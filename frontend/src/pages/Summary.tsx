import { useTender } from '../context/TenderContext'
import { TrendingUp, ArrowRight, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ScoreRadarChart from '../components/ScoreRadarChart'

const Summary = () => {
  const { state } = useTender()
  const { tenders } = state
  const navigate = useNavigate()



  if (tenders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tender Summary</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">No tenders available for summary. Please upload a tender first.</p>
        <button
          onClick={() => navigate('/input')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          Upload Tender
        </button>
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
  
  // Quality score = total score / 10
  const qualityScore = (totalScore / 10).toFixed(1)

  return (
    <div className="space-y-8 bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tender Summary</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/analysis')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Run Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tender Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{tender.supplierName}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{tender.projectName}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Relevance</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{relevance}/10</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">25%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Profitability</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{profitability}/10</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">30%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{resourcesFeasibility}/10</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">20%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Risk</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{risk}/10</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">15%</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Strategic</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{strategicValue}/10</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">10%</p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Performance Score</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{totalScore.toFixed(1)}/10</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Based on weighted criteria: Relevance (25%), Profitability (30%), Resources feasibility (20%), Risk (15%), Strategic value (10%)</p>
        </div>
      </div>

      {/* Interactive Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreRadarChart
          title="Tender Performance Overview"
          data={[
            { criteria: 'Relevance', score: relevance, fullMark: 10 },
            { criteria: 'Profitability', score: profitability, fullMark: 10 },
            { criteria: 'Resources', score: resourcesFeasibility, fullMark: 10 },
            { criteria: 'Risk', score: risk, fullMark: 10 },
            { criteria: 'Strategic', score: strategicValue, fullMark: 10 }
          ]}
        />
      </div>

      {/* Detailed Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Relevance (25%)</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{relevance}/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(relevance / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profitability (30%)</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{profitability}/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(profitability / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resources Feasibility (20%)</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{resourcesFeasibility}/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(resourcesFeasibility / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk (15%)</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{risk}/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(risk / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Strategic Value (10%)</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{strategicValue}/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(strategicValue / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{qualityScore}/10</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(parseFloat(qualityScore) / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Score ÷ 10</p>
          </div>
        </div>
      </div>





      {/* Scoring Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How We Measure the Total Score</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Weighted Criteria</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Relevance:</span>
                  <span className="font-medium dark:text-white">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Profitability:</span>
                  <span className="font-medium dark:text-white">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Resources Feasibility:</span>
                  <span className="font-medium dark:text-white">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Risk:</span>
                  <span className="font-medium dark:text-white">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Strategic Value:</span>
                  <span className="font-medium dark:text-white">10%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quality Score Calculation</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Quality Score = Total Score of the Tender ÷ 10
              </p>
              <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Example: If total score is 7.5, then quality score = 7.5 ÷ 10 = 0.75
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="text-center">
        <button
          onClick={() => navigate('/analysis')}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 mx-auto"
        >
          <TrendingUp className="w-5 h-5" />
          <span>View Detailed Analysis</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Summary 