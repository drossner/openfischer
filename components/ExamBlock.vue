<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span>Prüfung: #{{ exam.id }}</span>
      <span class="ml-2 text-caption">{{ formatDate(exam.started) }}</span>
      <v-spacer></v-spacer>
      <v-btn icon size="small" @click="handleRemoveExam">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div class="d-flex align-center mb-2">
        <span class="text-medium-emphasis">Status: <strong>{{ msg }}</strong></span>
        <v-icon v-if="successful === 2" color="success" class="ml-2">mdi-check</v-icon>
        <v-icon v-if="successful === 1" color="error" class="ml-2">mdi-close</v-icon>
        <v-spacer></v-spacer>
        <v-btn
          v-if="exam.ended === null"
          color="primary"
          @click="navigateTo(`/exams/${exam.id}`)"
        >
          Starten
        </v-btn>
        <v-btn
          v-else
          variant="outlined"
          color="info"
          @click="showDetails = !showDetails"
        >
          Details
        </v-btn>
      </div>

      <!-- Details (Collapsible) -->
      <v-expand-transition>
        <div v-if="showDetails && exam.ended !== null">
          <v-divider class="my-3"></v-divider>

          <div class="mb-2">
            <div class="text-caption mb-1">Fischkunde</div>
            <v-progress-linear
              :model-value="exam.correctFK"
              :max="12"
              :color="exam.correctFK >= 6 ? 'success' : 'error'"
              height="25"
            >
              <strong>{{ exam.correctFK }} / 12</strong>
            </v-progress-linear>
          </div>

          <div class="mb-2">
            <div class="text-caption mb-1">Gewässerkunde</div>
            <v-progress-linear
              :model-value="exam.correctGK"
              :max="12"
              :color="exam.correctGK >= 6 ? 'success' : 'error'"
              height="25"
            >
              <strong>{{ exam.correctGK }} / 12</strong>
            </v-progress-linear>
          </div>

          <div class="mb-2">
            <div class="text-caption mb-1">Schutz und Pflege</div>
            <v-progress-linear
              :model-value="exam.correctSP"
              :max="12"
              :color="exam.correctSP >= 6 ? 'success' : 'error'"
              height="25"
            >
              <strong>{{ exam.correctSP }} / 12</strong>
            </v-progress-linear>
          </div>

          <div class="mb-2">
            <div class="text-caption mb-1">Fanggeräte</div>
            <v-progress-linear
              :model-value="exam.correctFG"
              :max="12"
              :color="exam.correctFG >= 6 ? 'success' : 'error'"
              height="25"
            >
              <strong>{{ exam.correctFG }} / 12</strong>
            </v-progress-linear>
          </div>

          <div class="mb-2">
            <div class="text-caption mb-1">Rechtsvorschriften</div>
            <v-progress-linear
              :model-value="exam.correctRV"
              :max="12"
              :color="exam.correctRV >= 6 ? 'success' : 'error'"
              height="25"
            >
              <strong>{{ exam.correctRV }} / 12</strong>
            </v-progress-linear>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>

    <v-card-actions>
      <v-progress-linear
        :model-value="correctAnswers"
        :max="60"
        :color="progressColor"
        height="30"
        class="flex-grow-1"
      >
        <strong>{{ correctAnswers }} / 60</strong>
      </v-progress-linear>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
interface Exam {
  id: number
  started: Date
  ended: Date | null
  correctFK: number
  correctGK: number
  correctSP: number
  correctFG: number
  correctRV: number
  currQst: number
}

const props = defineProps<{
  exam: Exam
}>()

const appStore = useAppStore()
const showDetails = ref(false)

// Computed
const correctAnswers = computed(() => {
  return props.exam.correctFK + props.exam.correctFG + props.exam.correctGK +
         props.exam.correctRV + props.exam.correctSP
})

const successful = computed(() => {
  if (props.exam.ended === null) return 0
  else if (
    correctAnswers.value >= 45 &&
    props.exam.correctFK >= 6 &&
    props.exam.correctFG >= 6 &&
    props.exam.correctRV >= 6 &&
    props.exam.correctSP >= 6 &&
    props.exam.correctGK >= 6
  ) {
    return 2 // Passed
  } else return 1 // Failed
})

const msg = computed(() => {
  if (successful.value === 0) return 'Nicht beendet'
  else if (successful.value === 2) return 'Bestanden'
  else return 'Nicht bestanden'
})

const progressColor = computed(() => {
  if (correctAnswers.value < 45) return 'error'
  else if (
    props.exam.correctFK < 6 ||
    props.exam.correctFG < 6 ||
    props.exam.correctRV < 6 ||
    props.exam.correctSP < 6 ||
    props.exam.correctGK < 6
  ) return 'warning'
  else return 'success'
})

// Methods
function formatDate(date: Date) {
  return new Date(date).toLocaleString('de-DE')
}

function handleRemoveExam() {
  appStore.removeExam(props.exam.id)
}
</script>

<style scoped>
.text-caption {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
