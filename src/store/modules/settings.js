<<<<<<< HEAD
// import variables from '@/styles/element-variables.scss'
import defaultSettings from '../../settings'
=======
import variables from '@/styles/element-variables.scss'
import defaultSettings from '@/settings'
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d

const { showSettings, tagsView, fixedHeader, sidebarLogo, supportPinyinSearch } = defaultSettings

const state = {
<<<<<<< HEAD
  // theme: variables.theme,
=======
  theme: variables.theme,
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
  showSettings,
  tagsView,
  fixedHeader,
  sidebarLogo,
  supportPinyinSearch
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

