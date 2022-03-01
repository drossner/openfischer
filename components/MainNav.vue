<template>
  <b-container>
    <b-overlay
      rounded
      opacity="0.7"
      spinner-variant="primary"
      :show="!vuexReady"
      variant="dark"
    >
    <b-navbar toggleable="md" type="dark" class="mb-3">
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
export default {
  name: "MainNav",
  methods: {

  },
  async fetch() {
    this.$store.dispatch('init').then(() => {

    })
  },
  computed: {
    vuexReady: function () {
      return this.$store.state.initialized
    }
  }
}
</script>

<style>

body {
  background-color: #212121;
  color: #e5e5e5;
}

.fa-w-16 {
  color: #e5e5e5;
}
.form-control{
  color: #e5e5e5;
  background-color: #343a40;
  border: 1px solid #212121;
}

.form-control:focus{
  color: #e5e5e5;
  background-color: #343a40;
  border: 1px solid #212121;
}

.list-group-item-dark {
  background-color: #343a40;
  color: #e5e5e5;
}

.list-group-item-danger {
  background-color: #6d070f;
  color: #e5e5e5;
}

.list-group-item-success {
  background-color: #005516;
  color: #e5e5e5;
}

.page-link {
  color: #e5e5e5 !important;
  background-color: #343a40 !important;
  border: 1px solid #212121;
}

.page-item.disabled .page-link {
  color: #e5e5e5 !important;
  background-color: #343a40 !important;
  border: 1px solid #212121;
}

</style>
