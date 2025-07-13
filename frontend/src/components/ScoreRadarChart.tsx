import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface ScoreData {
  criteria: string
  score: number
  fullMark: number
}

interface ScoreRadarChartProps {
  data: ScoreData[]
  title?: string
}

const ScoreRadarChart = ({ data, title }: ScoreRadarChartProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="criteria" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#6b7280' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={{ stroke: '#6b7280' }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#374151'
            }}
            labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreRadarChart 