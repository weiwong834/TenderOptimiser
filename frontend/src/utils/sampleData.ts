import { TenderOffer } from '../types/tender'

export const sampleTenders: TenderOffer[] = [
  {
    id: 'tender-1',
    supplierName: 'ABC Construction Ltd.',
    projectName: 'Office Building Renovation',
    totalCost: 125000,
    currency: 'USD',
    deliveryTime: 45,
    qualityScore: 8.5,
    reliabilityScore: 8,
    technicalScore: 9,
    financialStability: 8,
    pastPerformance: 7,
    riskLevel: 'medium',
    description: 'Comprehensive renovation services including electrical, plumbing, and structural work.',
    submissionDate: '2024-01-15',
    validityPeriod: 30,
    terms: 'Payment 30% upfront, 40% at 50% completion, 30% upon final delivery.'
  },
  {
    id: 'tender-2',
    supplierName: 'XYZ Services Inc.',
    projectName: 'IT Infrastructure Upgrade',
    totalCost: 85000,
    currency: 'EUR',
    deliveryTime: 30,
    qualityScore: 9,
    reliabilityScore: 9,
    technicalScore: 8.5,
    financialStability: 9,
    pastPerformance: 8,
    riskLevel: 'low',
    description: 'Complete IT infrastructure upgrade including servers, networking, and security systems.',
    submissionDate: '2024-01-20',
    validityPeriod: 45,
    terms: 'Payment 50% upfront, 50% upon completion.'
  },
  {
    id: 'tender-3',
    supplierName: 'Tech Solutions Corp',
    projectName: 'Software Development',
    totalCost: 200000,
    currency: 'USD',
    deliveryTime: 60,
    qualityScore: 7.5,
    reliabilityScore: 7,
    technicalScore: 9.5,
    financialStability: 6,
    pastPerformance: 6,
    riskLevel: 'high',
    description: 'Custom software development for inventory management system with mobile app.',
    submissionDate: '2024-01-25',
    validityPeriod: 60,
    terms: 'Payment 25% upfront, 25% at milestone 1, 25% at milestone 2, 25% upon delivery.'
  }
]

export const sampleDocuments = [
  {
    name: 'tender_proposal_abc.pdf',
    content: `TENDER PROPOSAL
Supplier: ABC Construction Ltd.
Project: Office Building Renovation
Total Cost: $125,000 USD
Delivery Time: 45 days
Quality Score: 8.5/10
Risk Level: Medium
Description: Comprehensive renovation services including electrical, plumbing, and structural work.`
  },
  {
    name: 'xyz_services_quote.docx',
    content: `COMPANY: XYZ Services Inc.
PROJECT NAME: IT Infrastructure Upgrade
AMOUNT: €85,000
LEAD TIME: 30 days
QUALITY GRADE: 9/10
RISK: Low
Terms: Payment 50% upfront, 50% upon completion.`
  },
  {
    name: 'tech_solutions_proposal.txt',
    content: `Vendor: Tech Solutions Corp
Tender: Software Development
Price: $200,000
Duration: 60 days
Quality: 7.5 out of 10
Risk Level: High
Description: Custom software development for inventory management system.`
  }
]

export const createSampleFile = (document: typeof sampleDocuments[0]): File => {
  const blob = new Blob([document.content], { type: 'text/plain' })
  return new File([blob], document.name, { type: 'text/plain' })
}

export const generateSampleFiles = (): File[] => {
  return sampleDocuments.map(doc => createSampleFile(doc))
} 