"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button"
import { useEffect } from "react"

interface Question {
    id: number
    text: string
    category: "depression" | "anxiety" | "stress"
}

interface QuestionCardProps {
    question: Question
    response: number
    onResponse: (questionId: number, value: number) => void
}

const scaleLabels = [
    { value: 0, label: "Tidak pernah", description: "Tidak berlaku untuk saya sama sekali" },
    { value: 1, label: "Kadang-kadang", description: "Berlaku untuk saya sampai tingkat tertentu, atau kadang-kadang" },
    { value: 2, label: "Sering", description: "Berlaku untuk saya sampai tingkat yang cukup besar, atau cukup sering" },
    { value: 3, label: "Hampir selalu", description: "Sangat berlaku untuk saya, atau berlaku hampir sepanjang waktu" },
]

export function QuestionCard({ question, response, onResponse }: QuestionCardProps) {
    const getScaleLabel = (value: number) => {
        if (value === 0) return scaleLabels[0]
        if (value <= 1) return scaleLabels[1]
        if (value <= 2) return scaleLabels[2]
        return scaleLabels[3]
    }

    const getValueColor = (value: number) => {
        if (value === 0) return "bg-green-100 text-green-800 border-green-200"
        if (value <= 1) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        if (value <= 2) return "bg-orange-100 text-orange-800 border-orange-200"
        return "bg-red-100 text-red-800 border-red-200"
    }

    const currentLabel = response !== undefined ? getScaleLabel(response) : null

    useEffect(() => {
        onResponse(question.id, 0)
    }, [question.id])

    return (
        <Card className="border-2 border-accent/20 shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {question.id}
                    </div>
                    <div className="text-sm text-muted-foreground">Selama seminggu terakhir...</div>
                </div>
                <CardTitle className="text-xl leading-relaxed text-pretty">{question.text}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Pilih tingkat kesesuaian (0.0 - 3.0):</label>
                            {response !== undefined && response !== null && (
                                <Badge className={`${getValueColor(response)} border font-mono text-sm`}>{response.toFixed(1)}</Badge>
                            )}
                        </div>

                        <div className="px-3">
                            <Slider
                                value={[response || 0]}
                                onValueChange={(value) => onResponse(question.id, value[0])}
                                max={3}
                                min={0}
                                step={1}
                                className="w-full"
                            />

                            {/* Scale markers */}
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span>0.0</span>
                                <span>1.0</span>
                                <span>2.0</span>
                                <span>3.0</span>
                            </div>
                        </div>
                    </div>

                    {currentLabel && (
                        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getValueColor(response!)}`}
                                >
                                    {response!.toFixed(1)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-foreground mb-1">{currentLabel.label}</div>
                                    <div className="text-sm text-muted-foreground">{currentLabel.description}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reference scale */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {scaleLabels.map((scale) => (
                            <div onClick={() => onResponse(question.id, Number(scale.value))} key={scale.value} className="cursor-pointer flex items-center gap-2 p-2 bg-muted/30 rounded">
                                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">
                                    {scale.value}
                                </div>
                                <div className="font-medium">{scale.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
