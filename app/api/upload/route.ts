import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { writeFile } from 'fs/promises'
// import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string // In real app, get from session

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Mock file upload processing
    // In production: Upload to S3/R2/Blob Storage
    // For local dev: We could save to public/uploads, but Vercel/Next don't like runtime writes
    
    console.log(`Received file: ${file.name} from user ${userId}`)

    // Create analysis record immediately
    // In a real flow, you might wait for upload success first
    const analysis = await prisma.analysis.create({
        data: {
            userId: userId || 'mock-user-id', // Fallback for demo
            type: 'MRI Brain', // Detect from metadata or form
            fileUrl: `/uploads/${file.name}`, // Mock URL
            status: 'PROCESSING'
        }
    })

    // Simulate AI Processing delay
    setTimeout(async () => {
        await prisma.analysis.update({
            where: { id: analysis.id },
            data: { status: 'COMPLETED', result: JSON.stringify({ findings: "Normal" }) }
        })
    }, 5000)

    return NextResponse.json({ success: true, analysisId: analysis.id })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
