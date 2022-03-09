<template>
  <div>
    <b-row>
      <b-col>
        <h4>Datensicherung</h4>
        <p>Diese Seite erlaubt es den lokal gespeicherten Fortschritt mit GoogleDrive abzugleichen. Dazu ist ein Google-Login notwendig.
          Mit Hilfe der Sicherung kann der Fortschritt auf verschiedenen Geräten, z.B. dem Smartphone und dem PC,
          und über verschiedene Browser synchronisiert werden.
        Melde Dich mit deinem Google-Account an und bestätige den Zugriff. Mit den angefragten Berechtigungen können keine
        andere Dateien von GoogleDrive gelesen oder verändert werden.</p>
        <p>Nach der Anmeldung ist es möglich, eine Liste der auf Drive verfügbaren Speicherstände anzuzeigen. Die Speicherstände
        können gelöscht, oder zum herunterladen ausgewählt werden.</p>
        <p><b>Achtung: Das Herunterladen eines Speicherstandes löscht ALLE lokalen Daten und übernimmt die heruntergeladenen!</b></p>
        <p>Ebenso kann der aktuelle lokale Datenbestand hochgeladen - und somit gesichert werden.</p>
        <p v-if="authenticated"><b>Du bist angemeldet</b> Gültigkeit Access-Token: {{tokenValid}}</p>
        <b-button v-else @click="login" :variant="primaryButtonVariant">Login with Google</b-button>
      </b-col>
    </b-row>
    <template v-if="authenticated">
      <b-row class="mb-2">
        <b-col>
          <b-button class="mb-2" :disabled="loadingData || active" @click="getData"><b-spinner v-if="loadingData" small></b-spinner>
            Liste verfügbare Daten von Drive </b-button>

        </b-col>
        <b-col>
          <b-button :disabled="uploadingData || active" @click="upload"><b-spinner v-if="uploadingData" small></b-spinner> Lokalen Stand hochladen</b-button>
        </b-col>
        <b-col><b-form-checkbox v-model="active" switch>Permanente Synchronisation</b-form-checkbox></b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card class="mb-3" v-for="appData in appDataFiles" :key="appData.id" :bg-variant="elementVariant">
            <template #header >
              <h6 class="mb-0 d-inline-flex">{{ appData.name }} ({{ new Date(appData.data.time).toDateString()}})</h6>
              <span v-if="!active" class="float-right ml-3" @click="removeSave(appData.id)"><font-awesome-icon  role="button" :icon="['fa', 'trash-can']" /></span>
              <span v-if="!active" class="float-right ml-3" @click="useSave(appData.data)"><font-awesome-icon  role="button" :icon="['fa', 'download']" /></span>
            </template>
            <b-card-text>Beantwortete Fragen (richtig und falsch): {{ Object.keys(appData.data.localQuestions).length }}</b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </template>

  </div>
</template>

<script>
import sync from "@/lib/DataSyncHelper";
import {mapGetters} from "vuex";

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
      return this.$store.state.googlesync.alreadyUsed
    },
    tokenValid: function () {
      return this.$store.getters["googlesync/isValid"]
    },
    ...mapGetters('theme', ['primaryButtonVariant', 'elementVariant', 'isDark']),
    active: {
      get () {
        return this.$store.state.googlesync.active
      },
      async set(value) {
        if(value) {
          //turn on..
          //check if there is a running sync already..
          if(this.tokenValid === false) {
            let data = await sync.refreshAccessToken(this.$store.state.googlesync.refreshToken)
            this.$store.commit('googlesync/refreshAccessToken', data)
          }
          sync.loadRunningState(this.$store.state.googlesync.token, async (res) => {
            console.log("There are "+res.files.length+" running states in gdrive")
            if(res.files.length > 0) {
              //there is a sync..
              this.$bvModal.msgBoxConfirm('Auf diesem Account besteht bereits ein synchronisierter Fortschritt. ' +
                'Möchtest du Deinen synchronisierten Fortschritt mit dem lokalen überschreiben?', {
                title: 'Achtung!',
                okVariant: 'danger',
                okTitle: 'Ja (löscht den alten Fortschritt auf GoogleDrive)',
                cancelTitle: 'Nein (überschreibt den lokalen Fortschritt mit dem von GoogleDrive)',
                cancelVariant: 'secondary',
                footerClass: 'p-2',
                bodyBgVariant: this.elementVariant,
                footerBgVariant: this.elementVariant,
                headerBgVariant: this.elementVariant,
                hideHeaderClose: false,
                centered: true
              })
                .then(async (ok) => {
                  if(ok === true) { //lokal -> remote
                    await sync.removeRunningState(this.$store.state.googlesync.token, res.files)
                    let exp = await sync.createExport(this.$localForage)
                    let newRunningState = await sync.createNewRunningState(this.$store.state.googlesync.token)
                    sync.runningStateUpload(this.$store.state.googlesync.token, exp, newRunningState.id, (data) => {
                      this.$store.commit('googlesync/setFileId', data.id)
                      this.$store.commit('googlesync/sync')
                      this.$store.commit('googlesync/setState', true)
                    })
                  } else if(ok === false) { //remote -> lokal
                    //identify latest sync (there should be one only, hopefully.. so we take [0])
                    sync.loadAConfig(this.$store.state.googlesync.token, res.files[0].id, data => {
                      this.$store.commit('googlesync/setFileId', res.files[0].id)
                      this.$store.commit('googlesync/sync')
                      this.$store.commit('googlesync/setState', true)
                      this.useSave(data)
                    })
                  }
                })
                .catch(err => {
                  // An error occurred
                })
            } else {
              //fresh..
              let exp = await sync.createExport(this.$localForage)
              let newRunningState = await sync.createNewRunningState(this.$store.state.googlesync.token)
              sync.runningStateUpload(this.$store.state.googlesync.token, exp, newRunningState.id, (data) => {
                this.$store.commit('googlesync/setFileId', data.id)
                this.$store.commit('googlesync/sync')
                this.$store.commit('googlesync/setState', true)
              })
            }
          })
        } else {
          this.$store.commit('googlesync/setState', value)
        }

      }
    }
  },
  async asyncData({ route, store }) {
    //this runs before the component is rendered!
    if(route.query.code !== undefined && store.state.googlesync.alreadyUsed === false)
    sync.handleAccessToken(route.query.code, location.protocol + '//' + location.host + '/openfischer' + route.path, function (res) {
      //access_token, expires_in, refresh_token
      store.commit('googlesync/login', res)
    })
    //if(params.access_token !== undefined) store.commit('googlesync/login', params)
  },
  methods: {
    login: function () {
      sync.forwardToLogin(location.protocol + '//' + location.host + '/openfischer' + this.$route.path)
    },
    getData: async function() {
      if(this.tokenValid === false) {
        let data = await sync.refreshAccessToken(this.$store.state.googlesync.refreshToken)
        this.$store.commit('googlesync/refreshAccessToken', data)
      }
      this.appDataFiles = []
      this.loadingData = true
      sync.loadConfig(this.$store.state.googlesync.token, list => {
        //this.appDataFiles = list.files
        for(let meta of list.files) {
          sync.loadAConfig(this.$store.state.googlesync.token, meta.id,theConf => {
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
      sync.deleteAConfig(this.$store.state.googlesync.token, fileId, (bool) => {
        let index = this.appDataFiles.map(appData => appData.id).indexOf(fileId)
        this.appDataFiles.splice(index, 1)
      })
    },
    upload: function () {
      this.uploadingData = true
      sync.createExport(this.$localForage).then(exp => {
        sync.storeFile(this.$store.state.googlesync.token, "config.json", exp, res => {
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
