import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { onAccessSystem } from '@/utils/permission'
import { cacheDict } from '@/api/base/sys-dict'
import { getAllScene, getSceneInst } from '@/api/data/scene'
import Cookies from 'js-cookie'
import {
  Message,
  MessageBox
} from 'element-ui'
// import { getEncloseBy } from '@/api/data/scene'
const state = {
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
        commit('SET_CODE', data.personCode)
        var sysDict = JSON.parse(sessionStorage.getItem('sysDict'))
        if (sysDict == null) {
          cacheDict().then(resp => {
            sessionStorage.setItem('sysDict', JSON.stringify(resp.data))
          })
        }
        /*登录时设置场景编码和实例*/
        var sceneCode = 'auditor'
        var dataUserId = data.userid
        getSceneInst(sceneCode, dataUserId).then(resp => {
          var dataUserName = resp.data.dataUserName
          var sceneName = resp.data.sceneName
          commit('SET_SCENECODE', sceneCode)
          commit('SET_SCENENAME', sceneName)
          commit('SET_DATAUSERID', dataUserId)
          commit('SET_DATAUSERNAME', dataUserName)
        })
        resolve()
      }).catch(error => {
        console.log(error)
        let repstr = error.toString().split(':')[1];
        Message({
          message: repstr,
          type: 'error',
          duration: 5 * 1000
        })
        reject(error)
      })
      // getEncloseBy().then(res =>{
      //   sessionStorage.setItem("encloseBy", JSON.stringify(res.data));
      // });
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { roles, name, avatar, introduction, id, personcode } = data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ID', id)
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_CODE', personcode)

        if (state.scenecode === '' || state.scenecode == null) {
          var sceneCode = 'auditor'
          var dataUserId = personcode
          getSceneInst(sceneCode, dataUserId).then(resp => {
            var dataUserName = resp.data.dataUserName
            var sceneName = resp.data.sceneName
            commit('SET_SCENECODE', sceneCode)
            commit('SET_SCENENAME', sceneName)
            commit('SET_DATAUSERID', dataUserId)
            commit('SET_DATAUSERNAME', dataUserName)
          })
        }
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
        Cookies.remove('LTPAToken')
        Cookies.remove('ROLTPAToken')
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

  saveScene({ commit }, payload) {
    return new Promise(resolve => {
      commit('SET_SCENECODE', payload.sceneCode)
      commit('SET_SCENENAME', payload.sceneName)
      commit('SET_DATAUSERID', payload.dataUserId)
      commit('SET_DATAUSERNAME', payload.dataUserName)
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
