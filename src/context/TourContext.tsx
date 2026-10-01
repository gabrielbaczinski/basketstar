import React, { createContext, useContext, useState, useCallback } from 'react'

export interface TourStep {
  target: string
  title: string
  body: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface TourContextType {
  steps: TourStep[]
  currentStep: number
  isVisible: boolean
  startTour: (steps: TourStep[]) => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
}

const TourContext = createContext<TourContextType | null>(null)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<TourStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const startTour = useCallback((tourSteps: TourStep[]) => {
    if (tourSteps.length === 0) return
    setSteps(tourSteps)
    setCurrentStep(0)
    setIsVisible(true)
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1
      if (next >= steps.length) { setIsVisible(false); return 0 }
      return next
    })
  }, [steps.length])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }, [])

  const endTour = useCallback(() => {
    setIsVisible(false)
    setCurrentStep(0)
  }, [])

  return (
    <TourContext.Provider value={{ steps, currentStep, isVisible, startTour, nextStep, prevStep, endTour }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be inside TourProvider')
  return ctx
}
