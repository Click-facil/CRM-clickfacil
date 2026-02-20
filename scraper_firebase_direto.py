import time, re, json, os, pandas as pd, traceback
import firebase_admin
from firebase_admin import credentials, firestore
from playwright.sync_api import sync_playwright

# ================================================================
# CONFIGURACOES
# ================================================================
PASTA_REACT        = "lead-compass"
ARQUIVO_CSV        = "leads_belem.csv"
SERVICE_ACCOUNT_KEY = "serviceAccountKey.json"

# ================================================================
# FIREBASE
# ================================================================

def init_firebase():
    if not os.path.exists(SERVICE_ACCOUNT_KEY):
        print(f"AVISO: '{SERVICE_ACCOUNT_KEY}' nao encontrado. Salvando so no CSV.")
        return None
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        # Testa a conexao com uma leitura simples
        db.collection("leads").limit(1).get()
        print("Firebase: conexao OK!")
        return db
    except Exception as e:
        print(f"Firebase ERRO na inicializacao: {type(e).__name__}: {e}")
        traceback.print_exc()
        return None


def salvar_no_firebase(db, lead):
    if db is None:
        print("   Firebase: desabilitado.")
        return

    try:
        empresa = lead.get("Empresa", "sem_nome")
        cidade  = lead.get("Territorio", "belem")

        nome_limpo   = re.sub(r"[^a-z0-9]", "_", empresa.lower()).strip("_")
        cidade_limpa = re.sub(r"[^a-z0-9]", "",  cidade.lower())
        id_doc = (nome_limpo + "_" + cidade_limpa)[:120]

        print(f"   Firebase: salvando '{id_doc}'...")

        wpp = formatar_whatsapp(lead.get("WhatsApp"))

        doc = {
            "companyName":    empresa,
            "niche":          lead.get("Nicho", ""),
            "phone":          lead.get("WhatsApp", ""),
            "website":        lead.get("Site", ""),
            "instagram":      lead.get("Instagram", ""),
            "googleMaps":     lead.get("Google_Maps", ""),
            "territory":      cidade,
            "stage":          "new",
            "source":         "scraper",
            "notes":          lead.get("Notas", ""),
            "websiteQuality": lead.get("WebsiteQuality", "none"),
            "whatsapp":       wpp,
            "linkWhatsApp":   ("https://wa.me/" + wpp) if wpp else "",
            "valor":          0,
            "contactName":    "",
            "email":          "",
            "createdAt":      firestore.SERVER_TIMESTAMP,
            "updatedAt":      firestore.SERVER_TIMESTAMP,
        }

        db.collection("leads").document(id_doc).set(doc, merge=True)
        print(f"   Firebase: SALVO! (id: {id_doc})")

    except Exception as e:
        print(f"   Firebase ERRO ao salvar: {type(e).__name__}: {e}")
        traceback.print_exc()

# ================================================================
# HELPERS
# ================================================================

def formatar_whatsapp(tel_bruto):
    if not tel_bruto or tel_bruto in ("Nao encontrado", "Nao encontrado"):
        return None
    num = re.sub(r"\D", "", str(tel_bruto))
    if num.startswith("55"):
        num = num[2:]
    num = "55" + num
    return num if len(num) >= 12 else None


# alias para compatibilidade com pandas apply
limpar_whatsapp = formatar_whatsapp

# ================================================================
# EXTRATORES PLAYWRIGHT
# ================================================================

def extrair_nome(page):
    try:
        el = page.query_selector('div[role="main"] h1')
        if el:
            t = el.inner_text().strip()
            if t and "Resultados" not in t and "pesquisa" not in t.lower():
                return t
        card = page.query_selector('div[role="article"][aria-selected="true"]')
        if card:
            nd = card.query_selector('div[class*="fontHeadlineSmall"]')
            if nd:
                return nd.inner_text().strip()
        for h1 in page.query_selector_all("h1"):
            t = h1.inner_text().strip()
            if t and "Resultados" not in t and len(t) > 3:
                return t
    except Exception as e:
        print(f"   Erro nome: {e}")
    return None


def extrair_telefone(page):
    try:
        time.sleep(0.5)
        for btn in page.query_selector_all('button[data-item-id*="phone"]'):
            d = btn.get_attribute("data-item-id") or ""
            if "phone:tel:" in d:
                n = d.replace("phone:tel:", "").strip()
                if n:
                    return n
        for a in page.query_selector_all('a[href^="tel:"]'):
            h = (a.get_attribute("href") or "").replace("tel:", "").strip()
            if h:
                return h
        for div in page.query_selector_all('div[class*="fontBody"]'):
            try:
                m = re.search(r"\(?\d{2}\)?\s*\d{4,5}-?\d{4}", div.inner_text())
                if m:
                    return m.group(0).strip()
            except:
                pass
    except Exception as e:
        print(f"   Erro telefone: {e}")
    return "Nao encontrado"


