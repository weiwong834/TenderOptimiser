import { SummaryData } from '../services/summarizer'
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface SummaryDisplayProps {
  summary: SummaryData
  fileName?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

const SummaryDisplay = ({ summary, fileName, isExpanded = false, onToggleExpand }: SummaryDisplayProps) => {
  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tender Summary</h3>
            {fileName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{fileName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              summary.confidence >= 0.8 ? 'bg-green-500' : 
              summary.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {(summary.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
      </div>

      {/* Main Summary */}
      <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{summary.summary}</p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Key Points */}
          {summary.keyPoints.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Key Points</span>
              </h4>
              <ul className="space-y-1">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <span className="text-green-500 dark:text-green-400 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Recommendations</span>
              </h4>
              <ul className="space-y-1">
                {summary.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {summary.riskFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Risk Factors</span>
              </h4>
              <ul className="space-y-1">
                {summary.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <span className="text-orange-500 dark:text-orange-400 mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>Cost Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Timeline Review</span>
          </div>
        </div>
        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
          View Full Details
        </button>
      </div>
    </div>
  )
}

export default SummaryDisplay 