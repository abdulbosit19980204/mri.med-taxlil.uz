"use client"

import React, { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Activity, Zap, Play, Search, Shield, Cpu, Layers, Crosshair, CheckCircle2, ArrowRight, Brain, Sparkles, Database, BarChart4 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import { useLanguage } from "@/context/language-context"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    { title: t.features.feature1_title, desc: t.features.feature1_desc, icon: <Layers className="h-5 w-5" /> },
    { title: t.features.feature2_title, desc: t.features.feature2_desc, icon: <Shield className="h-5 w-5" /> },
    { title: t.features.feature3_title, desc: t.features.feature3_desc, icon: <Activity className="h-5 w-5" /> },
    { title: t.features.feature4_title, desc: t.features.feature4_desc, icon: <Database className="h-5 w-5" /> },
  ]

  const workflow = [
    { step: "01", title: t.workflow.step1_title, desc: t.workflow.step1_desc },
    { step: "02", title: t.workflow.step2_title, desc: t.workflow.step2_desc },
    { step: "03", title: t.workflow.step3_title, desc: t.workflow.step3_desc },
    { step: "04", title: t.workflow.step4_title, desc: t.workflow.step4_desc },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#020617] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section: MRT Tahlili (Professional Split Layout) */}
      <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-24 px-4 md:px-6 overflow-hidden">
        {/* Background Mesh/Grid Effect (Matching "Tibbiy Foydalari") */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-24 xl:px-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            {/* Left Content: Value Prop */}
            <div className={`flex-[1.2] space-y-10 text-left transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> {t.hero.subtitle}
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] lg:leading-[0.85]">
                  {t.hero.mri_analysis.includes(' ') ? (
                    <>
                      {t.hero.mri_analysis.split(' ')[0]} <br />
                      <span className="text-primary italic">{t.hero.mri_analysis.split(' ').slice(1).join(' ')}</span>
                    </>
                  ) : (
                    t.hero.mri_analysis
                  )}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                  {t.hero.description}
                </p>
              </div>

              {/* Call to Action */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/upload">
                  <Button size="lg" className="h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-3 text-base font-bold group bg-primary">
                    {t.hero.cta_primary} <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-400 font-bold text-base">
                    {t.hero.cta_secondary}
                  </Button>
                </Link>
              </div>

              {/* Stats/Badges Row */}
              <div className="flex flex-wrap gap-6 pt-6 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">DICOM Compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">T2/FLAIR Ready</span>
                </div>
              </div>
            </div>

            {/* Right: Modern Visualization Card */}
            <div className={`flex-1 relative w-full transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="relative aspect-square lg:aspect-[4/5] xl:aspect-square w-full rounded-[48px] overflow-hidden border border-white/10 dark:border-white/5 shadow-2xl group group-hover:border-primary/20 transition-all duration-500">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 z-0" />

                {/* Scanning HUD Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute top-8 left-8 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Neural_Scan_Live</span>
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <div className="text-[9px] font-mono text-white/40 leading-none">Voxel_Size: 0.8mm</div>
                  </div>

                  <div className="absolute bottom-8 right-8 p-4 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 text-right">
                    <div className="text-[20px] font-black text-primary leading-none">99.4%</div>
                    <div className="text-[9px] font-mono text-primary/60 uppercase tracking-widest mt-1">Accuracy_Peak</div>
                  </div>

                  <div className="scanline-v2" />
                </div>

                {/* Main Visual */}
                <div className="relative h-full w-full p-8 flex items-center justify-center z-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]" />
                  <Image
                    src="/hero_brain_mri_3d.png"
                    alt="Clinical Brain Scan"
                    width={500}
                    height={500}
                    className="object-contain drop-shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-float scale-110 lg:scale-125"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Metrics Section (Data Dense Redesign) */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-24 xl:px-32 relative z-10">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                Technical Specifications
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                {t.features.title}
              </h2>
              <p className="text-primary font-mono text-xs tracking-[0.5em] font-bold uppercase italic opacity-60">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Accuracy Card */}
              <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-4 hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Accuracy</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">99.4</span>
                    <span className="text-xl font-bold text-primary">%</span>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-tight">{t.features.accuracy}</p>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[99.4%] shadow-[0_0_10px_#2563eb]" />
                </div>
              </div>

              {/* Sensitivity/Specificity Metric */}
              <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-4 hover:border-cyan-500/20 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Sensitivity</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-white tracking-tighter">98.2<span className="text-xs text-cyan-500 font-bold">%</span></span>
                    <p className="text-[8px] text-white/40 uppercase font-bold tracking-tight">Sensitivity</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-white tracking-tighter">97.5<span className="text-xs text-primary font-bold">%</span></span>
                    <p className="text-[8px] text-white/40 uppercase font-bold tracking-tight">Specificity</p>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                  <div className="h-full bg-cyan-500 w-[98.2%]" />
                  <div className="h-full bg-primary w-[97.5%]" />
                </div>
              </div>

              {/* Speed Card */}
              <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-4 hover:border-emerald-500/20 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Processing</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">&lt; 38</span>
                    <span className="text-xl font-bold text-emerald-500">s</span>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-tight">{t.features.speed}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[92%] shadow-[0_0_10px_#10b981]" />
                  </span>
                  <span className="text-[9px] font-mono text-emerald-500/50">8.2ms/vox</span>
                </div>
              </div>
            </div>

            {/* Performance Micro Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {['DICOM V3', 'HIPAA SECURE', 'NEURAL_PRO_V4', 'ISO_27001_READY'].map((b, i) => (
                <div key={i} className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 flex items-center gap-2 hover:bg-white/[0.06] transition-colors">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Workflow Section */}
      <section id="how-it-works" className="py-32 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-y border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-6 lg:px-24 xl:px-32">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-bold tracking-tight uppercase italic text-primary">{t.workflow.title}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto uppercase text-xs tracking-[0.3em] font-bold">{t.workflow.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {workflow.map((w, i) => (
              <div key={i} className="relative group p-10 rounded-[40px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute -top-5 -left-5 h-14 w-14 rounded-3xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-primary/30 group-hover:rotate-12 transition-transform">
                  {w.step}
                </div>
                <div className="space-y-4 pt-4 text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{w.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-mono italic opacity-80">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Interface Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 lg:px-24 xl:px-32">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 space-y-10 text-left">
              <div className="space-y-6">
                <h2 className="text-5xl font-black tracking-tight leading-tight">{t.features.medical_benefits}</h2>
                <p className="text-primary font-mono text-sm uppercase tracking-[0.3em] leading-relaxed font-bold">Expert-level Diagnostics Powered by Neura-Scan V4</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {t.features.benefits_list.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 group hover:border-primary transition-all duration-300">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-sm font-bold opacity-80">{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6 text-center lg:text-left">
                <Link href="/auth/register">
                  <Button variant="outline" className="h-20 px-12 rounded-full border-primary/20 hover:bg-primary/5 group text-xl font-bold transition-all hover:scale-105">
                    {t.cta.start_trial} <Sparkles className="ml-3 h-6 w-6 text-primary group-hover:animate-pulse" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative rounded-[50px] overflow-hidden shadow-2xl border border-white/10 aspect-video group">
              <Image src="/workstation.png" alt="AI Radiologist Workstation" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-primary/20" />
            </div>
          </div>
        </div>
      </section>


      {/* Partners Section */}
      <section className="py-16 bg-[#0f172a] text-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-12">Partnering with advanced diagnostic centers</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale saturate-0 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="font-black text-xl italic tracking-tighter">MED_CENTER</span>
            <span className="font-black text-xl italic tracking-tighter">NEURO_SCAN</span>
            <span className="font-black text-xl italic tracking-tighter">AI_RADIOLOGY</span>
            <span className="font-black text-xl italic tracking-tighter">TIBBIY_BOT</span>
          </div>
        </div>
      </section>
    </div>
  )
}
