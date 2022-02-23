<template>
  <div>
    <b-form-group label="Kategorien:" v-slot="{ ariaDescribedby }">
      <b-form-checkbox-group
        id="checkbox-group-categories"
        v-model="selectedCatorgies"
        :options="optionsCategory"
        :aria-describedby="ariaDescribedby"
      ></b-form-checkbox-group>
    </b-form-group>

    <b-form-group label="Fragentypen:" v-slot="{ ariaDescribedby }">
      <b-form-checkbox-group
        id="checkbox-group-qsts"
        v-model="selectedQsts"
        :options="optionsQst"
        :aria-describedby="ariaDescribedby"
        disabled-field="notEnabled"
      ></b-form-checkbox-group>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: "Settings",
  data: function () {
    return {
      optionsCategory: [
        { text: 'Fischkunde', value: 1 },
        { text: 'Gewässerkunde', value: 2 },
        { text: 'Schutz und Pflege', value: 3 },
        { text: 'Fanggeräte', value: 4 },
        { text: 'Rechtsvorschrfiten', value: 5 }
      ],
      selectedCatorgies: [],
      optionsQst: [
        { text: 'Richtige', value: 1 },
        { text: 'Falsche', value: 2 },
        { text: 'Unbeantwortete', value: 3 },
      ],
      selectedQsts: [],
    }
  },
  async fetch() {
    this.selectedCatorgies = this.$store.state.settings.categories;
    this.selectedQsts = this.$store.state.settings.qsts;
  },
  methods: {
    saveSettings: function () {
      this.$store.commit('updateSettings', {
        categories: this.selectedCatorgies,
        qsts: this.selectedQsts
      })
    }
  }
}
</script>

<style scoped>

</style>
