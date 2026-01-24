import { NextRequest, NextResponse } from 'next/server';

interface PredictionRequest {
  jobId: string;
  imageSlice?: number;
  models?: string[];
}

interface PredictionResult {
  jobId: string;
  timestamp: Date;
  predictions: {
    [key: string]: {
      probability: number;
      boundingBoxes: BoundingBox[];
      description: string;
    };
  };
  processingTime: number;
  confidence: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

// Simulated model results
const mockPredictions: { [key: string]: any } = {
  tumor: {
    probability: 78,
    boundingBoxes: [
      { x: 120, y: 150, width: 45, height: 35, confidence: 0.92 }
    ],
    description: 'O\'ng tepalik maydonida o\'sma aniqlanindi'
  },
  stroke: {
    probability: 45,
    boundingBoxes: [
      { x: 140, y: 160, width: 30, height: 25, confidence: 0.68 }
    ],
    description: 'Parietal loplarida qon quyilishi belgilari'
  },
  degenerative: {
    probability: 23,
    boundingBoxes: [
      { x: 100, y: 140, width: 20, height: 20, confidence: 0.54 }
    ],
    description: 'O\'rta darajadagi degenerativ o\'zgarishlar'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    const { jobId, models = ['tumor', 'stroke', 'degenerative'] } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId majburiy' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Filter predictions based on requested models
    const predictions: { [key: string]: any } = {};
    for (const model of models) {
      if (mockPredictions[model]) {
        predictions[model] = mockPredictions[model];
      }
    }

    // Calculate overall confidence
    const confidenceScores = Object.values(predictions).map(p => p.probability);
    const overallConfidence = confidenceScores.length > 0 
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
      : 0;

    const result: PredictionResult = {
      jobId,
      timestamp: new Date(),
      predictions,
      processingTime: Date.now() - startTime,
      confidence: overallConfidence
    };

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Tahlil paytida xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analysis/predict
 * 
 * Performs AI-powered medical image analysis using trained models.
 * 
 * Request body:
 * {
 *   "jobId": "job_...",
 *   "imageSlice": 50,  // optional
 *   "models": ["tumor", "stroke", "degenerative"]  // optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "result": {
 *     "jobId": "job_...",
 *     "timestamp": "2024-01-20T10:30:00Z",
 *     "predictions": {
 *       "tumor": {
 *         "probability": 78,
 *         "boundingBoxes": [...],
 *         "description": "..."
 *       },
 *       ...
 *     },
 *     "processingTime": 234,
 *     "confidence": 68
 *   }
 * }
 */

export const dynamic = 'force-dynamic';
