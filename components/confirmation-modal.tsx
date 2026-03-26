'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'
import { AlertCircle, Trash2 } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'info'
  loading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'danger',
  loading = false
}: ConfirmationModalProps) {
  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border border-white/10 bg-slate-900 p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-[32px]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={cn(
                "h-16 w-16 rounded-3xl flex items-center justify-center shadow-inner border",
                variant === 'danger' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"
            )}>
              {variant === 'danger' ? <Trash2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
            </div>
            
            <AlertDialogPrimitive.Title className="text-2xl font-black text-white tracking-tight">
              {title}
            </AlertDialogPrimitive.Title>
            
            <AlertDialogPrimitive.Description className="text-sm text-slate-400 font-medium leading-relaxed">
              {description}
            </AlertDialogPrimitive.Description>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <button className="h-12 px-8 rounded-2xl border border-white/5 bg-white/5 text-white text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all outline-none">
                {cancelText}
              </button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <button 
                onClick={(e) => {
                    e.preventDefault()
                    onConfirm()
                }}
                disabled={loading}
                className={cn(
                    "h-12 px-8 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all outline-none flex items-center justify-center gap-2",
                    variant === 'danger' ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20" : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20",
                    loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? "Bajarilmoqda..." : confirmText}
              </button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
