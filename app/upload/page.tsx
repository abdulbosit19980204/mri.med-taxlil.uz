"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Upload, File, FileArchive, X, Check, ArrowRight, Loader2, Sparkles, Shield, Activity, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

import { useLanguage } from "@/context/language-context"
import { apiClient } from "@/lib/api-client"

export default function UploadPage() {
    const { t } = useLanguage()
    const { isLoggedIn } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/auth/login")
        }
    }, [isLoggedIn, router])

    const [isDragging, setIsDragging] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState("")

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length > 0) {
            setFiles(Array.from(e.dataTransfer.files))
        }
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFiles(Array.from(e.target.files))
        }
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const startAnalysis = async () => {
        if (files.length === 0) return

        setIsUploading(true)
        setProgress(0)
        setError("")

        try {
            const formData = new FormData()
            formData.append("file", files[0])
            formData.append("type", "BRAIN_MRI")

            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90))
            }, 500)

            const res = await apiClient.upload('/analyses/', formData)
            const data = await res.json()

            clearInterval(interval)
            setProgress(100)

            if (!res.ok) throw new Error(JSON.stringify(data) || t.common.error)

            setTimeout(() => {
                router.push(`/report/${data.id}`)
            }, 1000)

        } catch (err: any) {
            setError(err.message)
            setIsUploading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] dark:bg-[#020617] flex items-center py-16 md:py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="flex-1 space-y-8 text-left">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                <Shield className="h-3 w-3" /> Secure Data Link
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {t.upload.title}
                            </h1>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                {t.upload.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <p className="text-xs font-bold uppercase tracking-tighter">Automated Slicing</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 space-y-2">
                                <Database className="h-5 w-5 text-emerald-500" />
                                <p className="text-xs font-bold uppercase tracking-tighter">Cloud Diagnostic</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                            <span className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-slate-300" /> DICOM</span>
                            <span className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-slate-300" /> NIfTI</span>
                            <span className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-slate-300" /> ZIP</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md">
                        <Card className={cn(
                            "border-2 border-dashed transition-all duration-500 bg-white/50 dark:bg-white/5 backdrop-blur-xl relative group rounded-[40px] overflow-hidden shadow-2xl shadow-black/5",
                            isDragging ? "border-primary bg-primary/10 scale-105" : "border-slate-200 dark:border-white/10 hover:border-primary/50"
                        )}>
                            <CardContent
                                className="flex flex-col items-center justify-center py-20 px-8 text-center cursor-pointer"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input id="file-upload" type="file" className="hidden" accept=".dcm,.zip,.nii,.nii.gz,image/*" onChange={handleFileInput} />

                                <div className="h-24 w-24 bg-primary rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/40 group-hover:rotate-6 transition-transform">
                                    <Upload className="h-10 w-10 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold mb-3">{t.upload.drop_title}</h3>
                                <p className="text-sm text-slate-500 font-mono italic">{t.upload.drop_desc}</p>
                            </CardContent>

                            {/* Scanline Effect */}
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-primary/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all animate-scan" style={{ top: '50%' }} />
                        </Card>

                        {/* Selected Files Overlay/List */}
                        {files.length > 0 && (
                            <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4">
                                <div className="p-1 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                    {file.name.endsWith('.zip') ? <FileArchive className="h-5 w-5" /> : <File className="h-5 w-5" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold truncate max-w-[150px]">{file.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeFile(i); }} disabled={isUploading} className="h-8 w-8 rounded-full hover:bg-red-500 hover:text-white">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mt-4">
                                        {t.common.error}: {error}
                                    </div>
                                )}

                                {isUploading ? (
                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                            <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> {t.upload.analyzing}</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <Button size="lg" className="w-full h-14 rounded-full shadow-2xl shadow-primary/30 gap-2 font-bold text-lg hover:scale-[1.02] transition-transform active:scale-95 mt-6" onClick={startAnalysis}>
                                        <Sparkles className="h-5 w-5" /> {t.upload.start_analysis} <ArrowRight className="h-5 w-5 ml-1" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
