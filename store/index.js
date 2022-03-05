export const state = () => ({
  initialized: false,
  settings: {}, //initialized with init action
  questionLocal: {}, // as settings, a id -> local data map
  allQuestionIds: [], //to have them at hand, fast..
  exams: [], //exams
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
  },
  examNextQuestion(state, data) {
    let exam = state.exams.find(exam => exam.id === data.id)
    let qst = data.qst
    if(data.correct === false) qst = data.qst //nothing
    else if(qst < 12) exam.correctFK++
    else if(qst < 24) exam.correctGK++
    else if(qst < 36) exam.correctSP++
    else if(qst < 48) exam.correctFG++
    else if(qst < 60) exam.correctRV++
    if(exam.currQst >= 59) {
      exam.ended = new Date()
    } else exam.currQst++

    this.$localForage.meta.setItem("EXAMS", state.exams)
  },
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
  },
  nextExamId(state) {
    if(state.exams.length === 0) return 1
    else return state.exams[state.exams.length - 1].id + 1
  },
  getExamById: (state) => (id) => {
    return state.exams.find(exam => exam.id === id)
  }
}

export const actions = {
  async init({ commit, state }, force) {
    if(state.initialized === false || force) {
      //init settings
      let settings = await this.$localForage.meta.getItem("SETTINGS")
      if(settings === undefined || settings === null) {
        //defaults
        settings = {}
        settings.categories = [1, 2, 3, 4, 5, 6];
        settings.qsts = [3];
        this.$localForage.meta.setItem("SETTINGS", settings)
      }
      commit('initSettings', settings)

      let allKeys = await this.$content('catalog').only(['id']).fetch()
      commit('initQuestionIds', allKeys)

      //init exams
      let exams = await this.$localForage.meta.getItem("EXAMS")
      if(exams === undefined || exams === null) {
        exams = []
        this.$localForage.meta.setItem("EXAMS", exams)
      }
      commit('initExams', exams)

      //init local question data
      //should not be crucial to application startup, only if we need answered questions only
      commit('initDone')
      let tmp = {};
      this.$localForage.nuxtLocalForage.iterate((value, key) => {
       tmp[key] = value;
     }).then(() => {
       commit('initQuestionLocal', tmp)

      })
    }
  }
}
