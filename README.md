# iFood Partner AI 🍔🤖

**Live Demo:** ([**https-ifood-partner-ai-git-main-mateus-projects-305a1384.vercel.app/**](https://ifood-partner-dk8ofxuq9-mateus-projects-305a1384.vercel.app))


Um dashboard Full Stack (Next.js + Python) que utiliza IA Generativa para transformar reviews de clientes do iFood em insights de negócio e planos de ação estratégicos para donos de restaurantes.


<img width="1144" height="774" alt="image" src="https://github.com/user-attachments/assets/24f3aaa8-9cf2-4012-bda7-642a1a542afc" />

---

## 🎯 O Problema

Donos de restaurantes recebem dezenas de avaliações diariamente, mas não têm tempo para ler todas. Eles perdem a chance de identificar problemas críticos (ex: "comida fria", "embalagem vazando") ou de entender a causa raiz das reclamações, impactando diretamente suas notas e vendas.

## 💡 A Solução: Um Co-piloto de Gestão

O **iFood Partner AI** é um SaaS (Software as a Service) que permite ao dono do restaurante fazer upload de sua planilha de reviews (CSV) e, em segundos, receber uma análise de nível de consultoria.

A plataforma não apenas mostra gráficos, mas fornece um **Agente de IA (RAG)** que permite ao gestor "conversar" com seus dados, pedir insights e até gerar respostas para clientes.

---

## ✨ Principais Funcionalidades

* **Dashboard de Insights Instantâneo:** Faz o upload de um CSV e gera automaticamente:
    * Análise de Sentimento (Positivo, Neutro, Negativo).
    * Identificação dos "Top Problemas" (ex: Logística, Qualidade, Erro no Pedido).
    * Um **Plano de Ação Estratégico** gerado pela IA.
* **Agente de IA (RAG):** Um chatbot que "leu" os reviews e responde perguntas como:
    * *"Quais são os principais insights sobre a entrega?"*
    * *"Houve reclamações sobre a batata frita?"*
* **Assistente de Resposta:** Peça ao agente: *"Sugira uma resposta educada para o cliente que reclamou da comida fria"* e ele gera um modelo pronto para uso.

---

## 🛠️ Stack Técnico (Full Stack AI)

Este projeto foi construído como um monorepo, combinando um backend Python e um frontend Next.js.

### 🐍 Backend (API)

* **Framework:** Python 3.12+ com **FastAPI** (para alta performance assíncrona).
* **Processamento de Dados:** **Pandas** para leitura e ETL do arquivo CSV.
* **Inteligência Artificial:** **Groq** para acesso ao modelo **Llama 3.3 70B**.
* **Técnica de IA:** **Engenharia de Prompt (RAG)** com lógica de "Exceção" para permitir que o agente tenha múltiplos comportamentos (Analista e Assistente).
* **Deploy:** **Render** (Web Service).

### 🖥️ Frontend (Dashboard)

* **Framework:** **Next.js 14+** (React) com App Router.
* **Linguagem:** **TypeScript**.
* **Estilização:** **Tailwind CSS** para um design responsivo e moderno.
* **Deploy:** **Vercel**.

---

## 🚀 Como Rodar Localmente

O projeto é dividido em duas partes (backend e frontend).

### Backend (Python)

```bash
# 1. Navegue até a raiz do projeto
cd /projeto_ifood

# 2. Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Crie um arquivo .env e adicione sua chave
# GROQ_API_KEY=sua_chave_aqui

# 5. Rode o servidor
uvicorn main:app --reload

```
Projeto Por:
Mateus S. Carpenter 👨‍💻

LinkedIn: https://www.linkedin.com/in/mateus-carpenter-a06773140/
