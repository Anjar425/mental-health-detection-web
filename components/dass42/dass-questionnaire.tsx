"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuestionCard } from "@/components/dass42/question-card"
import { ResultsCard } from "@/components/dass42/results-card"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

const dassQuestions = [
    // Depression items (1, 3, 5, 10, 13, 16, 17, 21, 24, 26, 31, 34, 37, 38, 42)
    { id: 1, text: "Saya merasa sulit untuk bersantai", category: "stress" },
    { id: 2, text: "Saya menyadari mulut saya terasa kering", category: "anxiety" },
    { id: 3, text: "Saya tidak dapat merasakan perasaan positif sama sekali", category: "depression" },
    {
        id: 4,
        text: "Saya mengalami kesulitan bernapas (misalnya, bernapas cepat, kehabisan napas tanpa melakukan aktivitas fisik)",
        category: "anxiety",
    },
    { id: 5, text: "Saya merasa sulit untuk memulai melakukan sesuatu", category: "depression" },
    { id: 6, text: "Saya cenderung bereaksi berlebihan terhadap situasi", category: "stress" },
    { id: 7, text: "Saya mengalami gemetar (misalnya, di tangan)", category: "anxiety" },
    { id: 8, text: "Saya merasa menggunakan banyak energi mental", category: "stress" },
    {
        id: 9,
        text: "Saya khawatir tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri",
        category: "anxiety",
    },
    { id: 10, text: "Saya merasa tidak ada yang dapat saya nantikan", category: "depression" },
    { id: 11, text: "Saya mendapati diri saya mudah gelisah", category: "stress" },
    { id: 12, text: "Saya merasa sulit untuk rileks", category: "stress" },
    { id: 13, text: "Saya merasa sedih dan tertekan", category: "depression" },
    {
        id: 14,
        text: "Saya tidak toleran terhadap hal-hal yang menghalangi saya melanjutkan apa yang sedang saya lakukan",
        category: "stress",
    },
    { id: 15, text: "Saya merasa hampir panik", category: "anxiety" },
    { id: 16, text: "Saya tidak dapat merasa antusias tentang apa pun", category: "depression" },
    { id: 17, text: "Saya merasa tidak berharga sebagai manusia", category: "depression" },
    { id: 18, text: "Saya merasa agak sensitif", category: "stress" },
    {
        id: 19,
        text: "Saya menyadari detak jantung saya tanpa melakukan aktivitas fisik (misalnya, merasa jantung berdetak kencang atau melewatkan detak)",
        category: "anxiety",
    },
    { id: 20, text: "Saya merasa takut tanpa alasan yang jelas", category: "anxiety" },
    { id: 21, text: "Saya merasa hidup tidak berarti", category: "depression" },
    { id: 22, text: "Saya merasa sulit untuk tenang setelah sesuatu membuat saya kesal", category: "stress" },
    { id: 23, text: "Saya mengalami kesulitan menelan", category: "anxiety" },
    { id: 24, text: "Saya tidak dapat menikmati hal-hal yang saya lakukan", category: "depression" },
    {
        id: 25,
        text: "Saya menyadari aktivitas jantung saya (misalnya, detak jantung meningkat atau menurun)",
        category: "anxiety",
    },
    { id: 26, text: "Saya merasa putus asa dan sedih", category: "depression" },
    { id: 27, text: "Saya merasa sangat gelisah", category: "stress" },
    {
        id: 28,
        text: "Saya khawatir tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri",
        category: "anxiety",
    },
    { id: 29, text: "Saya khawatir bahwa saya akan 'hancur' jika saya membiarkan diri saya rileks", category: "anxiety" },
    { id: 30, text: "Saya merasa sulit untuk bersabar ketika saya tertunda dalam hal apa pun", category: "stress" },
    { id: 31, text: "Saya merasa sedih", category: "depression" },
    {
        id: 32,
        text: "Saya tidak toleran terhadap gangguan apa pun terhadap apa yang sedang saya lakukan",
        category: "stress",
    },
    { id: 33, text: "Saya merasa tegang", category: "anxiety" },
    { id: 34, text: "Saya merasa tidak berharga", category: "depression" },
    { id: 35, text: "Saya tidak dapat menoleransi gangguan terhadap apa yang sedang saya lakukan", category: "stress" },
    { id: 36, text: "Saya merasa ketakutan", category: "anxiety" },
    { id: 37, text: "Saya tidak dapat melihat harapan untuk masa depan", category: "depression" },
    { id: 38, text: "Saya merasa hidup tidak berarti", category: "depression" },
    { id: 39, text: "Saya merasa gelisah", category: "stress" },
    {
        id: 40,
        text: "Saya khawatir tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri",
        category: "anxiety",
    },
    { id: 41, text: "Saya merasa gemetar (misalnya, di tangan)", category: "anxiety" },
    { id: 42, text: "Saya merasa sulit untuk mengambil inisiatif melakukan sesuatu", category: "depression" },
]

