<template>
  <MainNav class="no-card-animation">
    <v-row v-if="!exam">
      <v-col>
        <v-card class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Lädt Prüfung...</p>
        </v-card>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Progress Bar -->
      <v-row class="mb-4">
        <v-col>
          <v-card class="pa-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <h4 class="text-h6">
                <v-icon icon="mdi-clipboard-check" color="primary" class="mr-2"></v-icon>
                Prüfung #{{ exam.id }}
              </h4>
              <v-chip color="primary" size="small">
                Frage {{ currentQuestionIndex + 1 }} / 60
              </v-chip>
            </div>
            <v-progress-linear
              :model-value="((currentQuestionIndex + 1) / 60) * 100"
              color="primary"
              height="12"
              rounded
            >
              <strong class="text-caption">{{ Math.round(((currentQuestionIndex + 1) / 60) * 100) }}%</strong>
            </v-progress-linear>
          </v-card>
        </v-col>
      </v-row>

      <!-- Question Component -->
      <v-row class="mb-4">
        <v-col>
          <Question
            v-if="currentQuestion"
            :key="currentQuestion.id"
            :question="currentQuestion"
            @checked="handleAnswer"
          />
        </v-col>
      </v-row>

      <!-- Navigation Button -->
      <v-row>
        <v-col>
          <v-btn
            color="primary"
            size="x-large"
            :prepend-icon="isLastQuestion ? 'mdi-check-circle' : 'mdi-arrow-right'"
            @click="nextQuestion"
            :disabled="!questionAnswered"
            block
          >
            {{ isLastQuestion ? 'Prüfung abschließen' : 'Nächste Frage' }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Results Dialog -->
      <v-dialog v-model="showResults" max-width="600" persistent>
        <v-card class="dialog-solid">
          <v-card-title class="d-flex align-center">
            <v-icon
              :icon="examPassed ? 'mdi-trophy' : 'mdi-alert-circle'"
              :color="examPassed ? 'success' : 'error'"
              size="large"
              class="mr-2"
            ></v-icon>
            {{ examPassed ? 'Bestanden! 🎉' : 'Nicht bestanden' }}
          </v-card-title>

          <v-card-text>
            <v-alert
              :type="examPassed ? 'success' : 'error'"
              variant="tonal"
              class="mb-4"
            >
              <div class="text-h5 mb-2">{{ totalCorrect }} / 60 Fragen richtig</div>
              <div class="text-body-2">
                {{ examPassed ? 'Herzlichen Glückwunsch!' : 'Weiter üben!' }}
              </div>
            </v-alert>

            <v-divider class="mb-4"></v-divider>

            <h4 class="text-subtitle-1 mb-2">Ergebnisse pro Kategorie:</h4>
            <div class="category-results">
              <div v-for="cat in categoryResults" :key="cat.name" class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-body-2">{{ cat.icon }} {{ cat.name }}</span>
                  <v-chip
                    :color="cat.correct >= 6 ? 'success' : 'error'"
                    size="small"
                  >
                    {{ cat.correct }} / 12
                  </v-chip>
                </div>
                <v-progress-linear
                  :model-value="(cat.correct / 12) * 100"
                  :color="cat.correct >= 6 ? 'success' : 'error'"
                  height="6"
                  rounded
                ></v-progress-linear>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-home"
              @click="goToExams"
              block
            >
              Zurück zur Übersicht
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </MainNav>
</template>

<script setup lang="ts">
import catalogData from '~/content/catalog.json'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const examId = computed(() => parseInt(route.params.id as string))
const exam = computed(() => appStore.getExamById(examId.value))
const allQuestions = ref<any[]>([])
const questionAnswered = ref(false)
const lastAnswerCorrect = ref(false)
const showResults = ref(false)

// Category mapping
const categories = [
  { name: 'Fischkunde', icon: '🐟', key: 'fkIds', correctKey: 'correctFK' },
  { name: 'Gewässerkunde', icon: '💧', key: 'gkIds', correctKey: 'correctGK' },
  { name: 'Schutz und Pflege', icon: '🛡️', key: 'spIds', correctKey: 'correctSP' },
  { name: 'Fanggeräte', icon: '🎣', key: 'fgIds', correctKey: 'correctFG' },
  { name: 'Rechtsvorschriften', icon: '⚖️', key: 'rvIds', correctKey: 'correctRV' }
]

// Load exam questions on mount
onMounted(() => {
  loadExamQuestions()
})

function loadExamQuestions() {
  if (!exam.value) {
    router.push('/exams')
    return
  }

  // Build questions array from all categories
  allQuestions.value = []

  for (const cat of categories) {
    // exam.value[cat.key] is now an array of question IDs (strings)
    const categoryQuestionIds = exam.value[cat.key]
    const categoryQuestions = catalogData.filter((q: any) =>
      categoryQuestionIds.includes(q.id)
    )
    allQuestions.value.push(...categoryQuestions)
  }
}

const currentQuestionIndex = computed(() => {
  return exam.value?.currQst || 0
})

const currentQuestion = computed(() => {
  return allQuestions.value[currentQuestionIndex.value]
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value >= 59
})

const totalCorrect = computed(() => {
  if (!exam.value) return 0
  return (exam.value.correctFK || 0) + (exam.value.correctGK || 0) +
         (exam.value.correctSP || 0) + (exam.value.correctFG || 0) +
         (exam.value.correctRV || 0)
})

const examPassed = computed(() => {
  if (!exam.value) return false
  const total = totalCorrect.value
  const passedTotal = total >= 45
  const passedCategories =
    (exam.value.correctFK >= 6) &&
    (exam.value.correctGK >= 6) &&
    (exam.value.correctSP >= 6) &&
    (exam.value.correctFG >= 6) &&
    (exam.value.correctRV >= 6)
  return passedTotal && passedCategories
})

const categoryResults = computed(() => {
  if (!exam.value) return []
  return categories.map(cat => ({
    name: cat.name,
    icon: cat.icon,
    correct: exam.value[cat.correctKey] || 0
  }))
})

// Watch for question changes to reset state
watch(currentQuestion, () => {
  questionAnswered.value = false
  lastAnswerCorrect.value = false
})

function handleAnswer(correct: boolean) {
  questionAnswered.value = true
  lastAnswerCorrect.value = correct
}

async function nextQuestion() {
  if (!exam.value) return

  // Use the store's examNextQuestion method - this updates the existing exam
  await appStore.examNextQuestion({
    id: exam.value.id,
    qst: currentQuestionIndex.value,
    correct: lastAnswerCorrect.value
  })

  // Check if exam is complete
  if (exam.value.ended) {
    showResults.value = true
  }
}

function goToExams() {
  router.push('/exams')
}
</script>

<style scoped>
.category-results {
  max-height: 300px;
  overflow-y: auto;
}
</style>
