'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, ZoomIn, Maximize2, Play, Pause, ChevronLeft, ChevronRight, Layers, Grid3X3, SlidersHorizontal } from 'lucide-react'

interface DicomViewerProps {
    imageUrl: string
    frames?: string[]
    className?: string
}

/** Build absolute URL from a relative /media/... path. */
function toAbsUrl(path: string): string {
    if (!path || path.startsWith('http')) return path
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    return `${base}${path}`
}

// ─── VIEW MODES ──────────────────────────────────────────────────────────────
type ViewMode = 'slider' | 'grid'

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function DicomViewer({ imageUrl, frames = [], className }: DicomViewerProps) {
    const hasFrames = frames.length > 1
    const [viewMode, setViewMode] = useState<ViewMode>('slider')
    const [currentFrame, setCurrentFrame] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [fps, setFps] = useState(10)
    const [loading, setLoading] = useState(true)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [dragging, setDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })
    const playRef = useRef<NodeJS.Timeout | null>(null)
    // Grid: selected frame to enlarge
    const [gridSelected, setGridSelected] = useState<number | null>(null)
    // Grid columns
    const [gridCols, setGridCols] = useState(4)

    // --- Navigation helpers ---
    const goTo = useCallback((idx: number) => {
        setCurrentFrame(Math.max(0, Math.min(idx, frames.length - 1)))
    }, [frames.length])

    // Play/Pause
    useEffect(() => {
        if (!hasFrames || viewMode !== 'slider') return
        if (isPlaying) {
            playRef.current = setInterval(() => {
                setCurrentFrame(f => (f + 1) % frames.length)
            }, 1000 / fps)
        } else {
            if (playRef.current) clearInterval(playRef.current)
        }
        return () => { if (playRef.current) clearInterval(playRef.current) }
    }, [isPlaying, fps, frames.length, hasFrames, viewMode])

    // Mouse-wheel
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!hasFrames || viewMode !== 'slider') return
        e.preventDefault()
        setIsPlaying(false)
        setCurrentFrame(f => Math.max(0, Math.min(f + (e.deltaY > 0 ? 1 : -1), frames.length - 1)))
    }, [hasFrames, frames.length, viewMode])

    // Drag-to-pan (slider mode)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || viewMode !== 'slider') return
        setDragging(true)
        dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
    }
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return
        setPan({ x: dragStart.current.px + e.clientX - dragStart.current.x, y: dragStart.current.py + e.clientY - dragStart.current.y })
    }
    const handleMouseUp = () => setDragging(false)

    const handleZoom = (delta: number) => setZoom(z => Math.max(0.5, Math.min(z + delta, 5)))
    const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

    // Current slider frame src
    const currentSrc = hasFrames ? toAbsUrl(frames[currentFrame]) : (imageUrl || '')

    useEffect(() => { if (hasFrames) { setLoading(true) } }, [currentFrame, hasFrames])

    // Cornerstone WADO (single .dcm fallback)
    const viewerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (hasFrames || !imageUrl || viewMode !== 'slider') return
        if (typeof window === 'undefined') return
        const loadCornerstone = async () => {
            const [cs, csMath, csTools, csWADO, dcmParser, Hammer] = await Promise.all([
                import('cornerstone-core'), import('cornerstone-math'), import('cornerstone-tools'),
                import('cornerstone-wado-image-loader'), import('dicom-parser'), import('hammerjs')
            ])
            if (!(window as any)._csInit) {
                ;(csWADO as any).external.cornerstone = cs
                ;(csWADO as any).external.dicomParser = dcmParser
                ;(csTools as any).external.cornerstone = cs
                ;(csTools as any).external.cornerstoneMath = csMath
                ;(window as any).Hammer = Hammer.default
                ;(csTools as any).external.Hammer = Hammer.default
                ;(csTools as any).init()
                ;(window as any)._csInit = true
            }
            if (!viewerRef.current) return
            try {
                ;(cs as any).enable(viewerRef.current)
                const image = await (cs as any).loadImage(`wadouri:${imageUrl}`)
                ;(cs as any).displayImage(viewerRef.current, image)
                setLoading(false)
            } catch { setLoading(false) }
        }
        loadCornerstone()
        return () => { if (viewerRef.current) import('cornerstone-core').then(cs => (cs as any).disable(viewerRef.current!)).catch(() => {}) }
    }, [imageUrl, hasFrames, viewMode])

    // ─── GRID VIEW ──────────────────────────────────────────────────────────
    if (viewMode === 'grid' && hasFrames) {
        return (
            <div className={`relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col ${className}`}>
                {/* Grid toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-black/90 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                        <Grid3X3 size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
                            Film Ko'rinish — {frames.length} ta slice
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-white/30 uppercase">Ustunlar</span>
                            {[3, 4, 5, 6].map(n => (
                                <button key={n} onClick={() => setGridCols(n)}
                                    className={`w-6 h-6 rounded text-[9px] font-black transition-all ${gridCols === n ? 'bg-primary text-white' : 'text-white/30 hover:text-white/60'}`}
                                >{n}</button>
                            ))}
                        </div>
                        <button
                            onClick={() => setViewMode('slider')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                            <SlidersHorizontal size={12} /> Slider
                        </button>
                    </div>
                </div>

                {/* Grid cells */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar"
                    style={{ background: '#000' }}
                >
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
                    >
                        {frames.map((src, idx) => (
                            <GridCell
                                key={idx}
                                src={toAbsUrl(src)}
                                idx={idx}
                                total={frames.length}
                                cols={gridCols}
                                isSelected={gridSelected === idx}
                                onClick={() => {
                                    if (gridSelected === idx) {
                                        setGridSelected(null)
                                    } else {
                                        setGridSelected(idx)
                                        setCurrentFrame(idx)
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Modal lightbox for selected frame */}
                {gridSelected !== null && (
                    <div
                        className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
                        onClick={() => setGridSelected(null)}
                    >
                        <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                            <img
                                src={toAbsUrl(frames[gridSelected])}
                                alt={`Slice ${gridSelected + 1}`}
                                className="max-w-full max-h-[70vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <button
                                    onClick={() => setGridSelected(g => g !== null ? Math.max(0, g - 1) : 0)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-primary transition-all"
                                ><ChevronLeft size={20} className="text-white" /></button>

                                <div className="text-center">
                                    <p className="text-primary font-black text-sm font-mono">
                                        {String(gridSelected + 1).padStart(3, '0')} / {String(frames.length).padStart(3, '0')}
                                    </p>
                                    <p className="text-white/30 text-[9px] uppercase tracking-widest">Kattalashtirish uchun bosing — Yopish uchun orqaga</p>
                                </div>

                                <button
                                    onClick={() => setGridSelected(g => g !== null ? Math.min(frames.length - 1, g + 1) : 0)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-primary transition-all"
                                ><ChevronRight size={20} className="text-white" /></button>
                            </div>
                        </div>
                        <button
                            onClick={() => setGridSelected(null)}
                            className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white/60 text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                        >Yopish (ESC)</button>
                    </div>
                )}

                {/* Bottom bar */}
                <div className="shrink-0 px-4 py-2 bg-black/90 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[8px] text-white/30 font-mono uppercase">
                        Sliceni kattalashtirish uchun ustiga bosing
                    </span>
                    <button
                        onClick={() => { setCurrentFrame(gridSelected ?? 0); setViewMode('slider') }}
                        className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                        Slider Ko'rinishida Ochish →
                    </button>
                </div>
            </div>
        )
    }

    // ─── SLIDER VIEW (default) ───────────────────────────────────────────────
    return (
        <div
            className={`relative bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col ${className}`}
            onWheel={handleWheel}
        >
            {/* Image viewport */}
            <div
                className="flex-1 relative overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: dragging ? 'grabbing' : 'crosshair' }}
            >
                {/* Subtle Loading Indicators */}
                {loading && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {/* Top Thin Progress Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden">
                            <div className="h-full bg-primary animate-progress-loading" style={{ width: '30%' }}></div>
                        </div>
                        
                        {/* Corner Mini-Spinner */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
                            <Loader2 className="h-3 w-3 text-primary animate-spin" />
                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">
                                {hasFrames ? `Loading Slice ${currentFrame + 1}` : 'Loading...'}
                            </span>
                        </div>
                    </div>
                )}

                {hasFrames ? (
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
                        onError={() => setLoading(false)}
                        draggable={false}
                    />
                ) : (
                    <div ref={viewerRef} className="w-full h-full min-h-[400px]" onContextMenu={e => e.preventDefault()} />
                )}

                {/* HUD counter */}
                {hasFrames && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-primary/20 px-3 py-1 rounded-xl flex items-center gap-2 z-20">
                        <Layers size={12} className="text-primary" />
                        <span className="text-[10px] font-black text-primary font-mono">
                            {String(currentFrame + 1).padStart(3, '0')} / {String(frames.length).padStart(3, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* Slider */}
            {hasFrames && (
                <div className="shrink-0 px-4 pt-2 pb-1 bg-black/80 border-t border-white/5">
                    <input
                        type="range" min={0} max={frames.length - 1} value={currentFrame}
                        onChange={e => { setIsPlaying(false); goTo(Number(e.target.value)) }}
                        className="w-full h-1 accent-primary cursor-pointer"
                    />
                </div>
            )}

            {/* Toolbar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-black/80 gap-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                    {hasFrames && (
                        <>
                            <ToolBtn onClick={() => { setIsPlaying(false); goTo(currentFrame - 1) }} icon={<ChevronLeft size={16} />} label="" active={false} />
                            <ToolBtn onClick={() => setIsPlaying(p => !p)} icon={isPlaying ? <Pause size={16} /> : <Play size={16} />} label={isPlaying ? 'Pause' : 'Play'} active={isPlaying} />
                            <ToolBtn onClick={() => { setIsPlaying(false); goTo(currentFrame + 1) }} icon={<ChevronRight size={16} />} label="" active={false} />
                            <div className="w-px h-5 bg-white/10 mx-1" />
                            <span className="text-[9px] text-white/30 font-mono uppercase">FPS</span>
                            <input type="number" min={1} max={60} value={fps}
                                onChange={e => setFps(Number(e.target.value))}
                                className="w-10 bg-white/5 border border-white/10 rounded text-[10px] text-white text-center px-1 py-0.5"
                            />
                            <div className="w-px h-5 bg-white/10 mx-1" />
                            {/* GRID VIEW TOGGLE */}
                            <ToolBtn
                                onClick={() => { setIsPlaying(false); setViewMode('grid') }}
                                icon={<Grid3X3 size={16} />}
                                label="Film Ko'rinish"
                                active={false}
                            />
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1 ml-auto">
                    <ToolBtn onClick={() => handleZoom(0.25)} icon={<ZoomIn size={16} />} label="+" active={false} />
                    <ToolBtn onClick={() => handleZoom(-0.25)} icon={<ZoomIn size={16} className="scale-75" />} label="-" active={false} />
                    <ToolBtn onClick={resetView} icon={<Maximize2 size={16} />} label="Reset" active={false} />
                </div>
            </div>
        </div>
    )
}

// ─── GRID CELL ────────────────────────────────────────────────────────────────
function GridCell({ src, idx, total, cols, isSelected, onClick }: {
    src: string; idx: number; total: number; cols: number; isSelected: boolean; onClick: () => void
}) {
    const [loaded, setLoaded] = useState(false)
    return (
        <div
            onClick={onClick}
            className={`relative aspect-square cursor-pointer overflow-hidden transition-all duration-200 border ${
                isSelected
                    ? 'border-primary shadow-lg shadow-primary/30 scale-105 z-10'
                    : 'border-white/5 hover:border-primary/40 hover:scale-[1.03]'
            }`}
            style={{ borderRadius: cols <= 4 ? '8px' : '4px' }}
        >
            {!loaded && (
                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                </div>
            )}
            <img
                src={src}
                alt={`Slice ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => setLoaded(true)}
                draggable={false}
            />
            {/* Slice number badge */}
            <div className="absolute bottom-0.5 right-0.5 bg-black/70 px-1 rounded text-[7px] font-mono text-white/60 leading-none py-0.5">
                {idx + 1}
            </div>
        </div>
    )
}

// ─── TOOL BUTTON ─────────────────────────────────────────────────────────────
function ToolBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${
                active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
        >
            {icon}
            {label && <span className="hidden md:inline">{label}</span>}
        </button>
    )
}
