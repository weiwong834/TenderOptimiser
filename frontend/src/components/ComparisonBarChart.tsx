import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ComparisonData {
  name: string
  score: number
  cost: number
  quality: number
}

interface ComparisonBarChartProps {
  data: ComparisonData[]
  title?: string
  type?: 'score' | 'cost' | 'quality'
}

const ComparisonBarChart = ({ data, title, type = 'score' }: ComparisonBarChartProps) => {
  const getDataKey = () => {
    switch (type) {
      case 'cost':
        return 'cost'
      case 'quality':
        return 'quality'
      default:
        return 'score'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'cost':
        return '#f59e0b' // orange
      case 'quality':
        return '#10b981' // green
      default:
        return '#8b5cf6' // purple
    }
  }

  const getYAxisLabel = () => {
    switch (type) {
      case 'cost':
        return 'Cost ($)'
      case 'quality':
        return 'Quality Score'
      default:
        return 'Total Score'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={{ stroke: '#6b7280' }}
            label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#374151'
            }}
          />
          <Legend />
          <Bar 
            dataKey={getDataKey()} 
            fill={getColor()} 
            radius={[4, 4, 0, 0]}
            stroke={getColor()}
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ComparisonBarChart 