def extrair_site(page):
    try:
        time.sleep(0.5)
        el = page.query_selector('a[data-item-id="authority"]')
        if el:
            h = el.get_attribute("href")
            if h:
                return h
        els = page.query_selector_all('a[aria-label*="Site"]')
        if els:
            h = els[0].get_attribute("href")
            if h:
                return h
        redes = ["instagram.com", "facebook.com", "twitter.com", "linkedin.com", "tiktok.com"]
        for a in page.query_selector_all('a[href^="http"]'):
            h = a.get_attribute("href") or ""
            if "google.com" not in h and "gstatic.com" not in h:
                if not any(r in h for r in redes):
                    return h
    except Exception as e:
        print(f"   Erro site: {e}")
    return "SEM SITE"


def extrair_instagram(page):
    try:
        time.sleep(0.5)
        els = page.query_selector_all('a[href*="instagram.com"]')
        if els:
            return els[0].get_attribute("href")
        els = page.query_selector_all('a[aria-label*="Instagram"]')
        if els:
            h = els[0].get_attribute("href")
            if h:
                return h
    except Exception as e:
        print(f"   Erro instagram: {e}")
    return "Nao encontrado"


def analisar_qualidade(site, instagram):
    problemas = []
    if site == "SEM SITE":
        problemas.append("Sem site proprio")
    elif "linktree" in site.lower() or "linktr.ee" in site.lower():
        problemas.append("Usando Linktree ao inves de site")
    if "nao encontrado" in instagram.lower():
        problemas.append("Sem Instagram")
    return "Oportunidade" if problemas else "Nao"


def qualidade_site_campo(site):
    if not site or site.upper() == "SEM SITE":
        return "none"
    ruins = ["linktree", "linktr.ee", "bio.link", "meulink.com", "beacons.ai", "sites.google.com"]
    if any(r in site.lower() for r in ruins):
        return "poor"
    return "good"


def scroll_lista_lateral(page, vezes=3):
    try:
        for _ in range(vezes):
            page.mouse.move(400, 400)
            page.mouse.wheel(0, 800)
            time.sleep(1)
        print("   Lista rolada")
    except Exception as e:
        print(f"   Erro scroll lista: {e}")


def scroll_painel_detalhes(page, tentativas=4):
    try:
        time.sleep(1.5)
        for _ in range(tentativas):
            page.mouse.move(900, 400)
            page.mouse.wheel(0, 400)
            time.sleep(0.7)
        for _ in range(tentativas):
            page.mouse.wheel(0, -400)
            time.sleep(0.3)
        print("   Painel rolado")
    except Exception as e:
        print(f"   Erro scroll painel: {e}")

# ================================================================
# SCRAPING PRINCIPAL
# ================================================================

def iniciar_prospeccao(nicho, cidade="Belém", estado="PA", max_leads=20, db=None):
    leads_extraidos = []

    with sync_playwright() as p:
        print("\n" + "="*60)
        print("CLICK FACIL - PROSPECCAO INTELIGENTE")
        print("="*60)
        print(f"Cidade: {cidade} | Nicho: {nicho} | Meta: {max_leads}")
        print(f"Firebase: {'Ativo' if db else 'Desabilitado'}")
        print("="*60 + "\n")

        browser = p.chromium.launch(headless=False, slow_mo=50)
        ctx     = browser.new_context(viewport={"width": 1400, "height": 900}, locale="pt-BR")
        page    = ctx.new_page()

        url = (
            "https://www.google.com.br/maps/search/"
            + nicho.replace(" ", "+")
            + "+em+"
            + cidade.replace(" ", "+")
            + ","
            + estado
        )
        print("Acessando Google Maps...")
        page.goto(url, wait_until="domcontentloaded")

        # Banner de consentimento
        try:
            btn = page.locator(
                'button[aria-label*="Aceitar tudo"], button[aria-label*="Rejeitar tudo"]'
            ).first
            if btn.is_visible(timeout=5000):
                btn.click()
                time.sleep(2)
                print("   Banner fechado.")
        except:
            pass

        try:
            page.wait_for_selector('div[role="article"]', timeout=15000)
            print("Pagina carregada!")
        except:
            print("ERRO: timeout nos resultados")
            browser.close()
            return []

        time.sleep(3)
        scroll_lista_lateral(page, vezes=3)

        todos = page.query_selector_all('div[role="article"]')
        print(f"{len(todos)} cards encontrados.")

        # Remove patrocinados
        validos = []
        for c in todos:
            try:
                if "Patrocinado" in c.inner_text():
                    continue
                validos.append(c)
            except:
                validos.append(c)

        meta = min(max_leads, len(validos))
        print(f"{len(validos)} empresas organicas. Processando {meta}.\n" + "="*60 + "\n")

        for i, card in enumerate(validos[:meta], 1):
            try:
                print(f"\n[{i}/{meta}] Processando...")
                card.click()
                time.sleep(2)

                try:
                    page.wait_for_selector("h1", timeout=5000)
                except:
                    print("   Timeout titulo, pulando.")
                    continue

                nome = extrair_nome(page)
                if not nome or "patrocinado" in nome.lower():
                    print("   Nome invalido, pulando.")
                    continue

                print(f"   Empresa: {nome}")
                scroll_painel_detalhes(page)

                site      = extrair_site(page)
                telefone  = extrair_telefone(page)
                instagram = extrair_instagram(page)
                analise   = analisar_qualidade(site, instagram)

                lead = {
                    "Empresa":        nome,
                    "Nicho":          nicho,
                    "Site":           site,
                    "WhatsApp":       telefone,
                    "Instagram":      instagram,
                    "Google_Maps":    page.url,
                    "Territorio":     cidade,
                    "Status":         "Pendente",
                    "Notas":          analise,
                    "WebsiteQuality": qualidade_site_campo(site),
                }

                leads_extraidos.append(lead)
                print(f"   Site:      {site}")
                print(f"   WhatsApp:  {telefone}")
                print(f"   Instagram: {instagram}")
                print(f"   Analise:   {analise}")

                salvar_no_firebase(db, lead)

                print("   Lead capturado!")
                time.sleep(1)

            except Exception as e:
                print(f"   ERRO lead {i}: {e}")
                traceback.print_exc()
                continue

        browser.close()

    print("\n" + "="*60)
    print(f"FINALIZADO! Total: {len(leads_extraidos)} leads")
    print("="*60 + "\n")
    return leads_extraidos

