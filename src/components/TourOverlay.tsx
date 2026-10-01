import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTour } from '../context/TourContext'

interface Rect { top: number; left: number; width: number; height: number }

const PAD = 8
const TOOLTIP_W = 320
const MOBILE_MAX = 640 // sm breakpoint

function measureTarget(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export default function TourOverlay() {
  const { steps, currentStep, isVisible, nextStep, prevStep, endTour } = useTour()
  const [rect, setRect] = useState<Rect | null>(null)
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))

  const step = isVisible ? steps[currentStep] : null
  const isMobile = vw < MOBILE_MAX

  const measure = useCallback(() => {
    if (!step) { setRect(null); return }
    setRect(measureTarget(step.target))
    setVw(window.innerWidth)
  }, [step])

  useEffect(() => {
    if (!step) { setRect(null); return }
    const el = document.querySelector(`[data-tour="${step.target}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, measure])

  if (!step) return null

  const placement = step.placement ?? 'bottom'

  /* ─── Tooltip position ─── */
  const tooltipStyle: React.CSSProperties = { position: 'fixed', zIndex: 101 }

  if (isMobile) {
    // Mobile: full-width bottom sheet above the tab bar
    tooltipStyle.left = 12
    tooltipStyle.right = 12
    tooltipStyle.bottom = 'calc(72px + env(safe-area-inset-bottom))'
  } else if (rect) {
    tooltipStyle.width = TOOLTIP_W
    const cx = rect.left + rect.width / 2
    const clampLeft = (x: number) => Math.max(12, Math.min(x, vw - TOOLTIP_W - 12))
    if (placement === 'bottom') {
      tooltipStyle.top = rect.top + rect.height + PAD + 8
      tooltipStyle.left = clampLeft(cx - TOOLTIP_W / 2)
    } else if (placement === 'top') {
      tooltipStyle.bottom = window.innerHeight - rect.top + PAD + 8
      tooltipStyle.left = clampLeft(cx - TOOLTIP_W / 2)
    } else if (placement === 'right') {
      tooltipStyle.top = Math.max(12, rect.top + rect.height / 2 - 80)
      tooltipStyle.left = rect.left + rect.width + PAD + 8
    } else {
      tooltipStyle.top = Math.max(12, rect.top + rect.height / 2 - 80)
      tooltipStyle.right = vw - rect.left + PAD + 8
    }
  } else {
    tooltipStyle.width = TOOLTIP_W
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  }

  /* ─── Spotlight rect — clamp to viewport to avoid overflow mask holes ─── */
  const spotlight = rect
    ? {
        top: Math.max(0, rect.top - PAD),
        left: Math.max(0, rect.left - PAD),
        width: Math.min(vw, rect.width + PAD * 2),
        height: rect.height + PAD * 2,
      }
    : null

  return (
    <>
      {/* Dim mask (4 pieces around the spotlight) */}
      {spotlight ? (
        <>
          <div
            className="fixed z-[99] bg-black/55 backdrop-blur-sm"
            style={{ top: 0, left: 0, right: 0, height: spotlight.top }}
            onClick={endTour}
          />
          <div
            className="fixed z-[99] bg-black/55 backdrop-blur-sm"
            style={{ top: spotlight.top + spotlight.height, left: 0, right: 0, bottom: 0 }}
            onClick={endTour}
          />
          <div
            className="fixed z-[99] bg-black/55 backdrop-blur-sm"
            style={{ top: spotlight.top, left: 0, width: spotlight.left, height: spotlight.height }}
            onClick={endTour}
          />
          <div
            className="fixed z-[99] bg-black/55 backdrop-blur-sm"
            style={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              right: 0,
              height: spotlight.height,
            }}
            onClick={endTour}
          />
          <div
            className="fixed z-[100] rounded-ios-md pointer-events-none transition-all"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 3px rgba(94,106,210,0.9), 0 0 0 8px rgba(94,106,210,0.3)',
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-[99] bg-black/55 backdrop-blur-sm" onClick={endTour} />
      )}

      {/* Tooltip / sheet */}
      <div
        style={tooltipStyle}
        className="ios-glass-heavy rounded-ios-md p-4 animate-scale-in shadow-ios-5"
        role="dialog"
        aria-live="polite"
      >
        {/* Mobile grabber */}
        {isMobile && (
          <div className="flex justify-center -mt-1 mb-2">
            <div className="w-9 h-1 rounded-full bg-ios-label-4 dark:bg-ios-dlabel-4" />
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-caption2 font-bold text-tint-600 dark:text-tint-300 uppercase tracking-wider">
            Passo {currentStep + 1} de {steps.length}
          </span>
          <button
            onClick={endTour}
            className="w-7 h-7 rounded-full ios-fill-2 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel transition-colors"
            aria-label="Fechar tour"
          >
            <X size={13} />
          </button>
        </div>

        <h4 className="text-callout font-semibold text-ios-label dark:text-ios-dlabel mb-1">
          {step.title}
        </h4>
        <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed">
          {step.body}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 hairline-t gap-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-caption1 font-semibold text-ios-label-2 dark:text-ios-dlabel-2 disabled:opacity-30 hover:text-ios-label dark:hover:text-ios-dlabel inline-flex items-center gap-0.5 transition-colors px-2 py-1.5 rounded-full"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <div className="flex gap-1 items-center">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all ${
                  i === currentStep ? 'w-4 h-1.5 bg-tint-500' : 'w-1.5 h-1.5 bg-ios-label-4 dark:bg-ios-dlabel-4'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextStep}
            className="ios-btn-primary !py-1.5 !px-3.5 !text-caption1"
          >
            {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </>
  )
}
