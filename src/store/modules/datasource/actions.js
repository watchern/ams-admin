import io from 'ams-etlscheduler-ui/src/components/etl/io'
import {
  save,
  update,
  testConn
} from 'ams-etlscheduler-ui/src/api/etlscheduler/datasource'

export default {
  /**
   * Data source creation
   * @param "type": string,//MYSQL, POSTGRESQL, HIVE, SPARK, CLICKHOUSE, ORACLE, SQLSERVER
   * @param "name": string,
   * @param "desc": string,
   * @param "parameter":string //{"address":"jdbc:hive2://192.168.220.189:10000","autoReconnect":"true","characterEncoding":"utf8","database":"default","initialTimeout":3000,"jdbcUrl":"jdbc:hive2://192.168.220.189:10000/default","maxReconnect":10,"password":"","useUnicode":true,"user":"hive"}
   */
  createDatasources({ state }, payload) {
    payload.connectionParams = JSON.stringify(payload)
    return new Promise((resolve, reject) => {
      save(payload).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
      // io.post('datasources/create', payload, res => {
      //   resolve(res)
      // }).catch(e => {
      //   reject(e)
      // })
    })
  },
  /**
   * Test connection
   * @param "id": int
   */
  connectDatasources({ state }, payload) {
    return new Promise((resolve, reject) => {
      testConn(payload).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
      // io.post('datasources/connect', payload, res => {
      //   resolve(res)
      // }).catch(e => {
      //   reject(e)
      // })
    })
  },
  /**
   * Query data source list - no paging
   * @param "type": string//MYSQL, POSTGRESQL, HIVE, SPARK, CLICKHOUSE, ORACLE, SQLSERVER
   */
  getDatasourcesList({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('datasources/list', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Query data source list - paging
   * @param "searchVal": string,
   * @param "pageNo": int,
   * @param "pageSize": int
   */
  getDatasourcesListP({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('datasources/list-paging', payload, res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Delete data source
   */
  deleteDatasource({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('datasources/delete', payload, res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  /**
   * Data source editing
   */
  updateDatasource({ state }, payload) {
    payload.connectionParams = JSON.stringify(payload)
    return new Promise((resolve, reject) => {
      update(payload).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  },
  // getEditDatasource({ state }, payload) {
  //   return new Promise((resolve, reject) => {
  //     io.post('datasources/update-ui', payload, res => {
  //       resolve(res.data)
  //     }).catch(e => {
  //       reject(e)
  //     })
  //   })
  // },
  // verifyName({ state }, payload) {
  //   return new Promise((resolve, reject) => {
  //     io.get('datasources/verify-name', payload, res => {
  //       resolve(res.data)
  //     }).catch(e => {
  //       reject(e)
  //     })
  //   })
  // },
  getKerberosStartupState({ state }, payload) {
    return new Promise((resolve, reject) => {
      io.get('datasources/kerberos-startup-state', payload, res => {
        resolve(res.data)
      }).catch(e => {
        reject(e)
      })
    })
  }
}
