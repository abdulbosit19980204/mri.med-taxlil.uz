"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Send, Activity, Globe } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function SiteFooter() {
    const { t } = useLanguage()

    return (
        <footer className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#020617] pt-20 pb-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Med-Taxlil Logo" width={40} height={40} className="rounded-xl shadow-lg" />
                            <span className="font-bold text-2xl tracking-tighter text-slate-900 dark:text-white">Med-Taxlil <span className="text-primary italic">MRT</span></span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed font-mono italic text-left">
                            [NEURAL_ENGINE_V4.2]<br />
                            {t.common.test_desc}
                        </p>
                    </div>

                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t.nav.dashboard}</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/upload" className="hover:text-primary transition-colors flex items-center gap-2">{t.upload.start_analysis} <div className="h-1 w-1 rounded-full bg-primary" /></Link></li>
                            <li><Link href="/#features" className="hover:text-primary transition-colors">{t.nav.features}</Link></li>
                            <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">{t.workflow.title}</Link></li>
                            <li><Link href="/dashboard" className="hover:text-primary transition-colors">{t.nav.dashboard}</Link></li>
                        </ul>
                    </div>

                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Global Resurslar</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="https://ecg.med-taxlil.uz" className="hover:text-primary transition-colors">Med-Taxlil {t.nav.ekg}</Link></li>
                            <li><Link href="https://eeg.med-taxlil.uz" className="hover:text-primary transition-colors">Med-Taxlil {t.nav.eeg}</Link></li>
                            <li><Link href="https://med-taxlil.uz/" className="hover:text-primary transition-colors flex items-center gap-2"><Globe className="h-3 w-3" /> Asosiy Sayt</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-xs">{t.nav.contact}</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Send className="h-4 w-4" /></Link>
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all"><Instagram className="h-4 w-4" /></Link>
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook className="h-4 w-4" /></Link>
                        </div>
                        <p className="text-xs text-slate-500 font-mono tracking-tighter">
                            SECURE_ENDPOINT: info@med-taxlil.uz<br />
                            SUPPORT_VOICE: +998 90 123 45 67
                        </p>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">
                    <p>© {new Date().getFullYear()} MED-TAXLIL.UZ [SYSTEM_ENCRYPTED]</p>
                    <div className="flex gap-8">
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Protocol Data Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
