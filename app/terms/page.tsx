"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] py-24 px-4">
            <div className="container max-w-3xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 -ml-4">
                        <ArrowLeft className="h-4 w-4" /> Bosh sahifaga qaytish
                    </Button>
                </Link>

                <div className="space-y-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Foydalanish Shartlari</h1>
                    <p className="text-slate-500 dark:text-slate-400">Oxirgi yangilanish: 24-yanvar, 2026</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">1. Xizmat tavsifi</h2>
                        <p>Med-Taxlil AI - bu sun'iy intellekt yordamida tibbiy tasvirlarni tahlil qilish platformasi. Xizmat faqat axborot maqsadida taqdim etiladi va yakuniy tibbiy tashxis hisoblanmaydi.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">2. Foydalanuvchi majburiyatlari</h2>
                        <p>Foydalanuvchi yuklangan ma'lumotlarning haqiqiyligi va ularni yuklash huquqiga egaligi uchun javobgardir.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">3. Rad etish</h2>
                        <p>Biz tahlil natijalarining 100% aniqligiga kafolat bermaymiz. Natijalar mutaxassis shifokor tomonidan tasdiqlanishi shart.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
