<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import { toRaw } from 'vue'
import catalogData from '~/content/catalog.json'
import DataSyncHelper from '~/lib/DataSyncHelper'

// Initialize app store globally
const appStore = useAppStore()
const googleSyncStore = useGoogleSyncStore()
const config = useRuntimeConfig()

// Initialize on mount (client-side only)
onMounted(async () => {
  const questionIds = catalogData.map((q: any) => ({ id: q.id }))
  await appStore.init(questionIds)

  // Fetch client ID from server (works in production on Fly.io)
  try {
    const serverConfig = await $fetch('/api/config')
    const clientId = serverConfig.googleClientId

    console.log('[App] Initializing DataSyncHelper with clientId:', clientId ? 'present' : 'MISSING')

    if (!clientId) {
      console.error('[App] GOOGLE_CLIENT_ID is not configured on server!')
    }

    DataSyncHelper.init(clientId)
  } catch (error) {
    console.error('[App] Failed to fetch config from server:', error)
  }

  // Proactively refresh token if auto-sync is enabled and token is expired
  if (googleSyncStore.active && googleSyncStore.alreadyUsed && !googleSyncStore.isValid) {
    try {
      console.log('[App] Auto-sync enabled but token expired - refreshing proactively')
      const data = await DataSyncHelper.refreshAccessToken(googleSyncStore.refreshToken)
      googleSyncStore.refreshAccessToken(data)
      console.log('[App] Token refreshed successfully')
    } catch (error) {
      console.error('[App] Failed to refresh token on mount:', error)
    }
  }

  // Check for newer data in Google Drive on app start (if auto-sync is active)
  if (googleSyncStore.active && googleSyncStore.alreadyUsed && googleSyncStore.syncFileId) {
    try {
      console.log('[App] Checking for newer data in Google Drive...')

      // Ensure token is valid
      if (!googleSyncStore.isValid) {
        const data = await DataSyncHelper.refreshAccessToken(googleSyncStore.refreshToken)
        googleSyncStore.refreshAccessToken(data)
      }

      // Load the remote running state
      const remoteData = await DataSyncHelper.loadARunningState(
        googleSyncStore.token,
        googleSyncStore.syncFileId
      )

      // Compare timestamps
      const remoteTime = remoteData.time || 0
      const localTime = googleSyncStore.lastSync

      console.log('[App] Remote data time:', new Date(remoteTime).toLocaleString())
      console.log('[App] Local last sync:', new Date(localTime).toLocaleString())

      // If remote is newer, download it
      if (remoteTime > localTime) {
        console.log('[App] Remote data is newer - downloading...')

        const nuxtApp = useNuxtApp()

        // Clear and update local storage with remote data (strip reactivity)
        await nuxtApp.$localForage.meta.clear()
        if (remoteData.exams) {
          await nuxtApp.$localForage.meta.setItem('EXAMS', toRaw(remoteData.exams))
        }
        if (remoteData.settings) {
          await nuxtApp.$localForage.meta.setItem('SETTINGS', toRaw(remoteData.settings))
        }

        await nuxtApp.$localForage.nuxtLocalForage.clear()
        const rawLocalQuestions = toRaw(remoteData.localQuestions || {})
        for (const key of Object.keys(rawLocalQuestions)) {
          await nuxtApp.$localForage.nuxtLocalForage.setItem(key, rawLocalQuestions[key])
        }

        // Reinitialize store with downloaded data
        const questionIds = catalogData.map((q: any) => ({ id: q.id }))
        await appStore.init(questionIds, true)

        // Update last sync time
        googleSyncStore.sync()

        console.log('[App] Remote data downloaded and applied successfully')
      } else {
        console.log('[App] Local data is up to date')
      }
    } catch (error) {
      console.error('[App] Failed to check for newer data:', error)
      // Continue with local data if check fails
    }
  }

  // Start auto-sync timer
  startAutoSync()
})

// Auto-sync logic
let autoSyncInterval: NodeJS.Timeout | null = null
let lastDirtyTime = 0

function startAutoSync() {
  // Clear any existing interval
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval)
  }

  // Check every 10 seconds
  autoSyncInterval = setInterval(async () => {
    // Only proceed if auto-sync is active
    if (!googleSyncStore.active) {
      return
    }

    // If data is dirty, track when it became dirty
    if (googleSyncStore.modelDirty && lastDirtyTime === 0) {
      lastDirtyTime = Date.now()
      return
    }

    // If dirty and at least 30 seconds have passed, sync
    if (googleSyncStore.modelDirty && lastDirtyTime > 0) {
      const timeSinceDirty = Date.now() - lastDirtyTime

      if (timeSinceDirty >= 30000) { // 30 seconds
        try {
          // Dispatch sync start event
          if (import.meta.client) {
            window.dispatchEvent(new CustomEvent('sync-start'))
          }

          // Check if token is still valid
          if (!googleSyncStore.isValid) {
            const data = await DataSyncHelper.refreshAccessToken(googleSyncStore.refreshToken)
            googleSyncStore.refreshAccessToken(data)
          }

          // Create export and upload
          const nuxtApp = useNuxtApp()
          const exp = await DataSyncHelper.createExport(nuxtApp.$localForage)
          await DataSyncHelper.runningStateUpload(
            googleSyncStore.token,
            exp,
            googleSyncStore.syncFileId
          )

          // Mark as synced
          googleSyncStore.sync()
          lastDirtyTime = 0

          console.log('Auto-sync completed successfully')

          // Dispatch sync complete event
          if (import.meta.client) {
            window.dispatchEvent(new CustomEvent('sync-complete'))
          }
        } catch (error) {
          console.error('Auto-sync failed:', error)
          // Reset dirty time to retry in 30s
          lastDirtyTime = 0

          // Dispatch sync complete event even on error
          if (import.meta.client) {
            window.dispatchEvent(new CustomEvent('sync-complete'))
          }
        }
      }
    }

    // Reset lastDirtyTime if data is no longer dirty
    if (!googleSyncStore.modelDirty && lastDirtyTime > 0) {
      lastDirtyTime = 0
    }
  }, 10000) // Check every 10 seconds
}

// Cleanup on unmount
onUnmounted(() => {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval)
  }
})
</script>
