<template>
 <MainNav>
   <b-row class="mb-5">
     <b-col>
       <h5>Probeprüfungen</h5>
       <p>Diese Seite erlaubt das Durchführen von Probeprüfungen. Diese setzen sich aus insgesamt 60 Fragen zusammen,
       12 je Themengebiet. Die Funktion steht aktuell noch nicht zur Verfügung.</p>
       <b-button variant="primary" block>Neue Probeprüfung starten</b-button>
     </b-col>
   </b-row>
   <b-row class="mb-5">
     <b-col>
       <b-card-group deck>
         <ExamBlock class="mb-2"></ExamBlock>
         <ExamBlock class="mb-2"></ExamBlock>
         <ExamBlock class="mb-2"></ExamBlock>
       </b-card-group>
     </b-col>
   </b-row>
 </MainNav>
</template>

<script>
export default {
  name: "Exams"
}
</script>

<style scoped>

</style>
