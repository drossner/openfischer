<template>
  <div>
    <b-row class="mb-3">
      <b-col>
        <b-input-group>
          <b-form-input :variant="elementVariant" placeholder="Fragen durchsuchen" v-model="enteredText" @input="startQuery"></b-form-input>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col>
        <b-pagination v-model="currentPage"  per-page="pageLimit" :total-rows="allData.length" variant="dark"></b-pagination>
      </b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col>
        <b-list-group>
                  <b-list-group-item v-for="qst in shownData" :key="qst.id" :variant="qst.variant" :to='"/catalog/"+qst.id'>
                    <b>{{ qst.id }}</b> {{ qst.question  }}
                  </b-list-group-item>
                </b-list-group>
      </b-col>
    </b-row>
    <b-row class="mb-2">
      <b-col>
        <b-pagination v-model="currentPage"  per-page="pageLimit" :total-rows="allData.length" use-router></b-pagination>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: 'Overview',
  data: function () {
    return {
      allData: [],
      pageLimit: 20,
      enteredText: "",
      currentPage: 1
    }
  },
  async fetch() {
    let query = this.$route.query.term || ""
    this.allData = await this.$content('catalog').where({question: {$regex: query}}).fetch();
  },
  methods: {
    linkGen(pageNum) {
      return pageNum === 1 ? '?' : `?page=${pageNum}`
    },
    startQuery() {
      let query = this.enteredText
      this.$content('catalog').where({question: {$regex: query}}).fetch().then(res => this.allData = res)
    }
  },
  computed: {
    shownData: function () {
      let beginSlice = (this.currentPage - 1) * this.pageLimit
      let result =  this.allData.slice(beginSlice, beginSlice + this.pageLimit)
      for(let qst of result) {
        let save = this.$store.state.questionLocal[qst.id]
        if(save === undefined || save === null){
          qst.variant = "dark"
        } else {
          if(save.correct){
            qst.variant = "success"
          }
          else
            qst.variant = "danger"
        }
      }
      return result
    },
    numberOfPages: function () {
      return Math.ceil(this.allData.length / this.pageLimit)
    },
    ...mapGetters('theme', ['primaryButtonVariant', 'elementVariant', 'isDark'])
  }
}
</script>
