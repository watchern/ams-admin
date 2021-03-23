import router from '@/router'
export default {
  namespaced: true,
  state: {
    rightFooterTags: [],
    leftMenuShrink: false,
  },
  mutations: {
    setRightFooterTags: (state, data) => {
      let temArr = state.rightFooterTags
      const name = data.val.name
      switch (data.type) {
        case 'reset':
          router.replace(data.val.path)
          break
        case 'active': // 新增或者激活
          let bool = false
          temArr.forEach(item => {
            item.isActive = false
            if (item.name === name) {
              item.isActive = true
              bool = true
            }
          })
          if (!bool) {
            temArr.push(Object.assign({}, data.val, { isActive: true }))
          }
          state.rightFooterTags = temArr
          state.rightFooterTags.forEach(item => {
            item.isActive && router.push(item.path)
          })
          break
        case 'close':
          temArr = temArr.filter(item => item.name !== name)
          state.rightFooterTags = temArr
          if (state.rightFooterTags.length) {
            router.push(state.rightFooterTags[state.rightFooterTags.length - 1].path)
          } else {
            router.push('/ams/first')
          }
          break
        case 'closeOther':
          state.rightFooterTags = [Object.assign({}, data.val, { isActive: true })]
          router.push(data.val.path)
          break
        case 'closeAll':
          state.rightFooterTags = []
          router.push('/ams/first')
          break
        default:
          break
      }
    },
    setLeftMenuShrink: (state, data) => {
      state.leftMenuShrink = data
    }
  },
  actions: {}
}
