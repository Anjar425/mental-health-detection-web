"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts"

interface FuzzyMembershipChartProps {
  title?: string
  description?: string
}

// Generate fuzzy membership data for Low, Medium, High based on the image
function generateFuzzyData() {
  const scores = []
  
  // Generate data points from 0 to 3.0
  for (let score = 0; score <= 3.0; score += 0.1) {
    const point: Record<string, number> = { score: parseFloat(score.toFixed(1)) }
    
    // Low (μ) - Green trapezoid: high at 0-0.5, declining 0.5-1.0
    if (score <= 0.5) {
      point.low = 1.0
    } else if (score <= 1.0) {
      point.low = Math.max(0, 1.0 - (score - 0.5) * 2)
    } else {
      point.low = 0
    }
    
    // Medium (μ) - Blue triangle: peak at 1.5, slopes 1.0-2.0
    if (score >= 1.0 && score <= 1.5) {
      point.medium = (score - 1.0) * 2
    } else if (score > 1.5 && score <= 2.0) {
      point.medium = Math.max(0, 1.0 - (score - 1.5) * 2)
    } else {
      point.medium = 0
    }
    
    // High (μ) - Red trapezoid: starts rising from 1.8, high at 2.3-3.0
    if (score < 1.8) {
      point.high = 0
    } else if (score >= 1.8 && score <= 2.3) {
      point.high = (score - 1.8) / 0.5
    } else {
      point.high = 1.0
    }
    
    scores.push(point)
  }
  
  return scores
}

const FUZZY_CHART_CONFIG: ChartConfig = {
  low: {
    label: "Low (μ)",
    color: "#22c55e",
  },
  medium: {
    label: "Medium (μ)",
    color: "#3b82f6",
  },
  high: {
    label: "High (μ)",
    color: "#ef4444",
  },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    return (
      <div className="bg-background border border-border rounded p-2 shadow-md text-xs">
        <p className="font-semibold">Score: {data.score.toFixed(1)}</p>
        <div className="mt-1 space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex gap-2">
              <span style={{ color: entry.color }}>●</span>
              <span>
                {entry.name}: {(entry.value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function FuzzyMembershipChart({ 
  title = "Fuzzy Membership Function for Item Score DASS", 
  description = "Visualisasi fungsi keanggotaan fuzzy untuk penilaian item DASS-42" 
}: FuzzyMembershipChartProps) {
  const data = generateFuzzyData()

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[500px] px-3 sm:px-6">
          <ChartContainer config={FUZZY_CHART_CONFIG}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 60, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis
                  dataKey="score"
                  type="number"
                  domain={[0, 3]}
                  label={{ value: "Score", position: "bottom", offset: 10 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{ value: "Membership Degree", angle: -90, position: "left" }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke={FUZZY_CHART_CONFIG.low.color}
                  strokeWidth={3}
                  dot={false}
                  name="Low (μ)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke={FUZZY_CHART_CONFIG.medium.color}
                  strokeWidth={3}
                  dot={false}
                  name="Medium (μ)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke={FUZZY_CHART_CONFIG.high.color}
                  strokeWidth={3}
                  dot={false}
                  name="High (μ)"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
