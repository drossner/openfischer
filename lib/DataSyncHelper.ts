interface OAuthSetup {
  clientId: string
  redirectURI: string
  responseType: string
  scope: string
}

export default {
  setup: null as OAuthSetup | null,

  init(clientId: string) {
    this.setup = {
      clientId,
      redirectURI: typeof window !== 'undefined' ? window.location.href : '',
      responseType: 'code',
      scope: 'https://www.googleapis.com/auth/drive.appdata'
    }
  },

  forwardToLogin(redirect?: string) {
    if (!this.setup) throw new Error('DataSyncHelper not initialized')

    const redirectUri = redirect || this.setup.redirectURI
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${this.setup.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${this.setup.responseType}&` +
      `scope=${this.setup.scope}&` +
      'access_type=offline&' +
      'prompt=consent'  // Force consent screen to always get refresh_token

    window.location.href = authUrl
  },

  async handleAccessToken(code: string, redirect?: string): Promise<any> {
    const response = await $fetch('/api/oauth/token', {
      method: 'POST',
      body: {
        code,
        redirect_uri: redirect || this.setup?.redirectURI,
        grant_type: 'authorization_code'
      }
    })
    return response
  },

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const response = await $fetch('/api/oauth/token', {
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }
    })
    return response
  },

  async storeFile(token: string, name: string, data: any): Promise<any> {
    const fileMeta = {
      name,
      parents: ['appDataFolder']
    }

    // Create file metadata
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(fileMeta)
    })

    const fileInfo = await createResponse.json()

    // Upload file content
    const uploadResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileInfo.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    )

    return uploadResponse.json()
  },

  async loadConfig(token: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    return response.json()
  },

  async loadAConfig(token: string, id: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  },

  async deleteAConfig(token: string, id: string): Promise<boolean> {
    await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return true
  },

  async createNewRunningState(token: string): Promise<any> {
    const fileMeta = {
      name: 'runningState.json',
      parents: ['appDataFolder']
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(fileMeta)
    })

    return response.json()
  },

  async runningStateUpload(token: string, data: any, fileId: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    )

    return response.json()
  },

  async loadRunningState(token: string): Promise<any> {
    const query = encodeURI("name = 'runningState.json'")
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    )

    return response.json()
  },

  async loadARunningState(token: string, id: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    return response.json()
  },

  async removeRunningState(token: string, files: any[]): Promise<void> {
    for (const file of files) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
    }
  },

  async createExport(localForage: any): Promise<any> {
    const keys = await localForage.nuxtLocalForage.keys()
    const tmp: Record<string, any> = {}

    for (const key of keys) {
      tmp[key] = await localForage.nuxtLocalForage.getItem(key)
    }

    return {
      settings: await localForage.meta.getItem('SETTINGS'),
      exams: await localForage.meta.getItem('EXAMS'),
      localQuestions: tmp,
      time: Date.now()
    }
  }
}
