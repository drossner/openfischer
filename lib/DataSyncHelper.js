
export default {
  setup: {
    clientId: "985093583268-kdpv39hs0bldgntln2l4a7uu2jqridvc.apps.googleusercontent.com",
    clientSecret: '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',
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
  handleAccessToken: function(code, redirect, callback) {
    let body = {
      client_id: this.setup.clientId,
      client_secret: this.setup.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect || this.setup.redirect
    }
    let formBody = [];
    for (let property in body) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(body[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody
    }).then(res => res.json()).then(res => callback(res))
  },
  refreshAccessToken: async function(refreshToken) {
    let body = {
      client_id: this.setup.clientId,
      client_secret: this.setup.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }
    let formBody = [];
    for (let property in body) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(body[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    let response = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody
    })
    return response.json()
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
  createNewRunningState: async function(token) {
    let fileMeta = {
      name: "runningState.json",
      parents: ['appDataFolder'],
    }

    let result = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
        },
        body: JSON.stringify(fileMeta)
      }
    )
    return result.json()
  },
  runningStateUpload: function(token, data, fileId, callback) {

        fetch('https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media', {
          method: 'PATCH',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify(data)
        })
          .then(res => res.json())
          .then(res => {
            if (callback !== undefined) callback(res)
          })
          .catch(err => console.log(err))
  },
  loadRunningState: function (token, callback) {
    fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q='+encodeURI("name = 'runningState.json'"), {
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
  loadARunningState: async function(token, id) {
    let result = await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media', {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    })
    return result.json()
  },
  removeRunningState: async function (token, files) {
    for(let file of files){
      await fetch('https://www.googleapis.com/drive/v3/files/' + file.id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
        },
      })
    }
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
      localQuestions: tmp,
      time: Date.now()
    }
  }
}
