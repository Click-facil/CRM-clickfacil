import json
import os
from datetime import datetime

def converter_para_leadflow():
    """
    Converte os dados do scraper (leads_paragominas.csv) 
    para o formato que o LeadFlow espera
    """
    
    print("\n" + "="*60)
    print("🔗 CONVERSOR: SCRAPER → LEADFLOW")
    print("="*60 + "\n")
    
    # Arquivo de entrada (gerado pelo scraper)
    arquivo_csv = "leads_paragominas.csv"
    
    # Verifica se o arquivo existe
    if not os.path.exists(arquivo_csv):
        print(f"❌ Erro: Arquivo '{arquivo_csv}' não encontrado!")
        print(f"   Execute o scraper primeiro para gerar os dados.")
        return
    
    # Lê o CSV
    import pandas as pd
    df = pd.read_csv(arquivo_csv)
    
    print(f"📂 Lendo {len(df)} leads de '{arquivo_csv}'...")
    
    # Converte para o formato do LeadFlow
    leads_leadflow = []
    
    for index, row in df.iterrows():
        # Limpa o WhatsApp
        whatsapp_limpo = ""
        if pd.notna(row.get('WhatsApp')) and row['WhatsApp'] != "Não encontrado":
            whatsapp_limpo = str(row['WhatsApp']).replace("(", "").replace(")", "").replace("-", "").replace(" ", "")
        
        # Monta o lead no formato do LeadFlow
        lead = {
            "id": str(index + 1),
            "empresa": str(row.get('Empresa', '')),
            "contato": "",  # Scraper não extrai nome de contato específico
            "email": "",    # Scraper não extrai email ainda
            "telefone": str(row.get('WhatsApp', '')) if pd.notna(row.get('WhatsApp')) else "",
            "whatsapp": whatsapp_limpo,
            "site": str(row.get('Site', '')) if pd.notna(row.get('Site')) else "SEM SITE",
            "instagram": str(row.get('Instagram', '')) if pd.notna(row.get('Instagram')) else "",
            "googleMaps": str(row.get('Google_Maps', '')) if pd.notna(row.get('Google_Maps')) else "",
            "nicho": str(row.get('Nicho', '')) if pd.notna(row.get('Nicho')) else "",
            "status": "Novo",  # Todos os leads começam como "Novo"
            "notas": str(row.get('Notas', '')) if pd.notna(row.get('Notas')) else "",
            "dataContato": datetime.now().strftime("%Y-%m-%d"),
            "valor": 0,
            "linkWhatsApp": str(row.get('Link_WhatsApp', '')) if pd.notna(row.get('Link_WhatsApp')) else ""
        }
        
        leads_leadflow.append(lead)
    
    # Salva em múltiplos formatos para garantir compatibilidade

    # 1. JSON para o App (na pasta `public` para ser acessível via fetch)
    # O caminho agora é relativo à pasta 'lead-compass', onde o script é executado.
    pasta_public_data = os.path.join("public", "data")
    os.makedirs(pasta_public_data, exist_ok=True)
    arquivo_json_publico = os.path.join(pasta_public_data, "leadsData.json")
    with open(arquivo_json_publico, 'w', encoding='utf-8') as f:
        json.dump(leads_leadflow, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON para o App salvo em: {arquivo_json_publico}")
    
    # 2. TypeScript export (para importação direta)
    arquivo_ts = "leads_leadflow.ts"
    with open(arquivo_ts, 'w', encoding='utf-8') as f:
        f.write("// Dados gerados automaticamente pelo scraper\n")
        f.write("// Última atualização: " + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "\n\n")
        f.write("export const leads = ")
        f.write(json.dumps(leads_leadflow, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        f.write("export default leads;\n")
    print(f"✅ TypeScript salvo: {arquivo_ts}")
    
    # 3. JavaScript export (alternativa)
    arquivo_js = "leads_leadflow.js"
    with open(arquivo_js, 'w', encoding='utf-8') as f:
        f.write("// Dados gerados automaticamente pelo scraper\n")
        f.write("// Última atualização: " + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "\n\n")
        f.write("export const leads = ")
        f.write(json.dumps(leads_leadflow, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        f.write("export default leads;\n")
    print(f"✅ JavaScript salvo: {arquivo_js}")
    
    # 4. Salva também na pasta do LeadFlow se existir
    pasta_leadflow_data = os.path.join("lead-compass", "src", "data")
    if os.path.exists(pasta_leadflow_data):
        # Copia o arquivo TS para a pasta do projeto
        arquivo_destino = os.path.join(pasta_leadflow_data, "leadsData.ts")
        with open(arquivo_destino, 'w', encoding='utf-8') as f:
            f.write("// Dados gerados automaticamente pelo scraper\n")
            f.write("// Última atualização: " + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + "\n\n")
            f.write("export const leadsData = ")
            f.write(json.dumps(leads_leadflow, ensure_ascii=False, indent=2))
            f.write(";\n\n")
            f.write("export default leadsData;\n")
        print(f"✅ Integrado com LeadFlow: {arquivo_destino}")
    
    print(f"\n{'='*60}")
    print(f"🎉 CONVERSÃO CONCLUÍDA!")
    print(f"{'='*60}\n")
    
    # Estatísticas
    print(f"📊 ESTATÍSTICAS:")
    print(f"   Total de leads: {len(leads_leadflow)}")
    
    # Conta quantos têm problemas
    sem_site = sum(1 for lead in leads_leadflow if "SEM SITE" in lead['site'])
    sem_telefone = sum(1 for lead in leads_leadflow if not lead['telefone'] or lead['telefone'] == "Não encontrado")
    sem_instagram = sum(1 for lead in leads_leadflow if not lead['instagram'] or lead['instagram'] == "Não encontrado")
    com_oportunidade = sum(1 for lead in leads_leadflow if "OPORTUNIDADE" in lead['notas'])
    
    print(f"   🎯 Sem site: {sem_site}")
    print(f"   📱 Sem telefone: {sem_telefone}")
    print(f"   📸 Sem Instagram: {sem_instagram}")
    print(f"   💰 Oportunidades detectadas: {com_oportunidade}")
    
    print(f"\n{'='*60}")
    print(f"📋 PRÓXIMOS PASSOS:")
    print(f"{'='*60}\n")
    print(f"1. Copie um dos arquivos gerados para o LeadFlow:")
    print(f"   - leads_leadflow.json")
    print(f"   - leads_leadflow.ts")
    print(f"   - leads_leadflow.js")
    print(f"\n2. No LeadFlow, importe os dados:")
    print(f"   import {{ leads }} from './data/leadsData';")
    print(f"\n3. Ou substitua os dados mockados no arquivo existente")
    print(f"\n4. Reinicie o servidor: npm run dev")
    print()
    
    # Mostra preview dos primeiros leads
    print(f"🔍 PREVIEW DOS LEADS:\n")
    for i, lead in enumerate(leads_leadflow[:3], 1):
        print(f"{i}. {lead['empresa']}")
        print(f"   Nicho: {lead['nicho']}")
        print(f"   Status: {lead['status']}")
        print(f"   Site: {lead['site']}")
        print(f"   Telefone: {lead['telefone']}")
        print(f"   Notas: {lead['notas']}")
        print()
    
    if len(leads_leadflow) > 3:
        print(f"... e mais {len(leads_leadflow) - 3} leads")
    print()

if __name__ == "__main__":
    try:
        converter_para_leadflow()
    except Exception as e:
        print(f"\n❌ ERRO: {str(e)}")
        print(f"\n💡 DICA:")
        print(f"   Certifique-se de que:")
        print(f"   1. Você executou o scraper primeiro")
        print(f"   2. O arquivo 'leads_paragominas.csv' existe")
        print(f"   3. Pandas está instalado: pip install pandas")
        print()
