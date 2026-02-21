<template>
  <MainNav>
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center mb-2">
          <v-icon icon="mdi-clipboard-check" size="40" color="primary" class="mr-3"></v-icon>
          <h3 class="text-h4">Probeprüfungen</h3>
        </div>
        <v-card class="pa-4 mb-4" color="info" variant="tonal">
          <v-card-text class="text-body-1">
            <p class="mb-2">
              <strong>📋 Prüfungsformat:</strong> 60 Fragen total (12 pro Kategorie)
            </p>
            <p class="mb-2">
              <strong>✅ Bestanden:</strong> Mindestens 45 Fragen richtig + mindestens 6 pro Kategorie
            </p>
            <p class="mb-0">
              <strong>🎯 Tipp:</strong> Simuliere echte Prüfungsbedingungen für die beste Vorbereitung!
            </p>
          </v-card-text>
        </v-card>

        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-plus-circle"
          @click="createNewExam"
          block
          class="mb-6"
        >
          Neue Probeprüfung starten
        </v-btn>
      </v-col>
    </v-row>

    <!-- No Exams State -->
    <v-row v-if="exams.length === 0">
      <v-col>
        <v-card class="pa-8 text-center">
          <v-icon icon="mdi-clipboard-text-outline" size="80" color="grey-lighten-1" class="mb-4"></v-icon>
          <h4 class="text-h5 mb-2 text-medium-emphasis">Noch keine Prüfungen</h4>
          <p class="text-body-1 text-medium-emphasis">
            Starte deine erste Probeprüfung, um dich optimal vorzubereiten!
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Exams Grid -->
    <v-row v-else>
      <v-col cols="12" md="6" lg="4" v-for="exam in sortedExams" :key="exam.id">
        <v-card class="exam-card" hover>
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon
                :icon="exam.ended ? 'mdi-check-circle' : 'mdi-progress-clock'"
                :color="exam.ended ? getStatusColor(exam) : 'warning'"
                class="mr-2"
              ></v-icon>
              <span>Prüfung #{{ exam.id }}</span>
            </div>
            <v-chip
              v-if="exam.ended"
              :color="getStatusColor(exam)"
              size="small"
            >
              {{ getStatusText(exam) }}
            </v-chip>
            <v-chip v-else color="warning" size="small">
              Laufend
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="mb-3">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Fortschritt</span>
                <span>{{ exam.currQst || 0 }} / 60</span>
              </div>
              <v-progress-linear
                :model-value="((exam.currQst || 0) / 60) * 100"
                :color="exam.ended ? getStatusColor(exam) : 'primary'"
                height="8"
                rounded
              ></v-progress-linear>
            </div>

            <div v-if="exam.ended" class="mb-3">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2">Gesamt:</span>
                <v-chip size="small" :color="getTotalScore(exam) >= 45 ? 'success' : 'error'">
                  {{ getTotalScore(exam) }} / 60
                </v-chip>
              </div>

              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <span class="text-caption">Details pro Kategorie</span>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="category-scores">
                      <div v-for="cat in categories" :key="cat.key" class="d-flex justify-space-between mb-1">
                        <span class="text-caption">{{ cat.icon }} {{ cat.name }}</span>
                        <v-chip
                          size="x-small"
                          :color="exam[cat.correctKey] >= 6 ? 'success' : 'error'"
                        >
                          {{ exam[cat.correctKey] || 0 }} / 12
                        </v-chip>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <div class="text-caption text-medium-emphasis mb-2">
              <v-icon icon="mdi-calendar" size="small" class="mr-1"></v-icon>
              Gestartet: {{ formatDate(exam.started) }}
            </div>
            <div v-if="exam.ended" class="text-caption text-medium-emphasis">
              <v-icon icon="mdi-flag-checkered" size="small" class="mr-1"></v-icon>
              Beendet: {{ formatDate(exam.ended) }}
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              v-if="!exam.ended"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-play"
              @click="continueExam(exam.id)"
              block
            >
              Fortsetzen
            </v-btn>
            <v-btn
              v-else
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              @click="deleteExam(exam.id)"
              block
            >
              Löschen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </MainNav>
</template>

<script setup lang="ts">
import catalogData from '~/content/catalog.json'

const router = useRouter()
const appStore = useAppStore()

const exams = computed(() => appStore.exams)

const sortedExams = computed(() => {
  return [...exams.value].sort((a, b) => b.id - a.id) // Newest first
})

const categories = [
  { name: 'Fischkunde', icon: '🐟', key: 'fkIds', correctKey: 'correctFK' },
  { name: 'Gewässerkunde', icon: '💧', key: 'gkIds', correctKey: 'correctGK' },
  { name: 'Schutz und Pflege', icon: '🛡️', key: 'spIds', correctKey: 'correctSP' },
  { name: 'Fanggeräte', icon: '🎣', key: 'fgIds', correctKey: 'correctFG' },
  { name: 'Rechtsvorschriften', icon: '⚖️', key: 'rvIds', correctKey: 'correctRV' }
]

function randomSelection(array: any[], count: number) {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

async function createNewExam() {
  const getQuestionsByCategory = (category: string) => {
    return catalogData.filter((q: any) => q.category === category)
  }

  const fkQuestions = randomSelection(getQuestionsByCategory('Fischkunde'), 12)
  const gkQuestions = randomSelection(getQuestionsByCategory('Gewässerkunde'), 12)
  const spQuestions = randomSelection(getQuestionsByCategory('Schutz und Pflege'), 12)
  const fgQuestions = randomSelection(getQuestionsByCategory('Fanggeräte'), 12)
  const rvQuestions = randomSelection(getQuestionsByCategory('Rechtsvorschriften'), 12)

  const newExam = {
    id: appStore.nextExamId,
    started: Date.now(),
    ended: null,
    fkIds: fkQuestions.map((q: any) => q.id),
    gkIds: gkQuestions.map((q: any) => q.id),
    spIds: spQuestions.map((q: any) => q.id),
    fgIds: fgQuestions.map((q: any) => q.id),
    rvIds: rvQuestions.map((q: any) => q.id),
    currQst: 0,
    correctFK: 0,
    correctGK: 0,
    correctSP: 0,
    correctFG: 0,
    correctRV: 0
  }

  await appStore.addExam(newExam)
  router.push(`/exams/${newExam.id}`)
}

function continueExam(id: number) {
  router.push(`/exams/${id}`)
}

async function deleteExam(id: number) {
  if (confirm('Möchtest du diese Prüfung wirklich löschen?')) {
    await appStore.removeExam(id)
  }
}

function getTotalScore(exam: any) {
  return (exam.correctFK || 0) + (exam.correctGK || 0) + (exam.correctSP || 0) +
         (exam.correctFG || 0) + (exam.correctRV || 0)
}

function getStatusColor(exam: any) {
  const total = getTotalScore(exam)
  const passedTotal = total >= 45
  const passedCategories =
    (exam.correctFK >= 6) &&
    (exam.correctGK >= 6) &&
    (exam.correctSP >= 6) &&
    (exam.correctFG >= 6) &&
    (exam.correctRV >= 6)

  return (passedTotal && passedCategories) ? 'success' : 'error'
}

function getStatusText(exam: any) {
  return getStatusColor(exam) === 'success' ? 'Bestanden ✓' : 'Nicht bestanden'
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.exam-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.exam-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 172, 193, 0.2) !important;
}

.category-scores {
  font-size: 0.875rem;
}
</style>
