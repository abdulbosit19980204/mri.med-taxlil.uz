'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Upload, Brain, ArrowLeft, CheckCircle2, AlertCircle, FileText, HardDrive, Zap, Shield, Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/language-context'
import { apiClient } from '@/lib/api-client'
import * as dicomParser from 'dicom-parser'

export default function UploadPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scanType, setScanType] = useState("BRAIN")
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("Erkak")

  const handleDrag = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = async (fileList: FileList) => {
    const newFiles: any[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const fileObj: any = {
        id: Math.random(),
        file: file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        status: 'pending',
        preview: null,
        metadata: null
      }

      // Generate Preview
      if (file.type.startsWith('image/')) {
        fileObj.preview = URL.createObjectURL(file)
      }

      // Parse DICOM / Medical Metadata
      const isMedical = file.name.toLowerCase().endsWith('.dcm') || file.name.toLowerCase().endsWith('.ima')
      if (isMedical) {
        try {
          const buffer = await file.arrayBuffer()
          const dataSet = dicomParser.parseDicom(new Uint8Array(buffer))

          const meta = {
            patientName: dataSet.string('x00100010'),
            patientAge: dataSet.string('x00101010'),
            modality: dataSet.string('x00080060'),
          }
          fileObj.metadata = meta

          // If first file and patient name is empty, auto-fill
          if (newFiles.length === 0 && !patientName && meta.patientName) {
            setPatientName(meta.patientName.replace(/\^/g, ' '))
          }
          if (newFiles.length === 0 && meta.modality) {
            const mod = meta.modality.toUpperCase()
            if (mod.includes('MR')) setScanType('BRAIN')
            else if (mod.includes('CT')) setScanType('CT')
          }
        } catch (e) {
          console.error("DICOM Parse error:", e)
        }
      }

      newFiles.push(fileObj)
    }

    setFiles([...files, ...newFiles])
  }

  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const startAnalysis = async () => {
    if (files.length === 0) return
    setLoading(true)
    setProgress(0)
    setError("")

    try {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      for (const fileObj of files) {
        const formData = new FormData()
        formData.append('file', fileObj.file)
        formData.append('type', scanType)
        formData.append('patient_name', patientName)
        formData.append('patient_age', patientAge)
        formData.append('patient_gender', patientGender)
        formData.append('scan_type', scanType)

        const res = await apiClient.upload('/analyses/', formData)

        if (!res.ok) {
          const data = await res.json()
          throw new Error(JSON.stringify(data) || t.common.error)
        }
      }

      clearInterval(interval)
      setProgress(100)

      setTimeout(() => {
        router.push('/dashboard/analyses')
      }, 1000)
    } catch (err: any) {
      console.error("Upload failed", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const removeFile = (id: number) => {
    setFiles(files.filter(f => f.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-left">
      {/* Header */}
      <div className="bg-card border-b border-border p-6 font-mono">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/90 mb-4 uppercase tracking-widest text-xs font-black">
            <ArrowLeft className="w-4 h-4" />
            Asosiyga qaytish
          </Link>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Tibbiy Fayllarni Yuklang</h1>
          <p className="text-muted-foreground mt-2 text-sm uppercase tracking-widest">MRI, CT yoki boshqa tibbiy tasvirlarni (.dcm, .nii, .png, .jpg) yuklang</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-8 font-mono">
        <div className="space-y-6">
          {/* Upload Area */}
          <Card
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer shadow-2xl shadow-primary/5 ${dragActive
              ? 'border-primary bg-primary/10'
              : 'border-white/5 bg-white/5'
              }`}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">
                Fayllarni yuklang yoki sura qiling
              </h3>
              <p className="text-muted-foreground mb-8 text-xs uppercase tracking-[0.2em] opacity-60">
                DICOM (.dcm), Siemens (.ima), NIfTI (.nii) va rasm formatlari
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".dcm,.ima,.img,.nii,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90 rounded-xl px-10 h-12 font-black italic tracking-widest"
              >
                Fayllarni Tanlang
              </Button>
            </div>
          </Card>

          {/* Files List */}
          {files.length > 0 && (
            <Card className="p-6 border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Yuklangan Fayllar ({files.length})
              </h3>
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Preview / Icon */}
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden group-hover:scale-105 transition-transform">
                        {file.preview ? (
                          <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-6 h-6 text-primary/40" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-sm text-slate-900 truncate uppercase tracking-tight">{file.name}</p>
                          {file.metadata?.modality && (
                            <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-1.5 border-primary/20 text-primary bg-primary/5">{file.metadata.modality}</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                          <span>{file.size}</span>
                          {file.metadata?.patientName && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-primary/60">{file.metadata.patientName.replace(/\^/g, ' ')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-emerald-500">Ready</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="ml-4 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      O'chirish
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Patient Info */}
          <Card className="p-8 border border-white/5 bg-white/5 rounded-[40px] shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h3 className="text-sm font-black uppercase tracking-[0.3em]">Bemor Ma'lumotlari</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bemor F.I.Sh</label>
                <input
                  type="text"
                  placeholder="Ism va Familiyani kiriting"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold uppercase focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Yoshi</label>
                <input
                  type="number"
                  placeholder="YOSHINI KIRITING"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold uppercase focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jinsi</label>
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold uppercase focus:border-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="Erkak">Erkak (Male)</option>
                  <option value="Ayol">Ayol (Female)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tahlil Turi</label>
                <select
                  value={scanType}
                  onChange={e => setScanType(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold uppercase focus:border-primary outline-none appearance-none cursor-pointer"
                >
                  <optgroup label="MRI — Bosh va Miya">
                    <option value="BRAIN">Bosh miya MRI</option>
                    <option value="BRAIN_FMRI">Funksional MRI (fMRI)</option>
                    <option value="BRAIN_DWI">Diffuzion MRI (DWI)</option>
                    <option value="BRAIN_ANGIO">MR Angiografiya (Bosh)</option>
                  </optgroup>
                  <optgroup label="MRI — Umurtqa">
                    <option value="SPINE_CERVICAL">Boyin umurtqasi MRI</option>
                    <option value="SPINE_THORACIC">Kokrak umurtqasi MRI</option>
                    <option value="SPINE_LUMBAR">Bel umurtqasi MRI</option>
                  </optgroup>
                  <optgroup label="MRI — Bogimlar">
                    <option value="KNEE">Tizza bogimi MRI</option>
                    <option value="SHOULDER">Yelka bogimi MRI</option>
                    <option value="HIP">Tos-son bogimi MRI</option>
                    <option value="WRIST">Bilak bogimi MRI</option>
                    <option value="ANKLE">Topiq bogimi MRI</option>
                  </optgroup>
                  <optgroup label="MRI — Ichki Azolar">
                    <option value="ABDOMEN">Qorin boshlig'i MRI</option>
                    <option value="PELVIS">Tos MRI</option>
                    <option value="LIVER">Jigar MRI</option>
                    <option value="PROSTATE">Prostata MRI</option>
                    <option value="BREAST">Kokrak bezi MRI</option>
                    <option value="CARDIAC">Yurak MRI (Cardiac)</option>
                    <option value="CHEST">Kokrak qafasi MRI</option>
                    <option value="WHOLE_BODY">Butun tana MRI</option>
                  </optgroup>
                  <optgroup label="Boshqa Usullar">
                    <option value="CT">KT (Kompyuter Tomografiya)</option>
                    <option value="CT_ANGIO">KT Angiografiya</option>
                    <option value="PET">PET Skan</option>
                    <option value="XRAY">Rentgen (X-Ray)</option>
                    <option value="OTHER">Boshqa (Other)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </Card>

          {/* Analysis Options */}
          <Card className="p-6 border border-border bg-gradient-to-b from-secondary/10 to-transparent">
            <h3 className="text-lg font-semibold text-foreground mb-4">AI Tahlil Parametrlari</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1" id="tumor" />
                <label htmlFor="tumor" className="flex-1 cursor-pointer">
                  <p className="font-medium text-foreground">O'smalar Aniqlash</p>
                  <p className="text-sm text-muted-foreground">Bosh miyada o'sma, davolash uchun juda muhim</p>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1" id="stroke" />
                <label htmlFor="stroke" className="flex-1 cursor-pointer">
                  <p className="font-medium text-foreground">Insult Aniqlash</p>
                  <p className="text-sm text-muted-foreground">Qon tomirlari va inson qon quyilishini tekshiring</p>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1" id="degenerative" />
                <label htmlFor="degenerative" className="flex-1 cursor-pointer">
                  <p className="font-medium text-foreground">Degenerativ O'zgarishlar</p>
                  <p className="text-sm text-muted-foreground">Umurtqa va bo'g'im-bo'g'im kasalliklarini aniqlash</p>
                </label>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">
                {t.common.error}: {error}
              </div>
            )}

            {loading && (
              <div className="space-y-4 pt-4 px-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> {t.upload.analyzing}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-border bg-transparent h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">
                  Bekor Qilish
                </Button>
              </Link>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95"
                onClick={startAnalysis}
                disabled={loading || files.length === 0}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? "Tahlil Qilinmoqda..." : "AI Tahlilni Boshlang"}
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 border border-border bg-card/50">
              <div className="flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Fayl Hajmi</h4>
                  <p className="text-sm text-muted-foreground">Harbiylarga 1 GB gacha fayl yuklaysiz</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-border bg-card/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Tahlil Vaqti</h4>
                  <p className="text-sm text-muted-foreground">Odatda 5-10 daqiqa ko'chak</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border border-border bg-card/50">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Xavfsizlik</h4>
                  <p className="text-sm text-muted-foreground">AES-256 shifrlash bilan himoyalangan</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
