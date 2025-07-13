import { Link } from 'react-router-dom'
import { useTender } from '../context/TenderContext'
import { BarChart3, FileText, Settings, TrendingUp, DollarSign, Clock, Award } from 'lucide-react'
import ScoreRadarChart from '../components/ScoreRadarChart'
import ComparisonBarChart from '../components/ComparisonBarChart'

const Dashboard = () => {
  const { state } = useTender()
  const { tenders, optimizationResult } = state



  const stats = [
    {
      title: 'Total Tenders',
      value: tenders.length,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Optimal Price',
      value: tenders.length > 0 
        ? `$${(tenders.reduce((sum, t) => sum + t.totalCost, 0) / tenders.length).toFixed(2)}`
        : '$0',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Price Range',
      value: tenders.length > 0 
        ? `$${Math.min(...tenders.map(t => t.totalCost)).toLocaleString()} - $${Math.max(...tenders.map(t => t.totalCost)).toLocaleString()}`
        : '$0 - $0',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Overall Performance Score',
      value: tenders.length > 0 
        ? ((tenders.reduce((sum, t) => sum + (t.qualityScore + t.technicalScore + t.reliabilityScore + t.financialStability + t.pastPerformance), 0) / (tenders.length * 5)) * 10).toFixed(1)
        : '0',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const quickActions = [
    {
      title: 'Input Tenders',
      description: 'Upload and process tender documents',
      icon: FileText,
      path: '/input',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Summary',
      description: 'View tender summary and overview',
      icon: BarChart3,
      path: '/summary',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Analysis',
      description: 'Advanced analysis and insights',
      icon: TrendingUp,
      path: '/analysis',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-8 bg-white dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tender Optimizer Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Analyze, compare, and optimize your tender offers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-purple-900`}>
                <Icon className={`w-7 h-7 ${stat.color} dark:text-purple-300`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Charts */}
      {tenders.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Visualization</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart for Current Tender */}
            <ScoreRadarChart
              title="Current Tender Performance"
              data={[
                { criteria: 'Relevance', score: tenders[0].qualityScore || 7.5, fullMark: 10 },
                { criteria: 'Profitability', score: tenders[0].technicalScore || 8.0, fullMark: 10 },
                { criteria: 'Resources', score: tenders[0].reliabilityScore || 7.0, fullMark: 10 },
                { criteria: 'Risk', score: tenders[0].financialStability || 6.5, fullMark: 10 },
                { criteria: 'Strategic', score: tenders[0].pastPerformance || 8.5, fullMark: 10 }
              ]}
            />
            
            {/* Bar Chart for Historical Comparison */}
            <ComparisonBarChart
              title="Historical Tender Comparison"
              data={[
                {
                  name: 'Current',
                  score: ((tenders[0].qualityScore || 7.5) * 0.25 + (tenders[0].technicalScore || 8.0) * 0.30 + (tenders[0].reliabilityScore || 7.0) * 0.20 + (tenders[0].financialStability || 6.5) * 0.15 + (tenders[0].pastPerformance || 8.5) * 0.10),
                  cost: tenders[0].totalCost,
                  quality: ((tenders[0].qualityScore || 7.5) * 0.25 + (tenders[0].technicalScore || 8.0) * 0.30 + (tenders[0].reliabilityScore || 7.0) * 0.20 + (tenders[0].financialStability || 6.5) * 0.15 + (tenders[0].pastPerformance || 8.5) * 0.10) / 10
                },
                { name: 'Market Avg', score: 7.2, cost: 95000, quality: 0.72 },
                { name: 'Best Practice', score: 8.5, cost: 110000, quality: 0.85 }
              ]}
              type="score"
            />
          </div>
        </div>
      )}

      {/* Quick Actions - Enhanced for better accessibility */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Actions</h2>
          <p className="text-gray-600 dark:text-gray-400">Access the main features of your tender optimizer</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.path}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-purple-100 dark:border-purple-900 p-8 flex flex-col items-center text-center hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className={`p-4 rounded-2xl ${action.bgColor} dark:bg-purple-900 mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-800 transition-colors duration-300`}>
                  <Icon className={`w-12 h-12 ${action.color} dark:text-purple-300`} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{action.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{action.description}</p>
                </div>
                <div className="mt-4 w-full">
                  <div className="bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg group-hover:bg-purple-700 transition-colors duration-300">
                    Get Started
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {tenders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Tenders</h2>
          <div className="space-y-4">
            {tenders.slice(-3).map((tender) => (
              <div key={tender.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{tender.supplierName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tender.projectName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${tender.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quality: {tender.qualityScore}/10</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Result Preview */}
      {optimizationResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Latest Optimization Result</h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Optimization Complete</h3>
            </div>
            <p className="text-purple-700 dark:text-purple-300 mb-2">
              Selected {optimizationResult.selectedTenders.length} tenders with overall score of{' '}
              {optimizationResult.overallScore.toFixed(2)}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Total Cost: ${optimizationResult.totalCost.toLocaleString()} | 
              Avg Quality: {optimizationResult.averageQuality.toFixed(1)}/10
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 