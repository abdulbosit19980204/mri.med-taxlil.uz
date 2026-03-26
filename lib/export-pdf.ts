/**
 * Generates a formatted medical PDF report from analysis data.
 * Uses jsPDF for PDF construction and html2canvas for the preview image.
 */

export async function exportAnalysisPDF(analysis: any) {
    const { default: jsPDF } = await import('jspdf')

    const result = analysis?.result || {}
    const aiResult = result?.ai_analysis || result
    const metadata = result?.dicom_metadata || {}
    const frames: string[] = result?.frames || []
    const previewSrc = frames[Math.floor(frames.length / 2)] || analysis.preview_image || ''

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210 // A4 width mm
    const MARGIN = 15

    // ── Color palette ──────────────────────────────────────────────
    const PRIMARY = [0, 198, 255] as [number, number, number]        // cyan
    const DARK    = [10, 10, 20]  as [number, number, number]
    const GRAY    = [110, 120, 140] as [number, number, number]
    const WHITE   = [240, 245, 255] as [number, number, number]
    const GREEN   = [52, 211, 153] as [number, number, number]
    const AMBER   = [251, 191, 36] as [number, number, number]

    let y = 0

    // ── Header block ───────────────────────────────────────────────
    doc.setFillColor(...DARK)
    doc.rect(0, 0, W, 40, 'F')

    doc.setFillColor(...PRIMARY)
    doc.rect(0, 0, 4, 40, 'F')

    doc.setTextColor(...PRIMARY)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('NEURO-QUANT', MARGIN + 4, 15)

    doc.setTextColor(...WHITE)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Medical AI Imaging Report', MARGIN + 4, 22)

    const now = new Date()
    doc.setTextColor(...GRAY)
    doc.setFontSize(7)
    doc.text(`Generated: ${now.toLocaleString()}`, MARGIN + 4, 29)
    doc.text(`Report ID: ${analysis.id?.substring(0, 8).toUpperCase() || 'N/A'}`, MARGIN + 4, 35)

    // Status badge (top right)
    const statusColor = analysis.status === 'COMPLETED' ? GREEN : AMBER
    doc.setFillColor(...statusColor)
    doc.roundedRect(W - MARGIN - 28, 10, 28, 8, 2, 2, 'F')
    doc.setTextColor(10, 10, 10)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(analysis.status || 'UNKNOWN', W - MARGIN - 14, 15.5, { align: 'center' })

    y = 48

    // ── Section helper ─────────────────────────────────────────────
    const sectionTitle = (title: string) => {
        doc.setFillColor(20, 25, 40)
        doc.rect(MARGIN, y, W - 2 * MARGIN, 7, 'F')
        doc.setFillColor(...PRIMARY)
        doc.rect(MARGIN, y, 2, 7, 'F')
        doc.setTextColor(...PRIMARY)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(title.toUpperCase(), MARGIN + 5, y + 5)
        y += 10
    }

    const row = (label: string, value: string, indent = MARGIN + 2) => {
        if (y > 270) { doc.addPage(); y = 15 }
        doc.setTextColor(...GRAY)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(label + ':', indent, y)
        doc.setTextColor(...WHITE)
        doc.setFont('helvetica', 'bold')
        doc.text(value || '—', indent + 48, y)
        y += 5
    }

    // ── Patient Info ───────────────────────────────────────────────
    sectionTitle('Patient Information')
    row('Name', analysis.patient_name || metadata?.Patient?.PatientName || analysis.user_email || 'N/A')
    row('Age', analysis.patient_age || metadata?.Patient?.PatientAge || 'N/A')
    row('Gender', analysis.patient_gender || metadata?.Patient?.PatientSex || 'N/A')
    row('Scan Type', analysis.scan_type || metadata?.Study?.Modality || analysis.type || 'N/A')
    row('Study Date', metadata?.Study?.StudyDate || new Date(analysis.created_at || '').toLocaleDateString() || 'N/A')
    y += 3

    // ── AI Findings ────────────────────────────────────────────────
    sectionTitle('AI Analysis Findings')
    if (aiResult?.diagnosis) {
        row('Diagnosis',   aiResult.diagnosis)
        row('Confidence',  aiResult.accuracy ? `${(aiResult.accuracy * 100).toFixed(1)}%` : 'N/A')
        row('AI Speed',    aiResult.workflow_speed || 'N/A')
        row('AI Version',  aiResult.system_version || 'N/A')
        y += 3
    }

    const findings: any[] = aiResult?.findings || []
    if (findings.length) {
        findings.forEach((f, i) => {
            if (y > 265) { doc.addPage(); y = 15 }

            const color = (f.status === 'CLEAR' || f.status === 'NORMAL' || f.status === 'OPTIMAL')
                ? GREEN : AMBER

            // Row background
            doc.setFillColor(18, 22, 35)
            doc.rect(MARGIN, y - 1, W - 2 * MARGIN, 14, 'F')

            // Status dot
            doc.setFillColor(...color)
            doc.circle(MARGIN + 4, y + 4, 1.5, 'F')

            doc.setTextColor(...WHITE)
            doc.setFontSize(7.5)
            doc.setFont('helvetica', 'bold')
            doc.text(f.type || `Finding ${i + 1}`, MARGIN + 8, y + 4)

            // Status badge
            doc.setFillColor(...color)
            doc.roundedRect(W - MARGIN - 22, y, 22, 6, 1.5, 1.5, 'F')
            doc.setTextColor(10, 10, 10)
            doc.setFontSize(6)
            doc.text(f.status || '', W - MARGIN - 11, y + 4.3, { align: 'center' })

            doc.setTextColor(...GRAY)
            doc.setFontSize(6.5)
            doc.setFont('helvetica', 'normal')
            doc.text(`Value: ${f.value || '—'}`, MARGIN + 8, y + 9)

            if (f.description) {
                const desc = doc.splitTextToSize(f.description, W - 2 * MARGIN - 30)
                doc.setTextColor(130, 140, 160)
                doc.setFontSize(6)
                doc.text(desc[0], MARGIN + 8, y + 13)
            }
            y += 17
        })
    }

    // ── Equipment / Technical ──────────────────────────────────────
    const equip = metadata?.Equipment || {}
    if (Object.keys(equip).length) {
        y += 2
        sectionTitle('Technical Parameters')
        const techFields = ['MagneticFieldStrength','RepetitionTime','EchoTime','SliceThickness','Manufacturer','ManufacturerModelName']
        techFields.forEach(key => {
            if (equip[key]) row(key.replace(/([A-Z])/g, ' $1').trim(), String(equip[key]))
        })
        y += 3
    }

    // ── Preview image ──────────────────────────────────────────────
    if (previewSrc) {
        try {
            const imgData = await loadImageAsBase64(previewSrc)
            if (imgData) {
                if (y > 200) { doc.addPage(); y = 15 }
                sectionTitle('Scan Preview')
                const imgW = 80, imgH = 60
                const imgX = (W - imgW) / 2
                doc.setFillColor(0, 0, 0)
                doc.rect(imgX - 1, y - 1, imgW + 2, imgH + 2, 'F')
                doc.addImage(imgData, 'PNG', imgX, y, imgW, imgH)
                y += imgH + 6
            }
        } catch (e) {
            console.warn('Could not embed preview image:', e)
        }
    }

    // ── Footer on every page ───────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p)
        doc.setFillColor(...DARK)
        doc.rect(0, 287, W, 10, 'F')
        doc.setFillColor(...PRIMARY)
        doc.rect(0, 287, W, 0.5, 'F')
        doc.setTextColor(...GRAY)
        doc.setFontSize(6)
        doc.text('CONFIDENTIAL — For Medical Professional Use Only', MARGIN, 293)
        doc.text(`Page ${p} of ${pageCount}`, W - MARGIN, 293, { align: 'right' })
    }

    // ── Save ──────────────────────────────────────────────────────
    const filename = `MRI_Report_${analysis.patient_name || 'Patient'}_${now.toISOString().slice(0, 10)}.pdf`
        .replace(/\s+/g, '_')
    doc.save(filename)
}

/** Fetches a URL and converts it to a base64 PNG data string for jsPDF. */
async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, { mode: 'cors' })
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
