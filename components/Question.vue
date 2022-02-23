<template>
  <div>
    <b-row>
      <b-col>
        <h3>Frage {{ question.id }} <small><b-badge pill :variant="answeredState.variant">{{ answeredState.text }}</b-badge></small></h3>
        <small> {{question.category}} </small>
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
            button-variant="outline-dark"
          >
            <b-form-radio
              v-for="option in options"
              :key="option.text"
              :value="option.value"
              :class="{checked: checked, correct: option.correct, wrong: !option.correct}"
            >
              {{ option.text }}
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row align-h="between">
      <b-col>
        <b-button variant='primary' @click="check" :disabled="selected < 0">Prüfen</b-button>
        <b-button variant='secondary' @click="nextQuestion">Zufällige nächste Frage</b-button>
      </b-col>
      <b-col cols="1">
        <font-awesome-icon class="float-right" role="button" @click="share" :icon="['fa', 'share-nodes']" />
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
      state: {}
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
        state.text = "Noch nicht beantwortet"
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
    },
    share: function () {
      if (navigator.share) {
        navigator.share({
          title: 'Frage '+this.question.id+" ("+this.question.category+")",
          text: this.question.question,
          url: window.location.href,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      }
    },
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
        id: { $in: allowedIds , $ne: this.question.id }
      }

      this.$content('catalog')
        .where(filter)
        .only(['id']).fetch()
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

.checked {
  font-weight: bold;
}
</style>
