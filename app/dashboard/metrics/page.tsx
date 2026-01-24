"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart4, TrendingUp, Activity, Database, Clock, Layers, FileText, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function MetricsPage() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await apiClient.get('/metrics/')
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (e) {
                console.error("Failed to fetch metrics", e)
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()

        // Setup polling if there's a running session
        const interval = setInterval(() => {
            const hasRunning = data?.sessions?.some((s: any) => s.status === 'RUNNING')
            if (hasRunning || loading) {
                fetchMetrics()
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [data?.sessions, loading])

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-black">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const { sessions, datasets_summary, overall } = data || {}
    const lastAccuracy = (overall?.last_accuracy * 100).toFixed(1) + '%'
    const lastValAccuracy = (overall?.last_val_accuracy * 100).toFixed(1) + '%'
    const totalFiles = datasets_summary?.total_files || 0

    const handleStartTraining = async () => {
        setStarting(true)
        try {
            const res = await apiClient.post('/datasets/train/', {})
            if (res.ok) {
                toast.success("AI Training session initiated successfully!", {
                    description: "Monitor the logs in the dashboard as the model evolves."
                })
                // Refresh data after a short delay
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            } else {
                toast.error("Failed to start training session.")
            }
        } catch (e) {
            console.error("Training trigger failed", e)
            toast.error("A network error occurred.")
        } finally {
            setStarting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                AI Performance
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Deep dive into model training and dataset insights</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                            <Button
                                onClick={handleStartTraining}
                                disabled={starting}
                                className="bg-primary hover:bg-primary/90 rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 gap-2 transition-all active:scale-95"
                            >
                                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-white" />}
                                {starting ? "Initializing..." : "Start Training"}
                            </Button>
                        )}
                        <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5 text-primary h-12 flex items-center rounded-2xl">
                            Sessions: {sessions?.length || 0}
                        </Badge>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <MetricCard
                        title="Model Accuracy"
                        value={lastAccuracy}
                        trend="Live"
                        icon={<Activity className="h-6 w-6 text-white" />}
                        color="bg-primary"
                    />
                    <MetricCard
                        title="Validation Accuracy"
                        value={lastValAccuracy}
                        trend="Final"
                        icon={<TrendingUp className="h-6 w-6 text-white" />}
                        color="bg-emerald-500"
                    />
                    <MetricCard
                        title="Training Samples"
                        value={totalFiles > 1000 ? (totalFiles / 1000).toFixed(1) + 'k' : totalFiles.toString()}
                        trend={`${datasets_summary?.dataset_count || 0} Sets`}
                        icon={<Database className="h-6 w-6 text-white" />}
                        color="bg-blue-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Training History Table */}
                    <Card className="lg:col-span-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-[40px] overflow-hidden shadow-xl shadow-black/5">
                        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" /> Training History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-white/2">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Epochs</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {sessions?.map((session: any) => (
                                        <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors border-b border-slate-50 dark:border-white/5">
                                            <td className="px-8 py-6">
                                                <p className="font-mono text-xs text-primary font-bold">#{session.id}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <Badge className={cn("text-[8px] uppercase font-black",
                                                        session.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            (session.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500')
                                                    )}>
                                                        {session.status}
                                                    </Badge>
                                                    {session.status === 'FAILED' && (
                                                        <p className="text-[9px] text-red-400 font-mono truncate max-w-[150px]" title={session.log_output}>
                                                            {session.log_output}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black italic">{(session.accuracy * 100).toFixed(1)}%</span>
                                            </td>
                                            <td className="px-8 py-6 text-slate-500 font-bold">{session.epochs}</td>
                                            <td className="px-8 py-6 text-xs text-slate-400">
                                                {new Date(session.started_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!sessions || sessions.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400">No training sessions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Training Protocol HUD */}
                        <div className="p-8 bg-primary/5 border-t border-primary/10">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="h-4 w-4 text-primary" />
                                <h4 className="text-xs font-black uppercase tracking-[0.2em]">O'qitish Tartibi (Training Protocol)</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 text-[11px] text-slate-500 leading-relaxed font-bold">
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2"><div className="h-1 w-1 bg-primary rounded-full" /> Kamida 100 ta DICOM namunasi tavsiya etiladi.</p>
                                    <p className="flex items-center gap-2"><div className="h-1 w-1 bg-primary rounded-full" /> Har bir klass uchun muvozanatli ma'lumotlar zarur.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2"><div className="h-1 w-1 bg-primary rounded-full" /> GPU tezlatkich mavjudligi analizni 10 barobar tezlashtiradi.</p>
                                    <p className="flex items-center gap-2"><div className="h-1 w-1 bg-primary rounded-full" /> Har bir "Epoch" modelni aniqligini ~2% ga oshiradi.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Dataset Distribution */}
                    <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-[40px] p-8 shadow-xl shadow-black/5">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" /> Data Insights
                        </h3>

                        {/* Specific Datasets List */}
                        <div className="mb-10 space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Sources</p>
                            {datasets_summary?.active_datasets?.map((ds: any) => (
                                <div key={ds.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold truncate max-w-[140px]">{ds.name}</span>
                                        <span className="text-[10px] font-mono text-primary">{ds.total_files}</span>
                                    </div>
                                    <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(ds.total_files / totalFiles) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:divide-white/5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Class Distribution</p>
                            {datasets_summary?.type_distribution && Object.entries(datasets_summary.type_distribution).map(([type, count]: [string, any]) => (
                                <div key={type} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{type}</span>
                                        <span className="text-xs font-black text-primary">{count} files</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(count / totalFiles) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex gap-4 items-center mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Total Datasets</p>
                                        <p className="font-black text-slate-900 dark:text-white">{datasets_summary?.dataset_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: string }) {
    return (
        <Card className="rounded-[40px] border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg", color)}>
                        {icon}
                    </div>
                    <Badge variant="outline" className="rounded-full font-black px-3 py-1 text-[8px] uppercase border-slate-200 dark:border-white/10">
                        {trend}
                    </Badge>
                </div>
                <div>
                    <h3 className="text-4xl font-black tracking-tighter mb-1 italic text-slate-900 dark:text-white">{value}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}
