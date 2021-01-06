export default {
  /**
   * edit Status
   */
  setProcessStatus(state, payload) {
    state.processStatus = payload
  },
  /**
   * edit processStartTime
   */
  setProcessStartTime(state, payload) {
    state.processStartTime = payload
  },
  /**
   * edit processEndTime
   */
  setProcessEndTime(state, payload) {
    state.processEndTime = payload
  },
  /**
   * edit processStateType
   */
  setProcessGroupExecutionStatusType(state, payload) {
    state.processGroupExecutionStatusType = payload
  },
  setScheduleDetail(state, payload) {
    state.scheduleDetail = payload
  }
}
