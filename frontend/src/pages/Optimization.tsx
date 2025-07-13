import { useState } from 'react'
import { useTender } from '../context/TenderContext'
import { TenderOffer, TenderCriteria, OptimizationResult } from '../types/tender'
import { Settings, TrendingUp, DollarSign, Clock, Award, CheckCircle, AlertTriangle } from 'lucide-react'

const Optimization = () => {
  const { state, dispatch } = useTender()
  const { tenders, criteria } = state
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  if (tenders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tender Optimization</h1>
        <p className="text-gray-600 mb-6">No tenders available for optimization. Please add some tenders first.</p>
      </div>
    )
  }

  // Optimization algorithm
  const optimizeTenders = () => {
    setIsOptimizing(true)
    
    // Simulate processing time
    setTimeout(() => {
      const result = calculateOptimalSelection(tenders, criteria)
      setOptimizationResult(result)
      dispatch({ type: 'SET_OPTIMIZATION_RESULT', payload: result })
      setIsOptimizing(false)
    }, 1500)
  }

  const calculateOptimalSelection = (tenders: TenderOffer[], criteria: TenderCriteria): OptimizationResult => {
    // Calculate weighted scores for each tender using new business-relevant criteria
    const scoredTenders = tenders.map(tender => {
      // Relevance (25%) - Based on quality score and technical score
      const relevanceScore = ((tender.qualityScore + tender.technicalScore) / 20) * 25
      
      // Profitability (30%) - Based on cost efficiency and financial stability
      const maxCost = Math.max(...tenders.map(t => t.totalCost))
      const costEfficiency = (1 - (tender.totalCost / maxCost))
      const profitabilityScore = (costEfficiency * 0.7 + (tender.financialStability / 10) * 0.3) * 30
      
      // Resources feasibility (20%) - Based on delivery time and reliability
      const maxDeliveryTime = Math.max(...tenders.map(t => t.deliveryTime))
      const deliveryEfficiency = (1 - (tender.deliveryTime / maxDeliveryTime))
      const resourcesScore = (deliveryEfficiency * 0.6 + (tender.reliabilityScore / 10) * 0.4) * 20
      
      // Risk (15%) - Based on risk level and past performance
      const riskMultiplier = tender.riskLevel === 'low' ? 1 : tender.riskLevel === 'medium' ? 0.7 : 0.4
      const riskScore = (riskMultiplier * 0.7 + (tender.pastPerformance / 10) * 0.3) * 15
      
      // Strategic value (10%) - Based on overall supplier capabilities
      const strategicScore = ((tender.qualityScore + tender.reliabilityScore + tender.financialStability) / 30) * 10

      const totalScore = relevanceScore + profitabilityScore + resourcesScore + riskScore + strategicScore

      return { ...tender, totalScore }
    })

    // Sort by score and select top performers
    const sortedTenders = scoredTenders.sort((a, b) => b.totalScore - a.totalScore)
    const selectedTenders = sortedTenders.slice(0, Math.min(3, sortedTenders.length))

    // Calculate result metrics
    const totalCost = selectedTenders.reduce((sum, t) => sum + t.totalCost, 0)
    const averageQuality = selectedTenders.reduce((sum, t) => sum + t.qualityScore, 0) / selectedTenders.length
    const averageDeliveryTime = selectedTenders.reduce((sum, t) => sum + t.deliveryTime, 0) / selectedTenders.length
    const riskScore = selectedTenders.reduce((sum, t) => {
      const riskValue = t.riskLevel === 'low' ? 1 : t.riskLevel === 'medium' ? 2 : 3
      return sum + riskValue
    }, 0) / selectedTenders.length

    const overallScore = selectedTenders.reduce((sum, t) => sum + t.totalScore, 0) / selectedTenders.length

    // Generate reasoning
    const reasoning = generateReasoning(selectedTenders, criteria)

    return {
      selectedTenders,
      totalCost,
      averageQuality,
      averageDeliveryTime,
      riskScore,
      overallScore,
      reasoning
    }
  }

  const generateReasoning = (selectedTenders: TenderOffer[], criteria: TenderCriteria): string => {
    const topTender = selectedTenders[0]
    const reasons = []

    // Check relevance factors
    if (topTender.qualityScore >= 8 || topTender.technicalScore >= 8) {
      reasons.push('High relevance score')
    }
    
    // Check profitability factors
    const avgCost = selectedTenders.reduce((sum, t) => sum + t.totalCost, 0) / selectedTenders.length
    if (topTender.totalCost < avgCost) {
      reasons.push('Cost-effective pricing')
    }
    if (topTender.financialStability >= 8) {
      reasons.push('Strong financial stability')
    }
    
    // Check resources feasibility
    if (topTender.deliveryTime <= 30) {
      reasons.push('Fast delivery capability')
    }
    if (topTender.reliabilityScore >= 8) {
      reasons.push('High reliability')
    }
    
    // Check risk factors
    if (topTender.riskLevel === 'low') {
      reasons.push('Low risk profile')
    }
    if (topTender.pastPerformance >= 8) {
      reasons.push('Excellent past performance')
    }

    return `Selected based on: ${reasons.join(', ')}. Top performer: ${topTender.supplierName} with ${(topTender.totalScore || 0).toFixed(2)} score.`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tender Optimization</h1>
        <button
          onClick={optimizeTenders}
          disabled={isOptimizing}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
        >
          <Settings className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Optimizing...' : 'Run Optimization'}</span>
        </button>
      </div>

      {/* Optimization Criteria */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Optimization Criteria</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Relevance</p>
            <p className="text-lg font-semibold text-purple-600">25%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Profitability</p>
            <p className="text-lg font-semibold text-purple-600">30%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Resources</p>
            <p className="text-lg font-semibold text-purple-600">20%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Risk</p>
            <p className="text-lg font-semibold text-purple-600">15%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Strategic</p>
            <p className="text-lg font-semibold text-purple-600">10%</p>
          </div>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Optimization Results</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Selected Tenders</p>
                <p className="text-2xl font-bold text-gray-900">{optimizationResult.selectedTenders.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-purple-600">${optimizationResult.totalCost.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold text-purple-600">{optimizationResult.averageQuality.toFixed(1)}/10</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-purple-600">{optimizationResult.overallScore.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Selected Tenders */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Tenders</h3>
            <div className="space-y-4">
              {optimizationResult.selectedTenders.map((tender, index) => (
                <div key={tender.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-purple-400' : 'bg-purple-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{tender.supplierName}</h4>
                        <p className="text-sm text-gray-600">{tender.projectName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${tender.totalCost.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Score: {tender.totalScore?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <span className="text-gray-600">Quality: {tender.qualityScore}/10</span>
                    <span className="text-gray-600">Delivery: {tender.deliveryTime} days</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tender.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      tender.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tender.riskLevel} risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Reasoning</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-800">{optimizationResult.reasoning}</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Delivery Time:</span>
                  <span className="font-semibold">{optimizationResult.averageDeliveryTime.toFixed(1)} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Risk Score:</span>
                  <span className="font-semibold">{optimizationResult.riskScore.toFixed(1)}/3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost per Tender:</span>
                  <span className="font-semibold">${(optimizationResult.totalCost / optimizationResult.selectedTenders.length).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {optimizationResult.averageQuality >= 8 && (
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>High quality selection achieved</span>
                  </div>
                )}
                {optimizationResult.riskScore <= 1.5 && (
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Low risk profile maintained</span>
                  </div>
                )}
                {optimizationResult.averageDeliveryTime <= 30 && (
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Fast delivery times secured</span>
                  </div>
                )}
                {optimizationResult.totalCost > 100000 && (
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Consider budget constraints</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!optimizationResult && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Optimization Works</h2>
          <div className="space-y-4 text-gray-600">
            <p>Our optimization algorithm uses business-relevant criteria to find the best tender combination:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Relevance (25%):</strong> Quality and technical capabilities alignment</li>
              <li><strong>Profitability (30%):</strong> Cost efficiency and financial stability</li>
              <li><strong>Resources Feasibility (20%):</strong> Delivery capability and reliability</li>
              <li><strong>Risk (15%):</strong> Risk level and past performance assessment</li>
              <li><strong>Strategic Value (10%):</strong> Overall supplier capabilities and fit</li>
            </ul>
            <p className="mt-4">Click "Run Optimization" to analyze your tenders and get the best recommendations based on these criteria.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Optimization 