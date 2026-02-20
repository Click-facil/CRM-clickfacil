"""
TESTE ISOLADO DO FIREBASE
Execute este script primeiro para verificar se o Firebase esta funcionando.
Se passar em todos os testes, o scraper vai funcionar tambem.

Como rodar:
    python teste_firebase.py
"""

import os, traceback
import firebase_admin
from firebase_admin import credentials, firestore

SERVICE_ACCOUNT_KEY = "serviceAccountKey.json"

print("=" * 50)
print("TESTE DE CONEXAO COM FIREBASE")
print("=" * 50)

# TESTE 1: Arquivo existe?
print("\n[1/4] Verificando arquivo de credenciais...")
if not os.path.exists(SERVICE_ACCOUNT_KEY):
    print(f"  FALHOU: '{SERVICE_ACCOUNT_KEY}' nao encontrado!")
    print(f"  Pasta atual: {os.getcwd()}")
    print(f"  Arquivos aqui: {os.listdir('.')}")
    exit(1)
else:
    tamanho = os.path.getsize(SERVICE_ACCOUNT_KEY)
    print(f"  OK: arquivo encontrado ({tamanho} bytes)")

# TESTE 2: JSON valido?
print("\n[2/4] Verificando formato do JSON...")
import json
try:
    with open(SERVICE_ACCOUNT_KEY, "r") as f:
        chave = json.load(f)
    campos_necessarios = ["type", "project_id", "private_key", "client_email"]
    for campo in campos_necessarios:
        if campo not in chave:
            print(f"  FALHOU: campo '{campo}' ausente no JSON!")
            exit(1)
    print(f"  OK: JSON valido")
    print(f"  Project ID: {chave.get('project_id')}")
    print(f"  Client Email: {chave.get('client_email')}")
except Exception as e:
    print(f"  FALHOU: erro ao ler JSON: {e}")
    exit(1)

# TESTE 3: Inicializar Firebase
print("\n[3/4] Inicializando Firebase Admin SDK...")
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("  OK: Firebase inicializado")
except Exception as e:
    print(f"  FALHOU: {type(e).__name__}: {e}")
    traceback.print_exc()
    exit(1)

# TESTE 4: Escrever e ler no Firestore
print("\n[4/4] Testando escrita e leitura no Firestore...")
try:
    ref = db.collection("_teste_conexao").document("ping")
    ref.set({"status": "ok", "timestamp": firestore.SERVER_TIMESTAMP})
    print("  OK: escrita bem-sucedida!")

    doc = ref.get()
    if doc.exists:
        print(f"  OK: leitura bem-sucedida! Dados: {doc.to_dict()}")
    else:
        print("  AVISO: escrita ok mas leitura nao retornou dados")

    # Limpa o documento de teste
    ref.delete()
    print("  OK: documento de teste removido")

except Exception as e:
    print(f"  FALHOU: {type(e).__name__}: {e}")
    traceback.print_exc()
    print()
    print("  CAUSA PROVAVEL: Regras do Firestore bloqueando escrita.")
    print("  SOLUCAO: No Firebase Console, va em:")
    print("    Firestore Database > Regras > e cole isso:")
    print()
    print('    rules_version = "2";')
    print('    service cloud.firestore {')
    print('      match /databases/{database}/documents {')
    print('        match /{document=**} {')
    print('          allow read, write: if true;')
    print('        }')
    print('      }')
    print('    }')
    print()
    print("  Nota: A SDK Admin ignora essas regras por padrao,")
    print("  mas se voce ver erro de permissao, verifique se o")
    print("  projeto no serviceAccountKey.json e o mesmo do Firestore.")
    exit(1)

print()
print("=" * 50)
print("TODOS OS TESTES PASSARAM!")
print("O Firebase esta funcionando corretamente.")
print("Pode rodar o scraper agora.")
print("=" * 50)
