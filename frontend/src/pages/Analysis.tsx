import { useState } from 'react'
import { useTender } from '../context/TenderContext'
import { TrendingUp, TrendingDown, DollarSign, Clock, Award, AlertTriangle, Sparkles, Target, Zap, Scale, BarChart3, PieChart, LineChart } from 'lucide-react'

const Analysis = () => {
  const { state } = useTender()
  const { tenders } = state

  if (tenders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Advanced Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">No tenders available for analysis. Please add some tenders first.</p>
      </div>
    )
  }

  const tender = tenders[0] // We only have one tender in this workflow

  // Calculate scores based on the new weighted criteria
  const relevance = tender.qualityScore || 7.5
  const profitability = tender.technicalScore || 8.0
  const resourcesFeasibility = tender.reliabilityScore || 7.0
  const risk = tender.financialStability || 6.5
  const strategicValue = tender.pastPerformance || 8.5
  
  // Calculate weighted total score
  const totalScore = (
    (relevance * 0.25) +
    (profitability * 0.30) +
    (resourcesFeasibility * 0.20) +
    (risk * 0.15) +
    (strategicValue * 0.10)
  )

  // Simulate historical data for comparison
  const historicalData = {
    averageScores: {
      relevance: 7.2,
      profitability: 7.8,
      resourcesFeasibility: 7.1,
      risk: 6.9,
      strategicValue: 7.5
    },
    marketInsights: [
      "Similar projects show 15% higher profitability scores",
      "Resource feasibility is within normal range for this sector",
      "Risk assessment aligns with industry standards",
      "Strategic value exceeds 80% of comparable tenders"
    ],
    recommendations: [
      "Consider negotiating on resource allocation",
      "Highlight strategic partnerships in proposal",
      "Emphasize risk mitigation strategies",
      "Focus on profitability optimization"
    ],
    priceRange: {
      min: 75000,
      max: 125000
    },
    successRate: 0.78,
    pastTenders: [
      { title: "Cloud Infrastructure Development", cost: 95000 },
      { title: "Mobile App Development Platform", cost: 88000 },
      { title: "Data Analytics Dashboard", cost: 92000 },
      { title: "E-commerce Platform Integration", cost: 105000 },
      { title: "AI-Powered Customer Service System", cost: 78000 },
      { title: "Cybersecurity Framework Implementation", cost: 112000 },
      { title: "IoT Device Management Platform", cost: 85000 },
      { title: "Blockchain Supply Chain Solution", cost: 98000 },
      { title: "Machine Learning Model Deployment", cost: 89000 },
      { title: "Digital Transformation Consulting", cost: 75000 },
      { title: "API Gateway Development", cost: 82000 },
      { title: "Microservices Architecture", cost: 115000 },
      { title: "DevOps Automation Platform", cost: 93000 },
      { title: "Business Intelligence System", cost: 87000 },
      { title: "Cloud Migration Strategy", cost: 102000 },
      { title: "Mobile Banking Application", cost: 95000 },
      { title: "Healthcare Data Management", cost: 108000 },
      { title: "Educational Technology Platform", cost: 79000 },
      { title: "Logistics Management System", cost: 91000 },
      { title: "Real-time Analytics Engine", cost: 97000 }
    ]
  }

  // AI Keywords Analysis
  const keywords = {
    technical: ['Technical', 'Engineering', 'Infrastructure', 'Development', 'Implementation', 'System', 'Technology'],
    business: ['Business', 'Strategic', 'Partnership', 'Growth', 'Market', 'Opportunity', 'Value'],
    operational: ['Operational', 'Efficiency', 'Process', 'Management', 'Quality', 'Performance', 'Delivery'],
    risk: ['Risk', 'Compliance', 'Security', 'Safety', 'Regulatory', 'Assessment', 'Mitigation'],
    resource: ['Resource', 'Capacity', 'Expertise', 'Team', 'Skills', 'Experience', 'Capability']
  }
  
  // Determine focus areas based on scores
  const focusAreas = []
  if (relevance > 7) focusAreas.push('technical')
  if (profitability > 7) focusAreas.push('business')
  if (resourcesFeasibility > 7) focusAreas.push('operational')
  if (risk > 7) focusAreas.push('risk')
  if (strategicValue > 7) focusAreas.push('resource')
  
  // Generate relevant keywords
  const relevantKeywords = focusAreas.flatMap(area => keywords[area as keyof typeof keywords]).slice(0, 8)
  
  // Add project-specific keywords
  const projectKeywords = [
    tender.projectName?.split(' ').filter(word => word.length > 3).slice(0, 3) || [],
    tender.supplierName?.split(' ').filter(word => word.length > 3).slice(0, 2) || []
  ].flat()
  
  const allKeywords = [...new Set([...relevantKeywords, ...projectKeywords])].slice(0, 12)

  return (
    <div className="space-y-8 bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analysis</h1>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Insights</span>
        </div>
      </div>

      {/* 1. AI Summary of Keywords and Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>AI Analysis & Keywords</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>AI Insights</span>
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Based on the tender analysis, this project shows strong alignment with {focusAreas.length > 0 ? focusAreas.join(', ') : 'core business objectives'}.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The keyword analysis indicates a focus on {['technical excellence', 'business growth', 'operational efficiency'].slice(0, 3).join(', ')}.
              </p>
            </div>
          </div>
          
          {/* Extracted Keywords */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>AI Extracted Keywords</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {allKeywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-white dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-full text-sm text-green-700 dark:text-green-300 font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

            {/* 2. Historical Comparison & Cost Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Historical Comparison & Cost Analysis</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Past Tenders */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Past Tenders</h3>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {historicalData.pastTenders.map((pastTender, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{pastTender.title}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">${pastTender.cost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Price Range</p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">${historicalData.priceRange.min.toLocaleString()} - ${historicalData.priceRange.max.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Cost Recommendations */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Cost Recommendations</h3>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Optimization</span>
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">•</span>
                  <span>Resource optimization: 10-15% cost reduction</span>
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">•</span>
                  <span>Timeline negotiation: 5-8% savings</span>
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">•</span>
                  <span>Strategic partnerships for shared costs</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Market Position</span>
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0">•</span>
                  <span>Pricing aligns with market standards</span>
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0">•</span>
                  <span>Competitive quality-to-cost ratio</span>
                </li>
                <li className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0">•</span>
                  <span>Consider premium pricing for quality</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Cost Analysis */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Cost Analysis</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Recommended Range</p>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">$85K - $110K</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimal Price</p>
                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">$95,000</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Cost Factors</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quality Premium:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Risk Adjustment:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">+8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Market Competition:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">-5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Strategic Value:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">+12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights & Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Strategic Recommendations</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Market Insights</h3>
                         <ul className="space-y-2">
               {historicalData.marketInsights.map((insight, index) => (
                 <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                   <span className="text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0">•</span>
                   <span>{insight}</span>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Action Items</h3>
                         <ul className="space-y-2">
               {historicalData.recommendations.map((rec, index) => (
                 <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                   <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">•</span>
                   <span>{rec}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analysis 