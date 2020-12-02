import Vue from 'vue'
import mAffirm from './jumpAffirm'
// import store from '@/components/Dolphin/store'
import store from '@/store'
// import router from '@/conf/home/router'
import router from '@/router'
import {
  uuid,
  findComponentDownward
} from '@/components/etl/util/'
import {
  last
} from 'lodash'
import {
  error
} from 'jquery'

const Affirm = {}
let $root = {}
let $routerType = ''
let $isPop = true

/**
 * Listen for route changes
 */
router.beforeEach((to, from, next) => {
  console.log(from)
  // if (from.name === 'projectsdefinitiondetails' || from.name === 'projects-instance-details' || from.name === 'processinstance') {
  if (from.name === 'projectsdefinitiondetails' || from.name === 'projects-instance-details' || from.name === 'workflow') {
    if (!Affirm.paramVerification(from.name)) {
      Affirm.isPop(() => {
        next()
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

/**
 * Get judgment initialization data
 */
Affirm.init = (root) => {
  $isPop = true
  $root = root
  $routerType = router.history.current.name
}

/**
 * Parameter verification
 */
Affirm.paramVerification = (name) => {
  if (!$isPop) {
    return true
  }
  const dagStore = store.state.dag
  let flag = false
  if ($routerType === 'workflow') {
    // No nodes jump out directly
    if (dagStore.tasks.length) {
      if (!dagStore.name) {
        store.commit('dag/setName', `${uuid('dag_')}${uuid() + uuid()}`)
      }
    } else {
      flag = true
    }
  } else {
    // View history direct jump
    flag = name === 'projects-instance-details' ? true : !dagStore.isEditDag
  }
  return flag
}

/**
 * Pop-up judgment
 */
Affirm.isPop = (fn) => {
  Vue.$modal.dialog({
    closable: false,
    showMask: true,
    escClose: true,
    className: 'v-modal-custom',
    transitionName: 'opacityp',
    render(h) {
      return h(mAffirm, {
        on: {
          ok() {
            // fn()
            Vue.$modal.destroy()
            // // save
            // findComponentDownward($root, 'DagChart')._save('else').then(() => {
            //   // fn()
            //   Vue.$modal.destroy()
            // }).catch(() => {
            //   // fn()
            //   Vue.$modal.destroy()
            // })
          },
          close() {
            fn()
            Vue.$modal.destroy()
          }
        },
        props: {}
      })
    }
  })
}

/**
 * Whether the external setting pops up
 */
Affirm.setIsPop = (is) => {
  $isPop = is
}

export default Affirm
