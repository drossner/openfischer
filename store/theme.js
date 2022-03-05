export const state = () => ({
  dark: localStorage.getItem("THEME") === "true"
})

export const getters = {
  primaryButtonVariant: function (state) {
    if(state.dark) return "dark"
    else return "primary"
  },
  elementVariant: function (state) {
    if(state.dark) return "dark"
    else return "light"
  },
  isDark: function (state) {
    return state.dark
  }
}

export const mutations = {
  switchTheme(state) {
    state.dark = !state.dark
    localStorage.setItem("THEME", `${state.dark === true}`)
  }
}

