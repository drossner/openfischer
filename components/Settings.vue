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
        { text: 'Bereits richtig (noch nicht verfügbar)', value: 1, notEnabled: true },
        { text: 'Falsch (noch nicht verfügbar)', value: 2, notEnabled: true },
        { text: 'Beantwortet', value: 3 },
      ],
      selectedQsts: [],
    }
  },
  async fetch () {
    let filter = await this.$localForage.getItem("SETTINGS")
    if(filter === undefined || filter === null) {
      //defaults
      filter = {}
      filter.categories = [1, 2, 3, 4, 5, 6];
      filter.qsts = [3];
      this.$localForage.setItem("SETTINGS", filter)
    }
    this.selectedCatorgies = filter.categories;
    this.selectedQsts = filter.qsts;
  },
  methods: {
    saveSettings: function () {
      this.$localForage.getItem("SETTINGS")
      .then(filter => {
        filter.categories = this.selectedCatorgies;
        filter.qsts = this.selectedQsts;
        return filter;
      }).then(filter => this.$localForage.setItem("SETTINGS", filter));
    }
  }
}
</script>

<style scoped>

</style>
