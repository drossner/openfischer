<template>
  <div>
    <Question :question="question"></Question>
    <b-row align-h="between" class="mt-2">
      <b-col>
        <b-button block variant='secondary' @click="nextQuestion">Zufällige nächste Frage</b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  async asyncData ({ $content, params, error }) {
    const id = params.question
    const [question] = await $content({ deep: true }).where({ id: {$eq: id} }).fetch()
    console.log(question)
    if (question === null || question === undefined) {
      return error({ statusCode: 404, message: 'question not found' })
    }

    return {
      question
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
