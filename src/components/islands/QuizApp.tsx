import { useEffect, useRef, useState } from 'react'
import { t, type Lang } from '@/i18n/index'
import { drawQuestions, failedFormulas, grade, type QuizQuestion } from '@/lib/quiz'
import { recordAttempt } from '@/lib/progress'

const COUNTS: (5 | 10 | 20)[] = [5, 10, 20]

type Phase = 'configure' | 'empty' | 'question' | 'results'

function formatTimeLeft(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  lang: Lang
  questions: QuizQuestion[]
  hubUrl: string
  catalogUrl: string
}

export default function QuizApp({ lang, questions: allQuestions, hubUrl, catalogUrl }: Props) {
  const [phase, setPhase] = useState('configure')
  const [config, setConfig] = useState({
    levels: [1, 2, 3, 4, 5, 6, 7],
    domains: [] as string[],
    count: 5 as 5 | 10 | 20,
    timerEnabled: false,
    timerMinutes: 5,
  })
  const [drawn, setDrawn] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({})
  const [result, setResult] = useState<ReturnType<typeof grade> | null>(null)
  const [qcmSelection, setQcmSelection] = useState<string[]>([])
  const [numericInput, setNumericInput] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const current = drawn[currentIndex]
  const isLast = currentIndex === drawn.length - 1
  const isMultiple = current ? current.correct.length > 1 : false

  const kindLabel = (k: 'qcm' | 'numeric') => t(lang, `exercise.kind.${k}` as never)

  const toggleLevel = (level: number) => {
    setConfig((c) => {
      const levels = c.levels.includes(level)
        ? c.levels.filter((l) => l !== level)
        : [...c.levels, level].sort((a, b) => a - b)
      return { ...c, levels }
    })
  }

  const toggleDomain = (domain: string) => {
    setConfig((c) => {
      const domains = c.domains.includes(domain)
        ? c.domains.filter((d) => d !== domain)
        : [...c.domains, domain]
      return { ...c, domains }
    })
  }

  const startQuiz = () => {
    const next = drawQuestions({
      exercises: allQuestions,
      levels: config.levels,
      domains: config.domains,
      count: config.count,
    })
    if (next.length < 5) {
      setDrawn([])
      setPhase('empty')
      return
    }
    setDrawn(next)
    setCurrentIndex(0)
    setAnswers({})
    setQcmSelection([])
    setNumericInput('')
    setResult(null)
    setPhase('question')
    if (config.timerEnabled) {
      setTimeLeft(config.timerMinutes * 60)
      timerRef.current = setInterval(() => {
        setTimeLeft((t: number) => {
          if (t <= 1) {
            finishQuiz()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
  }

  const saveCurrentAnswer = () => {
    if (!current) return
    setAnswers((prev) => {
      if (current.kind === 'qcm') return { ...prev, [current.id]: qcmSelection }
      return { ...prev, [current.id]: numericInput }
    })
  }

  const nextQuestion = () => {
    saveCurrentAnswer()
    if (isLast) {
      finishQuiz()
    } else {
      setCurrentIndex((i: number) => i + 1)
      setQcmSelection([])
      setNumericInput('')
    }
  }

  const finishQuiz = () => {
    saveCurrentAnswer()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const grading = grade(drawn, answers)
    setResult(grading)
    for (const q of drawn) {
      const raw = answers[q.id]
      if (raw === undefined || raw === '') continue
      const correct = grading.results.find((r: { questionId: string }) => r.questionId === q.id)?.correct ?? false
      recordAttempt({ exerciseId: q.id, result: correct ? 'correct' : 'wrong' })
    }
    setPhase('results')
  }

  const retryQuiz = () => {
    setPhase('configure')
    setResult(null)
    setDrawn([])
    setCurrentIndex(0)
    setAnswers({})
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])
}