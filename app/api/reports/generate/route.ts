import { NextRequest, NextResponse } from 'next/server';

interface ReportRequest {
  jobId: string;
  patientName: string;
  age: number;
  gender: string;
  analysisType: string;
  findings: string;
  recommendations: string[];
  predictions: {
    [key: string]: {
      probability: number;
      description: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json();
    const {
      jobId,
      patientName,
      age,
      gender,
      analysisType,
      findings,
      recommendations,
      predictions
    } = body;

    // Validate required fields
    if (!jobId || !patientName || !analysisType) {
      return NextResponse.json(
        { error: 'Majburiy maydonlar: jobId, patientName, analysisType' },
        { status: 400 }
      );
    }

    // Generate report content
    const reportContent = generateReportHTML(
      patientName,
      age,
      gender,
      analysisType,
      findings,
      recommendations,
      predictions
    );

    // In production, you would use a library like jsPDF or puppeteer to generate PDF
    // For now, returning the HTML content
    const reportId = `report_${jobId}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      reportId,
      content: reportContent,
      filename: `${patientName}_${analysisType}_${new Date().toISOString().split('T')[0]}.pdf`,
      message: 'Hisobot muvaffaqiyatli yaratildi'
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Hisobot yaratishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

/**
 * Generate report HTML content
 */
function generateReportHTML(
  patientName: string,
  age: number,
  gender: string,
  analysisType: string,
  findings: string,
  recommendations: string[],
  predictions: { [key: string]: { probability: number; description: string } }
): string {
  const genderLabel = gender === 'male' ? 'Erkak' : 'Ayol';
  const date = new Date().toLocaleString('uz-UZ');

  let predictionsHTML = '';
  Object.entries(predictions).forEach(([key, value]) => {
    const labels: { [key: string]: string } = {
      tumor: 'O\'sma',
      stroke: 'Insult',
      degenerative: 'Degenerativ'
    };
    
    predictionsHTML += `
      <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid #3b82f6; background: #f0f9ff;">
        <strong>${labels[key] || key}:</strong> ${value.probability}%<br>
        <small>${value.description}</small>
      </div>
    `;
  });

  let recommendationsHTML = '';
  recommendations.forEach((rec, idx) => {
    recommendationsHTML += `<li style="margin-bottom: 8px;">${rec}</li>`;
  });

  return `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <title>${patientName} - Tibbiy Hisobot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 20px;
          background: white;
        }
        .header {
          border-bottom: 2px solid #0f2d5f;
          padding-bottom: 15px;
          margin-bottom: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #0f2d5f;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 12px;
        }
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #0f2d5f;
          font-size: 16px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .patient-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        .info-item {
          background: #f9f9f9;
          padding: 10px;
          border-radius: 4px;
          border-left: 3px solid #10b981;
        }
        .info-item strong {
          display: block;
          color: #666;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .info-item span {
          font-size: 14px;
          color: #333;
        }
        .findings {
          background: #fff3cd;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid #ff9800;
          margin-bottom: 15px;
        }
        .findings strong {
          display: block;
          margin-bottom: 8px;
          color: #333;
        }
        .recommendations {
          background: #e8f5e9;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid #10b981;
        }
        .recommendations strong {
          display: block;
          margin-bottom: 8px;
          color: #333;
        }
        .recommendations ul {
          margin: 0;
          padding-left: 20px;
        }
        .recommendations li {
          color: #333;
        }
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .signature-line {
          margin-top: 30px;
          border-top: 1px solid #333;
          width: 250px;
          text-align: center;
          padding-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MED-TAXLIL</h1>
        <p>AI Tibbiy Tahlil Platformasi</p>
        <p>Tahlil Sanasi: ${date}</p>
      </div>

      <div class="section">
        <h2>Bemor Ma'lumotlari</h2>
        <div class="patient-info">
          <div class="info-item">
            <strong>F.I.Sh</strong>
            <span>${patientName}</span>
          </div>
          <div class="info-item">
            <strong>Yoshi / Jinsi</strong>
            <span>${age} yoshli ${genderLabel}</span>
          </div>
          <div class="info-item">
            <strong>Tahlil Turi</strong>
            <span>${analysisType}</span>
          </div>
          <div class="info-item">
            <strong>Hisobot ID</strong>
            <span>${new Date().getTime()}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>AI Tahlili Natijalari</h2>
        ${predictionsHTML}
      </div>

      <div class="section">
        <h2>Topilmalari</h2>
        <div class="findings">
          <strong>Klinik Topilmalari:</strong>
          ${findings}
        </div>
      </div>

      <div class="section">
        <h2>Tavsiyalar</h2>
        <div class="recommendations">
          <strong>Klinisyanga Tavsiyalar:</strong>
          <ul>
            ${recommendationsHTML}
          </ul>
        </div>
      </div>

      <div class="footer">
        <p>Bu hisobot AI tizim tomonidan yaratilgan bo'lib, radiolog tomonidan tasdiqlangan hisobot deb ta'qib qilinishi lozim.</p>
        <div style="margin-top: 40px;">
          <div class="signature-line">
            Dr. Ahmad Abdullayev
          </div>
          <p style="margin-top: 40px;">© 2024 Med-Taxlil. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * POST /api/reports/generate
 * 
 * Generates a PDF report from analysis results.
 * 
 * Request body:
 * {
 *   "jobId": "job_...",
 *   "patientName": "Ali Karimov",
 *   "age": 35,
 *   "gender": "male",
 *   "analysisType": "Bosh MRI",
 *   "findings": "O'sma aniqlanindi...",
 *   "recommendations": ["Onkolog maslahat...", "CT skan..."],
 *   "predictions": {
 *     "tumor": { "probability": 78, "description": "..." }
 *   }
 * }
 */

export const dynamic = 'force-dynamic';
