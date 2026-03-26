/**
 * Medical PDF Report Generator for med-taxlil.uz
 * Uses jsPDF for clean, professional PDF output.
 */

type HealthLevel = 'healthy' | 'warning' | 'sick' | 'unknown'

function getHealthLevel(result: any): HealthLevel {
    const findings: any[] = result?.ai_analysis?.findings || []
    if (!findings.length) return 'unknown'
    const bad = findings.filter(f =>
        f.status && !['CLEAR', 'NORMAL', 'OPTIMAL', 'VALID'].includes(f.status.toUpperCase())
    )
    if (bad.length === 0) return 'healthy'
    if (bad.length >= findings.length) return 'sick'
    return 'warning'
}

const HEALTH_COLORS: Record<HealthLevel, [number, number, number]> = {
    healthy: [52, 211, 153],
    warning: [251, 191, 36],
    sick:    [239, 68, 68],
    unknown: [100, 116, 139],
}

const HEALTH_LABELS: Record<HealthLevel, string> = {
    healthy: 'SOG\'LOM',
    warning: 'SHUBHALI',
    sick:    'KASALLIGI ANIQLANDI',
    unknown: 'NOMA\'LUM',
}

/**
 * Fetches a remote image and converts it to a base64 data URL.
 */
async function toBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, { mode: 'cors' })
        if (!res.ok) return null
        const blob = await res.blob()
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

