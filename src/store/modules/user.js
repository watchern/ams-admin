import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { onAccessSystem } from '@/utils/permission'
import { cacheDict } from '@/api/base/sys-dict'
import { getAllScene } from '@/api/data/scene'
import Cookies from 'js-cookie'
const state = {
  ext: "xxxx",
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  id: '',
  code: '',
  scenecode: '',
  scenename: '',
  datauserid: '',
  datausername: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_RES: (state, res) => {
    state.res = res
  },
  SET_CODE: (state, code) => {
    state.code = code
  },
  SET_SCENECODE: (state, scenecode) => {
    state.scenecode = scenecode
  },
  SET_SCENENAME: (state, scenename) => {
    state.scenename = scenename
  },
  SET_DATAUSERID: (state, datauserid) => {
    state.datauserid = datauserid
  },
  SET_DATAUSERNAME: (state, datausername) => {
    state.datausername = datausername
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ userid: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_ID', data.personUuid)
        commit('SET_NAME', data.username)
        /*commit('SET_TOKEN', data.personUuid)*/
        commit('SET_CODE', data.userid)
        Cookies.set("PERSONUUID", data.personUuid)
        commit('SET_DATAUSERID', data.userid)
        /*setToken(data.personUuid)*/
        var sysDict = JSON.parse(sessionStorage.getItem('sysDict'))
        if (sysDict == null) {
          cacheDict().then(resp => {
            sessionStorage.setItem('sysDict', JSON.stringify(resp.data))
          })
        }
        getAllScene().then(res => {
          commit('SET_SCENECODE', res.data[0].sceneCode)
          commit('SET_SCENENAME', res.data[0].sceneName)
          debugger;
          sessionStorage.setItem('sceneCode', res.data[0].sceneCode);
          sessionStorage.setItem('sceneName', res.data[0].sceneName);
          sessionStorage.setItem('dataUserId', data.userid);
          sessionStorage.setItem('dataUserName', data.username);
         /* saveSession({
            sceneCode: res.data[0].sceneCode,
            sceneName :res.data[0].sceneName,
            dataUserId: data.userid,
            dataUserName: data.username
          });*/
        })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      //console.log(state);
      debugger;
      var personuuid = state.id;
      if(personuuid == "" || personuuid == null){
        personuuid = Cookies.get("PERSONUUID")
      }
      if(personuuid == "" || personuuid == null){
        personuuid = window.location.hash.replace('#/base/sso?param=', '').split(",")[0];
        Cookies.set("PERSONUUID", personuuid)
      }
      getInfo(personuuid).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { roles, name, avatar, introduction, id, personcode } = data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        if (id != null) commit('SET_ID', id)
        if (roles != null) commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_CODE', personcode)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
      resolve()
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        dispatch('tagsView/delAllViews', null, { root: true })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },
  saveScene({ commit, code, name, datauserid, personuuid, datausername }) {
    return new Promise(resolve => {
      commit('SET_SCENECODE', code)
      commit('SET_SCENENAME', name)
      commit('SET_DATAUSERID', datauserid)
      commit('SET_DATAUSERNAME', datausername)
      commit('SET_ID', personuuid)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
