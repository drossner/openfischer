<template>
  <div>
    <b-row>
      <b-col>
        <h4 class="d-inline-flex">Frage {{ question.id }} <small><b-badge class="ml-2" pill :variant="answeredState.variant">{{ answeredState.text }}</b-badge></small></h4>
        <span class="ml-2 mt-1 float-right"><font-awesome-icon class="align-middle" role="button" @click="share" :icon="['fa', 'share-nodes']" /></span>
        <small class="d-block"> {{question.category}} </small>
        <p>{{question.question}}</p>
      </b-col>
    </b-row>
    <b-row v-if="question.picture" class="mb-4">
      <b-col>
        <b-img :src="'img/'+question.id+'.jpg'"></b-img>
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
            button-variant="dark"
            size="lg"
          >
            <b-form-radio
              v-for="option in options"
              :key="option.valueAsNumber"
              :value="option.value"
              :class="{checked: checked, correct: option.correct, wrong: !option.correct}"
              @change="check"
              :disabled="checked && option.value !== selected"
            >
              {{ option.text }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "Question",
  props: ['question'],
  data: function () {
    return {
      selected: -1,
      checked: false,
      //state: {}
    }
  },
  computed: {
    options: function() {
      return this.question.answers.map((a, index) =>  {
        return {
          text: a, value: index, correct: index === this.question.correctAnswer
        }
      })
    },
    answeredState: function () {
      const tmp = this.$store.state.questionLocal[this.question.id] || {correct: null}
      let state = { correct: tmp.correct }
      if(state.correct === true) {
        state.variant = "success"
        state.text = "Richtig"
      } else if(state.correct === false) {
        state.variant = "danger"
        state.text = "Falsch"
      } else {
        state.text = "Offen"
        state.variant = "secondary"
      }
      return state
    }
  },
  methods: {
    check: function() {
      this.checked = true
      let correct = this.selected === this.question.correctAnswer;
      this.$store.commit('answerQuestion', {
        id: this.question.id,
        correct: correct
      })
      this.$emit("checked", correct)
    },
    share: function () {
      if (navigator.share) {
        navigator.share({
          title: 'Frage '+this.question.id+" ("+this.question.category+")",
          text: this.question.question,
          url: location.protocol + "//" + location.host + this.$router.resolve({
            name: 'catalog-question',
            params: { question: this.question.id }
          }).href,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      }
    },
  },
  watch: {
    question: function () {
      this.checked = false
      this.selected = -1
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

.checked {
  font-weight: bold;
}
</style>
