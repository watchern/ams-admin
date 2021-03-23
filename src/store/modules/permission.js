<<<<<<< HEAD
// import { asyncRoutes, constantRoutes } from '@/router'
=======
import { asyncRoutes, constantRoutes } from '@/router'
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
import { getUserRes } from '@/api/user'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(paths, route) {
  return paths.includes(route.path)
  /*if (`` && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }*/
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, paths) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    console.log(tmp.path);
    if (hasPermission(paths, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, paths)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      var accessedRoutes = [];
      //此处通过r1菜单，过滤router
      asyncRoutes.forEach(route =>{accessedRoutes.push()})
      constantRoutes.forEach(route =>{accessedRoutes.push()})
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
