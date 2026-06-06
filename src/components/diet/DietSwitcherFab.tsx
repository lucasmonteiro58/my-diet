import { User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const LONG_PRESS_MS = 500
const SHOW_AFTER_SCROLL_PX = 48

interface DietSwitcherFabProps {
  patientName: string
  enabled: boolean
  onCycle: () => void
  onLongPress: () => void
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

export function DietSwitcherFab({
  patientName,
  enabled,
  onCycle,
  onLongPress,
}: DietSwitcherFabProps) {
  const [show, setShow] = useState(false)
  const longPressTimer = useRef<number | null>(null)
  const longPressTriggered = useRef(false)

  useEffect(() => {
    if (!enabled) {
      setShow(false)
      return
    }

    function update() {
      setShow(window.scrollY > SHOW_AFTER_SCROLL_PX)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [enabled])

  function clearLongPressTimer() {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handlePointerDown() {
    longPressTriggered.current = false
    clearLongPressTimer()
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      onLongPress()
    }, LONG_PRESS_MS)
  }

  function handlePointerUp() {
    clearLongPressTimer()
    if (!longPressTriggered.current) onCycle()
  }

  function handlePointerCancel() {
    clearLongPressTimer()
    longPressTriggered.current = false
  }

  if (!enabled) return null

  return (
    <button
      type="button"
      aria-label={`Alternar dieta — ${patientName}. Toque longo para escolher.`}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        'fixed right-4 z-30 flex max-w-[calc(100%-2rem)] touch-manipulation select-none items-center gap-2 rounded-full',
        'border border-brand-500/25 bg-brand-600 px-3 py-2 backdrop-blur-md',
        'text-white shadow-sm shadow-brand-600/20 transition-[opacity,transform] duration-150 active:scale-95',
        'dark:border-brand-300/20 dark:bg-brand-700 dark:shadow-black/30',
        'bottom-[max(1.5rem,var(--safe-bottom))]',
        show
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      ].join(' ')}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
        <User className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium text-white/90">
        {getFirstName(patientName)}
      </span>
    </button>
  )
}
