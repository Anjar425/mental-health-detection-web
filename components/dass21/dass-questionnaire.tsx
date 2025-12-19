"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuestionCard } from "@/components/dass21/question-card"
import { ResultsCard } from "@/components/dass21/results-card"
import axios from "axios"
import { jwtDecode } from "jwt-decode"

// Pastikan jumlah pertanyaan sesuai dengan DASS-21 (21 soal) atau DASS-42 (42 soal)
// Di array ini jumlahnya 21, jadi kita set type nanti ke "21"
const dassQuestions = [
    { id: 1, text: "Saya merasa sulit untuk menenangkan diri.", category: "stress" },
    { id: 2, text: "Saya merasa mulut saya kering.", category: "anxiety" },
    { id: 3, text: "Saya tidak dapat merasakan perasaan positif sama sekali.", category: "depression" },
    {
        id: 4,
        text: "Saya mengalami kesulitan bernapas (misalnya, terengah-engah, sesak napas) tanpa ada aktivitas fisik.",
        category: "anxiety"
    },
    { id: 5, text: "Saya merasa sulit untuk berinisiatif melakukan sesuatu.", category: "depression" },
    { id: 6, text: "Saya cenderung bereaksi berlebihan terhadap situasi.", category: "stress" },
    { id: 7, text: "Saya merasa gemetar (misalnya, di tangan).", category: "anxiety" },
    { id: 8, text: "Saya merasa menggunakan banyak energi saraf.", category: "stress" },
    { id: 9, text: "Saya khawatir dengan situasi yang mungkin membuat saya panik dan mempermalukan diri sendiri.", category: "anxiety" },
    { id: 10, text: "Saya merasa tidak ada hal yang dapat saya harapkan di masa depan.", category: "depression" },
    { id: 11, text: "Saya merasa gelisah.", category: "stress" },
    { id: 12, text: "Saya merasa sulit untuk bersantai.", category: "stress" },
    { id: 13, text: "Saya merasa sedih dan tertekan.", category: "depression" },
    {
        id: 14,
        text: "Saya tidak sabar (misalnya, mudah tersinggung, mudah marah).",
        category: "stress"
    },
    { id: 15, text: "Saya merasa hampir panik.", category: "anxiety" },
    { id: 16, text: "Saya merasa tidak bersemangat untuk melakukan apa pun.", category: "depression" },
    { id: 17, text: "Saya merasa diri saya tidak berharga.", category: "depression" },
    { id: 18, text: "Saya merasa sangat peka (mudah tersinggung).", category: "stress" },
    {
        id: 19,
        text: "Saya merasakan detak jantung saya (misalnya, berdebar-debar) tanpa ada alasan fisik.",
        category: "anxiety"
    },
    { id: 20, text: "Saya merasa takut tanpa alasan yang jelas.", category: "anxiety" },
    { id: 21, text: "Saya merasa hidup tidak berarti.", category: "depression" }
]

interface Result {
    depression: number,
    anxiety: number,
    stress: number
}

export function DassQuestionnaire() {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [responses, setResponses] = useState<Record<number, number>>({})
    const [isCompleted, setIsCompleted] = useState(false)
    const [apiResult, setApiResult] = useState<Result>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userToken, setUserToken] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<"user" | "guest">("guest")

    // Cek apakah user login saat komponen di-load
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
            // 1. Siapkan Data
            const scores = dassQuestions.map(q => Number(responses[q.id] ?? 0))
            const payload = { 
                scores,
                type: "21" // PENTING: Backend butuh field ini
            }
            
            console.log("📋 DASS-21 Submission Started")
            console.log("📤 Payload:", JSON.stringify(payload, null, 2))
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

            // 2. Tentukan Logic: User vs Guest
            if (userToken) {
                // CASE A: User Login (Simpan History)
                endpoint = `${process.env.NEXT_PUBLIC_API}/qdss`
                config.headers["Authorization"] = `Bearer ${userToken}`
                
                console.log("👤 Submitting as: Authenticated User")
                console.log("✅ Authorization header set:", `Bearer ${userToken.substring(0, 20)}...`)
            } else {
                // CASE B: Guest (Hanya Hitung / Public)
                endpoint = `${process.env.NEXT_PUBLIC_API}/qdss/public` 
                console.log("👥 Submitting as: Guest")
            }

            console.log("🌐 Endpoint:", endpoint)
            console.log("📋 Config headers:", config.headers)

            // 3. Kirim Request
            const res = await axios.post(endpoint, payload, config)

            // 4. Handle Response
            console.log("✅ API Response Success:", res.data)
            setApiResult(res.data)
            setIsCompleted(true)

        } catch (error: any) {
            console.error("❌ Failed to submit:", error)
            console.error("❌ Response status:", error?.response?.status)
            console.error("❌ Response data:", error?.response?.data)
            console.error("❌ Error message:", error?.message)
            
            // Optional: Tampilkan alert jika error spesifik
            if (error.response?.status === 401) {
                alert("Sesi Anda habis. Silakan login ulang.")
            } else if (error.response?.status === 404 && !userToken) {
                alert("Endpoint Guest belum tersedia. Silakan Login untuk melakukan tes.")
            } else {
                alert("Terjadi kesalahan saat memproses data.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const progress = ((currentQuestion + 1) / dassQuestions.length) * 100
    const currentQuestionData = dassQuestions[currentQuestion]
    const currentResponse = responses[currentQuestionData?.id]

    if (isCompleted && apiResult) {
        return (
            <ResultsCard
                scores={apiResult}
                userRole={userRole}
                onRestart={() => {
                    setCurrentQuestion(0)
                    setResponses({})
                    setIsCompleted(false)
                    // Opsional: Redirect atau reset state saja
                    // window.location.href = "/" 
                }}
            />
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-accent/5 to-background p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-8">
                    <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
                        Kuisioner DASS-21
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Skala Depresi, Kecemasan, dan Stres - {dassQuestions.length} Item
                    </p>
                    
                    {/* Indikator Status Login (Optional) */}
                    <div className="mt-2">
                         {userToken ? (
                            <Badge variant="default" className="bg-green-600">Mode: Pengguna (Hasil Disimpan)</Badge>
                         ) : (
                            <Badge variant="outline">Mode: Tamu (Hasil Tidak Disimpan)</Badge>
                         )}
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-6">
                        <Badge variant="secondary" className="text-sm">
                            Pertanyaan {currentQuestion + 1} dari {dassQuestions.length}
                        </Badge>
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
                    response={currentResponse}  
                    onResponse={handleResponse}
                />

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0 || isSubmitting}
                        className="px-6 bg-transparent"
                    >
                        Sebelumnya
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        {Object.keys(responses).length} dari {dassQuestions.length} pertanyaan dijawab
                    </div>

                    <Button 
                        onClick={handleNext} 
                        disabled={currentResponse === undefined || isSubmitting} 
                        className="px-6"
                    >
                        {isSubmitting ? "Memproses..." : (currentQuestion === dassQuestions.length - 1 ? "Selesai" : "Selanjutnya")}
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