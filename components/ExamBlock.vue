<template>
  <div>
    <b-card >
      <template #header >
          <h6 class="mb-0 d-inline-block">Prüfung: #{{ exam.id }}</h6>
        <span class="ml-2"><small>{{ exam.started.toLocaleString() }}</small></span>
        <span class="float-right" @click="removeExam"><font-awesome-icon  role="button" :icon="['fa', 'trash-can']" /></span>
      </template>
        <b-card-text>Status: <span v-if="exam.ended < 0">nicht</span>beendet</b-card-text>
      <b-progress max="60" :value="exam.currQst"></b-progress>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "ExamBlock",
  props: {
    exam: Object
  },
  methods: {
    removeExam: function () {
      this.$store.commit('removeExam', this.exam.id)
    }
  }
}
</script>

<style scoped>

</style>
