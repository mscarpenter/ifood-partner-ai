from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path 
import json
import pandas as pd
import io

# Setup
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Modelos de Dados
class ChatRequest(BaseModel):
    pergunta: str
    contexto: str  # Aqui virão os reviews que o frontend vai mandar de volta

@app.get("/")
def home():
    return {"mensagem": "API iFood Partner com Chatbot 🤖"}

# --- ROTA 1: UPLOAD E ANÁLISE ---
@app.post("/dashboard")
async def gerar_relatorio_upload(arquivo: UploadFile = File(...)):
    try:
        conteudo = await arquivo.read()
        df = pd.read_csv(io.BytesIO(conteudo))
        coluna_texto = df.columns[0]
        reviews = df[coluna_texto].head(50).tolist()
        
        # Criamos um texto único para a IA ler
        texto_reviews = "\n".join([f"- {r}" for r in reviews])
        
        prompt_analista = f"""
        Você é um Consultor iFood. Analise:
        {texto_reviews}
        
        Gere JSON:
        1. "total_reviews": int
        2. "sentimentos": {{"Positivo": int, "Neutro": int, "Negativo": int}}
        3. "principais_problemas": [str, str, str]
        4. "plano_acao": str
        """
        
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "JSON Output Only."},
                {"role": "user", "content": prompt_analista}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0,
            response_format={"type": "json_object"}
        )

        resposta_json = json.loads(completion.choices[0].message.content)
        
        return {
            "sucesso": True,
            "dados": resposta_json,
            "reviews_texto": texto_reviews # <--- NOVIDADE: Devolvemos o texto pro Front guardar
        }

    except Exception as e:
        return {"sucesso": False, "erro": str(e)}

# --- ROTA 2: O CHATBOT (NOVIDADE) ---
@app.post("/chat")
def chat_agente(request: ChatRequest):
    try:
        prompt_sistema = """
        Você é um Consultor de Negócios SÊNIOR do iFood. Seu trabalho é conversar com o DONO do restaurante.
        
        REGRAS DE OURO (NÃO QUEBRE):
        
        1.  **PENSE ANTES DE FALAR:** O usuário não quer uma lista de dados, ele quer um INSIGHT.
            - RUIM (Repetidor): "O cliente disse 'comida fria'."
            - ÓTIMO (Analista): "Notei um padrão de 'comida fria'. Isso afeta a percepção de qualidade do seu prato principal."

        2.  **O CONTEXTO É TUDO:** O texto que você recebe no CONTEXTO são os "dados da última semana". NUNCA, JAMAIS, diga "não tenho acesso em tempo real" ou "não tenho data". O contexto é a sua única verdade.
        
        3.  **SEJA UM ANALISTA, NÃO UM PAPAGAIO:** Quando o usuário pedir um "resumo" ou "quais os problemas", sua missão é AGRUPAR os problemas por tema e dar sua OPINIÃO DE ESPECIALISTA sobre o impacto.
            - Ex: "Identifiquei 3 temas principais:
              1. **Logística (Crítico):** Atrasos e comida fria são os maiores problemas.
              2. **Precisão (Fácil de resolver):** Erros de pedido, como 'veio cebola'.
              3. **Embalagem:** O 'refrigerante vazou'."

        --- EXCEÇÃO (Manter): ---
        Se o usuário pedir "sugestão de resposta" ou "escreva uma resposta", aí sim você para de ser analista e se torna um assistente de escrita, gerando um modelo de resposta.
        """

        prompt_usuario = f"""
        CONTEXTO (Reviews Reais):
        {request.contexto}
        
        PERGUNTA DO USUÁRIO:
        {request.pergunta}
        """
        
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": prompt_usuario}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5, # Um pouco mais criativo para conversar
        )
        
        return {"resposta": completion.choices[0].message.content}
        
    except Exception as e:
        return {"resposta": f"Erro no chat: {str(e)}"}