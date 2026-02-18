import time
import re
import os
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from playwright.sync_api import sync_playwright

# --- CONFIGURAÇÕES DO LEAD COMPASS ---
CIDADE = "Belém"
ESTADO = "PA"
# Caminho para sua chave de serviço do Firebase. NÃO ENVIE ESTE ARQUIVO PARA O GITHUB!
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"

# --- FUNÇÕES AUXILIARES ---

def limpar_whatsapp(tel_bruto):
    """Limpa e formata número de telefone para WhatsApp."""
    if not tel_bruto or tel_bruto == "Não encontrado":
        return None
    num = re.sub(r'\D', '', str(tel_bruto))
    if len(num) > 4 and not num.startswith('55'):
        num = '55' + num
    return num if len(num) >= 12 else None

def analisar_qualidade_site(site: str):
    """Analisa a qualidade do site, portado da lógica do frontend."""
    if not site or site == 'SEM SITE' or 'sem site' in site.lower():
        return 'none'
    
    site_lower = site.lower()
    sites_ruins = ['linktree', 'linktr.ee', 'bio.link', 'meulink.com', 'beacons.ai', 'sites.google.com']
    if any(s in site_lower for s in sites_ruins):
        return 'poor'
    
    return 'good'

def identificar_oportunidade(site: str, website_quality: str, instagram: str):
    """Gera notas de oportunidade, portado da lógica do frontend."""
    problemas = []
    if website_quality == 'none':
        problemas.append('SEM SITE - Grande oportunidade de venda!')
    elif website_quality == 'poor':
        problemas.append('Site genérico/amador - Oportunidade de upgrade!')
    
    if instagram == "Não encontrado":
        problemas.append("Sem Instagram")
        
    return " | ".join(problemas) if problemas else 'Presença digital parece completa.'

# --- FUNÇÕES DE EXTRAÇÃO (Playwright) ---

def extrair_nome(page):
    """Extrai o nome da empresa com múltiplas estratégias."""
    try:
        nome_h1 = page.query_selector('div[role="main"] h1')
        if nome_h1:
            texto = nome_h1.inner_text().strip()
            if texto and "Resultados" not in texto:
                return texto
    except Exception: pass
    return None

def extrair_telefone(page):
    """Extrai telefone com múltiplas estratégias."""
    try:
        # Tenta encontrar o botão com o número de telefone
        tel_buttons = page.query_selector_all('button[data-item-id*="phone"]')
        for btn in tel_buttons:
            data_id = btn.get_attribute('data-item-id')
            if data_id and 'phone:tel:' in data_id:
                return data_id.replace('phone:tel:', '').strip()
        # Tenta encontrar texto que parece um telefone
        texto_pagina = page.locator('div[role="main"]').inner_text()
        match = re.search(r'\(?\d{2}\)?\s*\d{4,5}-?\d{4}', texto_pagina)
        if match:
            return match.group(0).strip()
    except Exception: pass
    return "Não encontrado"

def extrair_site(page):
    """Extrai site com múltiplas estratégias."""
    try:
        site_el = page.query_selector('a[data-item-id="authority"]')
        if site_el:
            return site_el.get_attribute('href')
    except Exception: pass
    return "SEM SITE"

def extrair_instagram(page):
    """Extrai Instagram."""
    try:
        insta_links = page.query_selector_all('a[href*="instagram.com"]')
        if insta_links:
            return insta_links[0].get_attribute('href')
    except Exception: pass
    return "Não encontrado"

def scroll_painel_detalhes(page):
    """Rola o painel de detalhes para carregar todos os dados."""
    try:
        painel = page.locator('div[role="main"] >> .. >> ..').first
        for _ in range(3):
            painel.evaluate('(node) => node.scrollTop = node.scrollHeight')
            time.sleep(0.8)
        painel.evaluate('(node) => node.scrollTop = 0') # Volta ao topo
        print("   ✅ Painel de detalhes rolado")
    except Exception as e:
        print(f"   ⚠️ Erro ao rolar painel: {e}")

# --- FUNÇÃO PRINCIPAL DE SCRAPING ---

