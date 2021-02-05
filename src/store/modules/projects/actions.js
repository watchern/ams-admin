import io from 'ams-etlscheduler-ui/src/components/etl/io'

import {
  taskStateCount, processStateCount
} from 'ams-etlscheduler-ui/src/api/etlscheduler/taskmonitor'

export default {
  /**
   * Get item list
   */
  getProjectsList({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('projects/list-paging', payload, res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Create project
   */
  createProjects({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.post('projects/create', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Delete Project
   */
  deleteProjects({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('projects/delete', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * edit Project
   */
  updateProjects({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.post('projects/update', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Task status statistics
   */
  getTaskCtatusCount({ state }, payload) {
    return new Promise((resolve, reject) => {
      // io.get('projects/analysis/task-state-count', payload, res => {
      //   resolve(res)
      // }).catch(e => {
      //   reject(e)
      // })
      taskStateCount(payload).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * get command state count
   */
  getCommandStateCount({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('projects/analysis/command-state-count', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * get command state count
   */
  getQueueCount({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('projects/analysis/queue-count', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Process status statistics
   */
  getProcessStateCount({ state }, payload) {
    return new Promise((resolve, reject) => {
      // io.get('projects/analysis/process-state-count', payload, res => {
      //   resolve(res)
      // }).catch(e => {
      //   reject(e)
      // })
      processStateCount(payload).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Process definition statistics
   */
  getDefineUserCount({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('projects/analysis/define-user-count', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  }
}
