const state = {
  dataSort: [],
  dataSortUuid: '',
  dataSortName: '',
  baseCodes: {},
  stageStandard: {},
  treeData: {}
}

const getters = {
  getStageStandard: state => {
    return state.stageStandard
  }
}

const actions = {
  setdataSort({ commit }, dataSort) {
    commit('getdataSort', { dataSort })
  },
  setDataSortUuid({ commit }, dataSortUuid) {
    commit('getDataSortUuid', { dataSortUuid })
  },
  setDataSortName({ commit }, dataSortName) {
    commit('getDataSortName', { dataSortName })
  },
  setBaseCode({ commit }, baseCode) {
    commit('getBaseCode', { baseCode })
  },
  setStageStandard({ commit }, stageStandard) {
    commit('getStageStandard', { stageStandard })
  },
  setBusiness({ commit }, treeData) {
    commit('getBusinessTree', { treeData })
  }
}
const mutations = {
  getdataSort(state, { baseData }) {
    state.baseData = baseData
  },
  getDataSortUuid(state, { dataSortUuid }) {
    state.dataSortUuid = dataSortUuid
  },
  getDataSortName(state, { dataSortName }) {
    state.dataSortName = dataSortName
  },
  getBaseCode(state, { baseCode }) {
    state.baseCodes = JSON.stringify(baseCode)
  },
  getStageStandard(state, { stageStandard }) {
    state.stageStandard = stageStandard
  },
  getBusinessTree(state, { treeData }) {
    state.treeData = JSON.stringify(treeData)
  }
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
