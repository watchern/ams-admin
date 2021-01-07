<template>
  <div class="dep-list-model">
    <div
      v-for="(el, $index) in dependItemList"
      :key="$index"
      class="list"
      @click="itemIndex = $index"
    >
      <x-select
        v-model="el.processSchedulesUuid"
        filterable
        :style="{ width: isInstance ? '450px' : '450px' }"
        :disabled="isDetails"
        @on-change="_onChangeDefinitionId"
      >
        <x-option
          v-for="item in scheduleList"
          :key="item.processSchedulesUuid"
          :value="item.processSchedulesUuid"
          :label="item.scheduleName"
          :disabled="item.processSchedulesUuid === processSchedulesUuid"
        />
      </x-select>
      <x-select
        v-model="el.depTasks"
        filterable
        :style="{ width: isInstance ? '450px' : '450px' }"
        :disabled="isDetails"
        @on-change="_onChangeDepTasksName"
      >
        <x-option
          v-for="item in el.depTasksList || []"
          :key="item.id"
          :value="item.id"
          :label="item.name"
        />
      </x-select>
      <x-select
        v-model="el.cycle"
        style="width: 150px"
        :disabled="isDetails"
        @on-change="_onChangeCycle"
      >
        <x-option
          v-for="item in cycleList"
          :key="item.value"
          :value="item.value"
          :label="item.label"
        />
      </x-select>
      <x-input
        v-model="el.cycleValue"
        style="display:none"
      >{{ cycleValue }}
      </x-input>
      <x-select
        v-model="el.dateValue"
        style="width: 116px"
        :disabled="isDetails"
        @on-change="_onChangeDateValue"
      >
        <x-option
          v-for="item in el.dateValueList || []"
          :key="item.value"
          :value="item.value"
          :label="item.label"
        />
      </x-select>
      <x-input
        v-model="el.dateValueName"
        style="display:none"
      >{{ dateValueName }}
      </x-input>
      <template v-if="isInstance">
        <span class="instance-state">
          <em
            v-if="el.state === 'SUCCESS'"
            class="iconfont ans-icon-success-solid"
            :class="'icon-' + el.state"
            data-toggle="tooltip"
            data-container="body"
            title="成功"
          />
          <em
            v-if="el.state === 'WAITING'"
            class="iconfont ans-icon-clock"
            :class="'icon-' + el.state"
            data-toggle="tooltip"
            data-container="body"
            title="等待"
          />
          <em
            v-if="el.state === 'FAILED'"
            class="iconfont ans-icon-fail-solid"
            :class="'icon-' + el.state"
            data-toggle="tooltip"
            data-container="body"
            title="失败"
          />
        </span>
      </template>
      <span v-if="show" class="operation">
        <a href="javascript:" class="delete" @click="!isDetails && _remove($index)">
          <em class="oper-btn delete" :class="_isDetails" data-toggle="tooltip" data-container="body" title="删除" />
        </a>
        <a v-if="($index === (dependItemList.length - 1))" href="javascript:" class="add" @click="!isDetails && _add()">
          <em class="oper-btn add" :class="_isDetails" data-toggle="tooltip" data-container="body" title="添加" />
        </a>
      </span>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import store from '@/store'
