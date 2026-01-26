"use client"

import React, { useState } from "react"
import { Mail, MapPin, Phone, Send, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/context/language-context"

export default function ContactPage() {
    const { t } = useLanguage()
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate form submission
        setTimeout(() => setSubmitted(true), 1000)
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#020617] relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <section className="py-20 lg:py-32 container mx-auto px-6 relative z-10">
                <div className="max-w-xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                        Biz Bilan <span className="text-primary">Bog'laning</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Savollaringiz bormi? Mutaxassislarimiz sizga yordam berishga tayyor.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="space-y-8">
                            <div className="flex items-start gap-6 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary/50 transition-colors">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Manzil</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Toshkent shahri, Yunusobod tumani,<br />
                                        Amir Temur ko'chasi, 107-uy
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary/50 transition-colors">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Email</h3>
                                    <a href="mailto:info@med-taxlil.uz" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                                        info@med-taxlil.uz
                                    </a>
                                    <p className="text-slate-400 text-sm mt-1">24/7 texnik yordam</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary/50 transition-colors">
                                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                    <Phone className="h-6 w-6 text-violet-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Telefon</h3>
                                    <a href="tel:+998712000000" className="text-slate-600 dark:text-slate-400 hover:text-violet-500 transition-colors block">
                                        +998 (71) 200-00-00
                                    </a>
                                    <a href="tel:+998901234567" className="text-slate-600 dark:text-slate-400 hover:text-violet-500 transition-colors block mt-1">
                                        +998 (90) 123-45-67
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 blur-[60px] opacity-10 rounded-[3rem]" />
                        <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-8 lg:p-10 border border-slate-100 dark:border-white/10 shadow-2xl">
                            {submitted ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Xabar Yuborildi!</h3>
                                        <p className="text-slate-500">Tez orada menejerlarimiz siz bilan bog'lanishadi.</p>
                                    </div>
                                    <Button onClick={() => setSubmitted(false)} variant="outline">Yangi xabar yozish</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Xabar Qoldirish</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ism</label>
                                            <Input required placeholder="Ismingiz" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Familiya</label>
                                            <Input required placeholder="Familiyangiz" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                                        <Input required type="email" placeholder="name@example.com" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Xabar</label>
                                        <Textarea required placeholder="Savolingiz yoki taklifingiz..." className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 min-h-[120px] resize-none" />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-14 text-base font-bold bg-primary hover:bg-blue-700 shadow-lg shadow-primary/20">
                                        Yuborish <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
