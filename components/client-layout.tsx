"use client"

import React, { useState, useEffect } from "react"
import { AlertCircle, X } from 'lucide-react'
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useLanguage } from "@/context/language-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function TestBanner() {
    const { t } = useLanguage()
    const [isVisible, setIsVisible] = useState(true)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith('/auth/')

    useEffect(() => {
        setMounted(true)
        const dismissed = localStorage.getItem('test_banner_dismissed')
        if (dismissed) setIsVisible(false)
    }, [])

    const dismiss = () => {
        setIsVisible(false)
        localStorage.setItem('test_banner_dismissed', 'true')
    }

    if (!mounted || !isVisible || isAuthPage) return null

    return (
        <div className="h-10 bg-[#f97316] text-white flex items-center justify-center px-4 md:px-6 relative z-[60] text-[10px] md:text-xs font-bold gap-2 group">
            <span className="flex items-center gap-1 uppercase tracking-tighter border border-white/40 px-1.5 py-0.5 rounded-md">
                <AlertCircle className="h-3 w-3" /> {t.common.test_mode}
            </span>
            <span className="opacity-90 font-medium truncate">{t.common.test_desc}</span>
            <button
                onClick={dismiss}
                className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith('/auth/')
    const isDashboardPage = pathname?.startsWith('/dashboard')
    const isReportPage = pathname?.startsWith('/report/')

    useEffect(() => {
        setMounted(true)
    }, [])

    const shouldHideHeaderFooter = isAuthPage || isDashboardPage || isReportPage

    return (
        <>
            <TestBanner />
            {!shouldHideHeaderFooter && <SiteHeader />}
            <main className={cn("flex-1", !shouldHideHeaderFooter && "pt-16")}>
                {children}
            </main>
            {!shouldHideHeaderFooter && <SiteFooter />}
        </>
    )
}
