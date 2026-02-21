import { defineStore } from 'pinia'

export const useGoogleSyncStore = defineStore('googleSync', () => {
  // State - using localStorage for OAuth tokens
  const alreadyUsed = ref(false)
  const token = ref('')
  const refreshToken = ref('')
  const loginTime = ref(0)
  const expiresIn = ref(0)
  const active = ref(false)
  const syncFileId = ref('')
  const lastSync = ref(0)
  const modelDirty = ref(false)

  // Initialize from localStorage (client-side only)
  if (import.meta.client) {
    alreadyUsed.value = localStorage.getItem('REFRESH_TOKEN') !== null && localStorage.getItem('REFRESH_TOKEN') !== ''
    token.value = localStorage.getItem('ACCESS_TOKEN') || ''
    refreshToken.value = localStorage.getItem('REFRESH_TOKEN') || ''
    loginTime.value = parseInt(localStorage.getItem('LAST_LOGON') || '0')
    expiresIn.value = parseInt(localStorage.getItem('EXPIRES_IN') || '0')
    active.value = localStorage.getItem('SYNC_ACTIVE') === 'true'
    syncFileId.value = localStorage.getItem('SYNC_FILE_ID') || ''
    lastSync.value = parseInt(localStorage.getItem('LAST_SYNC') || '0')
  }

  // Getters
  const isValid = computed(() => {
    // Token is valid if login time + expires in > current time (with 10s buffer)
    return loginTime.value + expiresIn.value > (Date.now() + 10_000) / 1000
  })

  // Actions
  function login(codeRequest: {
    access_token: string
    refresh_token: string
    expires_in: number
  }) {
    loginTime.value = Date.now() / 1000
    token.value = codeRequest.access_token
    refreshToken.value = codeRequest.refresh_token
    alreadyUsed.value = true
    expiresIn.value = codeRequest.expires_in

    if (import.meta.client) {
      localStorage.setItem('ACCESS_TOKEN', token.value)
      localStorage.setItem('REFRESH_TOKEN', refreshToken.value)
      localStorage.setItem('LAST_LOGON', String(loginTime.value))
      localStorage.setItem('EXPIRES_IN', String(expiresIn.value))
    }
  }

  function refreshAccessToken(refreshRequest: {
    access_token: string
    expires_in: number
  }) {
    loginTime.value = Date.now() / 1000
    token.value = refreshRequest.access_token
    expiresIn.value = refreshRequest.expires_in

    if (import.meta.client) {
      localStorage.setItem('ACCESS_TOKEN', token.value)
      localStorage.setItem('LAST_LOGON', String(loginTime.value))
      localStorage.setItem('EXPIRES_IN', String(expiresIn.value))
    }
  }

  function setState(newState: boolean) {
    active.value = newState
    if (import.meta.client) {
      localStorage.setItem('SYNC_ACTIVE', String(active.value))
    }
  }

  function setFileId(id: string) {
    syncFileId.value = id
    if (import.meta.client) {
      localStorage.setItem('SYNC_FILE_ID', id)
    }
  }

  function sync() {
    modelDirty.value = false
    lastSync.value = Date.now()
    if (import.meta.client) {
      localStorage.setItem('LAST_SYNC', String(lastSync.value))
    }
  }

  function setModelDirty(dirty: boolean) {
    modelDirty.value = dirty
  }

  function logout() {
    alreadyUsed.value = false
    token.value = ''
    refreshToken.value = ''
    loginTime.value = 0
    expiresIn.value = 0
    active.value = false
    syncFileId.value = ''
    lastSync.value = 0
    modelDirty.value = false

    if (import.meta.client) {
      localStorage.setItem('ACCESS_TOKEN', '')
      localStorage.setItem('REFRESH_TOKEN', '')
      localStorage.setItem('LAST_LOGON', '0')
      localStorage.setItem('EXPIRES_IN', '0')
      localStorage.setItem('SYNC_FILE_ID', '')
      localStorage.setItem('SYNC_ACTIVE', 'false')
      localStorage.setItem('LAST_SYNC', '0')
    }
  }

  return {
    // State
    alreadyUsed,
    token,
    refreshToken,
    loginTime,
    expiresIn,
    active,
    syncFileId,
    lastSync,
    modelDirty,
    // Getters
    isValid,
    // Actions
    login,
    refreshAccessToken,
    setState,
    setFileId,
    sync,
    setModelDirty,
    logout
  }
})
