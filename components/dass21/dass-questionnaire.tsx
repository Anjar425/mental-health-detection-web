"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuestionCard } from "@/components/dass21/question-card"
import { ResultsCard } from "@/components/dass21/results-card"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

// Daftar Pertanyaan DASS-21
const dassQuestions = [
    { id: 1, text: "Saya merasa sulit untuk menenangkan diri.", category: "stress" },
    { id: 2, text: "Saya merasa mulut saya kering.", category: "anxiety" },
    { id: 3, text: "Saya tidak dapat merasakan perasaan positif sama sekali.", category: "depression" },
    { id: 4, text: "Saya mengalami kesulitan bernapas (misalnya, terengah-engah, sesak napas) tanpa ada aktivitas fisik.", category: "anxiety" },
    { id: 5, text: "Saya merasa sulit untuk berinisiatif melakukan sesuatu.", category: "depression" },
    { id: 6, text: "Saya cenderung bereaksi berlebihan terhadap situasi.", category: "stress" },
    { id: 7, text: "Saya mengalami gemetar (misalnya, pada tangan).", category: "anxiety" },
    { id: 8, text: "Saya merasa menggunakan banyak energi untuk gelisah.", category: "stress" },
    { id: 9, text: "Saya khawatir akan situasi di mana saya mungkin menjadi panik dan mempermalukan diri sendiri.", category: "anxiety" },
    { id: 10, text: "Saya merasa tidak ada hal yang dapat saya nantikan.", category: "depression" },
    { id: 11, text: "Saya mendapati diri saya menjadi gelisah.", category: "stress" },
    { id: 12, text: "Saya merasa sulit untuk rileks.", category: "stress" },
    { id: 13, text: "Saya merasa sedih dan tertekan.", category: "depression" },
    { id: 14, text: "Saya tidak toleran terhadap apa pun yang menghalangi saya menyelesaikan apa yang sedang saya lakukan.", category: "stress" },
    { id: 15, text: "Saya merasa hampir panik.", category: "anxiety" },
    { id: 16, text: "Saya tidak dapat antusias terhadap apa pun.", category: "depression" },
    { id: 17, text: "Saya merasa saya tidak berharga sebagai seseorang.", category: "depression" },
    { id: 18, text: "Saya merasa bahwa saya mudah tersinggung.", category: "stress" },
    { id: 19, text: "Saya menyadari detak jantung saya walau tanpa aktivitas fisik (misalnya, detak jantung meningkat, jantung berdebar).", category: "anxiety" },
    { id: 20, text: "Saya merasa takut tanpa alasan yang jelas.", category: "anxiety" },
    { id: 21, text: "Saya merasa bahwa hidup tidak berarti.", category: "depression" },
]

interface Result {
    depression: number,
    anxiety: number,
    stress: number,
    group_name?: string | null,
    group_id?: number | null,
}

