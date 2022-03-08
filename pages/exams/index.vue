<template>
 <div>
   <b-row class="mb-5">
     <b-col>
       <h5>Probeprüfungen</h5>
       <p>Diese Seite erlaubt das Durchführen von Probeprüfungen. Diese setzen sich aus insgesamt 60 Fragen zusammen,
       12 je Themengebiet. Eine Prüfung gilt als bestanden,
       wenn mindestens 45 Fragen und in keinem Themengebiet weniger als 6 Fragen richtig beanwortet wurden.</p>
       <b-button :variant="primaryButtonVariant" block @click="addExam">Neue Probeprüfung anlegen</b-button>
     </b-col>
   </b-row>
   <b-row class="mb-5">
     <b-col>
       <b-card-group deck>
         <ExamBlock v-for="exam in exams.slice().reverse()" :key="exam.id" :exam="exam"
                    class="mb-2"></ExamBlock>
       </b-card-group>
     </b-col>
   </b-row>
 </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  computed: {
    exams: function() {
     return this.$store.state.exams
    },
    ...mapGetters('theme', ['primaryButtonVariant', 'elementVariant', 'isDark'])
  },
  methods: {
    addExam: async function () {
      //create exam
      let randX = function(array, x) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array.slice(0,x)
      }
      let FKids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Fischkunde"}}).fetch(), 12)
      let GKids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Gewässerkunde"}}).fetch(), 12)
      let SPids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Schutz und Pflege"}}).fetch(), 12)
      let FGids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Fanggeräte"}}).fetch(), 12)
      let RVids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Rechtsvorschriften"}}).fetch(), 12)
      this.$store.commit('addExam', {
        id: this.$store.getters.nextExamId,
        started: new Date(),
        ended: null,
        fkIds: FKids,
        gkIds: GKids,
        spIds: SPids,
        fgIds: FGids,
        rvIds: RVids,
        currQst: 0,
        correctFK: 0,
        correctGK: 0,
        correctSP: 0,
        correctFG: 0,
        correctRV: 0,
      })
    }
  }
}
</script>

<style scoped>

</style>
