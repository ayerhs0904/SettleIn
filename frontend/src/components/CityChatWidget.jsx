import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const CityChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState('Noida');
    const [inputMsg, setInputMsg] = useState('');
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: "👋 Hi! I'm your SettleIn Local Guide. Ask me anything about transport, safety tips, metro routes, or PG hubs in Noida, Delhi, or Bengaluru!",
            city: 'Noida',
            sources: ['Noida: Transport & Safety Guide'],
            confidenceScore: 98
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputMsg;
        if (!query.trim() || loading) return;

        const userMessage = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        if (!textToSend) setInputMsg('');
        setLoading(true);

        try {
            const response = await api.post('/chat/city', {
                message: query,
                city: selectedCity
            });

            const botMessage = {
                sender: 'bot',
                text: response.data.answer || "I couldn't fetch an answer right now.",
                city: response.data.city || selectedCity,
                sources: response.data.sources || [],
                confidenceScore: response.data.confidenceScore || 90
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("Failed to query city RAG chatbot", err);
            setMessages(prev => [
                ...prev,
                {
                    sender: 'bot',
                    text: "Sorry, I ran into an issue connecting to the city guide server. Please try again.",
                    city: selectedCity,
                    sources: []
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedPrompts = [
        "How to commute in Sector 62 Noida?",
        "Is South Delhi safe for night shifts?",
        "Metro timing & PG hubs in Bengaluru?",
        "Emergency helpline numbers?"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl transition duration-300 transform hover:scale-110 flex items-center space-x-2.5 border border-white/20 group"
                >
                    <span className="text-2xl animate-bounce">🤖</span>
                    <span className="font-extrabold text-sm hidden sm:inline pr-1">City Guide AI</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </button>
            )}

            {/* Chat Modal Drawer */}
            {isOpen && (
                <div className="bg-gray-900/95 border border-gray-700/80 rounded-3xl shadow-2xl w-[90vw] sm:w-[420px] h-[550px] flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-md">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base leading-tight">SettleIn City Guide</h3>
                                <span className="text-[11px] text-pink-200 flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span>Grounded RAG Knowledge Base</span>
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    {/* City Selection Pills */}
                    <div className="bg-gray-800/90 px-4 py-2 border-b border-gray-700/60 flex items-center justify-between text-xs shrink-0">
                        <span className="text-gray-400 font-semibold">City Context:</span>
                        <div className="flex space-x-1.5">
                            {['Noida', 'Delhi', 'Bengaluru'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCity(c)}
                                    className={`px-3 py-1 rounded-xl font-bold transition ${
                                        selectedCity === c
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-700/60 text-gray-400 hover:text-gray-200'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Stream */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-md ${
                                        msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none'
                                            : 'bg-gray-800 border border-gray-700/80 text-gray-200 rounded-bl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>

                                {/* Grounded Sources Footer for Bot */}
                                {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1 max-w-[85%]">
                                        {msg.sources.map((src, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                                            >
                                                📍 {src}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 p-3 rounded-2xl w-36 text-gray-400 text-xs animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                                <span>Searching RAG docs...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Suggested Prompt Chips */}
                    <div className="px-4 py-2 border-t border-gray-800/80 bg-gray-900/60 flex space-x-2 overflow-x-auto shrink-0 scrollbar-none">
                        {suggestedPrompts.map((prompt, pIdx) => (
                            <button
                                key={pIdx}
                                onClick={() => handleSendMessage(prompt)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-medium border border-gray-700 whitespace-nowrap transition"
                            >
                                💡 {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="p-3 bg-gray-800/90 border-t border-gray-700 flex items-center space-x-2 shrink-0"
                    >
                        <input
                            type="text"
                            placeholder={`Ask about transport, safety in ${selectedCity}...`}
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || !inputMsg.trim()}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CityChatWidget;
