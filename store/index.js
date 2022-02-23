export const state = () => ({
  initialized: false,
  settings: {}, //initialized with init action
  questionLocal: {}, // as settings, a id -> local data map
  allQuestionIds: [], //to have them at hand, fast..
  exams: []
})

export const mutations = {
  initSettings(state, data) {
    state.settings = data
  },
  updateSettings(state, data) {
    state.settings = data
    this.$localForage.meta.setItem("SETTINGS", data);
  },
  initQuestionLocal(state, data) {
    state.questionLocal = data
  },
  initQuestionIds(state, data) {
    state.allQuestionIds = data
  },
  initDone(state) {
    state.initialized = true
  },
  initExams(state, data){
    state.exams = data
  },
  answerQuestion(state, data) {
    let value = {
      correct: data.correct
    }
    if(state.questionLocal[data.id] === undefined) {
      state.questionLocal[data.id] = value
      state.questionLocal = { ...this.state.questionLocal, ...this.state}
    } else {
      state.questionLocal[data.id].correct = data.correct
    }

    this.$localForage.nuxtLocalForage.setItem(data.id, value)
  },
  addExam(state, exam) {
    state.exams.push(exam)
    this.$localForage.meta.setItem("EXAMS", this.state.exams)
  },
  removeExam(state, id) {
    const index = state.exams.map(elem => elem.id).indexOf(id)
    state.exams.splice(index, 1)
    this.$localForage.meta.setItem("EXAMS", this.state.exams)
  }
}

export const getters = {
  categoryNames(state) {
    let categories = []
    for(let entry of state.settings.categories) {
      if(entry === 1) categories.push('Fischkunde');
      else if(entry === 2) categories.push('Gewässerkunde');
      else if(entry === 3) categories.push('Schutz und Pflege');
      else if(entry === 4) categories.push('Fanggeräte');
      else if(entry === 5) categories.push('Rechtsvorschriften');
    }
    return categories
  },
  labeledQuestionIds(state) {
    let result = {
      correct: [],
      wrong: [],
    }
    for(const [key, value] of Object.entries(state.questionLocal)){
      if(value.correct) result.correct.push(key)
      else result.wrong.push(key)
    }
    return result
  },
  filteredQuestionIds(state, getters) {
    let res = []
    let tmp = getters.labeledQuestionIds
    if(state.settings.qsts.includes(1)) Array.prototype.push.apply(res, tmp.correct);
    if(state.settings.qsts.includes(2)) Array.prototype.push.apply(res, tmp.wrong);
    if(state.settings.qsts.includes(3)) {
      //complex.. it is all ids we have NOT (may be inefficient
      for(let qID of state.allQuestionIds) {
        if(state.questionLocal[qID.id] === undefined) {
          res.push(qID.id)
        }
      }
    }
    return res;
  }
}

export const actions = {
  async init({ commit, state }) {
    if(state.initialized === false) {
      //init settings
      let settings = await this.$localForage.meta.getItem("SETTINGS")
      if(settings === undefined || settings === null) {
        //defaults
        settings = {}
        settings.categories = [1, 2, 3, 5, 6];
        settings.qsts = [3];
        this.$localForage.meta.setItem("SETTINGS", settings)
      }
      commit('initSettings', settings)

      //init local question data
      let data = await this.$localForage.nuxtLocalForage.keys()
      let allKeys = await this.$content('catalog').only(['id']).fetch()
      let tmp = {};
      for(let key of data) {
        tmp[key] = await this.$localForage.nuxtLocalForage.getItem(key)
      }
      commit('initQuestionIds', allKeys)
      commit('initQuestionLocal', tmp)

      //init exams
      let exams = await this.$localForage.meta.getItem("EXAMS")
      if(exams === undefined || exams === null) {
        exams = []
        this.$localForage.meta.setItem("EXAMS", exams)
      }
      commit('initExams', exams)

      commit('initDone')
    }
  }
}
