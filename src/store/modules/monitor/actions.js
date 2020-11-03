import io from '@/components/etl/io'
import {
  monitorList,
  workerList,
  zookeeperList,
  getDatabase
} from '@/api/etlscheduler/monitor'
export default {
  getMasterData({ state }, payload) {
    return new Promise((resolve, reject) => {
      // io.get('monitor/master/list', payload, res => {
      //   resolve(res.data)
      // }).catch(e => {
      //   reject(e)
      // })
      monitorList().then(res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  },
  getWorkerData({ state }, payload) {
    return new Promise((resolve, reject) => {
      // io.get('monitor/worker/list', payload, res => {
      //   resolve(res.data)
      // }).catch(e => {
      //   reject(e)
      // })
      workerList().then(res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  },
  getDatabaseData({ state }, payload) {
    return new Promise((resolve, reject) => {
      // io.get('monitor/database', payload, res => {
      //   resolve(res.data)
      // }).catch(e => {
      //   reject(e)
      // })
      getDatabase().then(res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  },
  getZookeeperData({ state }, payload) {
    return new Promise((resolve, reject) => {
      // io.get('monitor/zookeeper/list', payload, res => {
      //   resolve(res.data)
      // }).catch(e => {
      //   reject(e)
      // })
      zookeeperList().then(res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  }
}
