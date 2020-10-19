import io from '@/components/Dolphin/axios/index'
import cookies from 'js-cookie'

const apiPrefix = '/dolphinscheduler'
const reSlashPrefix = /^\/+/

const resolveURL = (url) => {
  if (url.indexOf('http') !== -1) {
    return url
  }
  if (url.charAt(0) !== '/') {
    return `${apiPrefix}/${url.replace(reSlashPrefix, '')}`
  }

  return url
}

/**
 * Resolve backend api url
 */
export {
  resolveURL
}

/**
 * Set io default instance resolveUrl globally
 */
io.config.resolveURL = resolveURL
io.config.timeout = 0
io.config.maxContentLength = 200000
io.config.validateStatus = function(status) {
  if (status === 401 || status === 504) {
    // window.location.href = `${PUBLIC_PATH}/view/login/index.html`
    return
  }
  return status
}

// io.config.emulateJSON = false
const _propRequest = io.request

// Add a local request interceptor
io.request = (spec) => {
  return _propRequest.call(io, spec)
}

// Global response interceptor registion
io.interceptors.response.use(
  response => {
    return response
  }, error => {
    // Do something with response error
    return Promise.reject(error)
  }
)

// Global request interceptor registion
io.interceptors.request.use(
  config => {
    const sIdCookie = cookies.get('sessionId')
    const sessionId = sessionStorage.getItem('sessionId')
    const requstUrl = config.url.substring(config.url.lastIndexOf('/') + 1)
    if (sIdCookie !== null && requstUrl !== 'login' && sIdCookie !== sessionId) {
      // window.location.href = `${PUBLIC_PATH}/view/login/index.html`
    } else {
      const {
        method
      } = config
      if (method === 'get') {
        config.params = Object.assign({}, config.params, {
          _t: Math.random()
        })
      }
      return config
    }
    // todo 添加这一行解决cancelToken undefined
    return config
  }, error => {
    // Do something with request error
    return Promise.reject(error)
  }
)

export default io
