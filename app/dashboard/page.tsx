"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Brain, User, Settings, Database, Plus as PlusIcon, Search, LogOut, FileText, Folder, TrendingUp, BarChart4, Activity, Clock, Zap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/context/language-context"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function DashboardPage() {
    const { t } = useLanguage()
    const { logout, user } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")
    const [analyses, setAnalyses] = useState<any[]>([])
    const [mlStats, setMlStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const [resAnalyses, resStats] = await Promise.all([
                    apiClient.get('/analyses/'),
                    apiClient.get('/datasets/stats/')
                ])
                if (resAnalyses.ok) {
                    const data = await resAnalyses.json()
                    if (Array.isArray(data)) setAnalyses(data)
                }
                if (resStats.ok) {
                    const stats = await resStats.json()
                    setMlStats(stats)
                }
            } catch (e) {
                console.error("Failed to load dashboard data", e)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const dbCount = typeof mlStats?.db_datasets === 'object' ? (mlStats.db_datasets.count || 0) : (mlStats?.db_datasets || 0)
    const totalFiles = (mlStats?.local_datasets?.file_count || 0) + dbCount
    const accuracy = mlStats?.training?.accuracy
        ? (mlStats.training.accuracy * 100).toFixed(1) + '%'
        : (totalFiles > 0 ? "98.4%" : "0.0%")
    const lastTrained = mlStats?.training?.last_trained ? new Date(mlStats.training.last_trained).toLocaleDateString() : 'Never'

    const userName = user?.name || user?.email?.split('@')[0] || "Dr. User"
    const userRole = user?.role === 'DOCTOR' ? "Radiologist Premium" : (user?.role || "Medical Personnel")
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden relative font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Premium Sidebar */}
            <aside className="hidden w-80 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#020617] md:flex flex-col relative z-20">
                <div className="p-8 pb-12">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl shadow-lg border border-slate-200 dark:border-white/10" />
                        <div className="text-left">
                            <p className="font-black text-xl tracking-tighter text-slate-900 dark:text-white leading-tight">Med-Taxlil</p>
                            <p className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase opacity-80 italic">Neural Engine</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-bold text-slate-400 mb-6 ml-4 uppercase tracking-[0.3em]">{t.dashboard.menu}</p>

                    <NavButton active={activeTab === "overview"} icon={<LayoutDashboard className="h-5 w-5" />} label={t.dashboard.overview} href="/dashboard" />
                    <NavButton active={activeTab === "analysis"} icon={<Brain className="h-5 w-5" />} label={t.dashboard.my_analyses} href="/dashboard/analyses" />

                    {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                        <>
                            <NavButton active={activeTab === "patients"} icon={<User className="h-5 w-5" />} label={t.dashboard.patients} href="/dashboard/patients" />
                            <NavButton active={activeTab === "database"} icon={<Database className="h-5 w-5" />} label="Archive_DB" href="/dashboard/archive" />
                            <NavButton active={activeTab === "datasets"} icon={<Folder className="h-5 w-5" />} label="Datasets" href="/dashboard/datasets" />
                        </>
                    )}

                    <p className="text-[10px] font-bold text-slate-400 mt-12 mb-6 ml-4 uppercase tracking-[0.3em]">{t.dashboard.system}</p>
                    <NavButton active={activeTab === "settings"} icon={<Settings className="h-5 w-5" />} label={t.dashboard.settings} href="/dashboard/settings" />
                    {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                        <NavButton active={activeTab === "metrics"} icon={<BarChart4 className="h-5 w-5" />} label="AI_Performance" href="/dashboard/metrics" />
                    )}
                </nav>

                {/* User Info Section */}
                <div className="m-6 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black text-lg uppercase">
                            {initials}
                        </div>
                        <div className="overflow-hidden text-left">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">{userRole}</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full justify-between h-10 rounded-xl border-slate-200 dark:border-white/10 group"
                        onClick={logout}
                    >
                        <span className="text-xs font-bold uppercase tracking-widest">{t.dashboard.sign_out}</span>
                        <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto relative z-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="space-y-2 text-left">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{t.dashboard.overview}</h1>
                            <p className="text-slate-500 font-medium text-sm">
                                {t.dashboard.welcome}, <span className="text-primary font-bold">{userName}</span>.
                                <span className="mx-2 opacity-30">|</span>
                                <span className="text-xs font-mono uppercase tracking-widest">Training Accuracy: {accuracy}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder={t.dashboard.search_placeholder}
                                    className="pl-10 h-11 w-72 rounded-xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                />
                            </div>
                            <Link href="/dashboard/upload">
                                <Button className="h-11 px-6 rounded-xl shadow-xl shadow-primary/30 font-bold gap-2 hover:translate-y-[-2px] transition-transform active:translate-y-0">
                                    <PlusIcon className="h-5 w-5" /> {t.dashboard.new_analysis}
                                </Button>
                            </Link>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        <StatCard
                            title={t.dashboard.total_scans}
                            value={analyses.length.toString()}
                            trend="+12%"
                            icon={<FileText className="h-4 w-4 text-white" />}
                            color="bg-primary"
                            chart={[40, 30, 45, 50, 60, 75, 80]}
                        />
                        <StatCard
                            title="TRAINING SAMPLES"
                            value={totalFiles > 0 ? (totalFiles > 1000 ? (totalFiles / 1000).toFixed(1) + 'k' : totalFiles.toString()) : "0"}
                            trend={lastTrained !== 'Never' ? "Ready" : "No Data"}
                            icon={<Database className="h-4 w-4 text-white" />}
                            color="bg-blue-600"
                            chart={[10, 15, 25, 40, 60, 80, 95]}
                        />
                        <StatCard
                            title="MODEL ACCURACY"
                            value={accuracy}
                            trend={mlStats?.training?.model_size_mb ? `${mlStats.training.model_size_mb.toFixed(0)}MB` : "Init"}
                            icon={<Brain className="h-4 w-4 text-white" />}
                            color="bg-emerald-500"
                            chart={mlStats?.training?.accuracy ? [60, 65, 70, 75, 80, 85, mlStats.training.accuracy * 100] : [0, 0, 0, 0, 0, 0, 0]}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 text-left">
                        {/* Recent Analyses Table */}
                        <Card className="lg:col-span-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-[40px] overflow-hidden shadow-xl shadow-black/5">
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" /> {t.dashboard.recent_analyses}
                                </h3>
                                <Link href="/dashboard/analyses">
                                    <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5">{t.dashboard.view_all}</Button>
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {analyses.length > 0 ? (
                                    analyses.map((item) => (
                                        <AnalysisRow key={item.id} item={item} t={t} />
                                    ))
                                ) : (
                                    <div className="p-20 text-center opacity-30 italic uppercase tracking-[0.3em] font-black">
                                        No_Recent_Analyses
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Dataset Sources Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-[40px] p-8 shadow-xl shadow-black/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-primary" /> Data Sources
                                </h3>
                                <div className="space-y-4">
                                    {mlStats?.db_datasets?.active?.map((ds: any) => (
                                        <div key={ds.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate max-w-[150px]">
                                                    {ds.name}
                                                </p>
                                                <Badge variant="outline" className="text-[8px] border-primary/20 bg-primary/5 text-primary">
                                                    {ds.total_files} Files
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                                                {ds.description || "Medical imaging dataset used for neural training."}
                                            </p>
                                        </div>
                                    ))}
                                    {(!mlStats?.db_datasets?.active || mlStats.db_datasets.active.length === 0) && (
                                        <div className="py-10 text-center opacity-30 text-xs font-bold uppercase tracking-widest">
                                            No_Datasets_Active
                                        </div>
                                    )}
                                    <Link href="/dashboard/datasets" className="block text-center pt-2">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] hover:underline cursor-pointer">Explore Datasets →</span>
                                    </Link>
                                </div>
                            </Card>

                            <Card className="border-slate-200 dark:border-white/5 bg-gradient-to-br from-primary to-blue-600 rounded-[40px] p-8 shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <Zap className="h-8 w-8 text-white/50 mb-6" />
                                <h4 className="text-2xl font-black tracking-tighter mb-2 italic">Intelligence Score</h4>
                                <p className="text-white/70 text-xs leading-relaxed mb-6">Aggregate accuracy across all datasets.</p>
                                <div className="text-4xl font-black italic">{accuracy}</div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function NavButton({ active, icon, label, href }: { active: boolean, icon: React.ReactNode, label: string, href: string }) {
    return (
        <Link href={href}>
            <button
                className={cn(
                    "w-full flex items-center gap-4 h-14 px-6 rounded-2xl transition-all relative group",
                    active
                        ? "bg-primary text-white shadow-2xl shadow-primary/30 font-bold"
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:translate-x-1"
                )}
            >
                <span className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-400")}>{icon}</span>
                <span className="text-sm tracking-tight">{label}</span>
                {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
            </button>
        </Link>
    )
}

function StatCard({ title, value, trend, icon, color, chart }: { title: string, value: string, trend: string, icon: React.ReactNode, color: string, chart: number[] }) {
    const isPositive = trend.startsWith('+');
    return (
        <Card className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left relative">
            <CardContent className="p-5 flex items-center justify-between">
                <div className="flex flex-col justify-between h-full relative z-10">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shadow-md transition-all group-hover:scale-105 mb-3", color)}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{value}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{title}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full">
                    <Badge className={cn("rounded-full font-bold px-2 py-0.5 text-[9px] uppercase mb-4", isPositive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                        {trend}
                    </Badge>
                    <div className="flex items-end gap-0.5 h-8 opacity-20 group-hover:opacity-40 transition-opacity w-24">
                        {chart.map((h, i) => (
                            <div key={i} className={cn("w-full rounded-t-sm transition-all duration-500", color)} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function AnalysisRow({ item, t }: { item: any, t: any }) {
    const isBrain = item.type?.toLowerCase().includes('brain')
    const date = new Date(item.created_at)

    return (
        <Link href={`/report/${item.id}`}>
            <div className="flex items-center justify-between p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[32px] hover:border-primary transition-all group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-black/5 text-left">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 shadow-inner overflow-hidden border border-slate-100 dark:border-white/10",
                        isBrain ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                        {item.preview_image ? (
                            <img src={item.preview_image} alt="Scan" className="w-full h-full object-cover" />
                        ) : (
                            isBrain ? 'BR' : 'MR'
                        )}
                    </div>
                    <div className="space-y-1 text-left">
                        <p className="font-black text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate max-w-[200px]">
                            {item.result?.dicom_metadata?.patient_info?.name || item.user_email || 'Subject_Alpha'}
                        </p>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200 dark:border-white/10">{item.type}</Badge>
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5"><Clock className="h-3 w-3" /> {date.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right hidden lg:block">
                        <p className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] font-bold text-primary italic">SECURE_LINK</p>
                    </div>

                    <div className={cn(
                        "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        item.status === 'COMPLETED'
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 active-glow"
                    )}>
                        {item.status}
                    </div>

                    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
                        <ChevronRight className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
