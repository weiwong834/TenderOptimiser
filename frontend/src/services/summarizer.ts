export interface SummaryData {
  summary: string
  keyPoints: string[]
  recommendations: string[]
  riskFactors: string[]
  confidence: number
}

export class TenderSummarizer {
  private static instance: TenderSummarizer

  static getInstance(): TenderSummarizer {
    if (!TenderSummarizer.instance) {
      TenderSummarizer.instance = new TenderSummarizer()
    }
    return TenderSummarizer.instance
  }

  async summarizeTender(text: string): Promise<SummaryData> {
    // Simulate AI-powered summarization
    return new Promise((resolve) => {
      setTimeout(() => {
        const summary = this.generateSummary(text)
        resolve(summary)
      }, 1500)
    })
  }

  private generateSummary(text: string): SummaryData {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    
    // Extract key information
    const supplier = this.extractSupplier(text)
    const cost = this.extractCost(text)
    const delivery = this.extractDelivery(text)
    const quality = this.extractQuality(text)
    const risk = this.extractRisk(text)

    // Generate summary
    const summary = this.createSummary(supplier, cost, delivery, quality, risk)
    
    // Extract key points
    const keyPoints = this.extractKeyPoints(text)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(cost, quality, risk, delivery)
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(text, risk, delivery, cost)

    return {
      summary,
      keyPoints,
      recommendations,
      riskFactors,
      confidence: 0.85
    }
  }

  private extractSupplier(text: string): string {
    const match = text.match(/(?:supplier|company|vendor|contractor)[:\s]+([^\n\r,]+)/i)
    return match ? match[1].trim() : 'Unknown Supplier'
  }

  private extractCost(text: string): number {
    const match = text.match(/(?:total|cost|price|amount)[:\s]*[\$€£¥]?([\d,]+(?:\.\d{2})?)/i)
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0
  }

  private extractDelivery(text: string): number {
    const match = text.match(/(?:delivery|lead time|duration)[:\s]*(\d+)\s*(?:days?|weeks?|months?)/i)
    return match ? parseInt(match[1]) : 0
  }

  private extractQuality(text: string): number {
    const match = text.match(/(?:quality|grade)[:\s]*(\d+(?:\.\d+)?)\s*(?:out of 10|\/10)?/i)
    return match ? parseFloat(match[1]) : 5
  }

  private extractRisk(text: string): string {
    const match = text.match(/(?:risk|risk level)[:\s]*(low|medium|high)/i)
    return match ? match[1].toLowerCase() : 'medium'
  }

  private createSummary(supplier: string, cost: number, delivery: number, quality: number, risk: string): string {
    const costFormatted = cost > 0 ? `$${cost.toLocaleString()}` : 'Not specified'
    const deliveryFormatted = delivery > 0 ? `${delivery} days` : 'Not specified'
    
    let summary = `${supplier} has submitted a tender proposal with a total cost of ${costFormatted}. `
    
    if (delivery > 0) {
      summary += `The delivery timeline is ${deliveryFormatted}. `
    }
    
    if (quality > 0) {
      summary += `Quality score is ${quality}/10. `
    }
    
    summary += `Risk level is assessed as ${risk}. `
    
    // Add context based on values
    if (cost > 100000) {
      summary += 'This is a high-value tender requiring careful consideration. '
    }
    
    if (quality >= 8) {
      summary += 'The supplier demonstrates high quality standards. '
    }
    
    if (risk === 'high') {
      summary += 'Risk mitigation strategies should be considered. '
    }
    
    return summary
  }

  private extractKeyPoints(text: string): string[] {
    const keyPoints: string[] = []
    const lines = text.split('\n').filter(line => line.trim().length > 10)
    
    // Look for important information
    if (text.match(/payment|terms/i)) {
      keyPoints.push('Payment terms are specified')
    }
    
    if (text.match(/warranty|guarantee/i)) {
      keyPoints.push('Warranty/guarantee information included')
    }
    
    if (text.match(/experience|track record/i)) {
      keyPoints.push('Supplier experience/track record mentioned')
    }
    
    if (text.match(/certification|accreditation/i)) {
      keyPoints.push('Certifications or accreditations listed')
    }
    
    if (text.match(/team|personnel/i)) {
      keyPoints.push('Team/personnel details provided')
    }
    
    // Add cost-related points
    const cost = this.extractCost(text)
    if (cost > 0) {
      if (cost > 100000) {
        keyPoints.push('High-value tender requiring budget approval')
      } else if (cost < 50000) {
        keyPoints.push('Cost-effective option within budget')
      }
    }
    
    // Add delivery-related points
    const delivery = this.extractDelivery(text)
    if (delivery > 0) {
      if (delivery <= 30) {
        keyPoints.push('Fast delivery timeline')
      } else if (delivery > 60) {
        keyPoints.push('Extended delivery period')
      }
    }
    
    return keyPoints.slice(0, 5) // Limit to 5 key points
  }