import {
  cycleList,
  dateValueList
} from '@/views/etlscheduler/dag/_source/formModel/tasks/_source/commcon'
import disabledState from '@/components/etl/mixin/disabledState'
import {
  getScheduleList,
  getTaskLink
} from '@/api/etlscheduler/processschedule'
// import { debug } from 'leancloud-storage'
import $ from 'jquery'
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
    dependTaskList: Array,
    processSchedulesUuid: String
  },
  data() {
    return {
      store,
      // dependTaskList: Array,
      task: null,
      list: [],
      // projectList: [],
      cycleList: cycleList,
      isInstance: false,
      itemIndex: null,
      scheduleList: [],
      cycleValue: '',
      dateValueName: '',
      cycle: { value: 'day' },
      depTasksList: {},
      show: false
    }
  },
  computed: {
    isScheduleDetail() {
      return this.store.state.monitor.scheduleDetail // 需要监听的数据
    }
  },
  watch: {
    'dependTaskList': 'initDepend',
    isScheduleDetail(val) {
      if (val) {
        this.show = false
      } else {
        this.show = true
      }
    }
    // dependItemList() {
    //   this.isInstance = false
    //   getScheduleList().then((resp) => {
    //     this.scheduleList = resp.data
    //     const value = this.scheduleList[0].processSchedulesUuid
    //     if (!this.dependItemList.length) {
    //       getTaskLink(value).then((resp) => {
    //         this.$emit(
    //           'dependItemListEvent',
    //           _.concat(
    //             this.dependItemList,
    //             this._rtNewParams(value, this.scheduleList, resp.data)
    //           )
    //         )
    //       })
    //     } else {
    //       const ids = _.map(
    //         this.dependItemList,
    //         (v) => v.processSchedulesUuid
    //       ).join(',')
    //       // get item list
    //       this._getDependItemList(ids, false).then((res) => {
    //         _.map(this.dependItemList, (v, i) => {
    //           getTaskLink(value).then((resTaskList) => {
    //             this.$set(
    //               this.dependItemList,
    //               i,
    //               this._rtOldParams(
    //                 v.processSchedulesUuid,
    //                 this.scheduleList,
    //                 res.data,
    //                 v
    //               )
    //             )
    //           })
    //         })
    //       })
    //     }
    //   })
    // }
  },
  beforeCreate() {},
  created() {
    // is type instancedetails
    this.isInstance = false
    this.show = !this.store.state.monitor.scheduleDetail
    // this.initDepend()
  },
  mounted() {
    this.initDepend()
  },
  beforeMounted() {
    // this.initDepend()
  },
  methods: {
    initDepend() {
      // 依赖不存在时
      if (this.dependItemList === null || !this.dependItemList.length || this.dependItemList[0] === {}) {
        if (this.dependItemList == null) this.dependItemList = []
        getScheduleList().then((resp) => {
          // this.scheduleList = resp.data
          // { 'processSchedulesUuid': this.processSchedulesUuid }
          // 找到所有不符合条件的
          this.scheduleList = _.reject(resp.data,
            { 'processSchedulesUuid': this.processSchedulesUuid })
          // if (this.scheduleList == null || this.scheduleList.length === 0) return
          // 判断 dependItemList 是否有值（无值的时候）
          const value = this.scheduleList[0].processSchedulesUuid
          getTaskLink(value).then((taskRes) => {
            const depTasksList = [{ id: 'ALL', name: 'ALL' }].concat(_.map(taskRes.data[value], (v) => v))
            this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(value, this.scheduleList, depTasksList)))
          })

          // this._getDependItemList(value).then(tasksResp => {
          //   const depTasksList = tasksResp.data
          //   this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(value, this.scheduleList, depTasksList)))
          // })
        })
      } else {
        const ids = _.map(this.dependItemList, v => v.processSchedulesUuid).join(',')
        // get item list
        this._getDependItemList(ids, false).then(res => {
          _.map(this.dependItemList, (v, i) => {
            getScheduleList().then((resp) => {
              // this.scheduleList = resp.data
              // 找到所有不符合条件的
              this.scheduleList = _.reject(resp.data,
                { 'processSchedulesUuid': this.processSchedulesUuid })
              // if (this.scheduleList == null || this.scheduleList.length === 0) return
              // 判断 dependItemList 是否有值（无值的时候）
              // const value = this.scheduleList[0].processSchedulesUuid
              this.$set(this.dependItemList, i, this._rtOldParams(v.processSchedulesUuid, this.scheduleList, [{ id: 'ALL', name: 'ALL' }].concat(_.map(res.data[v.processSchedulesUuid] || [], v => v.name)), v))
              getTaskLink(v.processSchedulesUuid).then((respon) => {
                // const depTasksList = resp.data
                const item = this.dependItemList[i]
                // init set depTasks All
                // item.depTasks = 'ALL'
                item.depTasks = this.dependItemList[i].depTasks
                this.$set(
                  this.dependItemList,
                  i,
                  this._rtOldParams(v.processSchedulesUuid, item.scheduleList, [{ id: 'ALL', name: 'ALL' }].concat(_.map(respon.data[v.processSchedulesUuid], (v) => v)), item)
                )
              })
            })
          })
        })
      }
    },

    /**
     * add task
     */
    _add() {
      // btn loading
      this.isLoading = true

      getScheduleList().then((resp) => {
        // 找到所有不符合条件的
        this.scheduleList = _.reject(resp.data,
          { 'processSchedulesUuid': this.processSchedulesUuid })
        // this.scheduleList = resp.data
        if (this.scheduleList == null || this.scheduleList.length === 0) {
          return
        }
        // const value = this.scheduleList[0].processSchedulesUuid
        // dependItemList index
        const is = (value) => _.some(this.dependItemList, { processSchedulesUuid: value })
        const noArr = _.filter(this.scheduleList, v => !is(v.processSchedulesUuid))
        const value = noArr[0] && noArr[0].processSchedulesUuid || null
        const val = value || this.scheduleList[0].processSchedulesUuid
        getTaskLink(val).then((resp) => {
          const depTasksList = [{ id: 'ALL', name: 'ALL' }].concat(_.map(resp.data[val], (v) => v))
          this.$emit('dependItemListEvent', _.concat(this.dependItemList, this._rtNewParams(val, this.scheduleList, depTasksList)))
        })
      })
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
    /**
     * get dependItemList
     */
    _getDependItemList(ids, is = true) {
      return new Promise((resolve, reject) => {
        // if (is) {
        //   getScheduleList().then((res) => {
        //     resolve(['ALL'].concat(_.map(res, (v) => v.scheduleName)))
        //   })
        // } else {
        // 返回任务环节
        getTaskLink(ids).then((resp) => {
          resolve(resp)
        })
        // }
      })
    },
    _onChangeDefinitionId({ value }) {
      // get depItem list data
      // 根据流程调度ID 查
      getTaskLink(value).then((resp) => {
        this.depTasksList[value] = resp.data[value]
        // const depTasksList = resp.data
        const item = this.dependItemList[this.itemIndex]
        // init set depTasks All
        item.depTasks = 'ALL'
        this.$set(
          this.dependItemList,
          this.itemIndex,
          this._rtOldParams(value, item.scheduleList, [{ id: 'ALL', name: 'ALL' }].concat(_.map(resp.data[value], (v) => v)), item)
        )
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
      this.cycle = _.find(cycleList, ['value', value])
      this.cycleValue = this.cycle.label
      this.$set(
        this.dependItemList[this.itemIndex],
        'cycleValue',
        this.cycleValue
      )
      const list = _.cloneDeep(dateValueList[value])
      this.$set(
        this.dependItemList[this.itemIndex],
        'dateValue',
        list[0].value
      )
      this.$set(
        this.dependItemList[this.itemIndex],
        'dateValueName',
        list[0].label
      )
      this.$set(this.dependItemList[this.itemIndex], 'dateValueList', list)
    },
    _onChangeDateValue({ value }) {
      const list = _.cloneDeep(dateValueList[this.cycle.value])
      this.dateValueName = _.find(list, ['value', value])
      this.$set(
        this.dependItemList[this.itemIndex],
        'dateValueName',
        this.dateValueName.label
      )
    },
    _onChangeDepTasksName({ value }) {
      const item = this.dependItemList[this.itemIndex]
      var depTasks = {}
      if (typeof item.depTasksList !== 'undefined') {
        if (typeof item.depTasks !== 'undefined') {
          depTasks = _.find(item.depTasksList, ['id', value])
        }
        if (value === 'ALL') {
          depTasks = { name: 'ALL' }
        }
      }
      if ($.isEmptyObject(depTasks)) {
        depTasks = { name: '' }
      }
      // const i = _.findIndex(this.dependItemList, v => v.processSchedulesUuid === value)
      // this.$set(this.dependItemList, i, this._rtOldParams(value, scheduleList, depTasksList, item))
      this.$set(
        this.dependItemList[this.itemIndex],
        'depTasksName',
        depTasks.name
      )
    },
    _rtNewParams(value, scheduleList, depTasksList) {
      const o = _.find(this.scheduleList, ['processSchedulesUuid', value])
      return {
        processSchedulesUuid: value,
        // dependItem need private definitionList
        // definitionList: scheduleList,
        scheduleList: scheduleList,
        depTasks: 'ALL',
        depTasksList: depTasksList,
        cycle: 'day',
        cycleValue: '日',
        scheduleName: o.scheduleName || '',
        depTasksName: 'ALL',
        dateValue: 'today',
        dateValueName: '今天',
        dateValueList: _.cloneDeep(dateValueList['day']),
        state: ''
      }
    },
    _rtOldParams(value, scheduleList, depTasksList, item) {
      const o = _.find(this.scheduleList, ['processSchedulesUuid', value])
      return {
        processSchedulesUuid: value,
        scheduleList: scheduleList,
        depTasks: item.depTasks || 'ALL',
        depTasksName: item.depTasksName,
        depTasksList: depTasksList,
        cycle: item.cycle,
        cycleValue: item.cycleValue,
        scheduleName: o.scheduleName,
        dateValue: item.dateValue,
        dateValueName: item.dateValueName,
        dateValueList: _.cloneDeep(dateValueList[item.cycle]),
        state: item.state
      }
    },
    // _cpOldParams(id, scheduleList, depTasksList, item) {
    //   return {
    //     scheduleList: scheduleList,
    //     processSchedulesUuid: id,
    //     depTasks: item.depTasks || 'ALL',
    //     depTasksList: depTasksList,
    //     cycle: item.cycle,
    //     dateValue: item.dateValue,
    //     dateValueList: _.cloneDeep(dateValueList[item.cycle]),
    //     state: item.state
    //   }
    // },
    /**
     * remove tip
     */
    _removeTip() {
      $('body').find('.tooltip.fade.top.in').remove()
    }
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
.ans-select .inner-input .input-element {
	color: #606266;
	cursor: pointer;
	text-overflow: ellipsis;
}
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
         margin-right: 2px;
        // color: #ff0000;
      }
      .add {
        // color: #0097e0;
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
        color: #f31322;
      }
    }
  }
}
</style>
