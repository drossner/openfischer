<template>
 <MainNav>
   <b-row class="mb-5">
     <b-col>
       <h5>Probeprüfungen</h5>
       <p>Diese Seite erlaubt das Durchführen von Probeprüfungen. Diese setzen sich aus insgesamt 60 Fragen zusammen,
       12 je Themengebiet. Eine Prüfung gilt als bestanden,
       wenn mindestens 45 Fragen richtig beanwortet wurden.</p>
       <p><small>Die Funktion steht aktuell noch nicht zur Verfügung.</small></p>
       <b-button variant="primary" block @click="addExam">Neue Probeprüfung starten</b-button>
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
 </MainNav>
</template>

<script>
export default {
  name: "Exams",
  computed: {
    exams: function() {
     return this.$store.state.exams
    }
  },
  methods: {
    addExam: async function () {
      //create exam
      let randX = function(arr, x) {
        return arr.sort(() => .5 - Math.random()).slice(0,x)
      }
      let FKids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Fischkunde"}}).fetch(), 12)
      let GKids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Gewässerkunde"}}).fetch(), 12)
      let SPids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Schutz und Pflege"}}).fetch(), 12)
      let FGids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Fanggeräte"}}).fetch(), 12)
      let RVids = randX(await this.$content('catalog').only(['id']).where({category: {$eq: "Rechtsvorschriften"}}).fetch(), 12)
      this.$store.commit('addExam', {
        id: this.exams.length + 1,
        started: new Date(),
        ended: -1,
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