  private generateRecommendations(cost: number, quality: number, risk: string, delivery: number): string[] {
    const recommendations: string[] = []
    
    // Cost-based recommendations
    if (cost > 100000) {
      recommendations.push('Consider negotiating payment terms for large investment')
    }
    
    if (cost < 50000 && quality >= 8) {
      recommendations.push('Excellent value proposition - strong candidate')
    }
    
    // Quality-based recommendations
    if (quality >= 9) {
      recommendations.push('High-quality supplier - prioritize for consideration')
    }
    
    if (quality <= 6) {
      recommendations.push('Quality concerns - request additional details')
    }
    
    // Risk-based recommendations
    if (risk === 'high') {
      recommendations.push('Implement risk mitigation strategies')
      recommendations.push('Consider performance bonds or guarantees')
    }
    
    if (risk === 'low' && quality >= 7) {
      recommendations.push('Low-risk, reliable option')
    }
    
    // Delivery-based recommendations
    if (delivery <= 30) {
      recommendations.push('Fast delivery - suitable for urgent projects')
    }
    
    if (delivery > 60) {
      recommendations.push('Extended timeline - ensure project schedule allows')
    }
    
    return recommendations.slice(0, 4) // Limit to 4 recommendations
  }

  private identifyRiskFactors(text: string, risk: string, delivery: number, cost: number): string[] {
    const riskFactors: string[] = []
    
    // Risk level factors
    if (risk === 'high') {
      riskFactors.push('High risk level indicated')
    }
    
    // Delivery risks
    if (delivery > 90) {
      riskFactors.push('Very long delivery timeline')
    }
    
    if (delivery <= 15) {
      riskFactors.push('Very short delivery timeline - potential quality risks')
    }
    
    // Cost risks
    if (cost > 200000) {
      riskFactors.push('High financial commitment required')
    }
    
    if (cost < 10000) {
      riskFactors.push('Very low cost - potential quality concerns')
    }
    
    // Text-based risk factors
    if (text.match(/new|startup|recently established/i)) {
      riskFactors.push('New or recently established company')
    }
    
    if (text.match(/limited experience|no track record/i)) {
      riskFactors.push('Limited experience or track record')
    }
    
    if (text.match(/financial difficulties|bankruptcy/i)) {
      riskFactors.push('Financial stability concerns')
    }
    
    if (text.match(/delays|extensions/i)) {
      riskFactors.push('History of project delays')
    }
    
    return riskFactors.slice(0, 3) // Limit to 3 risk factors
  }

  // Batch summarization for multiple documents
  async summarizeMultipleDocuments(texts: string[]): Promise<SummaryData[]> {
    const summaries: SummaryData[] = []
    
    for (const text of texts) {
      try {
        const summary = await this.summarizeTender(text)
        summaries.push(summary)
      } catch (error) {
        console.error('Error summarizing document:', error)
        summaries.push({
          summary: 'Unable to generate summary',
          keyPoints: [],
          recommendations: [],
          riskFactors: [],
          confidence: 0
        })
      }
    }
    
    return summaries
  }

  // Generate executive summary for multiple tenders
  generateExecutiveSummary(summaries: SummaryData[]): string {
    if (summaries.length === 0) {
      return 'No tenders available for summary.'
    }
    
    const totalTenders = summaries.length
    const avgConfidence = summaries.reduce((sum, s) => sum + s.confidence, 0) / totalTenders
    
    let executiveSummary = `Executive Summary: ${totalTenders} tender(s) analyzed with ${(avgConfidence * 100).toFixed(1)}% average confidence.\n\n`
    
    // Group by risk level
    const highRisk = summaries.filter(s => s.riskFactors.length > 1)
    const lowRisk = summaries.filter(s => s.riskFactors.length <= 1)
    
    if (highRisk.length > 0) {
      executiveSummary += `⚠️ ${highRisk.length} tender(s) with elevated risk factors requiring attention.\n`
    }
    
    if (lowRisk.length > 0) {
      executiveSummary += `✅ ${lowRisk.length} tender(s) with acceptable risk profiles.\n`
    }
    
    // Key recommendations
    const allRecommendations = summaries.flatMap(s => s.recommendations)
    const uniqueRecommendations = [...new Set(allRecommendations)]
    
    if (uniqueRecommendations.length > 0) {
      executiveSummary += `\nKey Recommendations:\n`
      uniqueRecommendations.slice(0, 3).forEach(rec => {
        executiveSummary += `• ${rec}\n`
      })
    }
    
    return executiveSummary
  }
}

export default TenderSummarizer 