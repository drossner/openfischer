<template>
  <MainNav>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h3 class="text-h4 mb-2">Fragenübersicht</h3>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ allData.length }} von {{ catalogData.length }} Fragen
          <span v-if="searchText"> · Suche: "{{ searchText }}"</span>
        </p>
      </v-col>
    </v-row>

    <!-- Search & Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchText"
          placeholder="Fragen durchsuchen..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="handleSearch"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedCategory"
          :items="categoryItems"
          label="Kategorie"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="handleSearch"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Status Filter Chips -->
    <v-row class="mb-4">
      <v-col>
        <v-chip-group v-model="statusFilter" filter>
          <v-chip value="all" variant="outlined">
            <v-icon start icon="mdi-format-list-bulleted"></v-icon>
            Alle
          </v-chip>
          <v-chip value="unanswered" variant="outlined" color="grey">
            <v-icon start icon="mdi-help-circle"></v-icon>
            Unbeantwortete
          </v-chip>
          <v-chip value="correct" variant="outlined" color="success">
            <v-icon start icon="mdi-check-circle"></v-icon>
            Richtige
          </v-chip>
          <v-chip value="wrong" variant="outlined" color="error">
            <v-icon start icon="mdi-close-circle"></v-icon>
            Falsche
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Pagination Top -->
    <v-row class="mb-3">
      <v-col>
        <v-pagination
          v-model="currentPage"
          :length="numberOfPages"
          :total-visible="7"
          density="comfortable"
        ></v-pagination>
      </v-col>
    </v-row>

    <!-- Question List -->
    <v-row>
      <v-col>
        <v-card v-if="shownData.length === 0" class="pa-8 text-center">
          <v-icon size="64" color="grey" class="mb-4">mdi-file-search</v-icon>
          <h4 class="text-h6 mb-2">Keine Fragen gefunden</h4>
          <p class="text-medium-emphasis">Versuche es mit einer anderen Suche oder Filter.</p>
        </v-card>

        <v-list v-else lines="two" class="question-list">
          <v-list-item
            v-for="qst in shownData"
            :key="qst.id"
            :to="`/catalog/${qst.id}`"
            class="question-item mb-2"
            rounded="lg"
            :prepend-icon="qst.statusIcon"
            :class="qst.statusClass"
          >
            <template v-slot:prepend>
              <v-avatar :color="qst.statusColor" size="40">
                <v-icon :icon="qst.statusIcon" color="white"></v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="mb-1">
              <span class="text-primary font-weight-bold">{{ qst.id }}</span>
              {{ truncateText(qst.question, 120) }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <v-chip size="small" variant="tonal" color="primary" class="mr-2">
                {{ qst.category }}
              </v-chip>
              <v-chip
                v-if="qst.image"
                size="small"
                variant="tonal"
                color="info"
                prepend-icon="mdi-image"
              >
                Bild
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <!-- Pagination Bottom -->
    <v-row class="mt-4">
      <v-col>
        <v-pagination
          v-model="currentPage"
          :length="numberOfPages"
          :total-visible="7"
          density="comfortable"
        ></v-pagination>
      </v-col>
    </v-row>
  </MainNav>
</template>

<script setup lang="ts">
import catalogData from '~/content/catalog.json'

const appStore = useAppStore()
const route = useRoute()

const searchText = ref('')
const selectedCategory = ref<string | null>(null)
const statusFilter = ref('all')
const currentPage = ref(1)
const pageLimit = 20

// Category options
const categoryItems = [
  { title: 'Alle Kategorien', value: null },
  { title: 'Fischkunde', value: 'Fischkunde' },
  { title: 'Gewässerkunde', value: 'Gewässerkunde' },
  { title: 'Schutz und Pflege', value: 'Schutz und Pflege' },
  { title: 'Fanggeräte', value: 'Fanggeräte' },
  { title: 'Rechtsvorschriften', value: 'Rechtsvorschriften' }
]

// Initialize search from query param
onMounted(() => {
  const term = route.query.term as string
  if (term) {
    searchText.value = term
  }
})

// Filter questions by search text, category, and status
const allData = computed(() => {
  let filtered = catalogData

  // Filter by search text
  if (searchText.value) {
    const regex = new RegExp(searchText.value, 'i')
    filtered = filtered.filter((q: any) => regex.test(q.question))
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((q: any) => q.category === selectedCategory.value)
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((q: any) => {
      const save = appStore.questionLocal[q.id]
      if (statusFilter.value === 'unanswered') {
        return !save
      } else if (statusFilter.value === 'correct') {
        return save && save.correct
      } else if (statusFilter.value === 'wrong') {
        return save && !save.correct
      }
      return true
    })
  }

  return filtered
})

// Paginated data
const shownData = computed(() => {
  const beginSlice = (currentPage.value - 1) * pageLimit
  const pageData = allData.value.slice(beginSlice, beginSlice + pageLimit)

  // Add visual properties based on answer status
  return pageData.map((qst: any) => {
    const save = appStore.questionLocal[qst.id]
    let statusColor = 'grey'
    let statusIcon = 'mdi-help-circle'
    let statusClass = ''

    if (!save) {
      statusColor = 'grey'
      statusIcon = 'mdi-help-circle'
      statusClass = 'question-unanswered'
    } else if (save.correct) {
      statusColor = 'success'
      statusIcon = 'mdi-check-circle'
      statusClass = 'question-correct'
    } else {
      statusColor = 'error'
      statusIcon = 'mdi-close-circle'
      statusClass = 'question-wrong'
    }

    return { ...qst, statusColor, statusIcon, statusClass }
  })
})

const numberOfPages = computed(() => {
  return Math.ceil(allData.value.length / pageLimit)
})

function handleSearch() {
  currentPage.value = 1 // Reset to first page on search
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.question-list {
  background: transparent !important;
}

.question-item {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.v-theme--dark .question-item {
  background: #1E1E1E;
  border-color: rgba(255, 255, 255, 0.08);
}

.question-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 172, 193, 0.15) !important;
  border-color: rgba(0, 172, 193, 0.3);
}

.question-unanswered {
  border-left: 4px solid #9E9E9E;
}

.question-correct {
  border-left: 4px solid #4CAF50;
}

.question-wrong {
  border-left: 4px solid #EF5350;
}
</style>
