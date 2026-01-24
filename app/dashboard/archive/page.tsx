"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Database, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context"

export default function ArchivePage() {
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
                            Archive Database
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Access historical MRI analysis records</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search archive..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                        />
                    </div>
                    <Button variant="outline" className="h-14 px-6 rounded-2xl">
                        <Filter className="h-5 w-5 mr-2" />
                        Filter
                    </Button>
                </div>

                {/* Empty State */}
                <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-20 rounded-[40px] text-center shadow-xl shadow-black/5">
                    <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
                        <Database className="h-12 w-12 text-slate-200" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3">Archive is Empty</h4>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Completed analyses will appear here for long-term storage
                    </p>
                </Card>
            </div>
        </div>
    )
}