// PERUBAHAN PENTING: Gunakan 'export function' (Named Export)
export function DassQuestionnaire() {
    const searchParams = useSearchParams()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [responses, setResponses] = useState<Record<number, number>>({})
    const [isCompleted, setIsCompleted] = useState(false)
    const [apiResult, setApiResult] = useState<Result>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userToken, setUserToken] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<"user" | "guest">("guest")
    const [groupId, setGroupId] = useState<number | null>(null)
    const [groupName, setGroupName] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("authToken")
            setUserToken(token)
            
            if (token) {
                try {
                    const decoded: any = jwtDecode(token)
                    setUserRole(decoded.role === "user" ? "user" : "guest")
                } catch (err) {
                    console.error("Token error:", err)
                    setUserRole("guest")
                }
            }

            // Baca groupId dari URL
            const gid = searchParams.get('groupId')
            if (gid) {
                setGroupId(parseInt(gid, 10))
            }
        }
    }, [searchParams])

    const handleResponse = (questionId: number, value: number | string) => {
        const val = Number(value)
        setResponses((prev) => ({ ...prev, [questionId]: val }))
    }

    const handleNext = async () => {
        if (currentQuestion < dassQuestions.length - 1) {
            setCurrentQuestion((prev) => prev + 1)
        } else {
            await submitResult();
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1)
        }
    }

    const submitResult = async () => {
        setIsSubmitting(true)
        try {
            const scores = dassQuestions.map(q => Number(responses[q.id] ?? 0))
            
            const payload = { 
                scores: scores,
                type: "21",
                group_id: groupId
            }
            
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
            let endpoint = ""
            
            const config: any = {
                headers: { "Content-Type": "application/json" },
                timeout: 30000 
            }

            if (userToken) {
                endpoint = `${baseUrl}/qdss`
                config.headers["Authorization"] = `Bearer ${userToken}`
            } else {
                endpoint = `${baseUrl}/qdss/public`
            }

            console.log(`📡 Sending to: ${endpoint}`, payload)

            const res = await axios.post(endpoint, payload, config)
            console.log("✅ Response:", res.data)
            
            const resultData = res.data.final_scores || res.data
            // If backend included resolved group info, capture it for display
            setGroupName(res.data.group_name ?? null)
            setApiResult(resultData)
            setIsCompleted(true)

        } catch (error: any) {
            console.error("❌ Submit Error:", error)
            let msg = "Terjadi kesalahan koneksi."
            
            if (error.response) {
                msg = `Server Error (${error.response.status}): ${error.response.data?.detail || "Gagal memproses data"}`
            } else if (error.request) {
                msg = "Gagal terhubung ke server. Pastikan backend (Port 8000) menyala."
            }
            
            alert(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isCompleted && apiResult) {
        return (
            <ResultsCard
                scores={apiResult}
                userRole={userRole}
                onRestart={() => {
                    setCurrentQuestion(0)
                    setResponses({})
                    setIsCompleted(false)
                    setApiResult(undefined)
                    setGroupName(null)
                }}
                groupId={groupId}
                groupName={groupName}
            />
        )
    }

    const progress = ((currentQuestion + 1) / dassQuestions.length) * 100
    const currentQuestionData = dassQuestions[currentQuestion]
    const currentResponse = responses[currentQuestionData?.id]

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-3xl space-y-4 sm:space-y-6">
                
                <div className="text-center mb-4 sm:mb-8 pt-2 sm:pt-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Kuisioner DASS-21
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Jawablah berdasarkan kondisi Anda selama seminggu terakhir.
                    </p>
                    <div className="mt-3 sm:mt-4 flex justify-center gap-2 flex-wrap">
                         {userToken ? (
                            <Badge className="bg-green-600 text-xs">Mode: Pengguna</Badge>
                         ) : (
                            <Badge variant="outline" className="text-xs">Mode: Tamu</Badge>
                         )}
                         <Badge variant="secondary" className="text-xs">
                            Soal {currentQuestion + 1} / {dassQuestions.length}
                         </Badge>
                    </div>
                </div>

                <div className="mb-4 sm:mb-6 space-y-2">
                    <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 sm:h-2" />
                </div>

                <QuestionCard
                    question={{
                        ...currentQuestionData,
                        category: currentQuestionData.category as "stress" | "anxiety" | "depression",
                    }}
                    response={currentResponse}  
                    onResponse={handleResponse}
                />

                <div className="flex justify-between items-center pt-4 gap-3">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0 || isSubmitting}
                        className="flex-1 sm:w-32 sm:flex-none text-xs sm:text-sm"
                    >
                        Sebelumnya
                    </Button>

                    <Button 
                        onClick={handleNext} 
                        disabled={currentResponse === undefined || isSubmitting} 
                        className="flex-1 sm:w-32 sm:flex-none text-xs sm:text-sm"
                    >
                        {isSubmitting ? "Memproses..." : (currentQuestion === dassQuestions.length - 1 ? "Selesai" : "Selanjutnya")}
                    </Button>
                </div>

                <Card className="mt-4 sm:mt-8 border-dashed bg-muted/20 shadow-none">
                    <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground text-center">
                            Panduan Skala Penilaian (0 - 3)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs">
                            <div className="p-1.5 sm:p-2 rounded bg-background border">
                                <strong className="block text-sm sm:text-lg">0</strong> Tidak pernah
                            </div>
                            <div className="p-1.5 sm:p-2 rounded bg-background border">
                                <strong className="block text-sm sm:text-lg">1</strong> Kadang-kadang
                            </div>
                            <div className="p-1.5 sm:p-2 rounded bg-background border">
                                <strong className="block text-sm sm:text-lg">2</strong> Sering
                            </div>
                            <div className="p-1.5 sm:p-2 rounded bg-background border">
                                <strong className="block text-sm sm:text-lg">3</strong> Hampir selalu
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}