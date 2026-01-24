'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  ArrowLeft, Download, Share2, Edit2, CheckCircle2,
  AlertCircle, FileText, Printer
} from 'lucide-react'
import { useState } from 'react'

export default function ReportPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [conclusion, setConclusion] = useState(
    'Bosh miyaning MRI tahlilida o\'ng tepalik maydonida 2.3x1.8 sm o\'lchamli o\'sma aniqlanindi. O\'smaning ehtimolligi AI tizim tomonidan 78% deb belgilandi. Klinikal taflilotlar asosida qo\'shimcha CT skan va onkolog bilan maslahat tavsiya etiladi.'
  )

  const handleDownloadPDF = () => {
    // PDF yuklashni simulyatsiya qilish
    alert('PDF hisobot yuklanmoqda...')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard/viewer" className="inline-flex items-center gap-2 text-primary hover:text-primary/90 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Viewerga qaytish
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Tibbiy Hisobot</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-border gap-2 bg-transparent"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Saqlash' : 'Tahrirlash'}
              </Button>
              <Button 
                variant="outline" 
                className="border-border gap-2 bg-transparent"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4" />
                PDF Yuklash
              </Button>
              <Button 
                variant="outline" 
                className="border-border gap-2 bg-transparent"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                Chop Etish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Patient Info Card */}
          <Card className="p-6 border border-border bg-card/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bemor Ma'lumotlari</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">F.I.Sh</p>
                <p className="text-lg font-medium text-foreground">Ali Karimov</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Yoshi / Jinsi</p>
                <p className="text-lg font-medium text-foreground">35 yoshli Erkak</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tahlil Turi</p>
                <p className="text-lg font-medium text-foreground">Bosh Magnetik-Rezonans Tomografiya</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tahlil Sanasi</p>
                <p className="text-lg font-medium text-foreground">2024-01-20 10:30</p>
              </div>
            </div>
          </Card>

          {/* AI Analysis Results */}
          <Card className="p-6 border border-border bg-gradient-to-b from-primary/5 to-transparent">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              AI Tahlili Natijalari
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">O'sma Ehtimoli</p>
                <p className="text-3xl font-bold text-primary">78%</p>
                <p className="text-xs text-primary/70 mt-2">Yuqori ehtimol darajasi</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-sm text-muted-foreground mb-2">Qon Quyilishi</p>
                <p className="text-3xl font-bold text-accent">45%</p>
                <p className="text-xs text-accent/70 mt-2">O\'rta ehtimol darajasi</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                <p className="text-sm text-muted-foreground mb-2">Degenerativ</p>
                <p className="text-3xl font-bold text-secondary">23%</p>
                <p className="text-xs text-secondary/70 mt-2">Past ehtimol darajasi</p>
              </div>
            </div>
          </Card>

          {/* Findings */}
          <Card className="p-6 border border-border bg-card/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Topilmalari</h2>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">O'sma Aniqlanindi</p>
                    <p className="text-sm text-muted-foreground">
                      O'ng tepalik maydonida 2.3x1.8 sm o\'lchamli homogen massani ko\'ramiz. T2 va FLAIR ketmalarida yog\'i signali kuchaytirilgan.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-accent/5 border border-accent/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">Qon Quyilishi Belgilari</p>
                    <p className="text-sm text-muted-foreground">
                      Parietal loplarida FLAIR ketmalarida fokus hiper signallari aniqlanadi. Edema va mass effekt yo\'q.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-secondary/5 border border-secondary/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">Ventrikular Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Ventrikular sistema o\'lchamlari normaldir. O'rta chiziq shift yo\'q. Intravenial bosim ko\'tarilmagan ko\'rinadi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Clinical Conclusion */}
          <Card className="p-6 border border-border bg-card/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Klinik Xulosalar</h2>
            {isEditing ? (
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full p-4 rounded-lg border border-border bg-background text-foreground min-h-40 resize-none"
                placeholder="Klinik xulosalarni yozing..."
              />
            ) : (
              <p className="text-foreground leading-relaxed">
                {conclusion}
              </p>
            )}
          </Card>

          {/* Recommendations */}
          <Card className="p-6 border border-border bg-gradient-to-b from-secondary/5 to-transparent">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tavsiyalar</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                <span className="text-foreground">Onkolog va nevrologning muallifiyatidan o'tish tavsiya etiladi</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                <span className="text-foreground">Qo'shimcha kontrast bilan ko'tariltirilgan MRI skan tavsiya etiladi</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                <span className="text-foreground">3 oy ichida ko'zda tutib tahlilni takrorlash tavsiya etiladi</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                <span className="text-foreground">Bemorga simptomlar ko'rinsa, qo'shimcha konsultatsiya qabul qiling</span>
              </li>
            </ul>
          </Card>

          {/* Signature Section */}
          <Card className="p-6 border border-border bg-card/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tasdiqlash</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Imzo (Radiolog)</p>
                <div className="h-20 border-b-2 border-foreground/30 pt-16">
                  <span className="text-sm text-foreground">Dr. Ahmad Abdullayev</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Sana</p>
                <div className="h-20 border-b-2 border-foreground/30 pt-16">
                  <span className="text-sm text-foreground">2024-01-20</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full border-border bg-transparent">
                Asosiyga Qaytish
              </Button>
            </Link>
            <Button 
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
            >
              <Download className="w-4 h-4" />
              PDF Sifatida Saqlash
            </Button>
            <Button 
              variant="outline"
              className="border-border gap-2 bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              Ulashish
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
