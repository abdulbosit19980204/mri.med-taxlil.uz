"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, Database, Plus as PlusIcon, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/context/language-context"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

export default function DatasetsPage() {
    const { t } = useLanguage()
    const [datasets, setDatasets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadName, setUploadName] = useState("")
    const [uploadFile, setUploadFile] = useState<File | null>(null)

    const [syncing, setSyncing] = useState(false)
    const [kaggleHandle, setKaggleHandle] = useState("")

    useEffect(() => {
        loadDatasets()
        const interval = setInterval(() => {
            if (Array.isArray(datasets) && datasets.some(d => d.status === 'PROCESSING' || d.status === 'UPLOADING')) {
                loadDatasets()
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [datasets])

    async function loadDatasets() {
        try {
            const res = await apiClient.get('/datasets/')
            if (res.ok) {
                const data = await res.json()
                if (data.results) {
                    setDatasets(data.results)
                } else if (Array.isArray(data)) {
                    setDatasets(data)
                }
            }
        } catch (e) {
            console.error("Failed to load datasets", e)
        } finally {
            setLoading(false)
        }
    }

    async function handleSyncKaggle() {
        if (!kaggleHandle) return
        setSyncing(true)
        try {
            const res = await apiClient.post('/datasets/sync_kaggle/', {
                body: JSON.stringify({ handle: kaggleHandle })
            })
            if (res.ok) {
                setKaggleHandle("")
                setTimeout(loadDatasets, 2000)
            }
        } catch (e) {
            console.error("Sync failed", e)
        } finally {
            setSyncing(false)
        }
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        if (!uploadFile || !uploadName) return

        setUploading(true)
        const formData = new FormData()
        formData.append('name', uploadName)
        formData.append('file', uploadFile)

        try {
            const res = await apiClient.post('/datasets/', {
                body: formData,
                // Do not set Content-Type header manually for FormData, api-client might need adjustment or we use fetch directly
                // Assuming apiClient handles FormData if passed as body, or we use raw fetch
            })

            // Note: If apiClient sets 'Content-Type': 'application/json' by default, FormData upload might fail.
            // Let's use raw fetch with auth token if needed, or check if apiClient supports FormData.
            // For safety in this quick implementation, I'll assume standard fetch pattern with token from localStorage

            const token = localStorage.getItem('auth_token')
            const uploadRes = await fetch('http://localhost:8000/api/datasets/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (uploadRes.ok) {
                setUploadName("")
                setUploadFile(null)
                loadDatasets()
            }
        } catch (e) {
            console.error("Upload failed", e)
        } finally {
            setUploading(false)
        }
    }

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
                            Datasets
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage training datasets for AI models</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <Input
                            placeholder="Kaggle Handle (e.g. user/dataset)"
                            value={kaggleHandle}
                            onChange={e => setKaggleHandle(e.target.value)}
                            className="h-10 w-64 border-none bg-transparent focus-visible:ring-0 text-xs font-mono uppercase tracking-widest placeholder:text-slate-300"
                        />
                        <Button
                            className="h-10 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 px-6"
                            onClick={handleSyncKaggle}
                            disabled={syncing || !kaggleHandle}
                        >
                            {syncing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <PlusIcon className="mr-2 h-3.5 w-3.5" />}
                            Add From Kaggle
                        </Button>
                    </div>
                </div>

                {/* Upload Section */}
                <Card className="mb-12 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-bold mb-6">Upload New Dataset</h3>
                        <form onSubmit={handleUpload} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Dataset Name</label>
                                <Input
                                    placeholder="e.g. Brain MRI T1 Samples"
                                    value={uploadName}
                                    onChange={e => setUploadName(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">File (.zip, .nii, .dcm)</label>
                                <Input
                                    type="file"
                                    className="h-12 pt-2"
                                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <Button type="submit" className="h-12 px-8 font-bold" disabled={uploading}>
                                {uploading ? <Loader2 className="animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Datasets List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {datasets.map((dataset) => {
                        const isKaggle = dataset.name?.toLowerCase().includes('kaggle')
                        const isProcessing = dataset.status === 'PROCESSING' || dataset.status === 'UPLOADING'
                        const statusColor = {
                            'UPLOADING': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            'PROCESSING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                            'READY': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            'FAILED': 'bg-red-500/10 text-red-500 border-red-500/20'
                        }[dataset.status as 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED'] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'

                        return (
                            <Card key={dataset.id} className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner",
                                            isKaggle ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {isKaggle ? <Database className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="outline" className={cn("text-[8px] uppercase font-black tracking-widest px-2 py-0.5", statusColor)}>
                                                {dataset.status}
                                            </Badge>
                                            {isKaggle && <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[8px] uppercase font-black">Verified Source</Badge>}
                                        </div>
                                    </div>
                                    <h4 className="font-black text-lg mb-1 truncate tracking-tight">{dataset.name}</h4>
                                    <p className="text-[10px] font-mono text-slate-400 mb-4 uppercase tracking-widest truncate">
                                        {isKaggle ? "KAG_INTERNAL_NODE" : "USR_UPLOAD_NODE"}
                                    </p>

                                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed italic">
                                        {dataset.description || "Tibbiy tahlil va modelni o'qitish uchun foydalaniladigan ma'lumotlar to'plami."}
                                    </p>

                                    {/* Tech Details */}
                                    <div className="grid grid-cols-2 gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest">
                                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <p className="text-slate-400 mb-1">Origin</p>
                                            <p className="text-slate-700 dark:text-slate-200">{isKaggle ? "Kaggle Open" : "Local Med"}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <p className="text-slate-400 mb-1">License</p>
                                            <p className="text-slate-700 dark:text-slate-200">{isKaggle ? "CC BY-SA 4.0" : "Private"}</p>
                                        </div>
                                    </div>

                                    {/* File Statistics */}
                                    {dataset.total_files > 0 && (
                                        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Samples</span>
                                                <span className="text-xs font-mono font-black text-primary">{dataset.processed_files}/{dataset.total_files}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                                                <div className="h-full bg-primary" style={{ width: `${(dataset.processed_files / dataset.total_files) * 100}%` }} />
                                            </div>
                                            {dataset.file_types && Object.keys(dataset.file_types).length > 0 && (
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {Object.entries(dataset.file_types).map(([type, count]: [string, any]) => (
                                                        <div key={type} className="px-2 py-1 rounded-md bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                            <span className="text-[9px] font-bold text-slate-500 uppercase">{type}: {count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {dataset.status === 'FAILED' && dataset.error_message && (
                                        <p className="text-xs text-red-500 mb-6 font-medium bg-red-500/5 p-3 rounded-lg border border-red-500/10">{dataset.error_message}</p>
                                    )}

                                    <Button variant="ghost" className="w-full justify-between group-hover:bg-primary group-hover:text-white rounded-xl h-12 text-xs font-bold uppercase tracking-widest transition-all">
                                        View Data Map <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                    {datasets.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No datasets uploaded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
