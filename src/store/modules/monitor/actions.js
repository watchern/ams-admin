<<<<<<< HEAD
// import {
//   monitorList,
//   workerList,
//   zookeeperList,
//   getDatabase
// // } from '@ETL/api/etlscheduler/monitor'
// } from '@ETL/api/etlscheduler/monitor'
=======
import {
  monitorList,
  workerList,
  zookeeperList,
  getDatabase
// } from '@ETL/api/etlscheduler/monitor'
} from '@ETL/api/etlscheduler/monitor'
>>>>>>> f50f6d123e4736d2ced8b9459fadb87b9ff7a95d
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
