<template>
  <MainNav>
    <div>
      <!-- Header Section -->
      <v-row class="mb-4">
        <v-col>
          <div class="d-flex align-center mb-2">
            <v-icon icon="mdi-cloud-sync" size="40" color="primary" class="mr-3"></v-icon>
            <h3 class="text-h4">Datensicherung</h3>
          </div>

          <v-card class="pa-4 mb-4" color="info" variant="tonal">
            <v-card-text>
              <p class="mb-2">
                <v-icon icon="mdi-cloud" size="small" class="mr-1"></v-icon>
                Synchronisiere deinen Lernfortschritt über mehrere Geräte mit Google Drive
              </p>
              <p class="mb-0 text-caption">
                <v-icon icon="mdi-shield-lock" size="small" class="mr-1"></v-icon>
                Sichere Anbindung - Zugriff nur auf App-spezifische Daten, nicht auf deine anderen Drive-Dateien
              </p>
            </v-card-text>
          </v-card>

          <!-- Login Status Card -->
          <v-card v-if="authenticated" class="mb-4" color="success" variant="tonal">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-check-circle" class="mr-2"></v-icon>
              Angemeldet
            </v-card-title>
            <v-card-text>
              <p class="mb-2">
                Token Status:
                <v-chip
                  :color="tokenValid ? 'success' : 'warning'"
                  size="small"
                  class="ml-2"
                >
                  {{ tokenValid ? 'Gültig ✓' : 'Abgelaufen' }}
                </v-chip>
              </p>
              <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-logout"
                @click="logout"
              >
                Abmelden
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Login Button -->
          <v-card v-else class="pa-6 text-center">
            <v-icon icon="mdi-google" size="60" color="grey-lighten-1" class="mb-3"></v-icon>
            <h4 class="text-h6 mb-2">Noch nicht angemeldet</h4>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Melde dich mit Google an, um deine Daten zu synchronisieren
            </p>
            <v-btn
              color="primary"
              size="x-large"
              prepend-icon="mdi-google"
              @click="login"
            >
              Mit Google anmelden
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sync Modes Info -->
      <v-row v-if="authenticated" class="mb-4">
        <v-col cols="12" md="6">
          <v-card class="h-100" color="primary" variant="tonal">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-sync" class="mr-2"></v-icon>
              Automatische Synchronisation
            </v-card-title>
            <v-card-text>
              <p class="mb-2">Automatischer Abgleich im Hintergrund</p>
              <div class="sync-status-legend">
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" color="success" class="mr-2">mdi-check-circle</v-icon>
                  <span class="text-caption">Synchronisiert</span>
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" color="warning" class="mr-2">mdi-timer-sand</v-icon>
                  <span class="text-caption">Wartet auf Sync</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="info" class="mr-2">mdi-sync</v-icon>
                  <span class="text-caption">Upload läuft</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="h-100" color="secondary" variant="tonal">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-hand-pointing-up" class="mr-2"></v-icon>
              Manuelle Synchronisation
            </v-card-title>
            <v-card-text>
              <p class="mb-2">Hoch- und Herunterladen per Klick</p>
              <v-alert type="warning" density="compact" variant="tonal">
                Herunterladen überschreibt lokale Daten!
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <template v-if="authenticated">
        <!-- Auto-Sync Toggle -->
        <v-row class="mb-4">
          <v-col>
            <v-card class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon
                    :icon="autoSyncActive ? 'mdi-sync' : 'mdi-sync-off'"
                    :color="autoSyncActive ? 'success' : 'grey'"
                    class="mr-3"
                    size="large"
                  ></v-icon>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">Automatische Synchronisation</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ autoSyncActive ? 'Aktiv - Änderungen werden automatisch gesichert' : 'Deaktiviert - Nur manuelle Synchronisation' }}
                    </div>
                  </div>
                </div>
                <v-switch
                  v-model="autoSyncActive"
                  color="primary"
                  hide-details
                  inset
                ></v-switch>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Manual Sync Controls -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-cloud-download"
              :disabled="loadingData || autoSyncActive"
              :loading="loadingData"
              @click="getData"
              block
            >
              Daten von Drive laden
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              color="secondary"
              size="large"
              prepend-icon="mdi-cloud-upload"
              :disabled="uploadingData || autoSyncActive"
              :loading="uploadingData"
              @click="upload"
              block
            >
              Lokalen Stand hochladen
            </v-btn>
          </v-col>
        </v-row>

        <!-- Saved Files List -->
        <v-row v-if="appDataFiles.length > 0">
          <v-col>
            <h4 class="text-h6 mb-3">
              <v-icon icon="mdi-folder-google-drive" class="mr-2"></v-icon>
              Gespeicherte Daten ({{ appDataFiles.length }})
            </h4>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
            v-for="appData in appDataFiles"
            :key="appData.id"
          >
            <v-card class="sync-file-card" hover>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-file-document" color="primary" class="mr-2"></v-icon>
                <span class="text-subtitle-1">{{ appData.name }}</span>
              </v-card-title>

              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon icon="mdi-calendar" size="small" class="mr-2"></v-icon>
                  <span class="text-body-2">{{ formatDate(appData.data.time) }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon icon="mdi-help-circle" size="small" class="mr-2"></v-icon>
                  <span class="text-body-2">
                    {{ Object.keys(appData.data.localQuestions).length }} beantwortete Fragen
                  </span>
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  v-if="!autoSyncActive"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-download"
                  @click="useSave(appData.data)"
                  class="flex-grow-1"
                >
                  Herunterladen
                </v-btn>
                <v-btn
                  v-if="!autoSyncActive"
                  color="error"
                  variant="text"
                  icon="mdi-delete"
                  @click="removeSave(appData.id)"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-row v-if="appDataFiles.length === 0 && !loadingData">
          <v-col>
            <v-card class="pa-8 text-center">
              <v-icon icon="mdi-cloud-off-outline" size="60" color="grey-lighten-1" class="mb-3"></v-icon>
              <p class="text-body-1 text-medium-emphasis">
                Noch keine Sicherungen in Drive gefunden
              </p>
              <p class="text-caption text-medium-emphasis">
                Klicke auf "Daten von Drive laden", um verfügbare Sicherungen anzuzeigen
              </p>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Sync Conflict Dialog -->
      <v-dialog v-model="showSyncDialog" max-width="600">
        <v-card class="dialog-solid">
          <v-card-title>Achtung!</v-card-title>
          <v-card-text>
            <p class="mb-4">
              Auf diesem Account besteht bereits ein synchronisierter Fortschritt.
              Was möchtest du tun?
            </p>
            <v-alert type="info" variant="tonal" density="compact" class="mb-2">
              <strong>GoogleDrive übernehmen:</strong> Lädt den Fortschritt von GoogleDrive herunter und überschreibt den lokalen Stand
            </v-alert>
            <v-alert type="warning" variant="tonal" density="compact">
              <strong>Lokal übernehmen:</strong> Lädt den lokalen Fortschritt zu GoogleDrive hoch und überschreibt den Remote-Stand
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-row>
              <v-col cols="12" sm="6">
                <v-btn
                  color="primary"
                  block
                  size="large"
                  prepend-icon="mdi-cloud-download"
                  @click="handleSyncConflict(false)"
                >
                  GoogleDrive übernehmen
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn
                  color="warning"
                  block
                  size="large"
                  prepend-icon="mdi-upload"
                  @click="handleSyncConflict(true)"
                >
                  Lokal übernehmen
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </MainNav>
</template>

<script setup lang="ts">
import { toRaw } from 'vue'
import DataSyncHelper from '~/lib/DataSyncHelper'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const googleSyncStore = useGoogleSyncStore()
const config = useRuntimeConfig()

// Initialize DataSyncHelper with client ID from server
onMounted(async () => {
  try {
    const serverConfig = await $fetch('/api/config')
    DataSyncHelper.init(serverConfig.googleClientId)
  } catch (error) {
    console.error('[Sync] Failed to fetch config from server:', error)
  }
})

// State
const appDataFiles = ref<any[]>([])
const loadingData = ref(false)
const uploadingData = ref(false)
const showSyncDialog = ref(false)
const pendingSyncFiles = ref<any[]>([])

// Computed
const authenticated = computed(() => googleSyncStore.alreadyUsed)
const tokenValid = computed(() => googleSyncStore.isValid)

const autoSyncActive = computed({
  get() {
    return googleSyncStore.active
  },
  async set(value: boolean) {
    if (value) {
      // Turn on auto-sync
      if (!tokenValid.value) {
        const data = await DataSyncHelper.refreshAccessToken(googleSyncStore.refreshToken)
        googleSyncStore.refreshAccessToken(data)
      }

      const res = await DataSyncHelper.loadRunningState(googleSyncStore.token)
      console.log(`There are ${res.files.length} running states in gdrive`)

      if (res.files.length > 0) {
        // Show conflict dialog
        pendingSyncFiles.value = res.files
        showSyncDialog.value = true
      } else {
        // Fresh sync - create new running state
        await createFreshSync()
      }
    } else {
      googleSyncStore.setState(false)
    }
  }
})

// Handle OAuth callback
onMounted(async () => {
  const code = route.query.code as string

  if (code && !googleSyncStore.alreadyUsed) {
    try {
      const redirectUri = `${window.location.protocol}//${window.location.host}${route.path}`
      const res = await DataSyncHelper.handleAccessToken(code, redirectUri)
      googleSyncStore.login(res)

      // Remove code from URL
      router.replace({ query: {} })
    } catch (error) {
      console.error('OAuth error:', error)
    }
  }
})

// Methods
function login() {
  const redirectUri = `${window.location.protocol}//${window.location.host}${route.path}`
  DataSyncHelper.forwardToLogin(redirectUri)
}

function logout() {
  googleSyncStore.logout()
}

async function getData() {
  if (!tokenValid.value) {
    const data = await DataSyncHelper.refreshAccessToken(googleSyncStore.refreshToken)
    googleSyncStore.refreshAccessToken(data)
  }

  appDataFiles.value = []
  loadingData.value = true

  const list = await DataSyncHelper.loadConfig(googleSyncStore.token)

  for (const meta of list.files) {
    const theConf = await DataSyncHelper.loadAConfig(googleSyncStore.token, meta.id)
    appDataFiles.value.push({
      id: meta.id,
      name: meta.name,
      data: theConf
    })
  }

  loadingData.value = false
}

async function removeSave(fileId: string) {
  await DataSyncHelper.deleteAConfig(googleSyncStore.token, fileId)
  const index = appDataFiles.value.findIndex(appData => appData.id === fileId)
  if (index > -1) {
    appDataFiles.value.splice(index, 1)
  }
}

async function upload() {
  uploadingData.value = true
  const nuxtApp = useNuxtApp()
  const exp = await DataSyncHelper.createExport(nuxtApp.$localForage)
  await DataSyncHelper.storeFile(googleSyncStore.token, 'config.json', exp)
  uploadingData.value = false
}

async function useSave(data: any) {
  const nuxtApp = useNuxtApp()

  // Strip Vue reactivity using toRaw
  const rawExams = toRaw(data.exams)
  const rawSettings = toRaw(data.settings)
  const rawLocalQuestions = toRaw(data.localQuestions)

  await nuxtApp.$localForage.meta.clear()
  await nuxtApp.$localForage.meta.setItem('EXAMS', rawExams)
  await nuxtApp.$localForage.meta.setItem('SETTINGS', rawSettings)

  await nuxtApp.$localForage.nuxtLocalForage.clear()

  for (const key of Object.keys(rawLocalQuestions)) {
    await nuxtApp.$localForage.nuxtLocalForage.setItem(key, rawLocalQuestions[key])
  }

  // Reinitialize store with new data
  const catalogData = await import('~/content/catalog.json')
  const questionIds = catalogData.default.map((q: any) => ({ id: q.id }))
  await appStore.init(questionIds, true)

  router.push('/')
}

async function handleSyncConflict(overwriteRemote: boolean) {
  showSyncDialog.value = false

  if (overwriteRemote) {
    // Local -> Remote
    await DataSyncHelper.removeRunningState(googleSyncStore.token, pendingSyncFiles.value)
    await createFreshSync()
  } else {
    // Remote -> Local
    const firstFile = pendingSyncFiles.value[0]
    const data = await DataSyncHelper.loadAConfig(googleSyncStore.token, firstFile.id)
    googleSyncStore.setFileId(firstFile.id)
    googleSyncStore.sync()
    googleSyncStore.setState(true)
    await useSave(data)
  }
}

async function createFreshSync() {
  const nuxtApp = useNuxtApp()
  const exp = await DataSyncHelper.createExport(nuxtApp.$localForage)
  const newRunningState = await DataSyncHelper.createNewRunningState(googleSyncStore.token)
  await DataSyncHelper.runningStateUpload(googleSyncStore.token, exp, newRunningState.id)
  googleSyncStore.setFileId(newRunningState.id)
  googleSyncStore.sync()
  googleSyncStore.setState(true)
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
.sync-file-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.sync-file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 172, 193, 0.15) !important;
}

.sync-status-legend {
  font-size: 0.875rem;
}
</style>
