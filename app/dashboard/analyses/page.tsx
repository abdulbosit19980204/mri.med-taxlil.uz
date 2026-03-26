'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Search, Plus as PlusIcon, Eye, Download, Share2, Trash2,
  CheckCircle2, Clock, AlertCircle, Zap, Filter, Loader2
} from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { apiClient } from '@/lib/api-client'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { exportAnalysisPDF } from '@/lib/export-pdf'

/** Build absolute URL from a relative /media/... path. */
function toAbsUrl(path: string): string {
    if (!path || path.startsWith('http')) return path
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    return `${base}${path}`
}

/** Compute health level from AI findings */
function getHealthLevel(item: any): 'healthy' | 'warning' | 'sick' | 'unknown' {
  const findings: any[] = item.result?.ai_analysis?.findings || []
  if (!findings.length) return 'unknown'
  const bad = findings.filter(f => f.status && !['CLEAR','NORMAL','OPTIMAL','VALID'].includes(f.status.toUpperCase()))
  if (bad.length === 0) return 'healthy'
  if (bad.length >= findings.length) return 'sick'
  return 'warning'
}

const HEALTH = {
  healthy: { border: 'border-l-4 border-emerald-500',  badge: 'bg-emerald-500/10 text-emerald-500',  label: '✓ Sog\'lom' },
  warning: { border: 'border-l-4 border-amber-500',    badge: 'bg-amber-500/10 text-amber-500',    label: '⚠ Shubhali' },
  sick:    { border: 'border-l-4 border-red-500',      badge: 'bg-red-500/10 text-red-500',        label: '✕ Kassal' },
  unknown: { border: '',                                badge: 'bg-slate-500/10 text-slate-400',   label: '— Noma\'lum' },
}

export default function AnalysesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnalyses(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus])

  useEffect(() => {
    loadAnalyses(page)
  }, [page])

  async function loadAnalyses(pageNumber = 1) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        search: searchQuery,
        status: filterStatus
      })
      const res = await apiClient.get(`/analyses/?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        // Handle paginated or non-paginated response
        if (data.results) {
          setAnalyses(data.results)
          setTotalCount(data.count)
          setTotalPages(Math.ceil(data.count / 10)) // Assuming PAGE_SIZE is 10
        } else {
          setAnalyses(data)
          setTotalCount(data.length)
          setTotalPages(1)
        }
      }
    } catch (e) {
      console.error("Failed to load analyses", e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Haqiqatdan ham bu tahlilni o'chirib tashlamoqchimisiz? Barcha fayllar va hisobotlar butunlay yo'qoladi.")) return
    
    try {
      const res = await apiClient.delete(`/analyses/${id}/`)
      if (res.ok) {
        setAnalyses(prev => prev.filter(p => p.id !== id))
        setTotalCount(prev => prev - 1)
      } else {
        alert("O'chirishda xatolik yuz berdi")
      }
    } catch (err) {
      console.error(err)
      alert("Server bilan bog'lanishda xatolik")
    }
  }

  const handleDownload = async (analysis: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (analysis.status === 'COMPLETED') {
      // Logic from walkthrough suggests PDF is favored for completed
      try {
        await exportAnalysisPDF(analysis)
      } catch (err) {
        console.error(err)
        // Fallback to raw file if PDF fails
        window.open(toAbsUrl(analysis.file), '_blank')
      }
    } else {
      // Just download the raw file for pending/processing
      window.open(toAbsUrl(analysis.file), '_blank')
    }
  }

  const filteredAnalyses = analyses // Server-side does the filtering now

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'PROCESSING':
        return <Zap className="w-5 h-5 text-primary animate-pulse" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-amber-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Tasdiqlandi'
      case 'PROCESSING':
        return 'Qayta ishlash'
      case 'PENDING':
        return 'Kutilmoqda'
      default:
        return status
    }
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-500'
      case 'medium':
        return 'bg-amber-500/10 text-amber-500'
      case 'low':
        return 'bg-emerald-500/10 text-emerald-500'
      default:
        return 'bg-slate-500/10 text-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Barcha Tahlillar</h1>
          <Link href="/dashboard/upload">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <PlusIcon className="w-4 h-4" />
              Yangi Yuklash
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Bemor ismi yoki tahlil turini qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white"
            >
              <option value="all">Hammasini</option>
              <option value="completed">Tasdiqlandinlar</option>
              <option value="processing">Qayta ishlash</option>
              <option value="pending">Kutyotgan</option>
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Ko'proq
            </Button>
          </div>
        </div>

        {/* Analyses Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-primary">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <div className="grid gap-4">
            {filteredAnalyses.map((analysis) => {
              const health = getHealthLevel(analysis)
              const hs = HEALTH[health]
              return (
              <Card key={analysis.id} className={`p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/50 transition-colors shadow-sm overflow-hidden ${hs.border}`}>
                <div className="flex items-center justify-between gap-4 text-left">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(analysis.status)}
                      <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
                        {analysis.patient_name || analysis.result?.dicom_metadata?.Patient?.PatientName || "Bemor: Noma'lum"}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 font-medium">
                      {analysis.type} • {new Date(analysis.created_at).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {getStatusLabel(analysis.status)}
                      </span>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full", hs.badge)}>
                        {hs.label}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                        AI Ehtimoli: {((analysis.result?.ai_analysis?.accuracy || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/report/${analysis.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-slate-200 dark:border-white/10 font-bold"
                        title="Ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Ko'rish</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Yuklash"
                      onClick={(e) => handleDownload(analysis, e)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10"
                      title="O'chirish"
                      onClick={(e) => handleDelete(analysis.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
              )
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Topildi: {totalCount} tahlil
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg h-10 px-4 font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10"
                  >
                    Oldingi
                  </Button>
                  <div className="h-10 px-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-black text-primary">Sahifa {page} / {totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg h-10 px-4 font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10"
                  >
                    Keyingi
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 border border-slate-200 dark:border-white/10 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Hech qanday tahlil topilmadi</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? 'Qidiruv natijalaridan hech narsa topilmadi' : 'Hali hech qanday tahlil yo\'q'}
            </p>
            <Link href="/dashboard/upload">
              <Button className="bg-primary hover:bg-primary/90">
                Birinchi Tahlilni Yuklang
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
