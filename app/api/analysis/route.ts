import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/analysis - Get all analyses for a user (Mock user for now)
export async function GET(request: Request) {
    try {
        // In a real app, get userId from session/token
        // const session = await getServerSession(authOptions)
        // if (!session) return new Response('Unauthorized', { status: 401 })

        // For demo/dev, we just fetch all analyses (or filtering by a dummy user if we had one seeded)
        const analyses = await prisma.analysis.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        })

        return NextResponse.json({ success: true, daa: analyses })
    } catch (error) {
        console.error('Failed to fetch analyses:', error)
        return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }
}

// POST /api/analysis - Create a new analysis record
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, type, fileUrl } = body

        if (!userId || !type || !fileUrl) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const analysis = await prisma.analysis.create({
            data: {
                userId,
                type,
                fileUrl,
                status: 'PROCESSING', // Start as processing
                // Mock result for immediate demo gratification if needed, or leave empty
                result: JSON.stringify({
                    findings: [{ type: "Mock Anomaly", confidence: 95 }],
                    status: "Complete"
                })
            }
        })

        return NextResponse.json({ success: true, data: analysis })
    } catch (error) {
        console.error('Failed to create analysis:', error)
        return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 })
    }
}
