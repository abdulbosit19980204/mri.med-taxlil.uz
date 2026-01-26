"use client"

import React from "react"
import { Activity, Shield, Zap, Database, Brain, CheckCircle2, Server, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

export default function FeaturesPage() {
    const { t } = useLanguage()

    const metrics = [
        { label: "Aniqlik (Accuracy)", value: "99.4%", icon: <CheckCircle2 className="h-6 w-6 text-primary" /> },
        { label: "Sezgirlik (Sensitivity)", value: "98.2%", icon: <Activity className="h-6 w-6 text-cyan-500" /> },
        { label: "Maxsuslik (Specificity)", value: "97.5%", icon: <Shield className="h-6 w-6 text-emerald-500" /> },
        { label: "Tahlil Tezligi", value: "< 38s", icon: <Zap className="h-6 w-6 text-yellow-500" /> },
    ]

    const capabilities = [
        {
            title: "AI Diagnostika",
            desc: "Gemini Pro Vision va maxsus CNN modellari yordamida patologiyalarni erta aniqlash.",
            icon: <Brain className="h-8 w-8 text-primary" />
        },
        {
            title: "DICOM Tahlili",
            desc: "T1, T2, FLAIR va boshqa barcha MRT modalitlarini avtomatik o'qish va tahlil qilish.",
            icon: <Database className="h-8 w-8 text-cyan-500" />
        },
        {
            title: "Xavfsiz Bulut",
            desc: "Tibbiy ma'lumotlar shifrlangan holda saqlanadi (HIPAA & GDPR standartlari).",
            icon: <Lock className="h-8 w-8 text-emerald-500" />
        },
        {
            title: "Tezkor Integratsiya",
            desc: "Klinika tizimlari (PACS) bilan oson ulanish va API orqali ishlash imkoniyati.",
            icon: <Server className="h-8 w-8 text-violet-500" />
        }
    ]

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#020617]">
            {/* Header Section */}
            <section className="py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)] pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Texnologik <span className="text-primary italic">Ustunlik</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Bizning platformamiz eng so'nggi sun'iy intellekt algoritmlari va tibbiy standartlarga asoslangan.
                    </p>
                </div>
            </section>

            {/* Metrics Grid */}
            <section className="py-12 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {metrics.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-primary/50 transition-colors group">
                                <div className="p-3 rounded-xl bg-white dark:bg-white/10 shadow-sm group-hover:scale-110 transition-transform">
                                    {m.icon}
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{m.value}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Capabilities */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Platforma Imkoniyatlari</h2>
                            <div className="space-y-6">
                                {capabilities.map((c, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="shrink-0 pt-1">{c.icon}</div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{c.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{c.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-slate-900" />
                            <div className="relative z-10 p-8 flex flex-col justify-center h-full text-center">
                                <div className="text-6xl font-black text-white/10 mb-4 select-none">AI-CORE</div>
                                <h3 className="text-2xl font-bold text-white mb-4">Hoziroq Sinab Ko'ring</h3>
                                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                    Bepul hisob yarating va birinchi tahlilni amalga oshiring.
                                </p>
                                <Link href="/auth/register">
                                    <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">
                                        Ro'yxatdan O'tish
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
