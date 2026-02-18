import time, re, json, os, pandas as pd
from playwright.sync_api import sync_playwright

# --- CONFIGURAÇÕES DO LEAD COMPASS ---
PASTA_REACT = "lead-compass" 
ARQUIVO_CSV = "leads_belem.csv"

def limpar_whatsapp(tel_bruto):
    """Limpa e formata número de telefone para WhatsApp"""
    if not tel_bruto or tel_bruto == "Não encontrado": 
        return None
    num = re.sub(r'\D', '', str(tel_bruto))
    num = num.replace('55', '', 1) if num.startswith('55') else num
    return '55' + num

def extrair_nome(page):
    """Extrai o nome da empresa com múltiplas estratégias"""
    try:
        # Estratégia 1: h1 dentro do painel de detalhes
        nome_h1 = page.query_selector('div[role="main"] h1')
        if nome_h1:
            texto = nome_h1.inner_text().strip()
            if texto and "Resultados" not in texto and "pesquisa" not in texto.lower():
                return texto
        
        # Estratégia 2: Título do card ativo
        card_ativo = page.query_selector('div[role="article"][aria-selected="true"]')
        if card_ativo:
            nome_div = card_ativo.query_selector('div[class*="fontHeadlineSmall"]')
            if nome_div:
                return nome_div.inner_text().strip()
        
        # Estratégia 3: Qualquer h1 que não seja "Resultados"
        todos_h1 = page.query_selector_all('h1')
        for h1 in todos_h1:
            texto = h1.inner_text().strip()
            if texto and "Resultados" not in texto and len(texto) > 3:
                return texto
                
    except Exception as e:
        print(f"   ⚠️ Erro ao extrair nome: {e}")
    
    return None

def extrair_telefone(page):
    """Extrai telefone com múltiplas estratégias"""
    try:
        # Aguarda um pouco para garantir que carregou
        time.sleep(0.5)
        
        # Estratégia 1: Botão de telefone com data-item-id
        tel_buttons = page.query_selector_all('button[data-item-id*="phone"]')
        for btn in tel_buttons:
            data_id = btn.get_attribute('data-item-id')
            if data_id and 'phone:tel:' in data_id:
                numero = data_id.replace('phone:tel:', '').strip()
                if numero:
                    return numero
        
        # Estratégia 2: Link de telefone
        tel_links = page.query_selector_all('a[href^="tel:"]')
        for link in tel_links:
            href = link.get_attribute('href')
            if href:
                numero = href.replace('tel:', '').strip()
                if numero:
                    return numero
        
        # Estratégia 3: Texto com ícone de telefone
        # Procura por divs que contenham padrões de telefone
        divs_texto = page.query_selector_all('div[class*="fontBody"]')
        for div in divs_texto:
            try:
                texto = div.inner_text()
                # Padrões: (91) 3729-1234 ou 91 3729-1234 ou (91) 99999-9999
                match = re.search(r'\(?\d{2}\)?\s*\d{4,5}-?\d{4}', texto)
                if match:
                    return match.group(0).strip()
            except:
                continue
                
    except Exception as e:
        print(f"   ⚠️ Erro ao extrair telefone: {e}")
    
    return "Não encontrado"

