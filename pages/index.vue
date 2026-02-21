<template>
  <MainNav>
    <!-- Welcome Header -->
    <v-row class="mb-4">
      <v-col>
        <h3 class="text-h4 mb-2">Dein Lernfortschritt</h3>
        <p class="text-subtitle-1 text-medium-emphasis">
          Verfolge deinen Fortschritt in allen Kategorien der bayerischen Fischerprüfung
        </p>
      </v-col>
    </v-row>

    <!-- Progress Cards -->
    <v-row>
      <v-col cols="12" md="6" v-for="category in categories" :key="category.name">
        <v-card class="category-card" :ripple="false">
          <v-card-title class="d-flex align-center">
            <v-icon :icon="category.icon" class="mr-2" color="primary" size="small"></v-icon>
            <span>{{ category.name }}</span>
          </v-card-title>
          <v-card-text>
            <v-progress-linear
              :model-value="category.progress.total"
              :max="category.total"
              height="36"
              rounded
            >
              <div class="progress-segments">
                <div
                  class="segment segment-success"
                  :style="{ width: `${(category.progress.correct / category.total) * 100}%` }"
                ></div>
                <div
                  class="segment segment-error"
                  :style="{ width: `${(category.progress.wrong / category.total) * 100}%` }"
                ></div>
                <div
                  class="segment segment-secondary"
                  :style="{ width: `${(category.progress.unanswered / category.total) * 100}%` }"
                ></div>
              </div>
              <strong class="progress-text">{{ category.progress.correct + category.progress.wrong }} / {{ category.total }}</strong>
            </v-progress-linear>
            <div class="d-flex justify-space-between mt-2 text-caption">
              <span class="text-success">✓ {{ category.progress.correct }} richtig</span>
              <span class="text-error">✗ {{ category.progress.wrong }} falsch</span>
              <span class="text-medium-emphasis">○ {{ category.progress.unanswered }} offen</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Action Buttons -->
    <v-row class="mt-4">
      <v-col>
        <v-card class="pa-4">
          <div class="d-flex align-center ga-2">
            <v-btn
              color="primary"
              size="x-large"
              class="flex-grow-1"
              prepend-icon="mdi-play-circle"
              @click="startRandomQuestion"
              style="min-width: 0;"
            >
              <span class="d-none d-sm-inline">Starte mit zufälliger Frage</span>
              <span class="d-sm-none">Starten</span>
            </v-btn>
            <v-btn
              icon="mdi-cog"
              size="large"
              variant="outlined"
              @click="showSettingsDialog = true"
              class="flex-shrink-0"
            ></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Settings Dialog -->
    <v-dialog v-model="showSettingsDialog" max-width="600">
      <v-card class="dialog-solid">
        <v-card-title>Einstellungen</v-card-title>
        <v-card-text>
          <Settings @close="handleSettingsSave" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </MainNav>
</template>

<script setup lang="ts">
import catalogData from '~/content/catalog.json'

const router = useRouter()
const appStore = useAppStore()

const showSettingsDialog = ref(false)

// Category definitions with icons
const categoryDefinitions = [
  { name: 'Fischkunde', icon: 'mdi-fish' },
  { name: 'Gewässerkunde', icon: 'mdi-waves' },
  { name: 'Schutz und Pflege', icon: 'mdi-shield-check' },
  { name: 'Fanggeräte', icon: 'mdi-hook' },
  { name: 'Rechtsvorschriften', icon: 'mdi-gavel' }
]

// Build categories array with progress
const categories = computed(() => {
  return categoryDefinitions.map(cat => {
    const total = catalogData.filter((q: any) => q.category === cat.name).length
    const progress = calculateProgress(cat.name, total)
    return {
      name: cat.name,
      icon: cat.icon,
      total,
      progress
    }
  })
})

function calculateProgress(category: string, total: number) {
  let correct = 0
  let wrong = 0

  const categoryQuestions = catalogData.filter((q: any) => q.category === category)

  for (const q of categoryQuestions) {
    const answer = appStore.questionLocal[q.id]
    if (answer) {
      if (answer.correct) correct++
      else wrong++
    }
  }

  return {
    correct,
    wrong,
    unanswered: total - correct - wrong,
    total: correct + wrong
  }
}

function startRandomQuestion() {
  const categories = appStore.categoryNames
  const allowedIds = appStore.filteredQuestionIds

  if (allowedIds.length <= 0) {
    alert('Keine weiteren Fragen verfügbar, bitte Einstellungen prüfen!')
    return
  }

  // Filter questions by category and allowed IDs
  const availableQuestions = catalogData.filter((q: any) => {
    return categories.includes(q.category) && allowedIds.includes(q.id)
  })

  if (availableQuestions.length === 0) {
    alert('Keine Fragen verfügbar!')
    return
  }

  // Pick random question
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  const nextId = availableQuestions[randomIndex].id

  router.push(`/catalog/${nextId}`)
}

function handleSettingsSave() {
  showSettingsDialog.value = false
}
</script>

<style scoped>
.progress-segments {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
}

.segment {
  height: 100%;
}

.segment-success {
  background-color: #4CAF50;
}

.segment-error {
  background-color: #FF5252;
}

.segment-secondary {
  background-color: #9E9E9E;
}

.progress-text {
  position: relative;
  z-index: 1;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
