import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTour } from '../context/TourContext'

interface Rect { top: number; left: number; width: number; height: number }

const PAD = 10
const TOOLTIP_W = 300

function measureTarget(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export default function TourOverlay() {
  const { steps, currentStep, isVisible, nextStep, prevStep, endTour } = useTour()
  const [rect, setRect] = useState<Rect | null>(null)

  const step = isVisible ? steps[currentStep] : null

  const measure = useCallback(() => {
    if (!step) { setRect(null); return }
    setRect(measureTarget(step.target))
  }, [step])

  useEffect(() => {
    if (!step) { setRect(null); return }
    const el = document.querySelector(`[data-tour="${step.target}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [step, measure])

  if (!step) return null

  const placement = step.placement ?? 'bottom'

  const tooltipStyle: React.CSSProperties = { position: 'fixed', zIndex: 101, width: TOOLTIP_W }
  if (rect) {
    const cx = rect.left + rect.width / 2
    const clampLeft = (x: number) => Math.max(12, Math.min(x, window.innerWidth - TOOLTIP_W - 12))
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
      tooltipStyle.right = window.innerWidth - rect.left + PAD + 8
    }
  } else {
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  }

  return (
    <>
      {rect ? (
        <>
          <div className="fixed z-[99] bg-black/55 backdrop-blur-sm pointer-events-none"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PAD) }} />
          <div className="fixed z-[99] bg-black/55 backdrop-blur-sm pointer-events-none"
            style={{ top: rect.top + rect.height + PAD, left: 0, right: 0, bottom: 0 }} />
          <div className="fixed z-[99] bg-black/55 backdrop-blur-sm pointer-events-none"
            style={{ top: rect.top - PAD, left: 0, width: Math.max(0, rect.left - PAD), height: rect.height + PAD * 2 }} />
          <div className="fixed z-[99] bg-black/55 backdrop-blur-sm pointer-events-none"
            style={{ top: rect.top - PAD, left: rect.left + rect.width + PAD, right: 0, height: rect.height + PAD * 2 }} />
          <div
            className="fixed z-[100] rounded-ios-md pointer-events-none"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              boxShadow: '0 0 0 3px rgba(94,106,210,0.9), 0 0 0 8px rgba(94,106,210,0.3)',
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-[99] bg-black/55 backdrop-blur-sm pointer-events-none" />
      )}

      <div
        style={tooltipStyle}
        className="ios-glass-heavy rounded-ios-md p-4 animate-scale-in"
        role="dialog"
        aria-live="polite"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption2 font-bold text-tint-600 dark:text-tint-300 uppercase tracking-wider">
            Passo {currentStep + 1} de {steps.length}
          </span>
          <button
            onClick={endTour}
            className="w-6 h-6 rounded-full ios-fill-2 flex items-center justify-center text-ios-label-2 dark:text-ios-dlabel-2 hover:text-ios-label dark:hover:text-ios-dlabel transition-colors"
          >
            <X size={12} />
          </button>
        </div>
        <h4 className="text-callout font-semibold text-ios-label dark:text-ios-dlabel mb-1">
          {step.title}
        </h4>
        <p className="text-footnote text-ios-label-2 dark:text-ios-dlabel-2 leading-relaxed">
          {step.body}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 hairline-t">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-caption1 font-semibold text-ios-label-2 dark:text-ios-dlabel-2 disabled:opacity-30 hover:text-ios-label dark:hover:text-ios-dlabel flex items-center gap-0.5 transition-colors"
          >
            <ChevronLeft size={13} /> Anterior
          </button>
          <div className="flex gap-1 items-center">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all ${i === currentStep ? 'w-4 h-1.5 bg-tint-500' : 'w-1.5 h-1.5 bg-ios-label-4 dark:bg-ios-dlabel-4'}`}
              />
            ))}
          </div>
          <button
            onClick={nextStep}
            className="text-caption1 font-semibold text-tint-500 hover:text-tint-600 flex items-center gap-0.5 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'} <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </>
  )
}
