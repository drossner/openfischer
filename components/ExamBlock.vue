<template>
  <div>
    <b-card>
      <template #header >
          <h6 class="mb-0 d-inline-flex">Prüfung: #{{ exam.id }}</h6>
        <span class="ml-2"><small>{{ exam.started.toLocaleString() }}</small></span>
        <span class="float-right ml-3" @click="removeExam"><font-awesome-icon  role="button" :icon="['fa', 'trash-can']" /></span>
      </template>
      <b-card-text> <span class="text-muted align-middle">Status: {{ msg }}</span>
        <b-button
        v-if="exam.ended < 0" class="d-inline-block float-right"
        @click="$router.push(`/exams/${exam.id}`)"
        >
          Starten
        </b-button>
        <b-button  class="d-inline-block float-right" v-else  v-b-toggle="'collapse-'+exam.id" variant="outline-info" @click.prevent>Details</b-button>
      </b-card-text>
      <b-card-text v-if="exam.ended != null">

        <b-collapse :id="'collapse-'+exam.id">
          Fischkunde <b-progress class="mb-2" show-value max="12" variant="success" :value="exam.correctFK"></b-progress>
          Gewässerkunde <b-progress class="mb-2" show-value max="12" variant="success" :value="exam.correctGK"></b-progress>
          Schutz und Pflege <b-progress class="mb-2" show-value max="12" variant="success" :value="exam.correctSP"></b-progress>
          Fanggeräte <b-progress class="mb-2" show-value max="12" variant="success" :value="exam.correctFG"></b-progress>
          Rechtsvorschriften <b-progress class="mb-2" show-value max="12" variant="success" :value="exam.correctRV"></b-progress>
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
    msg: function () {
      if(this.exam.ended < 0) return "Nicht beendet"
      else if(this.correctAnswers >= 45) {
        return "Bestanden"
      } else return "Nicht bestanden"
    },
    correctAnswers: function () {
      return this.exam.correctFK + this.exam.correctFG + this.exam.correctGK + this.exam.correctRV + this.exam.correctSP
    },
    progressVariant: function () {
      if(this.correctAnswers < 30) return "danger"
      else if(this.correctAnswers < 45) return "warning"
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
