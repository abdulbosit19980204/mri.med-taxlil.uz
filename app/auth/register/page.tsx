"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, User, Mail, Lock, ArrowRight, Loader2, Shield } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import React, { Suspense, useEffect } from "react"
import dynamic from "next/dynamic"

export default function RegisterPage() {
  const { t } = useLanguage()
  const { isLoggedIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState("DOCTOR")
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }, [isLoggedIn, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const email = formData.get('email')
    const password = formData.get('password')
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const name = `${firstName} ${lastName}`

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const res = await fetch(`${apiBase}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(JSON.stringify(data) || t.common.error)
      }

      router.push('/auth/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden">
      {/* Left Side: Sophisticated Background Visual */}
      <div className="hidden lg:flex flex-[1.2] relative bg-[#010413] items-center justify-center overflow-hidden">
        <Image
          src="/hero_brain_mri_3d.png"
          alt="Anatomical Render"
          fill
          className="object-cover opacity-60 scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#010413] via-transparent to-[#010413]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#010413] via-transparent to-transparent" />
        <div className="absolute inset-0 diagnostic-grid opacity-10" />

        <div className="relative z-10 w-full max-w-xl p-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-[0.3em]">Med-Taxlil_Safe_Protocol_V4</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none opacity-80">
              ENCRYPTED<br />REGISTRATION
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-12 border-t border-white/5 opacity-40">
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Compliance</p>
              <p className="text-xs font-bold text-white">HIPAA / GDPR</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Encryption</p>
              <p className="text-xs font-bold text-white">END_TO_END</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 z-20">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">© 2026 Med-Taxlil AI / CLINICAL_PROTOCOL_V4</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-8 bg-white dark:bg-[#020617] relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

        <div className="w-full max-w-lg space-y-10 relative z-10 py-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <Link href="/" className="group inline-flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-all duration-500">
                  <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Med-Taxlil <span className="text-primary italic">AI</span></h2>
                  <p className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Clinical_Analysis_Platform</p>
                </div>
              </Link>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t.auth.register_title}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t.auth.register_desc}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-bold uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-slate-400">{t.auth.name}</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="Aziz" className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 focus:ring-2 focus:ring-primary transition-all text-xs" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-slate-400">{t.auth.surname}</Label>
                <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Rahimov" className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 focus:ring-2 focus:ring-primary transition-all text-xs" required />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-slate-400">{t.auth.email}</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="shifokor@med-taxlil.uz" className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 focus:ring-2 focus:ring-primary transition-all text-xs" required />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-[9px] font-bold uppercase tracking-widest ml-1 text-slate-400">{t.auth.password}</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input id="password" name="password" type="password" autoComplete="new-password" className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 focus:ring-2 focus:ring-primary transition-all text-xs" required />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest ml-1 text-slate-400">{t.auth.role}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={cn(
                    "h-11 rounded-xl border flex gap-2 font-bold transition-all uppercase tracking-widest text-[9px]",
                    role === 'PATIENT' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-transparent text-slate-400 border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <User className="h-3.5 w-3.5" /> {t.auth.patient}
                </Button>
                <Button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={cn(
                    "h-11 rounded-xl border flex gap-2 font-bold transition-all uppercase tracking-widest text-[9px]",
                    role === 'DOCTOR' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-transparent text-slate-400 border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Activity className="h-3.5 w-3.5" /> {t.auth.doctor}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-3 group bg-primary hover:scale-[1.01] active:scale-[0.99] transition-all" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center gap-2">{t.auth.create_account} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></div>}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {t.auth.have_account} <Link href="/auth/login" className="text-primary hover:underline font-black">{t.auth.login_link}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
