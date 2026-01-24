'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft, ZoomIn, ZoomOut, RotateCw, Download, Share2,
  ChevronLeft, ChevronRight, Volume2, Home, Maximize2, Settings, List
} from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'

const DicomViewer = dynamic(() => import('@/components/dicom-viewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-3xl border border-primary/20 animate-pulse text-xs font-mono uppercase text-primary/40">Initializing_Viewer_Node...</div>
})

function ViewerContent() {
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('id')
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (analysisId) {
      apiClient.get(`/analyses/${analysisId}/`).then(res => res.json()).then(data => {
        setAnalysis(data)
        setLoading(false)
      })
    }
  }, [analysisId])

  const imageUrl = analysis?.file || '/placeholder_mri.jpg'

  return (
    <div className="min-h-screen bg-black flex flex-col font-mono text-left">
      {/* HUD Bar */}
      <div className="bg-black/80 backdrop-blur-md border-b border-primary/20 p-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-primary hover:text-white hover:bg-primary/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="h-8 w-[1px] bg-primary/20" />
            <div className="text-left">
              <h1 className="text-sm font-black text-primary uppercase tracking-[0.2em]">
                {analysis?.result?.dicom_metadata?.patient_info?.name || 'Anonymous Subject'}
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                ID: {analysisId?.substring(0, 8) || 'SYSTEM_NODE'} • Modality: {analysis?.type || 'MR'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-primary/5 border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] lowercase text-primary/70">engine: monai_v3.2</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><Share2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white"><Download className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Nav Tools */}
        <div className="w-16 bg-black border-r border-primary/10 flex flex-col items-center py-6 gap-6">
          <NavToolItem icon={<List size={20} />} label="Series" />
          <NavToolItem icon={<Settings size={20} />} label="Filter" active />
          <NavToolItem icon={<Volume2 size={20} />} label="3D" />
        </div>

        {/* Viewport Area */}
        <div className="flex-1 flex flex-col bg-[#050505] relative">
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.5em] mb-4">Diagnostic_Workspace</p>
            <div className="space-y-1 text-[8px] font-mono text-white/30">
              <p>SLICE: 0/0</p>
              <p>THICKNESS: 1.0MM</p>
              <p>ZOOM: AUTO</p>
            </div>
          </div>

          <div className="flex-1 p-4 flex items-center justify-center">
            <DicomViewer
              imageUrl={imageUrl}
              className="w-full h-full border-none shadow-none"
            />
          </div>

          {/* Slice Slider HUD */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-1 bg-primary/10 rounded-full">
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-primary bg-black" />
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-96 bg-black border-l border-primary/10 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-primary/10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Neural Insights</h3>

            <div className="space-y-4">
              {analysis?.result?.ai_analysis?.findings?.map((f: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{f.type}</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase">{f.status}</Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-black italic">{f.value}</span>
                    <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
              {!analysis?.result?.ai_analysis?.findings && (
                <div className="py-20 text-center opacity-20">
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em]">No_Detections_Cached</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Actions</h3>
            <div className="space-y-3">
              <ActionButton label="Measure Distance" />
              <ActionButton label="Area Computation" />
              <ActionButton label="Voxel Segmentation" />
            </div>

            <div className="mt-auto">
              <Link href={`/report/${analysisId}`} className="block">
                <Button className="w-full h-14 bg-primary text-white font-black italic rounded-2xl shadow-2xl shadow-primary/20">
                  GENERATE FINAL REPORT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-primary font-mono uppercase tracking-widest animate-pulse">Initializing Interface...</div>}>
      <ViewerContent />
    </Suspense>
  )
}

function NavToolItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? 'text-primary' : 'text-white/20 hover:text-white/50'}`}>
      {icon}
      <span className="text-[8px] uppercase font-black tracking-widest">{label}</span>
    </div>
  )
}

function ActionButton({ label }: { label: string }) {
  return (
    <Button variant="outline" className="w-full h-12 border-primary/10 bg-transparent text-white/50 text-[10px] uppercase font-black tracking-widest hover:border-primary hover:text-white rounded-xl">
      {label}
    </Button>
  )
}