def extrair_site(page):
    """Extrai site com múltiplas estratégias"""
    try:
        time.sleep(0.5)
        
        # Estratégia 1: Link com data-item-id="authority"
        site_el = page.query_selector('a[data-item-id="authority"]')
        if site_el:
            href = site_el.get_attribute('href')
            if href:
                return href
        
        # Estratégia 2: Link com aria-label contendo "Site"
        site_links = page.query_selector_all('a[aria-label*="Site"]')
        if site_links:
            href = site_links[0].get_attribute('href')
            if href:
                return href
        
        # Estratégia 3: Procurar por links externos (não Google, não redes sociais)
        all_links = page.query_selector_all('a[href^="http"]')
        for link in all_links:
            href = link.get_attribute('href')
            if href and 'google.com' not in href and 'gstatic.com' not in href:
                # Ignora redes sociais para pegar o site principal
                redes_sociais = ['instagram.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'tiktok.com']
                if not any(rede in href for rede in redes_sociais):
                    return href
                    
    except Exception as e:
        print(f"   ⚠️ Erro ao extrair site: {e}")
    
    return "SEM SITE"

def extrair_instagram(page):
    """Extrai Instagram com múltiplas estratégias"""
    try:
        time.sleep(0.5)
        
        # Estratégia 1: Link direto do Instagram
        insta_links = page.query_selector_all('a[href*="instagram.com"]')
        if insta_links:
            return insta_links[0].get_attribute('href')
        
        # Estratégia 2: Aria-label com Instagram
        insta_aria = page.query_selector_all('a[aria-label*="Instagram"]')
        if insta_aria:
            href = insta_aria[0].get_attribute('href')
            if href:
                return href
                
    except Exception as e:
        print(f"   ⚠️ Erro ao extrair Instagram: {e}")
    
    return "Não encontrado"

def analisar_qualidade_presenca_digital(site, instagram):
    """Analisa a qualidade da presença digital e identifica oportunidades"""
    problemas = []
    
    if site == "SEM SITE":
        problemas.append("Sem site próprio")
    elif "linktree" in site.lower() or "linktr.ee" in site.lower():
        problemas.append("Usando Linktree genérico ao invés de site")
    
    if instagram == "Não encontrado":
        problemas.append("Sem Instagram")
    
    if problemas:
        return "Oportunidade"
    
    return "Não"

def scroll_lista_lateral(page, vezes=5):
    """Rola a lista lateral (esquerda) para carregar mais resultados"""
    try:
        # A lista lateral geralmente é o primeiro elemento scrollável
        for i in range(vezes):
            # Move mouse para a área da lista (lado esquerdo)
            page.mouse.move(400, 400)
            page.mouse.wheel(0, 800)
            time.sleep(1)
        print(f"   ✅ Lista lateral rolada")
    except Exception as e:
        print(f"   ⚠️ Erro ao rolar lista: {e}")

def scroll_painel_detalhes(page, tentativas=4):
    """Rola o painel de detalhes (direita) para carregar todos os dados"""
    try:
        # Aguarda o painel carregar
        time.sleep(1.5)
        
        # Rola para baixo
        for i in range(tentativas):
            page.mouse.move(900, 400)  # Posiciona no painel direito
            page.mouse.wheel(0, 400)
            time.sleep(0.7)
        
        # Volta para o topo
        for i in range(tentativas):
            page.mouse.wheel(0, -400)
            time.sleep(0.3)
        
        print(f"   ✅ Painel de detalhes rolado")
            
    except Exception as e:
        print(f"   ⚠️ Erro ao rolar painel: {e}")

def iniciar_prospeccao(nicho, max_leads=20):
    """
    Inicia a prospecção de leads no Google Maps
    """
    leads_extraidos = []
    
    with sync_playwright() as p:
        print(f"\n{'='*60}")
        print(f"🚀 CLICK FÁCIL - PROSPECÇÃO INTELIGENTE")
        print(f"{'='*60}")
        print(f"📍 Cidade: Belém")
        print(f"🎯 Nicho: {nicho}")
        print(f"📊 Meta: {max_leads} leads")
        print(f"{'='*60}\n")
        
        # Configurações do navegador
        browser = p.chromium.launch(
            headless=False,
            slow_mo=50  # Mais lento para dar tempo de carregar
        )
        context = browser.new_context(
            viewport={'width': 1400, 'height': 900},
            locale='pt-BR'
        )
        page = context.new_page()
        
        # Acessa o Google Maps
        url_busca = f"https://www.google.com.br/maps/search/{nicho}+em+Belém,+PA"
        print(f"🔍 Acessando Google Maps...")
        page.goto(url_busca, wait_until='domcontentloaded')
        
        # Aguarda os resultados carregarem
        try:
            page.wait_for_selector('div[role="article"]', timeout=15000)
            print(f"✅ Página carregada!")
        except:
            print("❌ Erro: Timeout ao carregar resultados")
            browser.close()
            return []
        
        # Aguarda um pouco mais para garantir
        time.sleep(3)
        
        # Scroll na lista lateral para carregar mais
        print(f"📜 Carregando mais resultados...")
        scroll_lista_lateral(page, vezes=3)
        
        # Pega todos os cards
        cards = page.query_selector_all('div[role="article"]')
        total_encontrado = len(cards)
        print(f"✅ {total_encontrado} empresas encontradas na lista!")
        print(f"\n{'='*60}")
        print(f"INICIANDO EXTRAÇÃO DETALHADA")
        print(f"{'='*60}\n")
        
        # Limita ao número máximo
        cards_processar = cards[:min(max_leads, len(cards))]
        
        for i, card in enumerate(cards_processar, 1):
            try:
                print(f"\n[{i}/{len(cards_processar)}] Processando empresa...")
                
                # Clica no card e aguarda
                card.click()
                time.sleep(2)  # Aguarda o painel abrir
                
                # Aguarda o título carregar
                try:
                    page.wait_for_selector('h1', timeout=5000)
                except:
                    print(f"   ⚠️ Timeout ao aguardar título")
                    continue
                
                # Extrai o nome
                nome = extrair_nome(page)
                
                if not nome:
                    print(f"   ⏭️ Não foi possível extrair o nome, pulando...")
                    continue
                
                print(f"   📌 Empresa: {nome}")
                
                # Rola o painel para carregar tudo
                scroll_painel_detalhes(page)
                
                # Extrai dados
                site = extrair_site(page)
                telefone = extrair_telefone(page)
                instagram = extrair_instagram(page)
                
                # Analisa a presença digital
                analise = analisar_qualidade_presenca_digital(site, instagram)
                
                # Monta o objeto lead
                lead = {
                    "Empresa": nome,
                    "Nicho": nicho,
                    "Site": site,
                    "WhatsApp": telefone,
                    "Instagram": instagram,
                    "Google_Maps": page.url,
                    "Status": "Pendente",
                    "Notas": analise
                }
                
                leads_extraidos.append(lead)
                
                # Exibe resumo
                print(f"   🌐 Site: {site}")
                print(f"   📱 WhatsApp: {telefone}")
                print(f"   📸 Instagram: {instagram}")
                print(f"   🎯 Análise: {analise}")
                print(f"   ✅ Lead capturado com sucesso!")
                
                # Pequena pausa
                time.sleep(1)
                
            except Exception as e:
                print(f"   ❌ Erro ao processar lead {i}: {str(e)}")
                continue
        
        browser.close()
        
    print(f"\n{'='*60}")
    print(f"✅ PROSPECÇÃO FINALIZADA!")
    print(f"📊 Total extraído: {len(leads_extraidos)} leads")
    print(f"{'='*60}\n")
    
    return leads_extraidos

def sincronizar_lead_compass(leads):
    """Salva os leads no formato JSON e CSV para o Lead Compass"""
    
    if not leads:
        print("⚠️ ATENÇÃO: Nenhum lead foi extraído!")
        print("\n💡 DICAS:")
        print("  1. Verifique se a busca retornou resultados no Google Maps")
        print("  2. Tente outro nicho: 'Restaurantes', 'Academias', 'Salões de Beleza'")
        print("  3. Tente outra cidade se Paragominas não tiver empresas desse tipo")
        print("  4. Execute novamente - às vezes o Google demora para carregar")
        return
    
    print(f"\n{'='*60}")
    print(f"💾 SINCRONIZANDO DADOS COM LEAD COMPASS")
    print(f"{'='*60}\n")
    
    # Cria DataFrame
    df_novo = pd.DataFrame(leads)
    
    # Adiciona link do WhatsApp
    df_novo['Link_WhatsApp'] = df_novo['WhatsApp'].apply(
        lambda x: f"https://wa.me/{limpar_whatsapp(x)}" if x and x != "Não encontrado" else None
    )
    
    # Tenta carregar leads antigos e mesclar
    try:
        if os.path.exists(ARQUIVO_CSV):
            df_antigo = pd.read_csv(ARQUIVO_CSV)
            print(f"📂 {len(df_antigo)} leads existentes encontrados")
            df_final = pd.concat([df_antigo, df_novo], ignore_index=True)
            df_final = df_final.drop_duplicates(subset=['Empresa'], keep='last')
            print(f"🔄 Mesclado: {len(df_final)} leads totais (removidas duplicatas)")
        else:
            df_final = df_novo
            print(f"📝 Criando novo arquivo com {len(df_final)} leads")
    except Exception as e:
        print(f"⚠️ Erro ao mesclar dados: {e}")
        df_final = df_novo
    
    # Salva CSV (Backup)
    df_final.to_csv(ARQUIVO_CSV, index=False, encoding='utf-8-sig')
    print(f"✅ CSV salvo: {ARQUIVO_CSV}")
    
    # Salva JSON (Lead Compass)
    caminho_json = os.path.join(PASTA_REACT, "src", "data", "leads.json")
    os.makedirs(os.path.dirname(caminho_json), exist_ok=True)
    
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(df_final.to_dict(orient='records'), f, ensure_ascii=False, indent=2)
    
    print(f"✅ JSON salvo: {caminho_json}")
    print(f"\n{'='*60}")
    print(f"🎉 SINCRONIZAÇÃO CONCLUÍDA!")
    print(f"{'='*60}\n")
    
    # Estatísticas
    sem_site = len(df_final[df_final['Site'].str.contains("SEM SITE", na=False)])
    sem_instagram = len(df_final[df_final['Instagram'] == "Não encontrado"])
    oportunidades = len(df_final[df_final['Notas'].str.contains("OPORTUNIDADE", na=False)])
    
    print(f"📊 ESTATÍSTICAS:")
    print(f"   Total de leads: {len(df_final)}")
    print(f"   🎯 Sem site: {sem_site} ({sem_site/len(df_final)*100:.1f}%)")
    print(f"   📸 Sem Instagram: {sem_instagram} ({sem_instagram/len(df_final)*100:.1f}%)")
    print(f"   💰 Oportunidades: {oportunidades} ({oportunidades/len(df_final)*100:.1f}%)")
    print()

if __name__ == "__main__":
    # Configuração
    nicho = "Clínica Odontológica"  # Tente: Clinicas, Restaurantes, Academias, Salões de Beleza
    max_leads = 20
    
    leads = iniciar_prospeccao(nicho, max_leads)
    sincronizar_lead_compass(leads)
