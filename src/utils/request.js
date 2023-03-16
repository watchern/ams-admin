import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 600000, // request timeout
  // 原生axios调用的时候可以传一个不同的值，response可以直接获取response不过滤信息
  reqType: 'base'
})

//接口错误信息是否保留
let keepErrorMsg=false;

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    keepErrorMsg=config.keepErrorMsg||false;
    // token从store中获取
    // let userToken = store.state.user.token
    let url= config.url;
    //判断请求路径中是否存在问号
    let symbol = url.indexOf("?") == -1 ? "?" : "&";
    url = url + symbol + "result=login&LTPAToken="+ getToken() +"&maxInerval=14400"
    config.url = url
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    if (response.config.reqType !== 'base' || response.config.responseType === 'blob'){
      return response
    }
    const res = response.data

    // if the custom code is not 0, it is judged as an error.
    if (res.code !== 0 && res.code !== 20000 && !keepErrorMsg) {
      // Message({
      //   message: res.msg || 'Error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 2012/* || res.code === 50012 || res.code === 50014*/) {
        // alert("重新登陆")
        // _this.$route.replace('/')
        // window.location.href = document.URL.split("/#/")[0] + "/#/"
        // window.location.reload()
        // return
        // to re-login
        MessageBox.alert('由于您长时间未操作,为确保安全,请重新登陆！', '确认注销', {
          confirmButtonText: '确认',
          showClose: false,
          closeOnClickModal: false,
          type: 'info'
        }).then(() => {
          location.reload()
        })
      }
      //code==1993为biz
      if(res.code == 1993){
        Message({
          dangerouslyUseHTMLString: true,
          message: `<div style="font-weight: bold;">${res.title}</div><div>${res.msg}</div>`,
          type: 'error',
          duration: 50 * 1000,
          showClose: true,
          offset: 100
        })
        return Promise.reject()
      } else if (res.head && res.head.status == 20) {
        return res
      } else if (res.code == 200) {
        return res
      } else {
        Message({
          message: res.msg || res || 'Error',
          type: 'error',
          duration: 5 * 1000
        })

        return Promise.reject(new Error(res.msg || res || 'Error'))
      }
    }else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
