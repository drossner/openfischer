export const state = () => ({
  alreadyUsed: false,
  token: {},
  refreshToken: '',
  loginTime: 0
})

export const mutations = {
  login(state, token) {
    state.loginTime = Date.now()
    state.token = token
    state.alreadyUsed = true
  }
}

