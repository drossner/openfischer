<template>
  <MainNav>
    <b-row>
      <b-col>
        <b-list-group>
          <b-list-group-item v-for="qstId in qstIds" :key="qstId.id"
                             :href='"catalog/"+qstId.id'
          >{{ qstId.id }}
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
      qstIds: []
    }
  },
  async fetch() {
    this.qstIds = await this.$content('catalog').only(['id']).fetch()
  }
}
</script>
