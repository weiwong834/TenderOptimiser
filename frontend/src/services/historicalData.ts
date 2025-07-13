import { TenderOffer } from '../types/tender'

export interface HistoricalComparison {
  priceRange: {
    min: number
    max: number
    average: number
    percentile: number // Where the current tender falls in the range
  }
  scoreComparison: {
    historicalAverage: number
    historicalMax: number
    historicalMin: number
    currentScore: number
    percentile: number
  }
  recommendations: string[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    confidence: number
  }
  marketInsights: {
    trend: 'increasing' | 'decreasing' | 'stable'
    averageDeliveryTime: number
    commonRiskFactors: string[]
    competitiveAdvantages: string[]
  }
}

export class HistoricalDataService {
  private static instance: HistoricalDataService

  static getInstance(): HistoricalDataService {
    if (!HistoricalDataService.instance) {
      HistoricalDataService.instance = new HistoricalDataService()
    }
    return HistoricalDataService.instance
  }

  // Simulate historical data based on the uploaded tender
  async analyzeAgainstHistoricalData(tender: TenderOffer): Promise<HistoricalComparison> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate realistic historical data based on the tender's characteristics
    const baseCost = tender.totalCost
    const baseScore = (tender.qualityScore + tender.technicalScore + tender.reliabilityScore + tender.financialStability + tender.pastPerformance) / 5

    // Generate price range (historical data)
    const priceVariation = 0.3 // 30% variation
    const minPrice = baseCost * (1 - priceVariation)
    const maxPrice = baseCost * (1 + priceVariation)
    const avgPrice = (minPrice + maxPrice) / 2
    const currentPercentile = ((baseCost - minPrice) / (maxPrice - minPrice)) * 100

    // Generate score comparison
    const scoreVariation = 2 // ±2 points variation
    const historicalMin = Math.max(1, baseScore - scoreVariation)
    const historicalMax = Math.min(10, baseScore + scoreVariation)
    const historicalAvg = (historicalMin + historicalMax) / 2
    const scorePercentile = ((baseScore - historicalMin) / (historicalMax - historicalMin)) * 100

    // Generate recommendations
    const recommendations = this.generateRecommendations(tender, currentPercentile, scorePercentile)

    // Generate risk assessment
    const riskAssessment = this.generateRiskAssessment(tender)

    // Generate market insights
    const marketInsights = this.generateMarketInsights(tender)

    return {
      priceRange: {
        min: Math.round(minPrice),
        max: Math.round(maxPrice),
        average: Math.round(avgPrice),
        percentile: Math.round(currentPercentile)
      },
      scoreComparison: {
        historicalAverage: Math.round(historicalAvg * 10) / 10,
        historicalMax: Math.round(historicalMax * 10) / 10,
        historicalMin: Math.round(historicalMin * 10) / 10,
        currentScore: Math.round(baseScore * 10) / 10,
        percentile: Math.round(scorePercentile)
      },
      recommendations,
      riskAssessment,
      marketInsights
    }
  }

  private generateRecommendations(tender: TenderOffer, pricePercentile: number, scorePercentile: number): string[] {
    const recommendations: string[] = []

    if (pricePercentile > 80) {
      recommendations.push('Consider negotiating price - this tender is in the upper 20% of historical prices')
    } else if (pricePercentile < 20) {
      recommendations.push('Excellent pricing - this tender is in the lower 20% of historical prices')
    }

    if (scorePercentile > 80) {
      recommendations.push('High quality tender - consider this as a premium option')
    } else if (scorePercentile < 40) {
      recommendations.push('Quality concerns - review technical specifications carefully')
    }

    if (tender.deliveryTime > 60) {
      recommendations.push('Long delivery time - consider impact on project timeline')
    } else if (tender.deliveryTime < 30) {
      recommendations.push('Fast delivery - good for time-sensitive projects')
    }

    if (tender.riskLevel === 'high') {
      recommendations.push('High risk profile - implement additional monitoring and controls')
    }

    if (tender.financialStability < 6) {
      recommendations.push('Financial stability concerns - request additional financial documentation')
    }

    return recommendations
  }

  private generateRiskAssessment(tender: TenderOffer): HistoricalComparison['riskAssessment'] {
    const factors: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let confidence = 0.8

    if (tender.riskLevel === 'high') {
      riskLevel = 'high'
      factors.push('Supplier has high risk rating')
    }

    if (tender.financialStability < 6) {
      factors.push('Below-average financial stability')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    if (tender.pastPerformance < 6) {
      factors.push('Poor historical performance')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    if (tender.deliveryTime > 90) {
      factors.push('Extended delivery timeline')
    }

    if (tender.technicalScore < 6) {
      factors.push('Technical capability concerns')
      if (riskLevel === 'low') riskLevel = 'medium'
    }

    if (factors.length === 0) {
      factors.push('No significant risk factors identified')
      confidence = 0.9
    }

    return {
      level: riskLevel,
      factors,
      confidence
    }
  }

  private generateMarketInsights(tender: TenderOffer): HistoricalComparison['marketInsights'] {
    const insights: HistoricalComparison['marketInsights'] = {
      trend: 'stable',
      averageDeliveryTime: 45,
      commonRiskFactors: [],
      competitiveAdvantages: []
    }

    // Determine trend based on tender characteristics
    if (tender.totalCost > 100000) {
      insights.trend = 'increasing'
    } else if (tender.totalCost < 50000) {
      insights.trend = 'decreasing'
    }

    // Generate common risk factors
    if (tender.riskLevel === 'high') {
      insights.commonRiskFactors.push('Supplier financial instability')
    }
    if (tender.deliveryTime > 60) {
      insights.commonRiskFactors.push('Extended project timelines')
    }
    if (tender.technicalScore < 7) {
      insights.commonRiskFactors.push('Technical complexity')
    }

    // Generate competitive advantages
    if (tender.qualityScore >= 8) {
      insights.competitiveAdvantages.push('High quality standards')
    }
    if (tender.deliveryTime < 30) {
      insights.competitiveAdvantages.push('Fast delivery capability')
    }
    if (tender.financialStability >= 8) {
      insights.competitiveAdvantages.push('Strong financial position')
    }

    return insights
  }
}

export default HistoricalDataService 