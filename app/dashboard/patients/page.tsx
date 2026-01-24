"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, User, Search, Plus as PlusIcon, Calendar, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context"
import { cn } from "@/lib/utils"

export default function PatientsPage() {
    const { t } = useLanguage()
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {t.dashboard.patients}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your patient records</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                        />
                    </div>
                </div>

                {/* Empty State */}
                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-20 rounded-[40px] text-center shadow-xl shadow-black/5">
                    <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
                        <User className="h-12 w-12 text-slate-200" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3">No Patients Yet</h4>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        Start adding patient records to manage their MRI analyses
                    </p>
                    <Button size="lg" className="rounded-full px-10 h-14 font-bold shadow-xl shadow-primary/20">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Patient
                    </Button>
                </Card>
            </div>
        </div>
    )
}