def iniciar_prospeccao(nicho, cidade, estado, max_leads=20):
    leads_extraidos = []
    with sync_playwright() as p:
        print(f"\n{'='*60}\n🚀 CLICK FACIL - PROSPECÇÃO INTELIGENTE\n{'='*60}")
        print(f"📍 Cidade: {cidade}, {estado}\n🎯 Nicho: {nicho}\n📊 Meta: {max_leads} leads\n{'='*60}\n")
        
        browser = p.chromium.launch(headless=False, slow_mo=50)
        context = browser.new_context(viewport={'width': 1400, 'height': 900}, locale='pt-BR')
        page = context.new_page()
        
        url_busca = f"https://www.google.com.br/maps/search/{nicho.replace(' ', '+')}+em+{cidade.replace(' ', '+')},{estado}"
        print(f"🔍 Acessando Google Maps...")
        page.goto(url_busca, wait_until='domcontentloaded', timeout=60000)
        
        try:
            page.wait_for_selector('div[role="article"]', timeout=20000)
            print("✅ Página carregada!")
        except Exception:
            print("❌ Erro: Timeout ao carregar resultados. Verifique a busca ou a conexão.")
            browser.close()
            return []
        
        time.sleep(3)
        
        # Rola a lista lateral para carregar mais resultados
        scroll_pane = page.locator('div[role="feed"]').first
        for _ in range(5):
            scroll_pane.evaluate('(node) => node.scrollTop = node.scrollHeight')
            time.sleep(1.5)
            
        cards = page.query_selector_all('div[role="article"]')
        print(f"✅ {len(cards)} empresas encontradas! Iniciando extração detalhada...\n{'='*60}\n")
        
        cards_processar = cards[:min(max_leads, len(cards))]
        
        for i, card in enumerate(cards_processar, 1):
            try:
                print(f"[{i}/{len(cards_processar)}] Processando...")
                card.click()
                time.sleep(1)
                page.wait_for_selector('h1', timeout=8000)
                
                nome = extrair_nome(page)
                if not nome:
                    print("   ⏭️ Não foi possível extrair o nome, pulando...")
                    continue
                
                print(f"   📌 Empresa: {nome}")
                scroll_painel_detalhes(page)
                
                site = extrair_site(page)
                telefone = extrair_telefone(page)
                instagram = extrair_instagram(page)
                
                website_quality = analisar_qualidade_site(site)
                analise = identificar_oportunidade(site, website_quality, instagram)
                
                lead = {
                    "Empresa": nome, "Nicho": nicho, "Site": site, "WhatsApp": telefone,
                    "Instagram": instagram, "Google_Maps": page.url, "Territorio": cidade,
                    "WebsiteQuality": website_quality, "Notas": analise
                }
                leads_extraidos.append(lead)
                
                print(f"   🎯 Análise: {analise}\n   ✅ Lead capturado!")
                time.sleep(1)
                
            except Exception as e:
                print(f"   ❌ Erro ao processar lead {i}: {str(e)}")
                continue
        
        browser.close()
        print(f"\n{'='*60}\n✅ PROSPECÇÃO FINALIZADA! Total: {len(leads_extraidos)} leads\n{'='*60}\n")
    return leads_extraidos

# --- FUNÇÃO DE SINCRONIZAÇÃO COM FIREBASE ---

def sincronizar_firebase(leads, service_account_key_path):
    """Sincroniza os leads diretamente com o Firebase Firestore."""
    if not leads:
        print("⚠️ Nenhum lead para sincronizar com o Firebase.")
        return

    print(f"🔥 SINCRONIZANDO {len(leads)} LEADS COM FIREBASE...")
    try:
        if not os.path.exists(service_account_key_path):
            print(f"❌ ERRO: Arquivo de chave de serviço '{service_account_key_path}' não encontrado.")
            print("   Baixe-o do seu console do Firebase e coloque na mesma pasta do script.")
            return

        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_key_path)
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        leads_ref = db.collection('leads')
        batch = db.batch()
        
        for lead_data in leads:
            # Cria um ID único e consistente
            id_unico = re.sub(r'[^a-z0-9]', '', f"{lead_data['Empresa']}_{lead_data['Territorio']}".lower())
            doc_ref = leads_ref.document(id_unico)
            
            whatsapp_limpo = limpar_whatsapp(lead_data.get('WhatsApp'))
            
            lead_firestore = {
                'id': id_unico,
                'companyName': lead_data.get('Empresa', ''),
                'niche': lead_data.get('Nicho', 'Outros'),
                'phone': lead_data.get('WhatsApp', ''),
                'website': lead_data.get('Site', ''),
                'instagram': lead_data.get('Instagram', ''),
                'googleMaps': lead_data.get('Google_Maps', ''),
                'notes': lead_data.get('Notas', ''),
                'territory': lead_data.get('Territorio', ''),
                'websiteQuality': lead_data.get('WebsiteQuality', 'none'),
                'whatsapp': whatsapp_limpo,
                'linkWhatsApp': f"https://wa.me/{whatsapp_limpo}" if whatsapp_limpo else '',
                'updatedAt': firestore.SERVER_TIMESTAMP,
            }
            
            # Adiciona ao lote (cria se não existe, mescla/atualiza se existe)
            batch.set(doc_ref, lead_firestore, merge=True)

        batch.commit()
        print(f"\n🎉 SINCRONIZAÇÃO CONCLUÍDA! {len(leads)} leads enviados/atualizados.\n")

    except Exception as e:
        print(f"❌ ERRO AO SINCRONIZAR COM FIREBASE: {e}")

# --- EXECUÇÃO ---

if __name__ == "__main__":
    nicho_alvo = "Clínica Odontológica"
    maximo_leads = 20
    
    leads_coletados = iniciar_prospeccao(nicho_alvo, CIDADE, ESTADO, maximo_leads)
    
    if leads_coletados:
        sincronizar_firebase(leads_coletados, SERVICE_ACCOUNT_KEY_PATH)

