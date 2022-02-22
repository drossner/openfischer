<template>
  <MainNav>
    <b-row>
      <b-col>
        <h3>Frage {{ question.id }} <b-badge :variant="state.variant">{{ state.text }}</b-badge></h3>
        <small> {{question.category}} </small>
        <p>{{question.question}}</p>
      </b-col>
    </b-row>
    <b-row v-if="question.picture" class="mb-4">
      <b-col>
        <b-img :src="/img/+question.id+'.jpg'"></b-img>
        <div><small>Die Bilder zu den Fragen sind urheberrechtlich geschützt. Die kommerzielle Verwertung in printform oder digital darf nur mit Genehmigung des jeweiligen Bildautors erfolgen.</small></div>
        <div><small><a href="https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php">Nutzungsbedingungen und Rechteinhaber</a></small></div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-form-group label="Antworten" v-slot="{ ariaDescribedby }">
          <b-form-radio-group
            required
            v-model="selected"
            :aria-describedby="ariaDescribedby"
            name="radios-stacked"
            stacked
            buttons
            class="btn-block"
            button-variant="outline-secondary"
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
      checked: false,
      state: {}
    }
  },
  async fetch() {
    const state = await this.$localForage.getItem(this.question.id) || {correct: null}
    if(state.correct === true) {
      state.variant = "success"
      state.text = "Richtig"
    } else if(state.correct === false) {
      state.variant = "danger"
      state.text = "Falsch"
    } else {
      state.text = "Noch nicht beantwortet"
      state.variant = "info"
    }
    this.state = state
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
    check: async function() {
      this.checked = true
      let correct = this.selected === this.question.correctAnswer;
      let save = await this.$localForage.getItem(this.question.id) || {};
      save.correct = correct;
      await this.$localForage.setItem(this.question.id, save);
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
  color: green !important;
}

.checked.wrong {
  color: red !important
}
</style>
