<template>
  <v-fade-transition>
    <v-btn
      v-if="googleSyncStore.active"
      class="sync-indicator"
      :class="{ 'syncing': isSyncing, 'clickable': googleSyncStore.modelDirty }"
      :color="statusColor"
      :icon="statusIcon"
      :size="buttonSize"
      elevation="4"
      :title="statusTooltip"
      @click="handleClick"
      :disabled="isSyncing"
    >
      <v-icon :class="{ 'rotating': isSyncing }">{{ statusIcon }}</v-icon>
      <v-tooltip activator="parent" location="top">
        {{ statusTooltip }}
      </v-tooltip>
    </v-btn>
  </v-fade-transition>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import DataSyncHelper from '~/lib/DataSyncHelper'

const googleSyncStore = useGoogleSyncStore()
const { mobile } = useDisplay()

// Track if currently syncing
const isSyncing = ref(false)

// Responsive button size
const buttonSize = computed(() => mobile.value ? 'small' : 'large')

// Compute sync status
const syncStatus = computed(() => {
  if (isSyncing.value) {
    return 'syncing'
  } else if (googleSyncStore.modelDirty) {
    return 'dirty'
  } else {
    return 'synced'
  }
})

const statusIcon = computed(() => {
  switch (syncStatus.value) {
    case 'syncing':
      return 'mdi-sync'
    case 'dirty':
      return 'mdi-timer-sand'
    case 'synced':
    default:
      return 'mdi-check-circle'
  }
})

const statusColor = computed(() => {
  switch (syncStatus.value) {
    case 'syncing':
      return 'info'
    case 'dirty':
      return 'warning'
    case 'synced':
    default:
      return 'success'
  }
})

const statusTooltip = computed(() => {
  switch (syncStatus.value) {
    case 'syncing':
      return 'Upload läuft...'
    case 'dirty':
      return 'Klicken um sofort zu synchronisieren'
    case 'synced':
    default:
      return 'Mit GoogleDrive synchronisiert'
  }
})

// Handle click to manually trigger sync when dirty
async function handleClick() {
  if (googleSyncStore.modelDirty && !isSyncing.value) {
    try {
      isSyncing.value = true
      window.dispatchEvent(new Event('sync-start'))

      // Check if token is still valid
      if (!googleSyncStore.isValid) {
        const data = await DataSyncHelper.refreshAccessToken(googleSyncStore.refreshToken)
        googleSyncStore.refreshAccessToken(data)
      }

      // Create export and upload to existing running state
      const nuxtApp = useNuxtApp()
      const exp = await DataSyncHelper.createExport(nuxtApp.$localForage)
      await DataSyncHelper.runningStateUpload(
        googleSyncStore.token,
        exp,
        googleSyncStore.syncFileId
      )

      // Mark as synced
      googleSyncStore.sync()

      console.log('Manual sync completed successfully')
      window.dispatchEvent(new Event('sync-complete'))
    } catch (error) {
      console.error('Manual sync failed:', error)
      isSyncing.value = false
      window.dispatchEvent(new Event('sync-complete'))
    }
  }
}

// Listen for sync events from app.vue
if (import.meta.client) {
  // Use a simple event bus pattern
  window.addEventListener('sync-start', () => {
    isSyncing.value = true
  })

  window.addEventListener('sync-complete', () => {
    isSyncing.value = false
  })
}
</script>

<style scoped>
.sync-indicator {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* Smaller positioning on mobile */
@media (max-width: 600px) {
  .sync-indicator {
    bottom: 12px;
    left: 12px;
  }
}

.sync-indicator:hover {
  transform: scale(1.1);
}

.sync-indicator.clickable {
  cursor: pointer;
}

.sync-indicator.clickable:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Rotate animation for syncing icon */
.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
