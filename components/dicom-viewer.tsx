'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, ZoomIn, Move, SunDim, Play, Pause, Maximize2, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { Button } from './ui/button'

interface DicomViewerProps {
    imageUrl: string
    frames?: string[]
    className?: string
}

/** Build absolute media URL from a relative path coming from the backend. */
function toAbsUrl(path: string): string {
    if (!path || path.startsWith('http')) return path
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    // frames paths start with /media/...
    return `${base}${path}`
}

export default function DicomViewer({ imageUrl, frames = [], className }: DicomViewerProps) {
    const hasFrames = frames.length > 1
    const [currentFrame, setCurrentFrame] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [fps, setFps] = useState(10)
    const [loading, setLoading] = useState(true)
    const [imgError, setImgError] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [dragging, setDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })
    const playRef = useRef<NodeJS.Timeout | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // --------------- Frame Navigation ---------------
    const goTo = useCallback((idx: number) => {
        setCurrentFrame(Math.max(0, Math.min(idx, frames.length - 1)))
    }, [frames.length])

    // Play / Pause animation
    useEffect(() => {
        if (!hasFrames) return
        if (isPlaying) {
            playRef.current = setInterval(() => {
                setCurrentFrame(f => (f + 1) % frames.length)
            }, 1000 / fps)
        } else {
            if (playRef.current) clearInterval(playRef.current)
        }
        return () => { if (playRef.current) clearInterval(playRef.current) }
    }, [isPlaying, fps, frames.length, hasFrames])

    // Mouse-wheel scroll through frames
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!hasFrames) return
        e.preventDefault()
        setIsPlaying(false)
        setCurrentFrame(f => {
            const next = f + (e.deltaY > 0 ? 1 : -1)
            return Math.max(0, Math.min(next, frames.length - 1))
        })
    }, [hasFrames, frames.length])

    // ---- Zoom / Pan (mouse drag) ----
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return
        setDragging(true)
        dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
    }
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return
        setPan({
            x: dragStart.current.px + e.clientX - dragStart.current.x,
            y: dragStart.current.py + e.clientY - dragStart.current.y
        })
    }
    const handleMouseUp = () => setDragging(false)

    const handleZoom = (delta: number) => {
        setZoom(z => Math.max(0.5, Math.min(z + delta, 5)))
    }

    const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

    // Current image URL
    const currentSrc = hasFrames ? toAbsUrl(frames[currentFrame]) : (imageUrl || '')

    // Reload image when frame changes
    useEffect(() => {
        if (hasFrames) {
            setLoading(true)
            setImgError(false)
        }
    }, [currentFrame, hasFrames])

    // ----------------------------------------------------------------
    // If no frames, fall back to Cornerstone WADO for raw .dcm loading
    // ----------------------------------------------------------------
    const viewerRef = useRef<HTMLDivElement>(null)
    const cornerstoneReady = useRef(false)

    useEffect(() => {
        if (hasFrames || !imageUrl) return
        if (typeof window === 'undefined') return

        const loadCornerstone = async () => {
            const [
                cornerstone,
                cornerstoneMath,
                cornerstoneTools,
                cornerstoneWADOImageLoader,
                dicomParser,
                Hammer
            ] = await Promise.all([
                import('cornerstone-core'),
                import('cornerstone-math'),
                import('cornerstone-tools'),
                import('cornerstone-wado-image-loader'),
                import('dicom-parser'),
                import('hammerjs')
            ])

            if (!(window as any)._csInit) {
                (cornerstoneWADOImageLoader as any).external.cornerstone = cornerstone
                ;(cornerstoneWADOImageLoader as any).external.dicomParser = dicomParser
                ;(cornerstoneTools as any).external.cornerstone = cornerstone
                ;(cornerstoneTools as any).external.cornerstoneMath = cornerstoneMath
                ;(window as any).Hammer = Hammer.default
                ;(cornerstoneTools as any).external.Hammer = Hammer.default
                ;(cornerstoneTools as any).init()
                ;(window as any)._csInit = true
            }

            if (!viewerRef.current) return
            const el = viewerRef.current
            try {
                ;(cornerstone as any).enable(el)
                const image = await (cornerstone as any).loadImage(`wadouri:${imageUrl}`)
                ;(cornerstone as any).displayImage(el, image)
                ;['PanTool', 'ZoomTool', 'WwwcTool'].forEach(t => {
                    ;(cornerstoneTools as any).addTool((cornerstoneTools as any)[t])
                })
                ;(cornerstoneTools as any).setToolActive('Pan', { mouseButtonMask: 1 })
                ;(cornerstoneTools as any).setToolActive('Zoom', { mouseButtonMask: 2 })
                setLoading(false)
            } catch (err) {
                console.error('Cornerstone error:', err)
                setImgError(true)
                setLoading(false)
            }
        }
        loadCornerstone()

        return () => {
            if (viewerRef.current) {
                import('cornerstone-core').then(cs => (cs as any).disable(viewerRef.current!)).catch(() => { })
            }
        }
    }, [imageUrl, hasFrames])

    // --------------- RENDER ---------------
    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col ${className}`}
            onWheel={handleWheel}
        >
            {/* Image / Viewport */}
            <div
                className="flex-1 relative overflow-hidden cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
            >
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                            {hasFrames ? `Loading Slice ${currentFrame + 1} / ${frames.length}` : 'Initializing_Engine'}
                        </p>
                    </div>
                )}

                {imgError ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-center p-8">
                        <p className="text-red-500 font-bold mb-2">Failed to load image.</p>
                        <p className="text-white/30 text-xs">The file may be corrupted or inaccessible.</p>
                    </div>
                ) : hasFrames ? (
                    /* PNG frames mode */
                    <img
                        key={currentFrame}
                        src={currentSrc}
                        alt={`Slice ${currentFrame + 1}`}
                        className="w-full h-full object-contain select-none"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            transition: dragging ? 'none' : 'transform 0.1s ease',
                        }}
                        onLoad={() => setLoading(false)}
                        onError={() => { setImgError(false); setLoading(false) }}
                        draggable={false}
                    />
                ) : (
                    /* Cornerstone WADO mode */
                    <div ref={viewerRef} className="w-full h-full min-h-[400px]" onContextMenu={e => e.preventDefault()} />
                )}

                {/* Slice counter HUD (top-right) */}
                {hasFrames && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-primary/20 px-3 py-1 rounded-xl flex items-center gap-2 z-20">
                        <Layers size={12} className="text-primary" />
                        <span className="text-[10px] font-black text-primary font-mono">
                            {String(currentFrame + 1).padStart(3, '0')} / {String(frames.length).padStart(3, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Slice Slider ── (only when multi-frame) */}
            {hasFrames && (
                <div className="shrink-0 px-4 pt-2 pb-1 bg-black/80 border-t border-white/5">
                    <input
                        type="range"
                        min={0}
                        max={frames.length - 1}
                        value={currentFrame}
                        onChange={e => { setIsPlaying(false); goTo(Number(e.target.value)) }}
                        className="w-full h-1 accent-primary cursor-pointer"
                    />
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-black/80 gap-2 border-t border-white/5">
                {/* Left: Frame controls */}
                {hasFrames && (
                    <div className="flex items-center gap-1">
                        <ToolBtn onClick={() => { setIsPlaying(false); goTo(currentFrame - 1) }} icon={<ChevronLeft size={16} />} label="" active={false} />
                        <ToolBtn onClick={() => setIsPlaying(p => !p)} icon={isPlaying ? <Pause size={16} /> : <Play size={16} />} label={isPlaying ? 'Pause' : 'Play'} active={isPlaying} />
                        <ToolBtn onClick={() => { setIsPlaying(false); goTo(currentFrame + 1) }} icon={<ChevronRight size={16} />} label="" active={false} />
                        <div className="w-px h-5 bg-white/10 mx-1" />
                        <span className="text-[9px] text-white/30 font-mono uppercase">FPS</span>
                        <input
                            type="number" min={1} max={60} value={fps}
                            onChange={e => setFps(Number(e.target.value))}
                            className="w-10 bg-white/5 border border-white/10 rounded text-[10px] text-white text-center px-1 py-0.5"
                        />
                    </div>
                )}

                {/* Right: Zoom/Pan controls */}
                <div className="flex items-center gap-1 ml-auto">
                    <ToolBtn onClick={() => handleZoom(0.25)} icon={<ZoomIn size={16} />} label="Zoom +" active={false} />
                    <ToolBtn onClick={() => handleZoom(-0.25)} icon={<ZoomIn size={16} className="scale-75" />} label="Zoom -" active={false} />
                    <ToolBtn onClick={resetView} icon={<Maximize2 size={16} />} label="Reset" active={false} />
                </div>
            </div>
        </div>
    )
}

function ToolBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
        >
            {icon}
            {label && <span className="hidden md:inline">{label}</span>}
        </button>
    )
}
