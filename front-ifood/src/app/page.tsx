"use client";
import { useState, useRef, useEffect } from "react";

export default function Dashboard() {
  // Estados do Dashboard
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [reviewsTexto, setReviewsTexto] = useState(""); // Guarda os reviews na memória

  // Estados do Chat
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagens, setMensagens] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'Olá! Eu li seus reviews. Como posso ajudar? 🤖' }
  ]);
  const [pergunta, setPergunta] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Função de Upload (Dashboard)
  async function enviarArquivo() {
    if (!arquivo) return alert("Selecione um arquivo!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      // CORRIGIDO com crase
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, { 
        method: "POST", 
        body: formData 
      });
      const data = await response.json();

      if (data.sucesso) {
        setDados(data.dados);
        setReviewsTexto(data.reviews_texto); // Guarda o texto para o chat usar!
        setChatAberto(true); // Abre o chat automaticamente
      } else {
        alert("Erro: " + data.erro);
      }
    } catch (error) { console.error(error); alert("Erro na API"); } 
    finally { setLoading(false); }
  }

  // Função de Chat (Enviar Pergunta)
  async function enviarPergunta() {
    if (!pergunta.trim()) return;
    
    // Adiciona pergunta do usuário na tela
    const novaMensagemUser = { role: 'user', content: pergunta };
    setMensagens(prev => [...prev, novaMensagemUser]);
    setPergunta("");
    setLoadingChat(true);

    try {
      // CORRIGIDO com crase
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            pergunta: novaMensagemUser.content, 
            contexto: reviewsTexto
        })
      });
      const data = await response.json();
      
      // Adiciona resposta da IA na tela
      setMensagens(prev => [...prev, { role: 'ai', content: data.resposta }]);
    } catch (error) {
      setMensagens(prev => [...prev, { role: 'ai', content: "Erro de conexão 😢" }]);
    } finally {
      setLoadingChat(false);
    }
  }
  
  // Scroll automático para o fim do chat
  useEffect(() => {
    if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2">
          <span className="text-2xl">🍔</span>
          <h1 className="text-lg font-bold text-red-600">iFood Partner AI</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUNA DA ESQUERDA: DASHBOARD --- */}
        <div className="lg:col-span-2 space-y-6">
            {/* Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-gray-700 mb-4">📂 Carregar Dados</h2>
                <div className="flex gap-4 items-center">
                    <input 
                        type="file" accept=".csv" 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                    />
                    <button onClick={enviarArquivo} disabled={loading || !arquivo} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-all whitespace-nowrap">
                        {loading ? "..." : "Analisar"}
                    </button>
                </div>
            </div>

            {/* Resultados Gráficos */}
            {dados && (
            <div className="animate-fade-in-up space-y-6">
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
                        <p className="text-xs text-gray-500 font-bold">TOTAL</p>
                        <p className="text-2xl font-black text-gray-800">{dados.total_reviews}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                        <p className="text-xs text-green-600 font-bold">POSITIVOS</p>
                        <p className="text-2xl font-black text-green-700">{dados.sentimentos?.Positivo || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
                        <p className="text-xs text-yellow-600 font-bold">NEUTROS</p>
                        <p className="text-2xl font-black text-yellow-700">{dados.sentimentos?.Neutro || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                        <p className="text-xs text-red-600 font-bold">NEGATIVOS</p>
                        <p className="text-2xl font-black text-red-700">{dados.sentimentos?.Negativo || 0}</p>
                    </div>
                </div>

                <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <h3 className="text-xs font-bold uppercase opacity-75 mb-2">🚀 Consultoria Estratégica</h3>
                    <p className="text-lg font-medium leading-relaxed">"{dados.plano_acao}"</p>
                </div>
                
                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-gray-800 mb-3">⚠️ Top Problemas</h3>
                    <ul className="space-y-2">
                        {dados.principais_problemas?.map((prob: string, i: number) => (
                            <li key={i} className="bg-gray-50 px-3 py-2 rounded text-sm text-gray-700 flex gap-2">
                                <span className="font-bold text-red-500">{i+1}.</span> {prob}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            )}
        </div>

        {/* --- COLUNA DA DIREITA: CHATBOT (IA AGENT) --- */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[600px] flex flex-col sticky top-24">
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 rounded-t-2xl flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="font-bold text-gray-700">Analista Virtual</p>
                </div>

                {/* Chat Messages */}
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {!chatAberto ? (
                        <div className="text-center text-gray-400 mt-20 text-sm">
                            <p className="text-4xl mb-2">🤖</p>
                            Carregue um arquivo para<br/>iniciar a conversa.
                        </div>
                    ) : (
                        // BLCOO CORRIGIDO E LIMPO:
                        mensagens.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-red-600 text-white rounded-tr-none' 
                                : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                            } whitespace-pre-wrap leading-relaxed`}> 
                              
                              {msg.content}

                            </div>
                          </div>
                        ))
                        // FIM DO BLOCO CORRIGIDO
                    )}
                    {loadingChat && <div className="text-xs text-gray-400 animate-pulse ml-2">Digitando...</div>}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t bg-white rounded-b-2xl">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Pergunte sobre os dados..." 
                            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={pergunta}
                            onChange={(e) => setPergunta(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && enviarPergunta()}
                            disabled={!chatAberto || loadingChat}
                        />
                        <button 
                            onClick={enviarPergunta}
                            disabled={!chatAberto || loadingChat}
                            className="bg-gray-900 text-white p-2 rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}