'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstoneTools from 'cornerstone-tools'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as dicomParser from 'dicom-parser'
import { Box, Loader2, ZoomIn, Maximize2, Move, SunDim } from 'lucide-react'
import { Button } from './ui/button'

// Initialize Cornerstone
const initCornerstone = () => {
    if ((window as any).cornerstoneInitialized) return

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser
    cornerstoneTools.external.cornerstone = cornerstone
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath
    cornerstoneTools.external.Hammer = (window as any).Hammer

    cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
            // Add authorization header if needed
            const token = localStorage.getItem('auth_token')
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            }
        }
    })

    cornerstoneTools.init()
        ; (window as any).cornerstoneInitialized = true
}

interface DicomViewerProps {
    imageUrl: string
    className?: string
}

export default function DicomViewer({ imageUrl, className }: DicomViewerProps) {
    const viewerRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTool, setActiveTool] = useState('Pan')

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Dynamic import of hammerjs as it's required by cornerstone-tools
        const loadHammer = async () => {
            const Hammer = (await import('hammerjs')).default
                ; (window as any).Hammer = Hammer
            initCornerstone()
            startViewer()
        }

        const startViewer = async () => {
            if (!viewerRef.current) return
            const element = viewerRef.current

            try {
                cornerstone.enable(element)

                // The imageUrl should be wadouri:http://...
                const imageId = `wadouri:${imageUrl}`

                const image = await cornerstone.loadImage(imageId)
                cornerstone.displayImage(element, image)
                setLoading(false)

                // Add tools
                const PanTool = cornerstoneTools.PanTool
                const ZoomTool = cornerstoneTools.ZoomTool
                const WwwcTool = cornerstoneTools.WwwcTool

                cornerstoneTools.addTool(PanTool)
                cornerstoneTools.addTool(ZoomTool)
                cornerstoneTools.addTool(WwwcTool)

                cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 })
                cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 })
                cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 4 })

            } catch (err) {
                console.error('Cornerstone error:', err)
                setError('Failed to load DICOM image. Make sure it is a valid .dcm file.')
                setLoading(false)
            }
        }

        loadHammer()

        return () => {
            if (viewerRef.current) {
                cornerstone.disable(viewerRef.current)
            }
        }
    }, [imageUrl])

    const toggleTool = (toolName: string) => {
        cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 })
        setActiveTool(toolName)
    }

    return (
        <div className={`relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl ${className}`}>
            {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Initializing_Engine</p>
                </div>
            )}

            {error ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-center p-8">
                    <p className="text-red-500 font-bold mb-4">{error}</p>
                    <p className="text-white/30 text-xs">If this persists, the file may be corrupted or inaccessible.</p>
                </div>
            ) : (
                <div
                    ref={viewerRef}
                    className="w-full h-full cursor-crosshair min-h-[400px]"
                    onContextMenu={(e) => e.preventDefault()}
                />
            )}

            {/* Toolbar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 z-20">
                <ToolButton
                    active={activeTool === 'Pan'}
                    onClick={() => toggleTool('Pan')}
                    icon={<Move size={18} />}
                    label="Pan"
                />
                <ToolButton
                    active={activeTool === 'Zoom'}
                    onClick={() => toggleTool('Zoom')}
                    icon={<ZoomIn size={18} />}
                    label="Zoom"
                />
                <ToolButton
                    active={activeTool === 'Wwwc'}
                    onClick={() => toggleTool('Wwwc')}
                    icon={<SunDim size={18} />}
                    label="Contrast"
                />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/50 hover:text-white"
                    onClick={() => {
                        if (viewerRef.current) cornerstone.reset(viewerRef.current)
                    }}
                >
                    <Maximize2 size={18} />
                </Button>
            </div>
        </div>
    )
}

function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
        >
            {icon}
            <span className="text-[10px] uppercase font-black tracking-widest hidden md:inline">{label}</span>
        </button>
    )
}
