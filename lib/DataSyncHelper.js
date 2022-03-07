
export default {
  setup: {
    clientId: "306947330178-0dtc6bg97qjuepq954pik1bn4ai15btk.apps.googleusercontent.com",
    redirectURI: location.href,
    responseType: "code",
    scope: "https://www.googleapis.com/auth/drive.appdata",
  },
  forwardToLogin: function(redirect) {
    location.href = "https://accounts.google.com/o/oauth2/v2/auth?" +
      `client_id=${this.setup.clientId}&` +
      `redirect_uri=${redirect || this.setup.redirectURI}&` +
      `response_type=${this.setup.responseType}&` +
      `scope=${this.setup.scope}&` +
      'access_type=offline'
  },
  handleAccessToken: function(routeHash) {
    let fragmentString = routeHash.substring(1);
    // Parse query string to see if page request is coming from OAuth 2.0 server.
    let params = {};
    let regex = /([^&=]+)=([^&]*)/g, m;
    // eslint-disable-next-line no-cond-assign
    while (m = regex.exec(fragmentString)) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    return params;
  },
  storeFile: function(token, name, data, callback) {

    let fileMeta = {
      name: name,
      parents: ['appDataFolder'],
    }

    fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
        },
        body: JSON.stringify(fileMeta)
      }
    ).then(res => res.json())
      .then(res => {
      console.log(res)
      fetch('https://www.googleapis.com/upload/drive/v3/files/'+res.id+'?uploadType=media',{
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer '+token
        },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(res => {
        if(callback !== undefined) callback(res)
      })
      .catch(err => console.log(err))
    }).catch(err => console.log(err))

  },
  loadConfig(token, callback) {
    fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
      },
    }).then(res => res.json())
      .then(res => {
        callback(res)
      })
  },
  loadAConfig(token, id, callback) {
    fetch('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media', {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    }).then(res => res.json())
      .then(res => {
        callback(res)
      })
  },
  deleteAConfig(token, id, callback) {
    fetch('https://www.googleapis.com/drive/v3/files/'+id, {
      mode: 'cors',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    }).then(res => callback(true))
  },
  async createExport(localForage) {
    let data = await localForage.nuxtLocalForage.keys()
    let tmp = {};
    for(let key of data) {
      tmp[key] = await localForage.nuxtLocalForage.getItem(key)
    }
    return {
      settings: await localForage.meta.getItem("SETTINGS"),
      exams: await localForage.meta.getItem("EXAMS"),
      localQuestions: tmp
    }
  }
}
