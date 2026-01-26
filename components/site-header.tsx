"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useAuth } from "@/context/auth-context"

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { isLoggedIn, logout } = useAuth()

  const navItems = [
    { name: t.nav.home, href: "https://med-taxlil.uz/" },
    { name: t.nav.ekg, href: "https://ecg.med-taxlil.uz" },
    { name: t.nav.eeg, href: "https://eeg.med-taxlil.uz" },
    { name: t.nav.features, href: "/features" },
    { name: t.nav.contact, href: "/contact" },
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Med-Taxlil Logo" width={32} height={32} className="rounded-lg shadow-sm" />
          <span className="font-bold text-xl text-[#0f172a] dark:text-white tracking-tight">
            Med-Taxlil <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-all hover:text-primary",
                pathname === item.href
                  ? "text-primary font-bold"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth & Lang Section */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full px-5"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                  {t.nav.login}
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="h-9 rounded-full px-5 shadow-lg shadow-primary/20">
                    {t.nav.register}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            className="p-2 text-slate-600 dark:text-slate-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#020617] p-6 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium py-3 border-b border-slate-100 dark:border-white/5 last:border-0 text-slate-600 dark:text-slate-400"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-6">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">Dashboard</Button>
                  </Link>
                  <Button
                    className="w-full rounded-full"
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">{t.nav.login}</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-full shadow-lg shadow-primary/20">{t.nav.register}</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
