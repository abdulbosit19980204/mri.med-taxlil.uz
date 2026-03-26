"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Download, Activity, User, Clock, AlertTriangle, Loader2, Info, ChevronRight, CornerDownRight, Database, Plus as PlusIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'
import { apiClient } from "@/lib/api-client"
import { useLanguage } from "@/context/language-context"
import AIChat from "@/components/ai-chat"

const DicomViewer = dynamic(() => import('@/components/dicom-viewer'), { ssr: false })
const BrainViewer3D = dynamic(() => import('@/components/brain-viewer-3d'), { ssr: false })

export default function ReportPage({ params }: { params: { id: string } }) {
    const { t } = useLanguage()
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [showChat, setShowChat] = useState(false)

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                const res = await apiClient.get(`/analyses/${params.id}/`)
                if (!res.ok) throw new Error(t.common.error)
                const data = await res.json()
                setAnalysis(data)

                if (data.status === 'PROCESSING' || data.status === 'PENDING') {
                    setTimeout(fetchAnalysis, 5000)
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalysis()
    }, [params.id, t.common.error])

    if (loading && !analysis) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-primary">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="font-mono tracking-widest animate-pulse uppercase">Initializing Neural Link...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-destructive">
                <AlertTriangle className="h-12 w-12" />
                <p className="font-mono tracking-widest uppercase">{error}</p>
                <Link href="/dashboard">
                    <Button variant="outline" className="border-destructive/50 text-destructive">{t.common.back}</Button>
                </Link>
            </div>
        )
    }

    const getFullUrl = (path: string) => {
        if (!path) return ""
        if (path.startsWith('http')) return path
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
        return `${baseUrl}${path}`
    }

    const { result, status, type, user_email, created_at } = analysis
    const aiResult = result?.ai_analysis || result
    const metadata = result?.dicom_metadata || {}
    const isDicom = result?.is_dicom || analysis.file?.toLowerCase().endsWith('.dcm')
    const dicomUrl = getFullUrl(analysis.file)
    // Build absolute frame URLs (backend may return relative /media/... paths)
    const frames: string[] = (result?.frames || []).map((f: string) => getFullUrl(f))

    return (
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-mono text-left">
            {/* Top Bar - HUD Style */}
            <header className="h-16 border-b border-primary/30 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-primary hover:text-white hover:bg-primary/20">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="h-8 w-[1px] bg-primary/30" />
                    <div className="text-left">
                        <h1 className="text-lg font-bold tracking-widest text-primary uppercase">
                            {t.report.protocol} <span className="text-white">#{params.id.substring(0, 8).toUpperCase()}</span>
                        </h1>
                        <p className="text-[10px] text-primary/60 uppercase tracking-[0.2em]">Status: {status} • Latency: 12ms</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setShowChat(true)}
                        className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/30"
                    >
                        <Sparkles className="h-4 w-4" />
                        AI Ask
                    </Button>
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded border border-primary/20 bg-primary/5 text-xs text-primary ${status === 'PROCESSING' ? 'animate-pulse' : ''}`}>
                        <div className={`h-2 w-2 rounded-full ${status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                        SYSTEM_{status}
                    </div>
                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-white transition-all uppercase text-xs tracking-wider gap-2">
                        <Download className="h-3 w-3" /> {t.report.export}
                    </Button>
                </div>
            </header>

            <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
                {/* Left HUD Panel */}
                <aside className="w-96 border-r border-primary/20 bg-black/40 backdrop-blur-sm flex flex-col overflow-hidden">
                    <Tabs defaultValue="findings" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="bg-transparent border-b border-primary/20 rounded-none h-12 shrink-0 justify-start px-4">
                            <TabsTrigger value="findings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-[10px] uppercase font-bold tracking-widest">Findings</TabsTrigger>
                            <TabsTrigger value="metadata" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none text-[10px] uppercase font-bold tracking-widest">Metadata</TabsTrigger>
                        </TabsList>

                        <TabsContent value="findings" className="flex-1 overflow-y-auto p-4 space-y-4 m-0 custom-scrollbar min-h-0">
                            {/* Basic Preview Info */}
                            <Card className="bg-primary/5 border-primary/20 rounded-none text-left">
                                <CardContent className="p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t.report.subject}</span>
                                        <span className="text-white font-bold truncate max-w-[150px]">{analysis.patient_name || metadata.Patient?.PatientName || user_email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Scan Modality</span>
                                        <span className="text-white uppercase">{analysis.scan_type || metadata.Study?.Modality || type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Field Strength</span>
                                        <span className="text-white font-mono text-primary">{metadata.Equipment?.MagneticFieldStrength || '1.5T (Std)'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">AI Speed</span>
                                        <span className="text-white font-mono text-emerald-500">{aiResult?.workflow_speed || '---'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 ml-1">Integrated Detection Log</h3>

                            {!aiResult && status === 'PROCESSING' && (
                                <div className="text-center py-20 opacity-50 space-y-4">
                                    <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-[10px] uppercase tracking-widest text-primary animate-pulse">{t.report.inference}</p>
                                </div>
                            )}

                            {/* Acquisition Parameters injected into log */}
                            {metadata.Equipment && (
                                <div className="p-3 border border-primary/10 bg-primary/1 rounded-sm text-left mb-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Hardware Context</span>
                                    </div>
                                    <div className="flex gap-4 text-[9px] font-mono text-primary/60">
                                        <span>TR: {metadata.Equipment.RepetitionTime}ms</span>
                                        <span>TE: {metadata.Equipment.EchoTime}ms</span>
                                        <span>THK: {metadata.Image.SliceThickness}mm</span>
                                    </div>
                                </div>
                            )}

                            {aiResult?.findings?.map((finding: any, i: number) => (
                                <div key={i} className="group relative p-4 border border-primary/20 bg-primary/2 hover:bg-primary/5 transition-all text-left">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-px w-3 bg-primary/50" />
                                            <span className="font-bold text-primary tracking-wide uppercase text-xs">{finding.type}</span>
                                        </div>
                                        <Badge variant="outline" className={`border-primary/30 text-primary text-[8px] uppercase font-black ${finding.status === 'CLEAR' || finding.status === 'NORMAL' || finding.status === 'OPTIMAL' ? 'text-emerald-500 border-emerald-500' : 'text-amber-500 border-amber-500'}`}>
                                            {finding.status}
                                        </Badge>
                                    </div>
                                    <div className="text-[11px] text-gray-400 space-y-1 pl-5 border-l border-primary/10 ml-1.5 mt-2">
                                        <p>Value: <span className="text-white font-bold">{finding.value}</span></p>
                                        <p className="text-[10px] italic leading-tight text-slate-500">{finding.description}</p>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="metadata" className="flex-1 overflow-y-auto p-4 space-y-6 m-0 custom-scrollbar min-h-0">
                            <MetadataSection title="Patient Demographics" icon={<User size={12} />} data={metadata.Patient} />
                            <MetadataSection title="Study Parameters" icon={<Info size={12} />} data={metadata.Study} />
                            <MetadataSection title="Technical Settings" icon={<Activity size={12} />} data={metadata.Equipment} />
                            <MetadataSection title="Image Attributes" icon={<Database size={12} />} data={metadata.Image} />
                            <MetadataSection title="System Extended Tags" icon={<PlusIcon size={12} />} data={metadata.Other} />
                        </TabsContent>
                    </Tabs>
                </aside>

                {/* Main Viewport */}
                <main className="flex-1 relative bg-black flex flex-col p-4 overflow-hidden">
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center border border-primary/20 bg-primary/2 rounded-3xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 to-black z-0" />

                        {status === 'COMPLETED' ? (
                            <div className="w-full h-full p-4 flex flex-col lg:flex-row gap-6 items-center justify-center z-10 overflow-hidden">
                                {/* Interactive DICOM Viewer or Static Preview */}
                                <div className="flex-1 w-full h-full flex flex-col gap-4 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Live_Visual_Node</span>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] uppercase tracking-[0.2em] border-primary/30">Scale: 1:1</Badge>
                                    </div>

                                    {isDicom ? (
                                        <DicomViewer imageUrl={dicomUrl} frames={frames} className="flex-1" />
                                    ) : (
                                        <div className="flex-1 relative border border-primary/20 rounded-3xl overflow-hidden bg-black/50 group">
                                            <img
                                                src={getFullUrl(analysis.preview_image || analysis.file)}
                                                alt="Scan"
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>

                                {/* 3D Projection */}
                                <div className="w-80 h-full flex flex-col gap-4 hidden xl:flex">
                                    <div className="h-[350px] border border-primary/20 rounded-3xl bg-black/40 relative overflow-hidden group">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">3D_VOXEL_CLOUD</span>
                                        </div>
                                        <BrainViewer3D className="w-full h-full" autoRotate={true} />
                                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.4))]" />
                                    </div>

                                    <div className="flex-1 border border-primary/20 rounded-3xl bg-primary/5 p-6 flex flex-col justify-center text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Neural Confidence</p>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-4xl font-black italic">{(aiResult?.accuracy * 100 || 0).toFixed(1)}%</span>
                                            <span className="text-xs text-emerald-500 mb-1 font-bold tracking-tight">↑ 0.4%</span>
                                        </div>
                                        <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${aiResult?.accuracy * 100 || 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="z-10 text-center space-y-6">
                                <div className="h-48 w-48 border-2 border-primary/20 rounded-full flex items-center justify-center relative mx-auto">
                                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                                    <Activity className="h-16 w-16 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-[0.3em] uppercase">{status}</h3>
                                    <p className="text-xs text-primary/50 font-mono uppercase">{t.report.reconstructing}</p>
                                </div>
                            </div>
                        )}

                        {/* Corner Data HUD */}
                        <div className="absolute bottom-6 left-6 text-left opacity-30 pointer-events-none group-hover:opacity-100 transition-opacity">
                            <p className="text-[8px] font-bold uppercase tracking-[0.4em] mb-4">Diagnostic Context</p>
                            <div className="space-y-1 text-[9px] font-mono">
                                <div className="flex gap-4"><span>RENDER_CORE:</span> <span className="text-white">CORNERSTONE_V3</span></div>
                                <div className="flex gap-4"><span>SLICE_POS:</span> <span className="text-white">Z_42.5MM</span></div>
                                <div className="flex gap-4"><span>COORD_SYS:</span> <span className="text-white">DICOM_LPS</span></div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* AI Chat Panel */}
            {showChat && <AIChat analysisId={params.id} onClose={() => setShowChat(false)} />}
        </div>
    )
}

/** Formats any DICOM value (string, array, nested object/sequence) into readable text */
function formatDicomValue(value: any, depth = 0): React.ReactNode {
    if (value === null || value === undefined) return <span className="text-slate-600 italic">N/A</span>

    // Sequence (array of objects) – render each item as collapsible sub-section
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-slate-600 italic">Empty</span>
        // Array of primitives – join them
        if (typeof value[0] !== 'object') return <span className="text-slate-200">{value.join(', ')}</span>
        // Array of objects (DICOM sequence)
        return (
            <div className="space-y-1 mt-1">
                {value.map((item: any, i: number) => (
                    <div key={i} className="border-l border-primary/10 pl-2">
                        <span className="text-[8px] text-primary/30 uppercase font-bold">Item {i + 1}</span>
                        {typeof item === 'object' && item !== null
                            ? Object.entries(item).map(([k, v]: [string, any]) => (
                                <div key={k} className="flex flex-col mt-0.5">
                                    <span className="text-[8px] uppercase text-slate-600 font-bold tracking-wider">{k}</span>
                                    <span className="text-[10px] text-slate-300">{formatDicomValue(v, depth + 1)}</span>
                                </div>
                            ))
                            : <span className="text-[10px] text-slate-300">{String(item)}</span>
                        }
                    </div>
                ))}
            </div>
        )
    }

    // Plain object (nested tags)
    if (typeof value === 'object') {
        return (
            <div className="space-y-1 mt-1">
                {Object.entries(value).map(([k, v]: [string, any]) => (
                    <div key={k} className="border-l border-primary/10 pl-2">
                        <span className="text-[8px] uppercase text-slate-600 font-bold tracking-wider">{k}</span>
                        <div className="text-[10px] text-slate-300">{formatDicomValue(v, depth + 1)}</div>
                    </div>
                ))}
            </div>
        )
    }

    // Primitive
    return <span className="text-slate-200">{String(value)}</span>
}

function MetadataSection({ title, icon, data }: { title: string, icon: React.ReactNode, data: any }) {
    if (!data || Object.keys(data).length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary/60">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">{title}</span>
            </div>
            <div className="border-l border-primary/20 ml-1.5 pl-4 space-y-2">
                {Object.entries(data).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">{key.replace(/_/g, ' ')}</span>
                        <div className="text-xs">{formatDicomValue(value)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
