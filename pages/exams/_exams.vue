<template>
  <MainNav>
    <template v-if="exam.id !== undefined">
      <b-row>
        <b-col>
          <b-progress variant="info" show-value class="mb-3" max="60" :value="exam.currQst+1"></b-progress>
          <Question :question="questions[this.exam.currQst]" @checked="answered"></Question>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button :disabled="!done" block variant='secondary' @click="nextQuestion">{{ lastQuestion? "Abschließen" : "Nächste Frage" }}</b-button>
        </b-col>
      </b-row>
    </template>
  </MainNav>
</template>

<script>
export default {
  data() {
    return {
      exam: {},
      questions: [],
      done: false,
      correct: false,
    }
  },
  async fetch() {
    this.$store.dispatch('init').then(async () => {
      let exam = this.$store.getters.getExamById(parseInt(this.$route.params.exams))
      this.questions.push.apply(this.questions, await this.$content('catalog').where({id: {$in: exam.fkIds.map(obs => obs.id)}}).fetch())
      this.questions.push.apply(this.questions, await this.$content('catalog').where({id: {$in: exam.gkIds.map(obs => obs.id)}}).fetch())
      this.questions.push.apply(this.questions, await this.$content('catalog').where({id: {$in: exam.spIds.map(obs => obs.id)}}).fetch())
      this.questions.push.apply(this.questions, await this.$content('catalog').where({id: {$in: exam.fgIds.map(obs => obs.id)}}).fetch())
      this.questions.push.apply(this.questions, await this.$content('catalog').where({id: {$in: exam.rvIds.map(obs => obs.id)}}).fetch())
      this.exam = exam
    })
  },
  computed: {
    lastQuestion: function () {
      return this.exam.currQst >= 59
    }
  },
  methods: {
    nextQuestion: function () {
      let lastQ = this.lastQuestion
      this.$store.commit('examNextQuestion', {
          id: this.exam.id,
          qst: this.exam.currQst,
          correct: this.correct
        }
      )
      this.done = false
      this.correct = false
      if(lastQ) this.$router.push('/exams')
    },
    answered: function (correct) {
      this.done = true
      this.correct = correct
    }
  }
}
</script>

<style scoped>

</style>
