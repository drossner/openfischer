<template>
  <div>
    <!-- Categories Section -->
    <div class="mb-6">
      <div class="d-flex align-center mb-3">
        <v-icon icon="mdi-format-list-bulleted-type" color="primary" class="mr-2"></v-icon>
        <h4 class="text-h6">Kategorien</h4>
      </div>
      <p class="text-caption text-medium-emphasis mb-3">
        Wähle die Kategorien aus, die du üben möchtest
      </p>
      <v-row>
        <v-col
          v-for="option in categoryOptions"
          :key="option.value"
          cols="12"
          sm="6"
        >
          <v-card
            :class="['category-selector', { 'selected': selectedCategories.includes(option.value) }]"
            @click="toggleCategory(option.value)"
            hover
          >
            <v-card-text class="d-flex align-center pa-3">
              <v-icon :icon="option.icon" size="24" class="mr-3" :color="selectedCategories.includes(option.value) ? 'primary' : 'grey'"></v-icon>
              <span class="flex-grow-1">{{ option.text }}</span>
              <v-icon
                :icon="selectedCategories.includes(option.value) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
                :color="selectedCategories.includes(option.value) ? 'primary' : 'grey'"
              ></v-icon>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-divider class="mb-6"></v-divider>

    <!-- Question Types Section -->
    <div class="mb-6">
      <div class="d-flex align-center mb-3">
        <v-icon icon="mdi-filter-variant" color="primary" class="mr-2"></v-icon>
        <h4 class="text-h6">Fragenfilter</h4>
      </div>
      <p class="text-caption text-medium-emphasis mb-3">
        Filtere Fragen nach deinem Lernfortschritt
      </p>
      <v-row>
        <v-col
          v-for="option in questionTypeOptions"
          :key="option.value"
          cols="12"
        >
          <v-card
            :class="['question-type-selector', { 'selected': selectedQsts.includes(option.value) }]"
            @click="toggleQuestionType(option.value)"
            hover
          >
            <v-card-text class="d-flex align-center pa-3">
              <v-icon :icon="option.icon" size="24" class="mr-3" :color="option.color"></v-icon>
              <div class="flex-grow-1">
                <div class="font-weight-medium">{{ option.text }}</div>
                <div class="text-caption text-medium-emphasis">{{ option.description }}</div>
              </div>
              <v-icon
                :icon="selectedQsts.includes(option.value) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
                :color="selectedQsts.includes(option.value) ? 'primary' : 'grey'"
              ></v-icon>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-btn
      color="primary"
      size="x-large"
      prepend-icon="mdi-content-save"
      @click="saveSettings"
      block
    >
      Einstellungen speichern
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore()

const emit = defineEmits<{
  close: []
}>()

const categoryOptions = [
  { text: 'Fischkunde', value: 1, icon: 'mdi-fish' },
  { text: 'Gewässerkunde', value: 2, icon: 'mdi-waves' },
  { text: 'Schutz und Pflege', value: 3, icon: 'mdi-shield-check' },
  { text: 'Fanggeräte', value: 4, icon: 'mdi-hook' },
  { text: 'Rechtsvorschriften', value: 5, icon: 'mdi-gavel' }
]

const questionTypeOptions = [
  {
    text: 'Richtig beantwortete',
    value: 1,
    icon: 'mdi-check-circle',
    color: 'success',
    description: 'Zeige Fragen, die du korrekt beantwortet hast'
  },
  {
    text: 'Falsch beantwortete',
    value: 2,
    icon: 'mdi-close-circle',
    color: 'error',
    description: 'Zeige Fragen, die du falsch beantwortet hast'
  },
  {
    text: 'Noch nicht beantwortet',
    value: 3,
    icon: 'mdi-help-circle',
    color: 'grey',
    description: 'Zeige Fragen, die du noch nicht gesehen hast'
  }
]

const selectedCategories = ref<number[]>([])
const selectedQsts = ref<number[]>([])

// Initialize from store
onMounted(() => {
  selectedCategories.value = appStore.settings.categories || []
  selectedQsts.value = appStore.settings.qsts || []
})

// Methods
function toggleCategory(value: number) {
  const index = selectedCategories.value.indexOf(value)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(value)
  }
}

function toggleQuestionType(value: number) {
  const index = selectedQsts.value.indexOf(value)
  if (index > -1) {
    selectedQsts.value.splice(index, 1)
  } else {
    selectedQsts.value.push(value)
  }
}

function saveSettings() {
  appStore.updateSettings({
    categories: selectedCategories.value,
    qsts: selectedQsts.value
  })
  emit('close')
}
</script>

<style scoped>
.category-selector,
.question-type-selector {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.category-selector:hover,
.question-type-selector:hover {
  transform: translateY(-2px);
}

.category-selector.selected,
.question-type-selector.selected {
  border-color: rgb(var(--v-theme-primary));
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-primary), 0.1));
}

.category-selector.selected:hover,
.question-type-selector.selected:hover {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}
</style>
