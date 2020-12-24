import store from '@/store'
import { cacheDict } from '@/api/base/sys-dict'
import { getAllScene } from '@/api/data/scene'


/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    const roles = store.getters && store.getters.roles
    const permissionRoles = value

    const hasPermission = roles.some(role => {
      return permissionRoles.includes(role)
    })

    if (!hasPermission) {
      return false
    }
    return true
  } else {
    console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}

export function onAccessSystem(sceneCode, dataUserId) {
  var sysDict = JSON.parse(sessionStorage.getItem('sysDict'))
  if (sysDict == null) {
    cacheDict().then(resp => {
      sessionStorage.setItem('sysDict', JSON.stringify(resp.data))
    })
  }
  getAllScene().then(res => {
    commit('SET_SCENECODE', res.data[0].sceneCode)
    commit('SET_SCENENAME', res.data[0].sceneName)
  })

}


