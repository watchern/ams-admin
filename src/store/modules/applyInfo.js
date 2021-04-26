
const state = {
  applyInfo:{
    //业务主键
    appDataUuid:"",
    //版本UUID
    versionUuid:"",
    //批量提交
    detailUuids:"",
    //业务审核状态
    status:"",
    //业务更新方法的成功失败0成功，1失败
    mstate:"",
    //流程提交方法，成功失败0成功，1失败
    fstate:"",
    //是否更新业务代码
    isupdate:"",
    //是否跳转,只在第一次使用
    jump:"",
    //收回，终止流程提交方法，成功失败0成功，1失败
    newFstate:"",
  }
}
const getters = {
  applyInfo:state=>{
    return state.applyInfo;
  }
}
const actions = {
  setApplyInfo({commit},applyInfo){
    commit('setApplyInfo', {applyInfo});
  },
  setStatus({commit},status){
    commit('setStatus', {status});
  },
  setDoCheckStatus({commit},status){
    commit('setDoCheckStatus', {status});
  },
  setFstate({commit},fstate){
    commit('setFstate', {fstate});
  },
  setMstate({commit},mstate){
    commit('setMstate', {mstate});
  },
  setIsupdate({commit},isupdate){
    commit('setIsupdate', {isupdate});
  },
  setJump({commit},jump){
    commit('setJump', {jump});
  },
  setNewFstate({commit},newFstate){
    commit('setNewFstate', {newFstate});
  },
}
const mutations = {
  setApplyInfo (state, {applyInfo}) {
    state.applyInfo = applyInfo;
  },
  setStatus(state,{status}){
    state.applyInfo.status = status;
  },
  setDoCheckStatus(state,{status}){
    state.applyInfo.docheckstatus = status;
  },
  setFstate(state,{fstate}){
    state.applyInfo.fstate = fstate;
  },
  setMstate(state,{mstate}){
    state.applyInfo.mstate = mstate;
  },
  setIsupdate(state,{isupdate}){
    state.applyInfo.isupdate = isupdate;
  },
  setJump(state,{jump}){
    state.applyInfo.jump = jump;
  },
  setNewFstate(state,{newFstate}){
    state.applyInfo.newFstate = newFstate;
  },
}
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
