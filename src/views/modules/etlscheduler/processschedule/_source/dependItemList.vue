/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="dep-list-model">
    <div v-for="(el,$index) in dependItemList" :key="$index" class="list" @click="itemIndex = $index">
      <!-- <x-select filterable :style="{width:isInstance ? '450px' : '450px'}" :disabled="isDetails" v-model="el.projectId" @on-change="_onChangeProjectId">
        <x-option v-for="item in projectList" :key="item.value" :value="item.value" :label="item.label">
        </x-option>
      </x-select> -->
      <x-select v-model="el.id" filterable :style="{width:isInstance ? '450px' : '450px'}" :disabled="isDetails" @on-change="_onChangeDefinitionId">
        <x-option v-for="item in scheduleList" :key="item.processSchedulesUuid" :value="item.processSchedulesUuid" :label="item.scheduleName" />
      </x-select>
      <x-select v-model="el.depTasks" filterable :style="{width:isInstance ? '450px' : '450px'}" :disabled="isDetails">
        <x-option v-for="item in el.depTasksList || []" :key="item.id" :value="item.id" :label="item.name" />
      </x-select>
      <x-select v-model="el.cycle" style="width: 150px;" :disabled="isDetails" @on-change="_onChangeCycle">
        <x-option v-for="item in cycleList" :key="item.value" :value="item.value" :label="item.label" />
      </x-select>
      <x-select v-model="el.dateValue" style="width: 116px;" :disabled="isDetails">
        <x-option v-for="item in el.dateValueList || []" :key="item.value" :value="item.value" :label="item.label" />
      </x-select>
      <template v-if="isInstance">
        <span class="instance-state">
          <em v-if="el.state === 'SUCCESS'" class="iconfont ans-icon-success-solid" :class="'icon-' + el.state" data-toggle="tooltip" data-container="body" title="成功" />
          <em v-if="el.state === 'WAITING'" class="iconfont ans-icon-clock" :class="'icon-' + el.state" data-toggle="tooltip" data-container="body" title="等待" />
          <em v-if="el.state === 'FAILED'" class="iconfont ans-icon-fail-solid" :class="'icon-' + el.state" data-toggle="tooltip" data-container="body" title="失败" />
        </span>
      </template>
      <span class="operation">
        <a href="javascript:" class="delete" @click="!isDetails && _remove($index)">
          <em class="ans-icon-trash" :class="_isDetails" data-toggle="tooltip" data-container="body" title="删除" />
        </a>
        <a v-if="$index === (dependItemList.length - 1)" href="javascript:" class="add" @click="!isDetails && _add()">
          <em class="iconfont ans-icon-increase" :class="_isDetails" data-toggle="tooltip" data-container="body" title="添加" />
        </a>
      </span>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { cycleList, dateValueList } from '@/views/modules/etlscheduler/dag/_source/formModel/tasks/_source/commcon'
