"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Maxfiylik Siyosati</h1>
                    <p className="text-slate-500 dark:text-slate-400">Oxirgi yangilanish: 24-yanvar, 2026</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">1. Ma'lumotlarni yig'ish</h2>
                        <p>Biz faqatgina MRI tahlili uchun zarur bo'lgan tibbiy tasvirlar va foydalanuvchi hisobini yaratish uchun zarur bo'lgan minimal ma'lumotlarni yig'amiz.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">2. Ma'lumotlar xavfsizligi</h2>
                        <p>Barcha yuklangan DICOM ma'lumotlari HIPAA standartlariga muvofiq shifrlanadi va tahlildan so'ng xavfsiz saqlanadi.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">3. Bog'lanish</h2>
                        <p>Maxfiylik bo'yicha savollar bo'lsa, privacy@med-taxlil.uz manziliga murojaat qiling.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
