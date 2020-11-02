import _ from 'lodash'
import Vue from 'vue'
import $ from 'jquery'

const Permissions = function() {
  this.isAuth = true
}

Permissions.prototype = {
  // Get permission based on userInfo
  request() {
    // return new Promise((resolve, reject) => {
    //   store.dispatch('user/getUserInfo').then(res => {
    //     if (res.userType !== 'GENERAL_USER') {
    //       this.isAuth = false
    //     }
    //     this.ps(res)
    //     resolve()
    //   })
    // })
  },
  // Command authority status
  ps(res) {
    Vue.directive('ps', {
      bind: function(el, binding, vnode) {
        if (!Vue.prototype.$_ps(binding.value)) {
          if ($(el).prop('tagName') === 'BUTTON') {
            $(el).attr('disabled', true)
          } else {
            setTimeout(function() { el.parentNode.removeChild(el) }, 100)
          }
        }
      }
    })
    // Permission check method
    Vue.prototype.$_ps = function(valueArr) {
      return _.indexOf(valueArr, res.userType) !== -1
    }
  },
  // External access permission status
  getAuth() {
    return this.isAuth
  }
}

export default new Permissions()
