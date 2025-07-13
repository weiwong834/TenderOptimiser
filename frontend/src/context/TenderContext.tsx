import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { TenderOffer, TenderCriteria, OptimizationResult, AnalysisMetrics } from '../types/tender'

interface TenderState {
  tenders: TenderOffer[]
  criteria: TenderCriteria
  optimizationResult: OptimizationResult | null
  analysisMetrics: AnalysisMetrics | null
}

type TenderAction =
  | { type: 'ADD_TENDER'; payload: TenderOffer }
  | { type: 'UPDATE_TENDER'; payload: TenderOffer }
  | { type: 'DELETE_TENDER'; payload: string }
  | { type: 'SET_CRITERIA'; payload: TenderCriteria }
  | { type: 'SET_OPTIMIZATION_RESULT'; payload: OptimizationResult }
  | { type: 'SET_ANALYSIS_METRICS'; payload: AnalysisMetrics }
  | { type: 'CLEAR_ALL' }

const initialState: TenderState = {
  tenders: [],
  criteria: {
    costWeight: 30,
    qualityWeight: 25,
    deliveryWeight: 15,
    reliabilityWeight: 10,
    technicalWeight: 10,
    financialWeight: 5,
    performanceWeight: 3,
    riskWeight: 2
  },
  optimizationResult: null,
  analysisMetrics: null
}

function tenderReducer(state: TenderState, action: TenderAction): TenderState {
  switch (action.type) {
    case 'ADD_TENDER':
      return {
        ...state,
        tenders: [...state.tenders, action.payload]
      }
    case 'UPDATE_TENDER':
      return {
        ...state,
        tenders: state.tenders.map(tender =>
          tender.id === action.payload.id ? action.payload : tender
        )
      }
    case 'DELETE_TENDER':
      return {
        ...state,
        tenders: state.tenders.filter(tender => tender.id !== action.payload)
      }
    case 'SET_CRITERIA':
      return {
        ...state,
        criteria: action.payload
      }
    case 'SET_OPTIMIZATION_RESULT':
      return {
        ...state,
        optimizationResult: action.payload
      }
    case 'SET_ANALYSIS_METRICS':
      return {
        ...state,
        analysisMetrics: action.payload
      }
    case 'CLEAR_ALL':
      return initialState
    default:
      return state
  }
}

interface TenderContextType {
  state: TenderState
  dispatch: React.Dispatch<TenderAction>
}

const TenderContext = createContext<TenderContextType | undefined>(undefined)

export function TenderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tenderReducer, initialState)

  return (
    <TenderContext.Provider value={{ state, dispatch }}>
      {children}
    </TenderContext.Provider>
  )
}

export function useTender() {
  const context = useContext(TenderContext)
  if (context === undefined) {
    throw new Error('useTender must be used within a TenderProvider')
  }
  return context
} 