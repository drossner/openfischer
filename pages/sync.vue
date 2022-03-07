<template>
  <MainNav>
    <b-row>
      <b-col>
        <h4>Datensicherung</h4>
        <p>Diese Seite erlaubt es, den lokal gespeicherten Fortschritt mit GoogleDrive abzugleichen. Dazu ist ein Google-Login notwendig.
          Mit Hilfe der Sicherung kann der Fortschritt auf verschiedenen Geräte, z.B. dem Smartphone und dem PC,
          und über verschiedne Browser synchronisiert werden.
        Melde Dich mit deinem Google-Account an und bestätige den Zugriff. Mit den angefragten Berechtigungen, können keine
        andere Dateien von GoogleDrive gelesen oder verändert werden.</p>
        <p>Nach der Anmeldung ist es möglich, eine Liste der auf Drive verfügbaren Speicherstände anzuzeigen. Die Speicherstände
        können gelöscht, oder zum herunterladen ausgewählt werden.</p>
        <p><b>Achtung: Das Herunterladen eines Speicherstandes löscht ALLE lokalen Daten und übernimmt die heruntergeladenenen!</b></p>
        <p>Ebenso kann der aktuelle lokale Datenbestand hochgeladen - und somit gesichert werden.</p>
        <p v-if="authenticated"><b>Du bist angemeldet</b></p>
        <b-button v-else @click="login" variant="dark">Login with Google</b-button>
      </b-col>
    </b-row>
    <template v-if="authenticated">
      <b-row class="mb-2">
        <b-col>
          <b-button class="mb-2" :disabled="loadingData" @click="getData"><b-spinner v-if="loadingData" small></b-spinner>
            Liste verfügbare Daten von Drive </b-button>

        </b-col>
        <b-col>
          <b-button :disabled="uploadingData" @click="upload"><b-spinner v-if="uploadingData" small></b-spinner> Lokalen Stand hochladen</b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card class="mb-3" v-for="appData in appDataFiles" :key="appData.id" bg-variant="dark">
            <template #header >
              <h6 class="mb-0 d-inline-flex">{{ appData.name }}</h6>
              <span class="float-right ml-3" @click="removeSave(appData.id)"><font-awesome-icon  role="button" :icon="['fa', 'trash-can']" /></span>
              <span class="float-right ml-3" @click="useSave(appData.data)"><font-awesome-icon  role="button" :icon="['fa', 'download']" /></span>
            </template>
            <b-card-text>Beantwortete Fragen (richtig und falsch): {{ Object.keys(appData.data.localQuestions).length }}</b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </template>

  </MainNav>
</template>

<script>
import sync from "@/lib/DataSyncHelper";

export default {
  name: "sync",
  data: function () {
    return {
      appDataFiles: [],
      loadingData: false,
      uploadingData: false
    }
  },
  computed: {
    authenticated: function () {
      return this.$store.state.googlesync.alreadyUsed && Date.now()/1000 - this.$store.state.googlesync.loginTime/1000 < this.$store.state.googlesync.loginTime/1000 + this.$store.state.googlesync.token.expires_in
    },
  },
  async asyncData({ route, store }) {
    //this runs before the component is rendered!
    let params = sync.handleAccessToken(route.hash)
    if(params.access_token !== undefined) store.commit('googlesync/login', params)
  },
  methods: {
    login: function () {
      sync.forwardToLogin(location.protocol + '//' + location.host + '/openfischer' + this.$route.path)
    },
    getData: function() {
      this.appDataFiles = []
      this.loadingData = true
      sync.loadConfig(this.$store.state.googlesync.token['access_token'], list => {
        //this.appDataFiles = list.files
        for(let meta of list.files) {
          sync.loadAConfig(this.$store.state.googlesync.token['access_token'], meta.id,theConf => {
            this.appDataFiles.push({
              id: meta.id,
              name: meta.name,
              data: theConf
            })
          })
        }
        this.loadingData = false
      })
    },
    removeSave: function (fileId) {
      sync.deleteAConfig(this.$store.state.googlesync.token['access_token'], fileId, (bool) => {
        let index = this.appDataFiles.map(appData => appData.id).indexOf(fileId)
        this.appDataFiles.splice(index, 1)
      })
    },
    upload: function () {
      this.uploadingData = true
      sync.createExport(this.$localForage).then(exp => {
        sync.storeFile(this.$store.state.googlesync.token['access_token'], "config.json", exp, res => {
          this.uploadingData = false
        })
      })
    },
    useSave: function (data) {

      this.$localForage.meta.clear()
      .then(() =>{
        this.$localForage.meta.setItem("EXAMS", data.exams)
        this.$localForage.meta.setItem("SETTINGS", data.settings)
        this.$localForage.nuxtLocalForage.clear().then(() => {
          for(let key of Object.keys(data.localQuestions)) {
            this.$localForage.nuxtLocalForage.setItem(key, data.localQuestions[key])
          }
          this.$store.dispatch('init', true).then(() => {
            this.$router.push("/")
          })
        })
        }
      )
    }
  },

}
</script>

<style scoped>

</style>
