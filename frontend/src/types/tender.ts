export interface TenderOffer {
  id: string
  supplierName: string
  projectName: string
  totalCost: number
  currency: string
  deliveryTime: number // in days
  qualityScore: number // 1-10
  reliabilityScore: number // 1-10
  technicalScore: number // 1-10
  financialStability: number // 1-10
  pastPerformance: number // 1-10
  riskLevel: 'low' | 'medium' | 'high'
  description: string
  submissionDate: string
  validityPeriod: number // in days
  terms: string
  attachments?: string[]
  totalScore?: number // Added for optimization calculations
}

export interface TenderCriteria {
  costWeight: number
  qualityWeight: number
  deliveryWeight: number
  reliabilityWeight: number
  technicalWeight: number
  financialWeight: number
  performanceWeight: number
  riskWeight: number
}

export interface OptimizationResult {
  selectedTenders: TenderOffer[]
  totalCost: number
  averageQuality: number
  averageDeliveryTime: number
  riskScore: number
  overallScore: number
  reasoning: string
}

export interface AnalysisMetrics {
  costAnalysis: {
    min: number
    max: number
    average: number
    median: number
  }
  qualityAnalysis: {
    min: number
    max: number
    average: number
    distribution: Record<string, number>
  }
  deliveryAnalysis: {
    min: number
    max: number
    average: number
    distribution: Record<string, number>
  }
  supplierAnalysis: {
    totalSuppliers: number
    uniqueSuppliers: number
    supplierPerformance: Record<string, number>
  }
} 