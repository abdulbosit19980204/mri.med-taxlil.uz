// DICOM Viewer utilities
// This file contains helper functions for DICOM image processing and visualization

/**
 * Parse DICOM file headers
 */
export async function parseDICOMFile(file: File): Promise<DICOMData | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Check DICOM file signature
    const view = new DataView(arrayBuffer);
    
    // DICOM files start with 'DICM' at offset 128
    const isDICOM = checkDICOMSignature(view);
    
    if (!isDICOM) {
      console.warn('Not a valid DICOM file');
      return null;
    }

    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      arrayBuffer: arrayBuffer
    };
  } catch (error) {
    console.error('Error parsing DICOM file:', error);
    return null;
  }
}

/**
 * Check if file has valid DICOM signature
 */
function checkDICOMSignature(view: DataView): boolean {
  try {
    // Check for DICM signature at offset 128
    const offset = 128;
    const signature = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    return signature === 'DICM';
  } catch (error) {
    return false;
  }
}

/**
 * Extract basic DICOM information
 */
export function extractDICOMInfo(dicomData: DICOMData): DICOMInfo {
  return {
    filename: dicomData.filename,
    size: formatFileSize(dicomData.size),
    uploadedAt: dicomData.lastModified.toLocaleString('uz-UZ'),
    slices: 150, // Default, actual value would come from parsing
    modality: 'MR', // Default, actual value would come from DICOM header
    patientName: 'Anonymous',
    studyDescription: 'Brain MRI'
  };
}

/**
 * Format file size to readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Apply window/level adjustments to DICOM image
 */
export function applyWindowLevel(
  imageData: ImageData,
  windowCenter: number,
  windowWidth: number
): ImageData {
  const data = imageData.data;
  
  // Calculate window boundaries
  const windowMin = windowCenter - windowWidth / 2;
  const windowMax = windowCenter + windowWidth / 2;
  const windowRange = windowMax - windowMin;
  
  // Apply window/level transformation
  for (let i = 0; i < data.length; i += 4) {
    let value = data[i]; // Assuming grayscale
    
    if (value < windowMin) {
      value = 0;
    } else if (value > windowMax) {
      value = 255;
    } else {
      value = ((value - windowMin) / windowRange) * 255;
    }
    
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  
  return imageData;
}

/**
 * Apply zoom transformation
 */
export function calculateZoomTransform(
  zoom: number,
  canvasWidth: number,
  canvasHeight: number
): TransformMatrix {
  const scale = zoom / 100;
  const translateX = (canvasWidth / 2) * (1 - scale);
  const translateY = (canvasHeight / 2) * (1 - scale);
  
  return {
    scale,
    translateX,
    translateY,
    rotate: 0
  };
}

/**
 * Apply rotation transformation
 */
export function calculateRotationTransform(
  angle: number,
  canvasWidth: number,
  canvasHeight: number
): TransformMatrix {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  
  return {
    scale: 1,
    translateX: canvasWidth / 2 - (canvasWidth / 2) * cos - (canvasHeight / 2) * sin,
    translateY: canvasHeight / 2 - (canvasWidth / 2) * sin + (canvasHeight / 2) * cos,
    rotate: angle
  };
}

/**
 * Measure distance between two points (pixels)
 */
export function measureDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Measure angle between two vectors
 */
export function measureAngle(p1: Point, p2: Point, p3: Point): number {
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const dot = v1.x * v2.x + v1.y * v2.y;
  const det = v1.x * v2.y - v1.y * v2.x;
  const angle = Math.atan2(det, dot);
  
  return Math.abs((angle * 180) / Math.PI);
}

/**
 * Generate DICOM analysis placeholder data
 */
export function generateAnalysisData(): AnalysisData {
  return {
    tumor: {
      probability: 78,
      description: 'O\'ng tepalik maydonida o\'sma aniqlanindi',
      coordinates: [120, 150]
    },
    stroke: {
      probability: 45,
      description: 'Parietal loplarida qon quyilishi belgilari',
      coordinates: [140, 160]
    },
    degenerative: {
      probability: 23,
      description: 'O\'rta darajadagi degenerativ o\'zgarishlar',
      coordinates: [100, 140]
    }
  };
}

// Type definitions
export interface DICOMData {
  filename: string;
  size: number;
  type: string;
  lastModified: Date;
  arrayBuffer: ArrayBuffer;
}

export interface DICOMInfo {
  filename: string;
  size: string;
  uploadedAt: string;
  slices: number;
  modality: string;
  patientName: string;
  studyDescription: string;
}

export interface TransformMatrix {
  scale: number;
  translateX: number;
  translateY: number;
  rotate: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface AnalysisData {
  tumor: { probability: number; description: string; coordinates: number[] };
  stroke: { probability: number; description: string; coordinates: number[] };
  degenerative: { probability: number; description: string; coordinates: number[] };
}
