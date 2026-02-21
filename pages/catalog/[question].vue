<template>
  <MainNav>
    <div v-if="question" class="no-card-animation">
      <Question :question="question"></Question>
      <v-row class="mt-4">
        <v-col>
          <v-btn
            block
            color="secondary"
            size="large"
            @click="nextQuestion"
          >
            Zufällige nächste Frage
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-alert type="error">Frage nicht gefunden</v-alert>
    </div>
  </MainNav>
</template>

<script setup lang="ts">
import catalogData from '~/content/catalog.json'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Get question ID from route
const questionId = route.params.question as string

// Find the question in catalog
const question = computed(() => {
  return catalogData.find((q: any) => q.id === questionId)
})

// Handle 404
if (!question.value) {
  throw createError({ statusCode: 404, message: 'Question not found' })
}

// Get next random question
function nextQuestion() {
  const categories = appStore.categoryNames
  const allowedIds = appStore.filteredQuestionIds

  if (allowedIds.length <= 0) {
    alert('Keine weiteren Fragen verfügbar, bitte Einstellungen prüfen!')
    return
  }

  // Filter questions by category and allowed IDs (excluding current)
  const availableQuestions = catalogData.filter((q: any) => {
    return categories.includes(q.category) &&
           allowedIds.includes(q.id) &&
           q.id !== questionId
  })

  if (availableQuestions.length === 0) {
    alert('Keine weiteren Fragen verfügbar!')
    return
  }

  // Pick random question
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  const nextId = availableQuestions[randomIndex].id

  router.push(`/catalog/${nextId}`)
}
</script>
