<template>
  <b-container>
    <b-overlay
      rounded
      opacity="0.7"
      spinner-variant="primary"
      :show="!vuexReady"
      :variant="elementVariant"
    >
    <b-navbar toggleable="md" :type="elementVariant" class="mb-3">
      <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>
      <b-navbar-brand :to="{ path: '/' }">
        <b-img width="50"  :src="'icon.png'"></b-img>
        OpenFischer
      </b-navbar-brand>
      <b-collapse id="nav-text-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :active="$nuxt.$route.path === '/'" :to="{ path: '/' }">Home</b-nav-item>
          <b-nav-item :active="$nuxt.$route.path === '/overview'" :to="{ path: '/overview' }">Fragenübersicht</b-nav-item>
          <b-nav-item :active="$nuxt.$route.path === '/exams'" :to="{ path: '/exams' }">Prüfungen</b-nav-item>
          <b-nav-item :active="$nuxt.$route.path === '/sync'" :to="{ path: '/sync' }">Datensicherung</b-nav-item>
          <b-nav-item :active="$nuxt.$route.path === '/about'" :to="{ path: '/about' }">Info</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <span v-if="isDark" @click="changeTheme"><font-awesome-icon  role="button" :icon="['fa', 'sun']" /></span>
          <span v-else @click="changeTheme"><font-awesome-icon  role="button" :icon="['fa', 'moon']" /></span>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

      <slot></slot>

      <template #overlay>
        <div class="text-center">
          <p>Lokale Daten werden in den Speicher geladen...</p>
          <b-spinner></b-spinner>
        </div>
      </template>
    </b-overlay>
  </b-container>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: "MainNav",
  head() {
    return {
      link: [
        {
          rel: "stylesheet",
          href: this.theme
        }
      ]
    };
  },
  methods: {
    changeTheme: function () {
      this.$store.commit('theme/switchTheme')
    }
  },
  async fetch() {
    this.$store.dispatch('init').then(() => {

    })
  },
  computed: {
    vuexReady: function () {
      return this.$store.state.initialized
    },
    theme: function () {
      if(this.isDark) return 'dark.css'
      else return 'light.css'
    },
    ...mapGetters('theme', ['primaryButtonVariant', 'elementVariant', 'isDark'])
  }
}
</script>

<style scoped>



</style>
