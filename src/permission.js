import router from './router'
import store from '@/store'
import { getInfo } from '@/api/user'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { getSceneInst } from '@/api/data/scene'
import { redisGetToken } from '@/api/user'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) =>
{
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

/*console.log(to);
  console.log(from);
  next({ ...to, replace: true })*/
   if(to.query.scene){  //如果参数中有scene 则设置场景
     var sceneCode = to.query.scene.split(',')[0];
     var dataUserId = to.query.scene.split(',')[1];
     getSceneInst(sceneCode, dataUserId).then(resp => {
       var dataUserName = resp.data.dataUserName;
       var sceneName = resp.data.sceneName;
       console.log("getSceneInst" + dataUserName + "  " + sceneName)
       store.dispatch('user/saveScene', {
         sceneCode: sceneCode,
         sceneName: sceneName,
         dataUserId: dataUserId,
         dataUserName: dataUserName
       });
     });
   }

  if (hasToken) {
    if (to.path === '/') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      await store.dispatch('user/getInfo')
      // determine whether the user has obtained his permission roles through getInfo
      next();
    }
  } else {
    /* has no token*/
    // 获取到redis里的token
    await redisGetToken().then(resp => {
      // token = resp.data
      // 把获取到的token存到cookie和store里
      store.dispatch('user/setRedisToken', resp.data)
    })
    next()
    // console.log('store.state.user.token',store.state.user.token)
    // next()

    // if (whiteList.indexOf(to.path) !== -1) {
    //   // in the free login whitelist, go directly
    //   next()
    // } else {
    //   // other pages that do not have permission to access are redirected to the login page.
    //   // if (`/` === to.path) {
    //   //   next(`/login`)
    //   // } else {
    //   //   next(`/login?redirect=${to.path}`)
    //   // }
    //   NProgress.done()
    // }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
