<template>
  <MainNav>
    <b-row>
      <b-col>
        <p>{{question.question}}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form-group label="Antworten" v-slot="{ ariaDescribedby }">
          <b-form-radio-group
            required
            v-model="selected"
            :aria-describedby="ariaDescribedby"
            name="radios-stacked"
            stacked
          >
            <b-form-radio
              v-for="option in options"
              :key="option.text"
              :value="option.value"
              :disabled="option.disabled"
              :class="{checked: checked, correct: option.correct, wrong: !option.correct}"
            >
              {{ option.text }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-button variant='primary' @click="check" :disabled="selected < 0">Prüfen</b-button>
        <b-button variant='secondary' @click="nextQuestion">Zufällige nächste Frage</b-button>
      </b-col>
    </b-row>
  </MainNav>
</template>

<script>
export default {
  name: "Question",
  props: ['question'],
  data: function () {
    return {
      selected: -1,
      checked: false
    }
  },
  computed: {
    options: function() {
      return this.question.answers.map((a, index) =>  {
        return {
          text: a, value: index, correct: index === this.question.correctAnswer
        }
      })
    }
  },
  methods: {
    check: function() {
      this.checked = true
    },
    nextQuestion: function() {
      this.$content('catalog').where({ id: {$ne: this.question.id} }).only(['id']).fetch()
      .then(res => {
        const next = res[Math.floor(Math.random()*res.length)].id
        this.$router.push("/catalog/"+next)
      })
    }
  }
}
</script>

<style scoped>
.checked.correct {
  color: green
}

.checked.wrong {
  color: red
}
</style>
