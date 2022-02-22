<template>
  <b-container>
    <b-navbar type="light" variant="light" class="mb-3">
      <b-navbar-nav>
        <b-nav-item :to="{ path: '/' }">Home</b-nav-item>
        <b-nav-item :to="{ path: '/overview' }">Fragenübersicht</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item href="#" right><font-awesome-icon @click="openSettings" role="button" :icon="['fa', 'gear']" /></b-nav-item>
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
    let filter = await this.$localForage.getItem("SETTINGS")
    if(filter === undefined || filter === null) {
      //defaults
      filter = {}
      filter.categories = [1, 2, 3, 4, 5, 6];
      filter.qsts = [3];
      this.$localForage.setItem("SETTINGS", filter)
    }
  }
}
</script>

<style scoped>

</style>
