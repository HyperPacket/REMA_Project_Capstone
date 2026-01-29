import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import type { Property } from '../../types';

interface PropertyChatWidgetProps {
    propertyContext: Property;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'rema';
    content: string;
    timestamp: string;
}

export const PropertyChatWidget = ({ propertyContext }: PropertyChatWidgetProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with contextual system message
    useEffect(() => {
        setMessages([{
            id: 'welcome',
            sender: 'rema',
            content: `I can answer specific questions about this property in ${propertyContext.neighborhood}, ${propertyContext.city}. Try asking about price history, nearby schools, or rental yield.`,
            timestamp: new Date().toISOString()
        }]);
    }, [propertyContext]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const generateResponse = async (userMsg: string) => {
        setIsTyping(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        let response = "I'm checking the details for you.";
        const msg = userMsg.toLowerCase();

        if (msg.includes('price') || msg.includes('cost') || msg.includes('worth')) {
            response = `This property is listed for ${propertyContext.currency} ${propertyContext.price.toLocaleString()}. Our AI valuation model suggests it might be ${propertyContext.valuation === 'undervalued' ? 'a great deal' : 'slightly above market average'}.`;
        } else if (msg.includes('location') || msg.includes('area') || msg.includes('neighborhood')) {
            response = `${propertyContext.neighborhood} is a highly sought-after area in ${propertyContext.city}. It features excellent access to main roads and services.`;
        } else if (msg.includes('school') || msg.includes('education')) {
            response = "There are several top-rated international and private schools within a 10-minute drive of this location.";
        } else if (msg.includes('rent') || msg.includes('yield') || msg.includes('invest')) {
            response = `For investment, similar units in ${propertyContext.neighborhood} typically rent for around 5-7% annual yield.`;
        } else {
            response = "That's a good question. Does checking the amenities list help, or would you like me to connect you with the agent?";
        }

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'rema',
            content: response,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMsg]);
        setIsTyping(false);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        generateResponse(currentInput);
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
            {/* Header - Minimalist */}
            <div className="bg-gray-50/80 border-b border-gray-100 p-3 flex items-center gap-2 backdrop-blur-md sticky top-0 z-10">
                <div className="bg-primary/10 p-1.5 rounded-full">
                    <Bot size={16} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-gray-700">Ask REMA</h3>
            </div>

            {/* Messages Area - Stacked chat style */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${msg.sender === 'user' ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                            {msg.sender === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                            ? 'bg-secondary text-white rounded-tr-none'
                            : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 max-w-[90%]">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm mt-1">
                            <Bot size={14} />
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center h-[44px]">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Sticky Input Area - Floating Pill Style */}
            <div className="p-3 bg-white border-t border-gray-100 sticky bottom-0 z-10 pb-4">
                <form
                    onSubmit={handleSend}
                    className="relative bg-white rounded-full shadow-md border border-gray-200 flex items-center transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/10"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about price, schools..."
                        className="flex-1 pl-5 pr-12 py-3 bg-transparent border-none rounded-full focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-sm"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};