export function DassQuestionnaire() {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [responses, setResponses] = useState<Record<number, number | string>>({})
    const [isCompleted, setIsCompleted] = useState(false)
    const [apiData, setApiData] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userToken, setUserToken] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<"user" | "guest">("guest")

    // Cek token saat komponen di-load
    useEffect(() => {
        const token = sessionStorage.getItem("authToken")
        setUserToken(token)
        
        // Tentukan role berdasarkan token
        if (token) {
            try {
                const decoded: any = jwtDecode(token)
                setUserRole(decoded.role === "user" ? "user" : "guest")
                console.log("✅ User authenticated with role:", decoded.role)
            } catch (err) {
                console.warn("⚠️ Failed to decode token:", err)
                setUserRole("guest")
            }
        } else {
            setUserRole("guest")
            console.log("📝 Running as guest (no token)")
        }
    }, [])

    const handleResponse = (questionId: number, value: number | string) => {
        const roundedValue = Math.round(Number(value) * 10) / 10
        setResponses((prev) => ({ ...prev, [questionId]: roundedValue }))
    }

    const handleNext = () => {
        if (currentQuestion < dassQuestions.length - 1) {
            setCurrentQuestion((prev) => prev + 1)
        } else {
            setIsCompleted(true)
            submitToInference()
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1)
        }
    }

    const submitToInference = async () => {
        setIsSubmitting(true)
        const questionnaire_responses: Record<string, number> = {}

        for (let i = 1; i <= 42; i++) {
            questionnaire_responses[`Q${i}`] = Number(responses[i] ?? 0)
        }

        try {
            console.log("📋 DASS-42 Submission Started")
            console.log("📤 Payload:", JSON.stringify(questionnaire_responses, null, 2))
            console.log("🔐 Token present:", !!userToken)
            if (userToken) {
                console.log("🔐 Token preview:", `${userToken.substring(0, 20)}...`)
            }

            let endpoint = ""
            let config: any = {
                headers: {
                    "Content-Type": "application/json"
                }
            }

            // Tentukan endpoint berdasarkan user login
            if (userToken) {
                // User Login - Simpan ke database
                endpoint = `${process.env.NEXT_PUBLIC_API}/inference/compute`
                config.headers["Authorization"] = `Bearer ${userToken}`
                console.log("👤 Submitting as: Authenticated User")
                console.log("✅ Authorization header set:", `Bearer ${userToken.substring(0, 20)}...`)
            } else {
                // Guest - Hanya hitung tanpa menyimpan
                endpoint = `${process.env.NEXT_PUBLIC_API}/inference/compute/public`
                console.log("👥 Submitting as: Guest")
            }

            console.log("🌐 Endpoint:", endpoint)
            console.log("📋 Config headers:", config.headers)

            const res = await axios.post(
                endpoint,
                { questionnaire_responses },
                config
            )

            console.log("✅ API Response Success:", res.data)
            setApiData(res.data)
            setIsSubmitting(false)

            return res.data
        } catch (err: any) {
            console.error("❌ Inference compute error:", err)
            console.error("❌ Response status:", err?.response?.status)
            console.error("❌ Response data:", err?.response?.data)
            console.error("❌ Error message:", err?.message)
            setIsSubmitting(false)
            return null
        }
    }

    const progress = ((currentQuestion + 1) / dassQuestions.length) * 100
    const currentQuestionData = dassQuestions[currentQuestion]
    const currentResponse = responses[currentQuestionData?.id] !== undefined ? responses[currentQuestionData?.id] : 0

    if (isCompleted && apiData) {
        return (
            <ResultsCard
                inference={apiData}
                onRestart={() => {
                    setCurrentQuestion(0)
                    setResponses({})
                    window.location.href ="/"
                }}
            />
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-accent/5 to-background p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-8">
                    <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Kuisioner DASS-42</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Skala Depresi, Kecemasan, dan Stres - 42 Item untuk evaluasi kesehatan mental
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <Badge variant="secondary" className="text-sm">
                            Pertanyaan {currentQuestion + 1} dari {dassQuestions.length}
                        </Badge>
                        {/* <Badge
              variant={
                currentQuestionData?.category === "depression"
                  ? "destructive"
                  : currentQuestionData?.category === "anxiety"
                    ? "default"
                    : "secondary"
              }
              className="text-sm capitalize"
            >
              {currentQuestionData?.category === "depression"
                ? "Depresi"
                : currentQuestionData?.category === "anxiety"
                  ? "Kecemasan"
                  : "Stres"}
            </Badge> */}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <QuestionCard
                    question={{
                        ...currentQuestionData,
                        category: currentQuestionData.category as "stress" | "anxiety" | "depression",
                    }}
                    response={Number(currentResponse) || 0}
                    onResponse={handleResponse}
                />

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="px-6 bg-transparent"
                    >
                        Sebelumnya
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {Object.keys(responses).length} dari {dassQuestions.length} pertanyaan dijawab
                    </div>

                    <Button onClick={handleNext} disabled={currentResponse === undefined} className="px-6">
                        {currentQuestion === dassQuestions.length - 1 ? "Selesai" : "Selanjutnya"}
                    </Button>
                </div>

                {/* Instructions */}
                <Card className="mt-8 border-accent/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Petunjuk Pengisian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-pretty">
                            Silakan baca setiap pernyataan dan gunakan slider untuk memilih nilai antara 0.0 hingga 3.0 yang
                            menunjukkan seberapa sering Anda mengalami kondisi tersebut <strong>selama seminggu terakhir</strong>.
                            Anda dapat memilih nilai desimal seperti 1.5, 2.3, dll. untuk tingkat yang lebih spesifik.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-semibold text-lg">0.0</div>
                                <div className="text-sm text-muted-foreground">Tidak pernah</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-semibold text-lg">1.0</div>
                                <div className="text-sm text-muted-foreground">Kadang-kadang</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-semibold text-lg">2.0</div>
                                <div className="text-sm text-muted-foreground">Sering</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-semibold text-lg">3.0</div>
                                <div className="text-sm text-muted-foreground">Hampir selalu</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
