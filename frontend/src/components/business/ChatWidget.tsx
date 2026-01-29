import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import remaLogo from '../../assets/rema_logo_wordless_no_bg.png';
import type { ChatMessage } from '../../types';
import { sendChatMessage } from '../../api/chatService';

interface ChatWidgetProps {
    context?: 'global' | 'property';
    propertyContext?: any;
    initialMessage?: string;
    onSend?: (message: string) => void;
}

// Internal component for the aesthetic border effect
const GradientBorderAvatar = ({
    src,
    size = "small",
    isActive = false,
    triggerOnHover = false
}: {
    src: string,
    size?: "small" | "large",
    isActive?: boolean,
    triggerOnHover?: boolean
}) => {
    // Large = Welcome Screen, Small = Chat/Typing
    const containerClasses = size === "large" ? "p-5 rounded-2xl" : "p-2 rounded-xl w-10 h-10";
    const imgClasses = size === "large" ? "w-16 h-16" : "w-6 h-6";

    // The visual logic: 
    // If triggerOnHover is true, we use group-hover to show opacity.
    // If isActive is true (typing), we force opacity-100.
    const opacityClass = isActive
        ? "opacity-100"
        : triggerOnHover ? "opacity-0 group-hover:opacity-100" : "opacity-0";

    return (
        <div className={`relative flex items-center justify-center ${triggerOnHover ? 'group' : ''}`}>
            {/* The Animated Border Layer */}
            {/* We spin this background layer to make colors move around */}
            <div
                className={`absolute -inset-[2px] rounded-2xl transition-opacity duration-500 blur-[2px] ${opacityClass}`}
                style={{
                    background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                    animation: 'spin-slow 4s linear infinite'
                }}
            />

            {/* The White Container */}
            <div className={`relative bg-white border border-gray-100 shadow-sm flex items-center justify-center z-10 transition-transform duration-300 ${triggerOnHover ? 'group-hover:scale-105' : ''} ${containerClasses}`}>
                <img src={src} alt="Avatar" className={`object-contain ${imgClasses}`} />
            </div>
        </div>
    );
};

export const ChatWidget = ({ context = 'global', propertyContext, initialMessage }: ChatWidgetProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Context-aware UI Strings
    const isPropertyContext = context === 'property';
    const placeholder = isPropertyContext ? "Ask about this property..." : "Ask REMA anything...";
    const welcomeTitle = isPropertyContext ? "Property Assistant" : "Hello! I'm REMA";
    const welcomeSubtitle = isPropertyContext
        ? "I can help you with details about this specific property. Ask me about the price, location, or features."
        : "Your personal AI real estate expert. Ask me anything about the Jordanian market, property valuations, or investment opportunities.";

    const defaultSuggestions = [
        "Find undervalued apartments in Amman",
        "Calculate price for a 3BR apartment in Abdoun",
        "Compare properties in Dabouq vs Khalda",
        "Calculate monthly mortgage for 150,000 JOD",
        "What's the ROI for a rental in Irbid?",
        "Show me villas under 200,000 JOD"
    ];

    const propertySuggestions = [
        "Is this property undervalued?",
        "Show me similar properties",
        "What's the predicted price for this property?",
        "Tell me about this neighborhood"
    ];

    const currentSuggestions = isPropertyContext ? propertySuggestions : defaultSuggestions;

    useEffect(() => {
        if (initialMessage) {
            setMessages([{
                id: 'welcome',
                sender: 'rema',
                content: initialMessage,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [initialMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent, msgText?: string) => {
        if (e) e.preventDefault();
        const textToSend = msgText || input;

        if (!textToSend.trim()) return;

        // Add User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: textToSend,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Backend Service
            const response = await sendChatMessage({
                message: textToSend,
                context: context,
                propertyContext: propertyContext,
                propertyId: propertyContext?.id
            });

            // Add Bot Response
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'rema',
                content: response.message,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'rema',
                content: "I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Inline styles for custom animation */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center space-y-8">
                        {/* BIG LOGO with Hover Effect */}
                        <div className="mb-4">
                            <GradientBorderAvatar
                                src={remaLogo}
                                size="large"
                                triggerOnHover={true}
                            />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">{welcomeTitle}</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {welcomeSubtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                            {currentSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(undefined, suggestion)}
                                    className="text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/30 hover:shadow-sm transition-all text-sm text-gray-600 font-medium"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`flex-shrink-0`}>
                                    {msg.sender === 'user' ? (
                                        <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm">
                                            <UserIcon size={18} />
                                        </div>
                                    ) : (
                                        // Standard Bot Message Avatar (Static)
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                            <img src={remaLogo} alt="Rema" className="w-6 h-6 object-contain" />
                                        </div>
                                    )}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[85%] md:max-w-[75%] text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-secondary text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* TYPING INDICATOR with "Always On" Border Effect */}
                        {isTyping && (
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <GradientBorderAvatar
                                        src={remaLogo}
                                        size="small"
                                        isActive={true} // Force border animation
                                    />
                                </div>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-1 items-center h-[52px]">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Sticky Input Area */}
            <div className="sticky bottom-0 w-full p-4 md:p-6 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent">
                <form
                    onSubmit={(e) => handleSend(e)}
                    className="relative max-w-3xl mx-auto bg-white rounded-full shadow-lg border border-gray-100 flex items-center transition-shadow hover:shadow-xl focus-within:ring-2 focus-within:ring-primary/20"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 pl-6 pr-14 py-4 bg-transparent border-none rounded-full focus:outline-none text-gray-800 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-sm"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-2">
                    REMA can make mistakes. Please verify important information.
                </p>
            </div>
        </div>
    );
};