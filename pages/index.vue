<template>
  <MainNav>
    <b-row>
      <b-col>
        <b-list-group>
          <b-list-group-item v-for="qst in qstDatas" :key="qst.id" :variant="qst.variant">
            <NuxtLink :to='"/catalog/"+qst.id'>{{ qst.id }}</NuxtLink>
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </MainNav>
</template>

<script>
export default {
  name: 'Home',
  data: function () {
    return {
      qstDatas: []
    }
  },
  async fetch() {
    let questIds = await this.$content('catalog').only(['id']).fetch()
    const keys = await this.$localForage.keys()
    console.log(keys)
    for(let qst of questIds) {
      if(keys.includes(qst.id)) {
        let save =  await this.$localForage.getItem(qst.id)
          let variant;
          if(save.correct === true)
            variant = "success";
          else if(save.correct === false)
            variant = "danger"
          this.qstDatas.push({id: qst.id, variant: variant})
      } else {
        this.qstDatas.push({id: qst.id})
      }

    }
  },
  computed: {

  }
}
</script>