export async function exportAnalysisPDF(analysis: any): Promise<void> {
    const { default: jsPDF } = await import('jspdf')

    const ai = analysis?.result?.ai_analysis || {}
    const meta = analysis?.result?.dicom_metadata || {}
    const frames: string[] = analysis?.result?.frames || []
    const health = getHealthLevel(analysis?.result)
    const healthColor = HEALTH_COLORS[health]
    const healthLabel = HEALTH_LABELS[health]

    // -- Dimensions --
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210
    const H = 297
    const M = 14  // margin
    const CW = W - 2 * M  // content width

    // ── COLORS ────────────────────────────────────────────────────────────────
    const C_BG    : [number,number,number] = [8, 12, 26]
    const C_CARD  : [number,number,number] = [15, 23, 42]
    const C_BORDER: [number,number,number] = [30, 41, 59]
    const C_ACC   : [number,number,number] = [0, 184, 255]
    const C_WHITE : [number,number,number] = [241, 245, 249]
    const C_GRAY  : [number,number,number] = [100, 116, 139]
    const C_MUTED : [number,number,number] = [71, 85, 105]

    const setFg = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2])
    const setFill = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2])
    const setDraw = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2])

    // ── FULL PAGE DARK BG ─────────────────────────────────────────────────────
    setFill(C_BG)
    doc.rect(0, 0, W, H, 'F')

    let y = 0

    // ── HEADER ────────────────────────────────────────────────────────────────
    setFill(C_CARD)
    doc.rect(0, 0, W, 44, 'F')

    // Accent bar (left)
    setFill(C_ACC)
    doc.rect(0, 0, 4, 44, 'F')

    // Status stripe (full width bottom of header)
    setFill(healthColor)
    doc.rect(0, 40, W, 4, 'F')

    // Site name
    setFg(C_WHITE)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('med-taxlil.uz', M + 6, 16)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    setFg(C_ACC)
    doc.text('AI TIBBIY TASVIRNI TAHLIL TIZIMI  •  Radiologiya Hisoboti', M + 6, 23)

    // Report meta (top-right)
    doc.setFontSize(7)
    setFg(C_GRAY)
    const now = new Date()
    doc.text(`Sana: ${now.toLocaleDateString('uz-UZ')}  ${now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`, W - M, 12, { align: 'right' })
    doc.text(`Hisobot ID: ${(analysis.id || '').substring(0, 8).toUpperCase()}`, W - M, 18, { align: 'right' })

    // Health status badge (top-right, below ID)
    const badgeW = 36, badgeH = 8
    setFill(healthColor)
    doc.roundedRect(W - M - badgeW, 24, badgeW, badgeH, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(8, 12, 26)
    doc.text(healthLabel, W - M - badgeW / 2, 29.5, { align: 'center' })

    y = 52

    // ── HELPER FUNCTIONS ───────────────────────────────────────────────────────

    function sectionTitle(title: string) {
        if (y > 260) { addPage(); return }
        setFill(C_CARD)
        doc.rect(M, y, CW, 8, 'F')
        setFill(C_ACC)
        doc.rect(M, y, 3, 8, 'F')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        setFg(C_ACC)
        doc.text(title.toUpperCase(), M + 6, y + 5.5)
        y += 12
    }

    function infoRow(label: string, value: string, col = 0) {
        if (y > 270) { addPage(); return }
        const xL = M + col * (CW / 2)
        const xV = xL + 40

        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        setFg(C_MUTED)
        doc.text(label + ':', xL, y)

        doc.setFont('helvetica', 'bold')
        setFg(C_WHITE)
        const maxW = CW / 2 - 42
        const val = (value || '—').substring(0, 50)
        doc.text(val, xV, y, { maxWidth: maxW })
        if (col === 1 || col === 0) y += 5.5
    }

    function twoColRows(pairs: [string, string][]) {
        for (let i = 0; i < pairs.length; i += 2) {
            if (y > 270) { addPage() }
            const [l1, v1] = pairs[i]
            const [l2, v2] = pairs[i + 1] || ['', '']

            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            setFg(C_MUTED)
            doc.text(l1 + ':', M, y)
            doc.setFont('helvetica', 'bold')
            setFg(C_WHITE)
            doc.text((v1 || '—').substring(0, 35), M + 40, y)

            if (l2) {
                doc.setFont('helvetica', 'normal')
                setFg(C_MUTED)
                doc.text(l2 + ':', M + CW / 2, y)
                doc.setFont('helvetica', 'bold')
                setFg(C_WHITE)
                doc.text((v2 || '—').substring(0, 35), M + CW / 2 + 40, y)
            }
            y += 5.5
        }
    }

    function addPage() {
        doc.addPage()
        setFill(C_BG)
        doc.rect(0, 0, W, H, 'F')
        y = 15
        // mini header on continuation pages
        setFill(C_CARD)
        doc.rect(0, 0, W, 10, 'F')
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        setFg(C_ACC)
        doc.text('med-taxlil.uz  —  AI Tibbiy Hisobot (davomi)', M, 7)
        y = 16
    }

    // ── SECTION 1: BEMOR MA'LUMOTLARI ─────────────────────────────────────────
    sectionTitle('Bemor Ma\'lumotlari')

    const patientPairs: [string, string][] = [
        ['F.I.Sh', analysis.patient_name || meta?.Patient?.PatientName || '—'],
        ['Yosh', analysis.patient_age || meta?.Patient?.PatientAge || '—'],
        ['Jinsi', analysis.patient_gender || meta?.Patient?.PatientSex || '—'],
        ['Skanerlash turi', analysis.scan_type || meta?.Study?.Modality || analysis.type || '—'],
        ['Tekshiruv sanasi', meta?.Study?.StudyDate || new Date(analysis.created_at || '').toLocaleDateString('uz-UZ') || '—'],
        ['Email', analysis.user_email || '—'],
    ]
    twoColRows(patientPairs)
    y += 4

    // ── SECTION 2: AI TAHLIL NATIJALARI ───────────────────────────────────────
    sectionTitle('AI Tahlil Natijalari')

    if (ai.diagnosis) {
        twoColRows([
            ['Tashxis', ai.diagnosis],
            ['AI ishonchliligi', ai.accuracy ? `${(ai.accuracy * 100).toFixed(1)}%` : '—'],
            ['Qayta ishlash vaqti', ai.workflow_speed || '—'],
            ['AI versiyasi', ai.system_version || 'med-taxlil.uz Neural v1.0'],
        ])
        y += 4
    }

    // Findings
    const findings: any[] = ai?.findings || []
    if (findings.length) {
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'bold')
        setFg(C_GRAY)
        doc.text('Topilmalar:', M, y)
        y += 6

        findings.forEach((f) => {
            if (y > 270) addPage()

            const fStatus = (f.status || '').toUpperCase()
            const isOk = ['CLEAR', 'NORMAL', 'OPTIMAL', 'VALID'].includes(fStatus)
            const dotColor: [number,number,number] = isOk ? [52, 211, 153] : (fStatus === 'ABNORMAL' ? [239, 68, 68] : [251, 191, 36])

            // Row background
            setFill(C_CARD)
            doc.rect(M, y - 1, CW, 15, 'F')

            // Left accent dot
            setFill(dotColor)
            doc.circle(M + 3, y + 4.5, 1.8, 'F')

            // Type
            doc.setFontSize(7.5)
            doc.setFont('helvetica', 'bold')
            setFg(C_WHITE)
            doc.text(f.type || 'Topilma', M + 8, y + 5)

            // Status pill
            setFill(dotColor)
            const pillW = 20
            doc.roundedRect(M + CW - pillW, y, pillW, 6, 1.5, 1.5, 'F')
            doc.setFontSize(5.5)
            doc.setTextColor(8, 12, 26)
            doc.text(fStatus.substring(0, 14), M + CW - pillW / 2, y + 4.3, { align: 'center' })

            // Value
            doc.setFontSize(6.5)
            doc.setFont('helvetica', 'normal')
            setFg(C_GRAY)
            doc.text(`Qiymat: ${f.value || '—'}`, M + 8, y + 10)

            // Description
            if (f.description) {
                const maxDescW = CW - 30
                const descLines = doc.splitTextToSize(f.description.substring(0, 120), maxDescW)
                setFg(C_MUTED)
                doc.setFontSize(6)
                doc.text(descLines[0], M + 8, y + 14)
            }
            y += 18
        })
        y += 2
    }

    // ── SECTION 3: TEXNIK PARAMETRLAR ────────────────────────────────────────
    const eq = meta?.Equipment || {}
    const techKeys = ['MagneticFieldStrength', 'RepetitionTime', 'EchoTime', 'SliceThickness', 'Manufacturer', 'ManufacturerModelName', 'SoftwareVersions']
    const techPairs: [string, string][] = techKeys
        .filter(k => eq[k])
        .map(k => [k.replace(/([A-Z])/g, ' $1').trim(), String(eq[k]).substring(0, 40)] as [string, string])

    if (techPairs.length) {
        if (y > 235) addPage()
        sectionTitle('Texnik Parametrlar')
        twoColRows(techPairs)
        y += 4
    }

    // ── SECTION 4: SKAN PREVY'USI ─────────────────────────────────────────────
    const previewSrc = frames[Math.floor(frames.length / 2)] || analysis.preview_image
    if (previewSrc) {
        if (y > 220) addPage()
        sectionTitle('Skan Ko\'rinishi (O\'rta Qism)')
        try {
            const imgData = await toBase64(previewSrc)
            if (imgData) {
                const imgW = 80, imgH = 65
                const imgX = (W - imgW) / 2
                setFill([0, 0, 0])
                doc.rect(imgX - 1, y - 1, imgW + 2, imgH + 2, 'F')
                setDraw(C_BORDER)
                doc.setLineWidth(0.3)
                doc.rect(imgX - 1, y - 1, imgW + 2, imgH + 2, 'S')
                doc.addImage(imgData, 'PNG', imgX, y, imgW, imgH)

                doc.setFontSize(6.5)
                setFg(C_MUTED)
                doc.text(`Kadrlar soni: ${frames.length || 1}  •  Fayl: ${(analysis.file || '').split('/').pop() || '—'}`, W / 2, y + imgH + 5, { align: 'center' })
                y += imgH + 10
            }
        } catch (e) {
            console.warn('Preview image failed:', e)
        }
    }

    // ── SECTION 5: XULOSA ─────────────────────────────────────────────────────
    if (y > 240) addPage()
    sectionTitle('Umumiy Xulosa')

    setFill(C_CARD)
    doc.rect(M, y - 1, CW, 20, 'F')
    setFill(healthColor)
    doc.rect(M, y - 1, 4, 20, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    setFg(healthColor as any)
    doc.text(healthLabel, M + 8, y + 8)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    setFg(C_GRAY)
    const summaryMap: Record<HealthLevel, string> = {
        healthy:  'Barcha ko\'rsatkichlar me\'yorda. Patologik o\'zgarishlar aniqlanmadi.',
        warning:  'Ba\'zi ko\'rsatkichlarda og\'ish aniqlandi. Qo\'shimcha tekshiruv tavsiya etiladi.',
        sick:     'Bir yoki bir nechta anormal ko\'rsatkich aniqlandi. Shifokor bilan maslahatlashing.',
        unknown:  'AI tahlil ma\'lumotlari etarli emas. Yangi skan yuklab ko\'ring.',
    }
    doc.text(summaryMap[health], M + 8, y + 15)
    y += 26

    // ── FOOTER ON EVERY PAGE ──────────────────────────────────────────────────
    const totalPages: number = (doc as any).internal.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        setFill(C_CARD)
        doc.rect(0, H - 10, W, 10, 'F')
        setFill(C_ACC)
        doc.rect(0, H - 10, W, 0.5, 'F')

        doc.setFontSize(6)
        doc.setFont('helvetica', 'normal')
        setFg(C_MUTED)
        doc.text('med-taxlil.uz  |  MAXFIY — Faqat Tibbiy Mutaxassis Uchun', M, H - 4)
        setFg(C_GRAY)
        doc.text(`Sahifa ${p} / ${totalPages}`, W - M, H - 4, { align: 'right' })
    }

    // ── SAVE ──────────────────────────────────────────────────────────────────
    const safeName = (analysis.patient_name || 'Bemor').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
    const dateStr = now.toISOString().slice(0, 10)
    doc.save(`med-taxlil_${safeName}_${dateStr}.pdf`)
}
