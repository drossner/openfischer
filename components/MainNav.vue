<template>
  <v-container class="mb-5">
    <v-overlay
      :model-value="!initialized"
      class="align-center justify-center"
      persistent
    >
      <div class="text-center">
        <p class="mb-4">Lokale Daten werden in den Speicher geladen...</p>
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>
    </v-overlay>

    <slot></slot>
  </v-container>
</template>

<script setup lang="ts">
const appStore = useAppStore()

const initialized = computed(() => appStore.initialized)
</script>
