export const state = () => ({
  alreadyUsed: localStorage.getItem('REFRESH_TOKEN') !== null,
  token: localStorage.getItem('ACCESS_TOKEN') || '',
  refreshToken: localStorage.getItem('REFRESH_TOKEN') || '',
  loginTime: parseInt(localStorage.getItem('LAST_LOGON')) || 0,
  expiresIn: parseInt(localStorage.getItem('EXPIRES_IN')) || 0,
  active: localStorage.getItem("SYNC_ACTIVE") === 'true' || false,
  modelDirty: false
})

export const getters = {
  isValid: function (state) {
    return state.loginTime + state.expiresIn > (Date.now() + 10_000) / 1000
  }
}

export const mutations = {
  login(state, codeRequest) {
    state.loginTime = Date.now() / 1000 //ms in s
    state.token = codeRequest.access_token
    state.refreshToken = codeRequest.refresh_token
    state.alreadyUsed = true
    state.expiresIn = codeRequest.expires_in
    localStorage.setItem('ACCESS_TOKEN', state.token)
    localStorage.setItem('REFRESH_TOKEN', state.refreshToken)
    localStorage.setItem('LAST_LOGON', state.loginTime)
    localStorage.setItem('EXPIRES_IN', state.expiresIn)
  },
  refreshAccessToken(state, refreshRequest) {
    state.loginTime = Date.now() / 1000 //ms in s
    state.token = refreshRequest.access_token
    state.expiresIn = refreshRequest.expires_in
    localStorage.setItem('ACCESS_TOKEN', state.token)
    localStorage.setItem('LAST_LOGON', state.loginTime)
    localStorage.setItem('EXPIRES_IN', state.expiresIn)
  },
  switchActive(state) {
    state.active = !state.active
    localStorage.setItem("SYNC_ACTIVE", `${state.active}`)
  },
  sync(state) {
    state.modelDirty = false
  }
}