import disabledState from '@/components/Dolphin/mixin/disabledState'
import {
  getScheduleList,
  getTaskLink
} from '@/api/etlscheduler/processschedule'
export default {
  name: 'DepList',
  components: {},
  mixins: [disabledState],
  model: {
    prop: 'dependItemList',
    event: 'dependItemListEvent'
  },
  props: {
    dependItemList: Array,
    index: Number,
    dependTaskList: Array
  },
  data() {
    return {
      task: null,
      list: [],
      // projectList: [],
      cycleList: cycleList,
      isInstance: false,
      itemIndex: null,
      scheduleList: []
    }
  },
  watch: {
  },
  beforeCreate() {
  },
  created() {
    // is type projects-instance-details
    this.isInstance = this.$router.history.current.name === 'projects-instance-details'
    getScheduleList().then((resp) => {
      this.scheduleList = resp.data
      // 判断 dependItemList 是否有值（无值的时候）
      const value = this.scheduleList[0].processSchedulesUuid
      if (!this.dependItemList.length) {
        getTaskLink(value).then((resp) => {
          this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(value, this.scheduleList, resp.data)))
        })
      } else {
        const ids = _.map(this.dependItemList, v => v.processSchedulesUuid).join(',')
        // get item list
        this._getDependItemList(ids, false).then(res => {

        })
        getTaskLink(value).then((res) => {
          _.map(this.dependItemList, (v, i) => {
            this.$set(this.dependItemList, i, this._rtOldParams(v.id, this.scheduleList, ['ALL'].concat(_.map(res[v.id] || [], v => v.name)), v))
          })
          // this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(value, this.scheduleList, resp.data)))
        })       
      }
      // const value = this.scheduleList[0].id
      // getTaskLink(value).then(depTasksList => {
      //   this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(value, scheduleList, depTasksList)))
      // })
    })

    // // get processlist
    // this._getProjectList().then(() => {
    //   if (!this.dependItemList.length) {
    //     // let projectId = this.projectList[0].value
    //     // let projectId = 1
    //     // this._getProcessByProjectId().then(definitionList => {
    //     //   const value = definitionList[0].value
    //     //   this._getDependItemList(value).then(depTasksList => {
    //     //     this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(value, definitionList, depTasksList)))
    //     //   })
    //     // })
    //   } else {
    //     // get id ids
    //     const ids = _.map(this.dependItemList, v => v.id).join(',')
    //     // get item list
    //     this._getDependItemList(ids, false).then(res => {
    //       _.map(this.dependItemList, (v, i) => {
    //         // this._getProcessByProjectId().then(definitionList => {
    //         //   this.$set(this.dependItemList, i, this._rtOldParams(v.id, definitionList, ['ALL'].concat(_.map(res[v.id] || [], v => v.name)), v))
    //         // })
    //       })
    //     })
    //   }
    // })
  },
  mounted() {

  },
  methods: {
    /**
       * add task
       */
    _add() {
      // btn loading
      this.isLoading = true

      // add task list
      // let projectId = this.projectList[0].value
      // let projectId = 1
      // this._getProcessByProjectId().then(definitionList => {
      //   // dependItemList index
      //   const is = (value) => _.some(this.dependItemList, { id: value })
      //   const noArr = _.filter(definitionList, v => !is(v.value))
      //   const value = noArr[0] && noArr[0].value || null
      //   const val = value || definitionList[0].value
      //   this._getDependItemList(val).then(depTasksList => {
      //     this.$nextTick(() => {
      //       this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(val, definitionList, depTasksList, projectId)))
      //     })
      //   })
      // })
      // remove tooltip
      this._removeTip()
    },
    /**
       * remove task
       */
    _remove(i) {
      this.dependTaskList[this.index].dependItemList.splice(i, 1)
      this._removeTip()
      if (!this.dependItemList.length || this.dependItemList.length === 0) {
        this.$emit('on-delete-all', {
          index: this.index
        })
      }
    },
    // _getProjectList() {
    //   return new Promise((resolve, reject) => {
    //     this.projectList = _.map(_.cloneDeep(this.store.state.dag.projectListS), v => {
    //       return {
    //         value: v.id,
    //         label: v.name
    //       }
    //     })
    //     resolve()
    //   })
    // },
    // /**
    //    * get processlist
    //    */
    // _getProcessList() {
    //   return new Promise((resolve, reject) => {
    //     const definitionList = _.map(_.cloneDeep(this.store.state.dag.processListS), v => {
    //       return {
    //         value: v.id,
    //         label: v.name
    //       }
    //     })
    //     resolve(definitionList)
    //   })
    // },
    // _getProcessByProjectId() {
    //   return new Promise((resolve, reject) => {
    //     this.store.dispatch('dag/getProcessByProjectId').then(res => {
    //       const definitionList = _.map(_.cloneDeep(res), v => {
    //         return {
    //           value: v.id,
    //           label: v.name
    //         }
    //       })
    //       resolve(definitionList)
    //     })
    //   })
    // },
    /**
       * get dependItemList
       */
    _getDependItemList(ids, is = true) {
      return new Promise((resolve, reject) => {
        if (is) {
          this.store.dispatch('dag/getProcessTasksList').then(res => {
            resolve(['ALL'].concat(_.map(res, v => v.name)))
          })
        } else {
          // this.store.dispatch('dag/getTaskListDefIdAll').then(res => {
          //   resolve(res)
          // })
        }
      })
    },
    /**
       * change process get dependItemList
       */
    // _onChangeProjectId() {
    //   this._getProcessByProjectId().then(definitionList => {
    //     /* this.$set(this.dependItemList, this.itemIndex, this._dlOldParams(value, definitionList, item))*/
    //     const id = definitionList[0].value
    //     this._getDependItemList(id).then(depTasksList => {
    //       const item = this.dependItemList[this.itemIndex]
    //       // init set depTasks All
    //       item.depTasks = 'ALL'
    //       // set dependItemList item data
    //       this.$set(this.dependItemList, this.itemIndex, this._cpOldParams(id, definitionList, depTasksList, item))
    //     })
    //   })
    // },
    _onChangeDefinitionId({ value }) {
      // get depItem list data
      // 根据流程调度ID 查
      getTaskLink(value).then((resp) => {
        // const depTasksList = resp.data
        // console.log(resp.data)
        const item = this.dependItemList[this.itemIndex]
        // init set depTasks All
        item.depTasks = 'ALL'
        this.$set(this.dependItemList, this.itemIndex, this._rtOldParams(value, item.definitionList, resp.data, item))
      })
      // this._getDependItemList(value).then(depTasksList => {
      //   const item = this.dependItemList[this.itemIndex]
      //   // init set depTasks All
      //   item.depTasks = 'ALL'
      //   // set dependItemList item data
      //   this.$set(this.dependItemList, this.itemIndex, this._rtOldParams(value, item.definitionList, depTasksList, item))
      // })
    },
    _onChangeCycle({ value }) {
      const list = _.cloneDeep(dateValueList[value])
      this.$set(this.dependItemList[this.itemIndex], 'dateValue', list[0].value)
      this.$set(this.dependItemList[this.itemIndex], 'dateValueList', list)
    },
    _rtNewParams(value, scheduleList, depTasksList) {
      return {
        projectId: 1,
        id: value,
        // dependItem need private definitionList
        definitionList: scheduleList,
        scheduleList: scheduleList,
        depTasks: 'ALL',
        depTasksList: depTasksList,
        cycle: 'day',
        dateValue: 'today',
        dateValueList: _.cloneDeep(dateValueList['day']),
        state: ''
      }
    },
    _rtOldParams(value, scheduleList, depTasksList, item) {
      return {
        projectId: 1,
        id: value,
        // dependItem need private definitionList
        definitionList: scheduleList,
        scheduleList: scheduleList,
        depTasks: item.depTasks || 'ALL',
        depTasksList: depTasksList,
        cycle: item.cycle,
        dateValue: item.dateValue,
        dateValueList: _.cloneDeep(dateValueList[item.cycle]),
        state: item.state
      }
    },

    _cpOldParams(id, scheduleList, depTasksList, item) {
      return {
        projectId: 1,
        definitionList: scheduleList,
        scheduleList: scheduleList,
        id: id,
        depTasks: item.depTasks || 'ALL',
        depTasksList: depTasksList,
        cycle: item.cycle,
        dateValue: item.dateValue,
        dateValueList: _.cloneDeep(dateValueList[item.cycle]),
        state: item.state
      }
    },
    /**
       * remove tip
       */
    _removeTip() {
      $('body').find('.tooltip.fade.top.in').remove()
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .dep-list-model {
    position: relative;
    min-height: 32px;
    .list {
      margin-bottom: 6px;
      .operation {
        padding-left: 4px;
        a {
          i {
            font-size: 18px;
            vertical-align: middle;
          }
        }
        .delete {
          color: #ff0000;
        }
        .add {
          color: #0097e0;
        }
      }
    }
    .instance-state {
      display: inline-block;
      width: 24px;
      .iconfont {
        font-size: 20px;
        vertical-align: middle;
        cursor: pointer;
        margin-left: 6px;
        &.icon-SUCCESS {
          color: #33cc00;
        }
        &.icon-WAITING {
          color: #888888;
        }
        &.icon-FAILED {
          color: #F31322;
        }
      }
    }
  }
</style>
