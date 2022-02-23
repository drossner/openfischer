<template>
  <b-container>
    <b-navbar toggleable="sm" type="light" class="mb-3">
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
        </b-navbar-nav>
      </b-collapse>

      <b-navbar-nav >
        <div @click="openSettings"><b-nav-item href="#" right><font-awesome-icon  role="button" :icon="['fa', 'gear']" /></b-nav-item></div>
      </b-navbar-nav>
    </b-navbar>
    <slot></slot>

    <b-modal ref="settings-modal" title="Einstellungen" hide-footer>
      <Settings ref="settings"></Settings>
      <b-button class="mt-3" variant="outline-primary" block @click="hideModal">Speichern</b-button>
    </b-modal>
  </b-container>
</template>

<script>
export default {
  name: "MainNav",
  methods: {
    openSettings: function () {
      this.$refs['settings-modal'].show();
    },
    hideModal: function () {
      this.$refs.settings.saveSettings();
      this.$refs['settings-modal'].hide();
    }
  },
  async fetch() {
    this.$store.dispatch('init').then(() => {

    })
  }
}
</script>

<style scoped>

</style>
