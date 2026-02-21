import { defineStore } from 'pinia'
import { toRaw } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const initialized = ref(false)
  const settings = ref<any>({})
  const questionLocal = ref<Record<string, { correct: boolean }>>({})
  const allQuestionIds = ref<Array<{ id: string }>>([])
  const exams = ref<Array<any>>([])

  // Getters
  const categoryNames = computed(() => {
    const categories: string[] = []
    for (const entry of settings.value.categories || []) {
      if (entry === 1) categories.push('Fischkunde')
      else if (entry === 2) categories.push('Gewässerkunde')
      else if (entry === 3) categories.push('Schutz und Pflege')
      else if (entry === 4) categories.push('Fanggeräte')
      else if (entry === 5) categories.push('Rechtsvorschriften')
    }
    return categories
  })

  const labeledQuestionIds = computed(() => {
    const result = {
      correct: [] as string[],
      wrong: [] as string[]
    }
    for (const [key, value] of Object.entries(questionLocal.value)) {
      if (value.correct) result.correct.push(key)
      else result.wrong.push(key)
    }
    return result
  })

  const filteredQuestionIds = computed(() => {
    const res: string[] = []
    const tmp = labeledQuestionIds.value

    if (settings.value.qsts?.includes(1)) res.push(...tmp.correct)
    if (settings.value.qsts?.includes(2)) res.push(...tmp.wrong)
    if (settings.value.qsts?.includes(3)) {
      // All unanswered questions
      for (const qID of allQuestionIds.value) {
        if (questionLocal.value[qID.id] === undefined) {
          res.push(qID.id)
        }
      }
    }
    return res
  })

  const nextExamId = computed(() => {
    if (exams.value.length === 0) return 1
    return exams.value[exams.value.length - 1].id + 1
  })

  const getExamById = (id: number) => {
    return exams.value.find(exam => exam.id === id)
  }

  // Actions
  async function init(questionIds?: Array<{ id: string }>, force: boolean = false) {
    const nuxtApp = useNuxtApp()

    if (!initialized.value || force) {
      // Init settings
      let settingsData: any = await nuxtApp.$localForage.meta.getItem('SETTINGS')
      if (!settingsData) {
        // Defaults
        settingsData = {
          categories: [1, 2, 3, 4, 5],
          qsts: [3] // Show only unanswered questions by default
        }
        await nuxtApp.$localForage.meta.setItem('SETTINGS', settingsData)
      }
      settings.value = settingsData

      // Store question IDs if provided
      if (questionIds) {
        allQuestionIds.value = questionIds
      }

      // Init exams
      let examsData: any = await nuxtApp.$localForage.meta.getItem('EXAMS')
      if (!examsData) {
        examsData = []
        await nuxtApp.$localForage.meta.setItem('EXAMS', examsData)
      }
      exams.value = examsData

      // Mark as initialized
      initialized.value = true

      // Load question local data (async)
      const tmp: Record<string, { correct: boolean }> = {}
      await nuxtApp.$localForage.nuxtLocalForage.iterate((value: any, key: string) => {
        tmp[key] = value
      })
      questionLocal.value = tmp
    }
  }

  async function updateSettings(data: any) {
    const nuxtApp = useNuxtApp()
    settings.value = data
    // Deep clone to strip all Vue reactivity (including nested arrays)
    const plainData = JSON.parse(JSON.stringify(data))
    await nuxtApp.$localForage.meta.setItem('SETTINGS', plainData)
  }

  async function answerQuestion(data: { id: string; correct: boolean }) {
    const nuxtApp = useNuxtApp()
    const googleSyncStore = useGoogleSyncStore()

    const value = { correct: data.correct }

    if (!questionLocal.value[data.id]) {
      questionLocal.value[data.id] = value
    } else {
      questionLocal.value[data.id].correct = data.correct
    }

    googleSyncStore.setModelDirty(true)
    await nuxtApp.$localForage.nuxtLocalForage.setItem(data.id, value)
  }

  async function addExam(exam: any) {
    const nuxtApp = useNuxtApp()
    const googleSyncStore = useGoogleSyncStore()

    exams.value.push(exam)
    googleSyncStore.setModelDirty(true)
    // Strip Vue reactivity before saving to IndexedDB
    await nuxtApp.$localForage.meta.setItem('EXAMS', toRaw(exams.value))
  }

  async function removeExam(id: number) {
    const nuxtApp = useNuxtApp()
    const googleSyncStore = useGoogleSyncStore()

    const index = exams.value.map(elem => elem.id).indexOf(id)
    exams.value.splice(index, 1)
    googleSyncStore.setModelDirty(true)
    // Strip Vue reactivity before saving to IndexedDB
    await nuxtApp.$localForage.meta.setItem('EXAMS', toRaw(exams.value))
  }

  async function examNextQuestion(data: { id: number; qst: number; correct: boolean }) {
    const nuxtApp = useNuxtApp()
    const googleSyncStore = useGoogleSyncStore()

    const exam = exams.value.find(e => e.id === data.id)
    if (!exam || exam.ended !== null) return

    // Track correct answers by category
    if (data.correct) {
      if (data.qst < 12) exam.correctFK++
      else if (data.qst < 24) exam.correctGK++
      else if (data.qst < 36) exam.correctSP++
      else if (data.qst < 48) exam.correctFG++
      else if (data.qst < 60) exam.correctRV++
    }

    // Increment question counter
    exam.currQst++

    // Check if exam is complete (after incrementing)
    if (exam.currQst >= 60) {
      exam.ended = Date.now()
    }

    googleSyncStore.setModelDirty(true)
    // Strip Vue reactivity before saving to IndexedDB
    await nuxtApp.$localForage.meta.setItem('EXAMS', toRaw(exams.value))
  }

  async function resetAnswers() {
    const nuxtApp = useNuxtApp()
    const googleSyncStore = useGoogleSyncStore()

    // Clear all answers from LocalForage
    await nuxtApp.$localForage.nuxtLocalForage.clear()
    questionLocal.value = {}
    googleSyncStore.setModelDirty(true)
  }

  return {
    // State
    initialized,
    settings,
    questionLocal,
    allQuestionIds,
    exams,
    // Getters
    categoryNames,
    labeledQuestionIds,
    filteredQuestionIds,
    nextExamId,
    getExamById,
    // Actions
    init,
    updateSettings,
    answerQuestion,
    addExam,
    removeExam,
    examNextQuestion,
    resetAnswers
  }
})
