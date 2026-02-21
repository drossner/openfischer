<template>
  <v-app :theme="themeStore.themeName">
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>

      <v-toolbar-title>
        <NuxtLink to="/" class="text-white text-decoration-none d-flex align-center">
          <img src="/icon.png" alt="OpenFischer Logo" class="logo-icon mr-2 mr-md-3" />
          <div>
            <!-- Mobile: Compact title -->
            <div class="text-body-1 d-md-none">OpenFischer</div>
            <!-- Desktop: Full title -->
            <div class="text-h6 d-none d-md-block">OpenFischer</div>
            <div class="text-caption d-none d-md-block" style="line-height: 1; margin-top: -2px; opacity: 0.9;">
              Bayerische Fischerprüfung
            </div>
          </div>
        </NuxtLink>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Desktop Navigation -->
      <v-btn
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :active="route.path === item.to"
        variant="text"
        :prepend-icon="item.icon"
        class="d-none d-md-inline-flex"
      >
        {{ item.title }}
      </v-btn>

      <v-btn icon @click="toggleTheme" size="small" class="ml-1">
        <v-icon>{{ themeStore.isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list density="compact" nav>
        <v-list-subheader>Navigation</v-list-subheader>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :active="route.path === item.to"
          :prepend-icon="item.icon"
          @click="drawer = false"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>

    <v-footer app>
      <v-spacer></v-spacer>
      <span>&copy; 2026 OpenFischer</span>
      <v-spacer></v-spacer>
    </v-footer>

    <!-- Sync Status Indicator -->
    <SyncStatusIndicator />
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const route = useRoute()
const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

const drawer = ref(false)

const navItems = [
  { title: 'Home', to: '/', icon: 'mdi-home' },
  { title: 'Fragenübersicht', to: '/overview', icon: 'mdi-format-list-bulleted' },
  { title: 'Prüfungen', to: '/exams', icon: 'mdi-clipboard-check' },
  { title: 'Datensicherung', to: '/sync', icon: 'mdi-cloud-sync' },
  { title: 'Info', to: '/about', icon: 'mdi-information' }
]

// Initialize Vuetify theme from store
onMounted(() => {
  vuetifyTheme.global.name.value = themeStore.themeName
})

// Watch for theme changes and update Vuetify
watch(() => themeStore.themeName, (newTheme) => {
  vuetifyTheme.global.name.value = newTheme
})

function toggleTheme() {
  themeStore.switchTheme()
}
</script>

<style scoped>
.text-white {
  color: white !important;
}

.logo-icon {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1); /* Make the teal icon white */
  transition: transform 0.2s ease;
}

/* Larger icon on desktop */
@media (min-width: 960px) {
  .logo-icon {
    height: 40px;
  }
}

.logo-icon:hover {
  transform: scale(1.05);
}
</style>