# ================================================================
# SALVAR CSV + JSON
# ================================================================

def sincronizar_local(leads, cidade="Belém"):
    if not leads:
        print("Nenhum lead extraido.")
        return

    print("\n" + "="*60 + "\nSALVANDO CSV E JSON\n" + "="*60 + "\n")

    df_novo = pd.DataFrame(leads)
    df_novo["Link_WhatsApp"] = df_novo["WhatsApp"].apply(
        lambda x: ("https://wa.me/" + (limpar_whatsapp(x) or "")) if limpar_whatsapp(x) else None
    )

    df_final = df_novo  # default: so novos leads

    if os.path.exists(ARQUIVO_CSV):
        try:
            tamanho = os.path.getsize(ARQUIVO_CSV)
            if tamanho > 20:
                df_antigo = pd.read_csv(ARQUIVO_CSV, encoding="utf-8-sig")
                if not df_antigo.empty and "Empresa" in df_antigo.columns:
                    print(f"   {len(df_antigo)} leads existentes no CSV")
                    df_final = pd.concat([df_antigo, df_novo], ignore_index=True)
                    df_final = df_final.drop_duplicates(subset=["Empresa"], keep="last")
                    print(f"   Apos mescla: {len(df_final)} leads")
                else:
                    print("   CSV existente invalido, recriando.")
            else:
                print("   CSV vazio, recriando.")
        except Exception as e:
            print(f"   Erro ao ler CSV ({e}), usando so novos leads.")
    else:
        print(f"   Criando novo CSV com {len(df_final)} leads")

    df_final.to_csv(ARQUIVO_CSV, index=False, encoding="utf-8-sig")
    print(f"CSV salvo: {ARQUIVO_CSV}")

    caminho_json = os.path.join(PASTA_REACT, "src", "data", "leads.json")
    os.makedirs(os.path.dirname(caminho_json), exist_ok=True)
    with open(caminho_json, "w", encoding="utf-8") as f:
        json.dump(df_final.to_dict(orient="records"), f, ensure_ascii=False, indent=2)
    print(f"JSON salvo: {caminho_json}")

    sem_site      = len(df_final[df_final["Site"].str.contains("SEM SITE", na=False)])
    sem_insta     = len(df_final[df_final["Instagram"].str.contains("encontrado", case=False, na=False)])
    oportunidades = len(df_final[df_final["Notas"] == "Oportunidade"])
    total         = len(df_final)

    print(f"\nESTATISTICAS:")
    print(f"   Total:         {total}")
    print(f"   Sem site:      {sem_site} ({sem_site/total*100:.1f}%)")
    print(f"   Sem Instagram: {sem_insta} ({sem_insta/total*100:.1f}%)")
    print(f"   Oportunidades: {oportunidades} ({oportunidades/total*100:.1f}%)\n")

# ================================================================
# EXECUCAO
# ================================================================

if __name__ == "__main__":
    NICHO     = "Clinica Odontologica"
    CIDADE    = "Belém"
    ESTADO    = "PA"
    MAX_LEADS = 20

    db    = init_firebase()
    leads = iniciar_prospeccao(NICHO, CIDADE, ESTADO, MAX_LEADS, db)
    sincronizar_local(leads, CIDADE)