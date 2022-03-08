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
export default {
  name: "default",
  data: function() {
    return {
      inSync: false
    }
  },
  async fetch(ctx) {
    console.log("Sync active: " + ctx.store.state.googlesync.active)

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
    }
  },
  mounted() {
    setInterval(() => {
      if(this.syncActive && this.syncState === 2) {
        this.inSync = true
        console.log("SYNC...")
        //put sync code here!!
        setTimeout(() => {
          this.$store.commit('googlesync/sync')
          this.inSync = false
        }, 3000)
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
