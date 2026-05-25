import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const backdropTransition = { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const }
const sheetTransition = {
  type: 'spring' as const,
  damping: 32,
  stiffness: 380,
  mass: 0.85,
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  ariaLabel?: string
  children: ReactNode
  maxHeight?: string
}

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel = 'Painel',
  children,
  maxHeight = '90dvh',
}: BottomSheetProps) {
  const dragControls = useDragControls()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 72 || info.velocity.y > 400) onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title ?? ariaLabel}
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface-elevated shadow-2xl will-change-transform"
            style={{
              maxHeight,
              paddingBottom: 'max(1rem, var(--safe-bottom))',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={sheetTransition}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.35 }}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex shrink-0 cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="h-1 w-10 rounded-full bg-handle" aria-hidden />
            </div>

            {title && (
              <div className="flex shrink-0 items-center justify-between px-5 pb-3">
                <h2 className="text-lg font-bold text-ink">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-ink-muted transition hover:bg-hover"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
