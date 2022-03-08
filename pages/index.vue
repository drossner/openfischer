<template>
  <div>
    <b-row class="mb-5">
      <b-col>
        <h5>Fischkunde</h5>
        <b-progress  :max="nFK" height="3rem" show-value class="mb-3">
          <b-progress-bar :value="lCorrectFK" variant="success"></b-progress-bar>
          <b-progress-bar :value="lWrongFK" variant="danger"></b-progress-bar>
          <b-progress-bar :value="nFK - lCorrectFK - lWrongFK" variant="secondary"></b-progress-bar>
        </b-progress>
        <h5>Gewässerkunde</h5>
        <b-progress value="3" :max="nGK" height="3rem" show-value class="mb-3">
          <b-progress-bar :value="lCorrectGK" variant="success"></b-progress-bar>
          <b-progress-bar :value="lWrongGK" variant="danger"></b-progress-bar>
          <b-progress-bar :value="nGK - lCorrectGK - lWrongGK" variant="secondary"></b-progress-bar>
        </b-progress>
        <h5>Schutz und Pflege</h5>
        <b-progress value="3" :max="nSP" height="3rem" show-value class="mb-3">
          <b-progress-bar :value="lCorrectSP" variant="success"></b-progress-bar>
          <b-progress-bar :value="lWrongSP" variant="danger"></b-progress-bar>
          <b-progress-bar :value="nSP - lCorrectSP - lWrongSP" variant="secondary"></b-progress-bar>
        </b-progress>
        <h5>Fanggeräte</h5>
        <b-progress value="3" :max="nFG" height="3rem" show-value class="mb-3">
          <b-progress-bar :value="lCorrectFG" variant="success"></b-progress-bar>
          <b-progress-bar :value="lWrongFG" variant="danger"></b-progress-bar>
          <b-progress-bar :value="nFG - lCorrectFG - lWrongFG" variant="secondary"></b-progress-bar>
        </b-progress>
        <h5>Rechtsvorschriften</h5>
        <b-progress value="3" :max="nRV" height="3rem" show-value class="mb-3">
          <b-progress-bar :value="lCorrectRV" variant="success"></b-progress-bar>
          <b-progress-bar :value="lWrongRV" variant="danger"></b-progress-bar>
          <b-progress-bar :value="nRV - lCorrectRV - lWrongRV" variant="secondary"></b-progress-bar>
        </b-progress>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="d-inline-flex w-100 justify-content-between">
        <b-button class="w-100" :variant="primaryButtonVariant" @click="nextQuestion">Starte mit zufälliger Frage</b-button>
        <span class="ml-3 mt-1" @click="openSettings"><font-awesome-icon  class="align-middle" role="button" :icon="['fa', 'gear']" /></span>
      </b-col>
    </b-row>
    <b-modal centered ref="settings-modal" title="Einstellungen" hide-footer
             :header-bg-variant="elementVariant" :body-bg-variant="elementVariant" :footer-bg-variant="elementVariant">
      <Settings ref="settings"></Settings>
      <b-button class="mt-3" variant="secondary" block @click="hideModal">Speichern</b-button>
    </b-modal>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'Home',
  data: function () {
    return {
      qstDatas: [],
      nFK: 0,
      nGK: 0,
      nSP: 0,
      nFG: 0,
      nRV: 0,
      lCorrectFK: 0,
      lCorrectGK: 0,
      lCorrectSP: 0,
      lCorrectFG: 0,
      lCorrectRV: 0,
      lWrongFK: 0,
      lWrongGK: 0,
      lWrongSP: 0,
      lWrongFG: 0,
      lWrongRV: 0,
    }
  },
  methods: {
    nextQuestion: function() {
      let categories = this.$store.getters.categoryNames
      //filter for not unanswered only at the moment
      let allowedIds = this.$store.getters.filteredQuestionIds;
      if(allowedIds.length <= 0){
        alert("Keine weiteren Fragen verfügbar, bitte Einstellungen prüfen!")
        return
      }
      let filter = {
        category: {
          $in: categories
        },
        id: { $in: allowedIds }
      }

      this.$content('catalog')
        .where(filter)
        .only(['id']).fetch()
        .then(res => {
          const next = res[Math.floor(Math.random()*res.length)].id
          this.$router.push("/catalog/"+next)
        })
    },
    openSettings: function () {
      this.$refs['settings-modal'].show();
    },
    hideModal: function () {
      this.$refs.settings.saveSettings();
      this.$refs['settings-modal'].hide();
    }
  },
  async fetch() {
    let FK = await this.$content('catalog').where({category: {$eq: "Fischkunde"}}).only(['id']).fetch();
    let GK = await this.$content('catalog').where({category: {$eq: "Gewässerkunde"}}).only(['id']).fetch();
    let SP = await this.$content('catalog').where({category: {$eq: "Schutz und Pflege"}}).only(['id']).fetch();
    let FG = await this.$content('catalog').where({category: {$eq: "Fanggeräte"}}).only().fetch(['id']);
    let RV = await this.$content('catalog').where({category: {$eq: "Rechtsvorschriften"}}).only(['id']).fetch();
    this.nFK = FK.length;
    this.nGK = GK.length;
    this.nSP = SP.length;
    this.nFG = FG.length;
    this.nRV = RV.length;

    //const localAnswered = await this.$localForage.keys();

    this.$localForage.iterate((value, key, i) => {
      if(key.startsWith("1") || key.startsWith("B1")) {
        if(value.correct) this.lCorrectFK++;
        else this.lWrongFK++
      } else if(key.startsWith("2") || key.startsWith("B2")) {
        if(value.correct) this.lCorrectGK++;
        else this.lWrongGK++
      } else if(key.startsWith("3")) {
        if(value.correct) this.lCorrectSP++;
        else this.lWrongSP++
      } else if(key.startsWith("4") || key.startsWith("B4") || key.startsWith("B3")) {
        if(value.correct) this.lCorrectFG++;
        else this.lWrongFG++
      } else if(key.startsWith("5") || key.startsWith("B5")) {
        if(value.correct) this.lCorrectRV++;
        else this.lWrongRV++
      }
    });

  },
  computed: {
    ...mapGetters('theme', ['primaryButtonVariant', 'elementVariant', 'isDark'])
  }
}
</script>

