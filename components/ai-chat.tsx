"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Send, Loader2, Sparkles, Bot, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface AIChatProps {
    analysisId: string
    onClose: () => void
}

export default function AIChat({ analysisId, onClose }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Fetch existing history or start new chat
        const initChat = async () => {
            try {
                // Fetch history by sending an empty message
                const res = await apiClient.post(`/analyses/${analysisId}/chat/`, {
                    message: ""
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.history && data.history.length > 0) {
                        // Restore existing chat
                        setMessages(data.history)
                    } else {
                        // Brand new chat -> Trigger initial greeting
                        const greetRes = await apiClient.post(`/analyses/${analysisId}/chat/`, {
                            message: "Please provide a brief initial analysis summary of this scan, including key findings and any notable observations."
                        })
                        if (greetRes.ok) {
                            const greetData = await greetRes.json()
                            if (greetData.response) {
                                setMessages([{
                                    role: 'assistant',
                                    content: greetData.response
                                }])
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Chat init error:", e)
            } finally {
                setInitializing(false)
            }
        }

        initChat()
    }, [analysisId])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: input
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const res = await apiClient.post(`/analyses/${analysisId}/chat/`, {
                message: input
                // history is handled by DB on backend
            })

            if (res.ok) {
                const data = await res.json()
                const aiMessage: Message = {
                    role: 'assistant',
                    content: data.response
                }
                setMessages(prev => [...prev, aiMessage])
            }
        } catch (e) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I apologize, but I'm having trouble connecting. Please try again."
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-black border-l border-primary/30 z-50 flex flex-col shadow-2xl shadow-primary/20">
            {/* Header */}
            <div className="h-16 border-b border-primary/30 bg-black/80 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest">AI Assistant</h3>
                        <p className="text-[10px] text-primary/60 uppercase tracking-wider">Gemini Medical Adapter</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-primary hover:text-white hover:bg-primary/20"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {initializing ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Initializing AI Context...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex gap-3 text-left",
                                    message.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                {message.role === 'assistant' && (
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                <Card className={cn(
                                    "max-w-[80%] p-4 border",
                                    message.role === 'user'
                                        ? "bg-primary/10 border-primary/30 text-white"
                                        : "bg-white/5 border-white/10 text-white"
                                )}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </Card>
                                {message.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <Card className="p-4 border bg-white/5 border-white/10">
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </Card>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-primary/30 bg-black/80 backdrop-blur-md">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Ask about metadata, findings, or the scan..."
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
                        disabled={loading || initializing}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || loading || initializing}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-[10px] text-primary/40 mt-2 uppercase tracking-wider text-center">
                    AI responses are for reference only. Always verify with clinical judgment.
                </p>
            </div>
        </div>
    )
}
