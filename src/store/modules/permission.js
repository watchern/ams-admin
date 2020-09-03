import { asyncRoutes, constantRoutes } from '@/router'
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
      getUserRes().then(response => {
        console.log(response)
        var res = {};
        response.data.menugroup.forEach(grp =>{
          grp.menuList.forEach(ml =>{
            res[ml.routepath] = ml.routepath;
          })
        })
        asyncRoutes.forEach(thisRoute => {
          if(res[thisRoute.path])    //注掉此行代码可以显示包括示例在内的所有菜单
          accessedRoutes.push(thisRoute);
        });
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        console.error(error);
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
