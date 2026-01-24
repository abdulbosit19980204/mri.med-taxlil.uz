import { NextRequest, NextResponse } from 'next/server';
import { formatFileSize } from '@/lib/dicom-viewer';

interface AnalysisJob {
  id: string;
  filename: string;
  size: string;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  patientName: string;
  analysisType: string;
  findings: {
    tumor: number;
    stroke: number;
    degenerative: number;
  } | null;
}

// In-memory storage for analysis jobs
const analysisJobs: Map<string, AnalysisJob> = new Map();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientName = formData.get('patientName') as string;
    const analysisType = formData.get('analysisType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Fayl majburiy' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidDICOMFile(file.name)) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri fayl turi. DICOM, NIfTI yoki rasm fayllarini yuklang' },
        { status: 400 }
      );
    }

    // Validate file size (max 1GB)
    if (file.size > 1024 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Fayl hajmi 1GB dan katta bo\'lmasligi kerak' },
        { status: 400 }
      );
    }

    // Create analysis job
    const jobId = generateJobId();
    const job: AnalysisJob = {
      id: jobId,
      filename: file.name,
      size: formatFileSize(file.size),
      uploadedAt: new Date(),
      status: 'pending',
      patientName,
      analysisType,
      findings: null
    };

    analysisJobs.set(jobId, job);

    // In production, this would send the file to a task queue (Celery)
    // For now, we'll simulate processing with a timeout
    simulateAnalysisProcessing(jobId);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Fayl muvaffaqiyatli yuklandi. Tahlil boshlandi.'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Yuklashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId majburiy' },
        { status: 400 }
      );
    }

    const job = analysisJobs.get(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Tahlil topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job
    });
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Tahlilni olishda xatolik' },
      { status: 500 }
    );
  }
}

/**
 * Validate DICOM file
 */
function isValidDICOMFile(filename: string): boolean {
  const validExtensions = ['.dcm', '.nii', '.jpg', '.jpeg', '.png'];
  const fileExtension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(fileExtension);
}

/**
 * Generate unique job ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simulate AI analysis processing
 */
function simulateAnalysisProcessing(jobId: string) {
  // Simulate processing delay (5-10 seconds)
  const processingTime = Math.random() * 5000 + 5000;
  
  // Update status to processing
  const job = analysisJobs.get(jobId);
  if (job) {
    job.status = 'processing';
  }

  // Simulate completion
  setTimeout(() => {
    const job = analysisJobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.findings = {
        tumor: Math.round(Math.random() * 100),
        stroke: Math.round(Math.random() * 100),
        degenerative: Math.round(Math.random() * 100)
      };
    }
  }, processingTime);
}

export const dynamic = 'force-dynamic';
