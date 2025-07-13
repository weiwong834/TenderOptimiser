import { TenderOffer } from '../types/tender'

export interface ExtractedData {
  supplierName?: string
  projectName?: string
  totalCost?: number
  currency?: string
  deliveryTime?: number
  qualityScore?: number
  reliabilityScore?: number
  technicalScore?: number
  financialStability?: number
  pastPerformance?: number
  riskLevel?: 'low' | 'medium' | 'high'
  description?: string
  terms?: string
  confidence: number // 0-1, how confident we are in the extraction
  [key: string]: any // Allow dynamic property access
}

export class DocumentProcessor {
  private static instance: DocumentProcessor

  static getInstance(): DocumentProcessor {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor()
    }
    return DocumentProcessor.instance
  }

  async processDocument(file: File): Promise<ExtractedData> {
    const fileType = this.getFileType(file)
    
    switch (fileType) {
      case 'pdf':
        return this.processPDF(file)
      case 'image':
        return this.processImage(file)
      case 'text':
        return this.processText(file)
      case 'document':
        return this.processWordDocument(file)
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (extension === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) return 'image'
    if (['txt', 'csv'].includes(extension || '')) return 'text'
    if (['doc', 'docx', 'rtf'].includes(extension || '')) return 'document'
    
    return 'unknown'
  }

  private async processPDF(file: File): Promise<ExtractedData> {
    // Simulate PDF processing with OCR and text extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        const extractedData = this.extractFromText(this.generateSampleText())
        resolve({
          ...extractedData,
          confidence: 0.85
        })
      }, 2000)
    })
  }

  private async processImage(file: File): Promise<ExtractedData> {
    // Simulate image processing with OCR
    return new Promise((resolve) => {
      setTimeout(() => {
        const extractedData = this.extractFromText(this.generateSampleText())
        resolve({
          ...extractedData,
          confidence: 0.75
        })
      }, 1500)
    })
  }

  private async processText(file: File): Promise<ExtractedData> {
    const text = await file.text()
    const extractedData = this.extractFromText(text)
    return {
      ...extractedData,
      confidence: 0.90
    }
  }

  private async processWordDocument(file: File): Promise<ExtractedData> {
    // Simulate document processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const extractedData = this.extractFromText(this.generateSampleText())
        resolve({
          ...extractedData,
          confidence: 0.80
        })
      }, 1800)
    })
  }

  private extractFromText(text: string): ExtractedData {
    const data: ExtractedData = { confidence: 0.5 }

    // Extract supplier name (look for patterns like "Supplier:", "Company:", etc.)
    const supplierMatch = text.match(/(?:supplier|company|vendor|contractor)[:\s]+([^\n\r,]+)/i)
    if (supplierMatch) {
      data.supplierName = supplierMatch[1].trim()
    }

    // Extract project name
    const projectMatch = text.match(/(?:project|tender|proposal)[:\s]+([^\n\r,]+)/i)
    if (projectMatch) {
      data.projectName = projectMatch[1].trim()
    }

    // Extract cost (look for currency patterns)
    const costMatch = text.match(/(?:total|cost|price|amount)[:\s]*[\$€£¥]?([\d,]+(?:\.\d{2})?)/i)
    if (costMatch) {
      data.totalCost = parseFloat(costMatch[1].replace(/,/g, ''))
    }

    // Extract currency
    const currencyMatch = text.match(/[\$€£¥]/)
    if (currencyMatch) {
      data.currency = currencyMatch[0] === '$' ? 'USD' : 
                     currencyMatch[0] === '€' ? 'EUR' : 
                     currencyMatch[0] === '£' ? 'GBP' : 'JPY'
    }

    // Extract delivery time
    const deliveryMatch = text.match(/(?:delivery|lead time|duration)[:\s]*(\d+)\s*(?:days?|weeks?|months?)/i)
    if (deliveryMatch) {
      data.deliveryTime = parseInt(deliveryMatch[1])
    }

          // Extract quality score
      const qualityMatch = text.match(/(?:quality|grade)[:\s]*(\d+(?:\.\d+)?)\s*(?:out of 10|out of ten|\/10)?/i)
    if (qualityMatch) {
      data.qualityScore = Math.min(10, Math.max(1, parseFloat(qualityMatch[1])))
    }

    // Extract risk level
    const riskMatch = text.match(/(?:risk|risk level)[:\s]*(low|medium|high)/i)
    if (riskMatch) {
      data.riskLevel = riskMatch[1].toLowerCase() as 'low' | 'medium' | 'high'
    }

    // Extract description (first paragraph or sentence)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    if (sentences.length > 0) {
      data.description = sentences[0].trim()
    }

    return data
  }

  private generateSampleText(): string {
    const samples = [
      `TENDER PROPOSAL
Supplier: ABC Construction Ltd.
Project: Office Building Renovation
Total Cost: $125,000 USD
Delivery Time: 45 days
Quality Score: 8.5/10
Risk Level: Medium
Description: Comprehensive renovation services including electrical, plumbing, and structural work.`,
      
      `COMPANY: XYZ Services Inc.
PROJECT NAME: IT Infrastructure Upgrade
AMOUNT: €85,000
LEAD TIME: 30 days
QUALITY GRADE: 9/10
RISK: Low
Terms: Payment 50% upfront, 50% upon completion.`,
      
      `Vendor: Tech Solutions Corp
Tender: Software Development
Price: $200,000
Duration: 60 days
Quality: 7.5 out of 10
Risk Level: High
Description: Custom software development for inventory management system.`
    ]
    
    return samples[Math.floor(Math.random() * samples.length)]
  }

  // Batch processing for multiple files
  async processMultipleFiles(files: File[]): Promise<ExtractedData[]> {
    const results: ExtractedData[] = []
    
    for (const file of files) {
      try {
        const result = await this.processDocument(file)
        results.push(result)
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        results.push({ confidence: 0 })
      }
    }
    
    return results
  }

  // Merge extracted data from multiple sources
  mergeExtractedData(dataArray: ExtractedData[]): ExtractedData {
    const merged: ExtractedData = { confidence: 0 }
    const weights: Record<string, number> = {}

    dataArray.forEach(data => {
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'confidence') return
        
        if (value !== undefined) {
          if (!merged[key]) {
            merged[key] = value
            weights[key] = data.confidence
          } else if (data.confidence > weights[key]) {
            merged[key] = value
            weights[key] = data.confidence
          }
        }
      })
    })

    // Calculate average confidence
    const totalConfidence = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    merged.confidence = totalConfidence / Object.keys(weights).length

    return merged
  }

  // Validate extracted data
  validateExtractedData(data: ExtractedData): { isValid: boolean; missingFields: string[] } {
    const requiredFields = ['supplierName', 'totalCost']
    const missingFields: string[] = []

    requiredFields.forEach(field => {
      if (!data[field]) {
        missingFields.push(field)
      }
    })

    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  }
}

export default DocumentProcessor 