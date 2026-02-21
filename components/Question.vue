<template>
  <div>
    <!-- Question Header Card -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-h5">Frage {{ question.id }}</span>
          <v-chip
            :color="answeredState.color"
            :prepend-icon="answeredState.icon"
            size="default"
          >
            {{ answeredState.text }}
          </v-chip>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="handleShare">
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-subtitle>
        <v-chip
          :prepend-icon="categoryIcon"
          color="primary"
          variant="tonal"
          size="small"
        >
          {{ question.category }}
        </v-chip>
      </v-card-subtitle>

      <v-card-text>
        <p class="text-h6 font-weight-regular">{{ question.question }}</p>
      </v-card-text>
    </v-card>

    <!-- Question Image Card -->
    <v-card v-if="question.picture" class="mb-4">
      <v-img
        :src="`/img/${question.id}.jpg`"
        cover
        class="question-image"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
        </template>
      </v-img>
      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-2">
          <small>
            Die Bilder zu den Fragen sind urheberrechtlich geschützt. Die kommerzielle
            Verwertung in printform oder digital darf nur mit Genehmigung des jeweiligen
            Bildautors erfolgen.
          </small>
        </v-alert>
        <div class="text-caption">
          <a
            href="https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php"
            target="_blank"
            class="text-decoration-none"
          >
            <v-icon size="x-small" class="mr-1">mdi-open-in-new</v-icon>
            Nutzungsbedingungen und Rechteinhaber
          </a>
        </div>
      </v-card-text>
    </v-card>

    <!-- Answer Options Card -->
    <v-card>
      <v-card-title>
        <v-icon class="mr-2" color="primary">mdi-format-list-checks</v-icon>
        Antworten
      </v-card-title>
      <v-card-text>
        <v-radio-group v-model="selected" @update:model-value="handleCheck">
          <v-card
            v-for="option in options"
            :key="option.value"
            :class="getAnswerClass(option)"
            class="mb-3 answer-card"
            :elevation="selected === option.value && !checked ? 4 : 1"
            @click="selectOption(option.value)"
          >
            <v-radio
              :value="option.value"
              :disabled="checked && option.value !== selected"
              hide-details
            >
              <template v-slot:label>
                <div class="d-flex align-center py-2">
                  <!-- Always render avatar to prevent layout shift -->
                  <div class="avatar-container mr-3">
                    <v-avatar
                      v-show="checked"
                      :color="option.correct ? 'success' : (option.value === selected ? 'error' : 'grey-lighten-2')"
                      size="32"
                    >
                      <v-icon color="white">
                        {{ option.correct ? 'mdi-check' : (option.value === selected ? 'mdi-close' : 'mdi-help') }}
                      </v-icon>
                    </v-avatar>
                  </div>
                  <span
                    class="text-body-1"
                    :class="{
                      'font-weight-bold': checked && (option.value === selected || option.correct),
                      'text-success': checked && option.correct,
                      'text-error': checked && !option.correct && option.value === selected
                    }"
                  >
                    {{ option.text }}
                  </span>
                </div>
              </template>
            </v-radio>
          </v-card>
        </v-radio-group>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface Question {
  id: string
  category: string
  question: string
  correctAnswer: number
  answers: string[]
  picture: boolean
}

const props = defineProps<{
  question: Question
}>()

const emit = defineEmits<{
  checked: [correct: boolean]
}>()

const appStore = useAppStore()
const router = useRouter()

const selected = ref<number>(-1)
const checked = ref(false)

// Computed
const options = computed(() => {
  return props.question.answers.map((a, index) => ({
    text: a,
    value: index,
    correct: index === props.question.correctAnswer
  }))
})

const answeredState = computed(() => {
  const tmp = appStore.questionLocal[props.question.id] || { correct: null }
  const state: { correct: boolean | null; color: string; text: string; icon: string } = {
    correct: tmp.correct,
    color: '',
    text: '',
    icon: ''
  }

  if (state.correct === true) {
    state.color = 'success'
    state.text = 'Richtig'
    state.icon = 'mdi-check-circle'
  } else if (state.correct === false) {
    state.color = 'error'
    state.text = 'Falsch'
    state.icon = 'mdi-close-circle'
  } else {
    state.text = 'Offen'
    state.color = 'grey'
    state.icon = 'mdi-help-circle'
  }

  return state
})

const categoryIcon = computed(() => {
  const icons: Record<string, string> = {
    'Fischkunde': 'mdi-fish',
    'Gewässerkunde': 'mdi-waves',
    'Schutz und Pflege': 'mdi-shield-check',
    'Fanggeräte': 'mdi-hook',
    'Rechtsvorschriften': 'mdi-gavel'
  }
  return icons[props.question.category] || 'mdi-help-circle'
})

// Methods
function selectOption(value: number) {
  if (!checked.value) {
    selected.value = value
    // Trigger check immediately after selection
    nextTick(() => {
      handleCheck()
    })
  }
}

function getAnswerClass(option: any) {
  if (!checked.value) return ''

  if (option.correct) return 'answer-correct'
  if (option.value === selected.value && !option.correct) return 'answer-wrong'
  return 'answer-neutral'
}

function handleCheck() {
  if (selected.value === -1) return

  checked.value = true
  const correct = selected.value === props.question.correctAnswer

  appStore.answerQuestion({
    id: props.question.id,
    correct
  })

  emit('checked', correct)
}

function handleShare() {
  if (navigator.share) {
    const url = `${location.protocol}//${location.host}/catalog/${props.question.id}`
    navigator.share({
      title: `Frage ${props.question.id} (${props.question.category})`,
      text: props.question.question,
      url
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error))
  }
}

// Watch for question changes
watch(() => props.question, () => {
  checked.value = false
  selected.value = -1
})
</script>

<style scoped>
.question-image {
  max-height: 400px;
}

.answer-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.answer-card:hover {
  transform: translateY(-2px);
}

.answer-correct {
  border: 2px solid rgb(var(--v-theme-success));
  background-color: rgba(var(--v-theme-success), 0.05);
}

.answer-wrong {
  border: 2px solid rgb(var(--v-theme-error));
  background-color: rgba(var(--v-theme-error), 0.05);
}

.answer-neutral {
  opacity: 0.6;
}

/* Avatar container reserves space (32px width) to prevent layout shift */
.avatar-container {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
</style>
