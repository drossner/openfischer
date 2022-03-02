<template>
  <div>
    <b-card bg-variant="dark">
      <template #header >
          <h6 class="mb-0 d-inline-flex">Prüfung: #{{ exam.id }}</h6>
        <span class="ml-2"><small>{{ exam.started.toLocaleString() }}</small></span>
        <span class="float-right ml-3" @click="removeExam"><font-awesome-icon  role="button" :icon="['fa', 'trash-can']" /></span>
      </template>
      <b-card-text>
        <span class="mr-2 text-muted align-middle">Status: <b>{{ msg }}</b></span>
        <span v-if="successful === 2" class="mr-4"><font-awesome-icon  :icon="['fa', 'check']" /></span>
        <span v-if="successful === 1" class="mr-4"><font-awesome-icon  :icon="['fa', 'x']" /></span>
        <b-button class="d-inline-block float-right"
        v-if="exam.ended === null"
        @click="$router.push(`/exams/${exam.id}`)"
        >Starten</b-button>
        <b-button  class="d-inline-block float-right" v-else  v-b-toggle="'collapse-'+exam.id" variant="outline-info" @click.prevent>Details</b-button>
      </b-card-text>
      <b-card-text v-if="exam.ended !== null">

        <b-collapse :id="'collapse-'+exam.id">
          Fischkunde <b-progress class="mb-2" show-value max="12" :variant="exam.correctFK >= 6? 'success' : 'danger'" :value="exam.correctFK"></b-progress>
          Gewässerkunde <b-progress class="mb-2" show-value max="12" :variant="exam.correctGK >= 6? 'success' : 'danger'" :value="exam.correctGK"></b-progress>
          Schutz und Pflege <b-progress class="mb-2" show-value max="12" :variant="exam.correctSP >= 6? 'success' : 'danger'" :value="exam.correctSP"></b-progress>
          Fanggeräte <b-progress class="mb-2" show-value max="12" :variant="exam.correctFG >= 6? 'success' : 'danger'" :value="exam.correctFG"></b-progress>
          Rechtsvorschriften <b-progress class="mb-2" show-value max="12" :variant="exam.correctRV >= 6? 'success' : 'danger'":value="exam.correctRV"></b-progress>
        </b-collapse>
      </b-card-text>
    <template #footer>
      <b-progress class="ml-2" show-value block max="60" :value="correctAnswers"  :variant="progressVariant">
      </b-progress>
    </template>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "ExamBlock",
  props: {
    exam: Object
  },
  data: function () {
    return {

    }
  },
  computed: {
    successful: function() {
      if(this.exam.ended === null) return 0
      else if(this.correctAnswers >= 45 && this.exam.correctFK >= 6 && this.exam.correctFG >= 6 && this.exam.correctRV >= 6 && this.exam.correctSP >= 6) {
        return 2
      } else return 1
    },
    msg: function () {
      if(this.successful === 0) return "Nicht beendet"
      else if(this.successful === 2) {
        return "Bestanden"
      } else return "Nicht bestanden"
    },
    correctAnswers: function () {
      return this.exam.correctFK + this.exam.correctFG + this.exam.correctGK + this.exam.correctRV + this.exam.correctSP
    },
    progressVariant: function () {
      if(this.correctAnswers < 45) return "danger"
      else if(this.exam.correctFK < 6 || this.exam.correctFG < 6 || this.exam.correctRV < 6 || this.exam.correctSP < 6) return "warning"
      else return "success"
    }
  },
  methods: {
    removeExam: function () {
      this.$store.commit('removeExam', this.exam.id)
    }
  }
}
</script>

<style scoped>
.progress-label {
  float: left;
  margin-right: 1em;
}
</style>
