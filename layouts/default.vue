<template>
  <div>
    <MainNav>
      <Nuxt />
    </MainNav>

    <footer v-if="syncActive" class="page-footer font-small fixed-bottom">
      <div class="ml-2 py-3">
        <span v-if="syncState === 1"><font-awesome-icon  :icon="['fa', 'circle-check']" /></span>
        <span v-else-if="syncState === 2"><font-awesome-icon  :icon="['fa', 'hourglass']" /></span>
        <span v-else-if="syncState === 3"><font-awesome-icon  :icon="['fa', 'rotate']" /></span>
      </div>
    </footer>
  </div>


</template>

<script>
import sync from "@/lib/DataSyncHelper";

export default {
  name: "default",
  fetchOnServer: false,
  data: function() {
    return {
      inSync: false
    }
  },
  async fetch() {
    if(this.$store.state.googlesync.active) {
      if(this.$store.getters["googlesync/isValid"] === false) {
        let data = await sync.refreshAccessToken(this.$store.state.googlesync.refreshToken)
        this.$store.commit('googlesync/refreshAccessToken', data)
      }

      let data = await sync.loadARunningState(this.$store.state.googlesync.token, this.$store.state.googlesync.syncFileId)
      await this.$localForage.meta.clear()
      await this.$localForage.meta.setItem("EXAMS", data.exams)
      await this.$localForage.meta.setItem("SETTINGS", data.settings)
      await this.$localForage.nuxtLocalForage.clear()
      for(let key of Object.keys(data.localQuestions)) {
        this.$localForage.nuxtLocalForage.setItem(key, data.localQuestions[key])
      }
      this.$store.dispatch('init', true)

    }

  },
  computed: {
    syncActive: function () {
      return this.$store.state.googlesync.active
    },
    syncState: function () {
      //O = off, 1 = sync, 2 = out of sync, 3 = refreshing
      if(this.syncActive === false) return 0
      else if(this.inSync) return 3
      else if(this.$store.state.googlesync.modelDirty === false) return 1
      else return 2
    },
    tokenValid: function () {
      return this.$store.getters["googlesync/isValid"]
    },
  },
  mounted() {
    setInterval(async () => {
      if(this.syncActive && this.syncState === 2) {
        this.inSync = true
        console.log("SYNC...")
        let exp = await sync.createExport(this.$localForage)
        sync.runningStateUpload(this.$store.state.googlesync.token, exp, this.$store.state.googlesync.syncFileId, res => {
          this.$store.commit('googlesync/sync')
          this.inSync = false
        })
      }
    }, 30_000)

  }
}
</script>

<style scoped>
  .fa-circle-check {
    color: green;
  }
</style>
