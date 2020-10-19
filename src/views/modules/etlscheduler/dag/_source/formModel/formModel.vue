<template>
  <div
    v-clickoutside="_handleClose"
    class="form-model-model"
  >
    <div class="title-box">
      <span class="name">当前节点设置</span>
      <span class="go-subtask">
        <!-- Component can't pop up box to do component processing -->
        <m-log :item="backfillItem">
          <template slot="history"><a
            href="javascript:"
            @click="_seeHistory"
          ><em class="ansicon ans-icon-timer" /><em>查看历史</em></a></template>
          <template slot="log"><a href="javascript:"><em class="ansicon ans-icon-log" /><em>查看日志</em></a></template>
        </m-log>
        <a
          v-if="_isGoSubProcess"
          href="javascript:"
          @click="_goSubProcess"
        ><em class="ansicon ans-icon-node" /><em>进入该子节点</em></a>
      </span>
    </div>
    <div
      v-if="isContentBox"
      class="content-box"
    >
      <div class="from-model" style="margin-bottom: 100px;">
        <!-- Node name -->
        <div class="clearfix list">
          <div class="text-box">
            <span style="color: red;">*</span>
            <span>节点名称</span></div>
          <div class="cont-box">
            <label class="label-box">
              <x-input
                v-model="name"
                type="text"
                :disabled="isDetails"
                placeholder="请输入名称(必填)"
                :maxlength="100"
                autocomplete="off"
                class="propwidth"
              />
            </label>
          </div>
        </div>

        <!-- task Node -->
        <div class="clearfix list">
          <div class="text-box">
            <span style="color: red;">*</span>
            <span>节点编码</span></div>
          <div class="cont-box">
            <label class="label-box">
              <x-input
                v-model="taskCode"
                type="text"
                :disabled="isDetails"
                placeholder="请输入节点编码(必填)"
                :maxlength="100"
                autocomplete="off"
                class="propwidth"
              />
            </label>
          </div>
        </div>

        <!-- Running sign -->
        <div class="clearfix list" style="display:none">
          <div class="text-box">
            <span>运行标志</span></div>
          <div class="cont-box">
            <label class="label-box">
              <x-radio-group v-model="runFlag">
                <x-radio
                  :label="'NORMAL'"
                  :disabled="isDetails"
                >正常</x-radio>
                <x-radio
                  :label="'FORBIDDEN'"
                  :disabled="isDetails"
                >禁止执行</x-radio>
              </x-radio-group>
            </label>
          </div>
        </div>

        <!-- Task priority -->
        <div class="clearfix list">
          <div class="text-box">
            <span>任务优先级</span>
          </div>
          <div class="cont-box">
            <span
              class="label-box"
              style="width: 193px;display: inline-block;"
            >
              <m-priority v-model="taskInstancePriority" />
            </span>
            <span
              class="text-b"
              style="display:none"
            >Worker分组</span>
            <m-worker-groups
              v-model="workerGroup"
              style="display:none"
            />
          </div>
        </div>

        <div class="clearfix list">
          <div class="text-box">
            <span style="color: red;">*</span>
            <span>出错策略</span></div>
          <div class="cont-box">
            <!-- <label class="label-box"> -->
            <x-select
              v-model="errorType"
              :disabled="isDetails"
              placeholder="请选择出错策略(必填)"
              class="propwidth"
            >
              <x-option
                v-for="model in errorTypeList"
                :key="model.value"
                :value="model.value"
                :label="model.name"
              />
            </x-select>
            <!-- </label> -->
          </div>
        </div>
        <div v-if="errorhide" class="clearfix list">
          <div class="text-box">
            <span style="color: red;">*</span>
            <span>出错次数</span></div>
          <div class="cont-box">
            <label class="label-box">
              <x-input
                v-model="errorNumbers"
                type="text"
                :disabled="isDetails"
                placeholder="请输入出错次数(必填)"
                :maxlength="100"
                autocomplete="off"
                class="propwidth"
              />
            </label>
          </div>
        </div>
        <!-- Task timeout alarm -->
        <m-timeout-alarm
          ref="timeout"
          :backfill-item="backfillItem"
          @on-timeout="_onTimeout"
        />

        <!-- sql node -->
        <!-- <m-sql
          v-if="taskType == 'SQL'"
          ref="SQL"
          :create-node-id="id"
          :backfill-item="backfillItem"
          @on-params="_onParams"
          @on-cache-params="_onCacheParams"
        /> -->
        <m-sql
          v-if="taskType === 'SQL'"
          ref="SQL"
          :create-node-id="id"
          :backfill-item="backfillItem"
          @on-params="_onParams"
          @on-cache-params="_onCacheParams"
        />
        <m-java
          v-if="taskType === 'JAVA'"
          ref="JAVA"
          :create-node-id="id"
          :backfill-item="backfillItem"
          @on-params="_onParams"
          @on-cache-params="_onCacheParams"
        />
        <!-- description -->
        <div class="clearfix list">
          <div class="text-box">
            <span>节点描述</span>
          </div>
          <div class="cont-box">
            <label class="label-box">
              <x-input
                v-model="description"
                resize
                :autosize="{minRows:2}"
                type="textarea"
                :disabled="isDetails"
                placeholder="请输入描述"
                autocomplete="off"
                class="propwidth"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-box">
      <div
        class="submit"
        style="background: #fff;"
      >
        <x-button
          type="text"
          @click="close()"
        > 取消 </x-button>
        <x-button
          type="primary"
          shape="circle"
          :loading="spinnerLoading"
          :disabled="isDetails"
          @click="ok()"
        >{{ spinnerLoading ? 'Loading...' : '确认添加' }} </x-button>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import mLog from './log'
import mSql from './tasks/sql'
import mJava from './tasks/java'
import JSP from './../plugIn/jsPlumbHandle'
import mTimeoutAlarm from './_source/timeoutAlarm'
import mWorkerGroups from './_source/workerGroups'
import clickoutside from '@/components/Dolphin/util/clickoutside'
import disabledState from '@/components/Dolphin/mixin/disabledState'
import { isNameExDag, rtBantpl } from './../plugIn/util'
import mPriority from '@/components/Dolphin/priority/priority'
import $ from 'jquery'

export default {
  name: 'FormModel',
  /**
   * Click on events that are not generated internally by the component
   */
  directives: { clickoutside },
  mixins: [disabledState],
  props: {
    // id: Number,
    id: String,
    taskType: String,
    self: Object,
    preNode: Array,
    rearList: Array,
    // instanceId: Number
    instanceId: String
  },
  data() {
    return {
      // loading
      spinnerLoading: false,
      // node name
      name: '',
      taskCode: '',
      // description
      description: '',
      // Node echo data
      backfillItem: {},
      cacheBackfillItem: {},
      // Resource(list)
      resourcesList: [],
      successNode: 'success',
      failedNode: 'failed',
      successBranch: '',
      failedBranch: '',
      conditionResult: {
        'successNode': [],
        'failedNode': []
      },
      // dependence
      dependence: {},
      // cache dependence
      cacheDependence: {},
      // Current node params data
      params: {},
      // Running sign
      runFlag: 'NORMAL',
      // The second echo problem caused by the node data is specifically which node hook caused the unfinished special treatment
      // isContentBox: false,
      isContentBox: true,
      // Number of failed retries
      maxRetryTimes: '0',
      // Failure retry interval
      retryInterval: '1',
      // Task timeout alarm
      timeout: {},
      // Task priority
      taskInstancePriority: 'MEDIUM',
      // worker group id
      workerGroup: 'default',
      errorType: '',
      errorTypeList: [{ name: '不重试', value: '0' }, { name: '重试', value: '1' }],
      errorNumbers: null,
      errorhide: false,
      stateList: [
        {
          value: 'success',
          label: `成功`
        },
        {
          value: 'failed',
          label: `失败`
        }
      ]
    }
  },
  methods: {
    ...mapActions('dag', ['getTaskInstanceList']),
    /**
     * depend
     */
    _onDependent(o) {
      this.dependence = Object.assign(this.dependence, {}, o)
    },
    _veriferrorNumbers() {
      const reg = /^[1-9]\d*$/
      if (!reg.test(this.errorNumbers)) {
        this.$message.warning(`重试次数请输入大于 0 的正整数`)
        return false
      }
      return true
    },
    /**
     * cache dependent
     */
    _onCacheDependent(o) {
      this.cacheDependence = Object.assign(this.cacheDependence, {}, o)
    },
    /**
     * Task timeout alarm
     */
    _onTimeout(o) {
      this.timeout = Object.assign(this.timeout, {}, o)
    },
    /**
     * Click external to close the current component
     */
    _handleClose() {
      // this.close()
    },
    /**
     * Jump to task instance
     */
    _seeHistory() {
      this.self.$router.push({
        name: 'task-instance',
        query: {
          processInstanceId: this.self.$route.params.id,
          taskName: this.backfillItem.name
        }
      })
      this.$modal.destroy()
    },
    /**
     * Enter the child node to judge the process instance or the process definition
     * @param  type = instance
     */
    _goSubProcess() {
      if (_.isEmpty(this.backfillItem)) {
        this.$message.warning(`新创建子工作流还未执行，不能进入子工作流`)
        return
      }
      // if (this.router.history.current.name === 'projects-instance-details') {
      const a = false
      if (a) {
        const stateId = $(`#${this.id}`).attr('data-state-id') || null
        if (!stateId) {
          this.$message.warning(`该任务还未执行，不能进入子工作流`)
          return
        }
        this.store.dispatch('dag/getSubProcessId', { taskId: stateId }).then(res => {
          this.$emit('onSubProcess', {
            subProcessId: res.data.subProcessInstanceId,
            fromThis: this
          })
        }).catch(e => {
          this.$message.error(e.msg || '')
        })
      } else {
        this.$emit('onSubProcess', {
          subProcessId: this.backfillItem.params.processDefinitionId,
          fromThis: this
        })
      }
    },
    /**
     * return params
     */
    _onParams(o) {
      this.params = Object.assign({}, o)
    },

    _onCacheParams(o) {
      this.params = Object.assign(this.params, {}, o)
      this._cacheItem()
    },

    _cacheItem() {
      this.conditionResult.successNode[0] = this.successBranch
      this.conditionResult.failedNode[0] = this.failedBranch
      this.$emit('cacheTaskInfo', {
        item: {
          type: this.taskType,
          id: this.id,
          name: this.name,
          taskCode: this.taskCode,
          errorType: this.errorType,
          errorNumbers: this.errorNumbers,
          params: this.params,
          description: this.description,
          runFlag: this.runFlag,
          conditionResult: this.conditionResult,
          dependence: this.cacheDependence,
          maxRetryTimes: this.maxRetryTimes,
          retryInterval: this.retryInterval,
          timeout: this.timeout,
          taskInstancePriority: this.taskInstancePriority,
          workerGroup: this.workerGroup,
          status: this.status,
          branch: this.branch
        },
        fromThis: this
      })
    },
    /**
     * verification name
     */
    _verifName() {
      if (!_.trim(this.name)) {
        this.$message.warning(`请输入名称（必填）`)
        return false
      }
      if (!_.trim(this.taskCode)) {
        this.$message.warning(`请输入节点编码（必填）`)
        return false
      }
      if (!_.trim(this.errorType)) {
        this.$message.warning(`请选择出错策略（必填）`)
        return false
      }
      if (this.errorType === '1') {
        if (!_.trim(this.errorNumbers)) {
          this.$message.warning(`请输入出错次数（必填）`)
          return false
        }
      }
      if (this.errorNumbers && !this._veriferrorNumbers()) {
        return false
      }
      if (this.successBranch !== '' && this.successBranch != null && this.successBranch === this.failedBranch) {
        this.$message.warning(`成功分支流转和失败分支流转不能选择同一个节点`)
        return false
      }
      if (this.name === this.backfillItem.name) {
        return true
      }
      // Name repeat depends on dom backfill dependent store
      if (isNameExDag(this.name, _.isEmpty(this.backfillItem) ? 'dom' : 'backfill')) {
        this.$message.warning(`名称已存在请重新输入`)
        return false
      }
      return true
    },
    _verifWorkGroup() {
      // const item = this.store.state.security.workerGroupsListAll.find(item => {
      //   return item.id === this.workerGroup
      // })
      // if (item === undefined) {
      //   // TODO
      //   // this.$message.warning(`该Worker分组已经不存在，请选择正确的Worker分组！}`)
      //   return true
      // }
      return true
    },
    /**
     * Global verification procedure
     */
    _verification() {
      // Verify name
      if (!this._verifName()) {
        return
      }
      // verif workGroup
      if (!this._verifWorkGroup()) {
        return
      }
      // Verify task alarm parameters
      if (!this.$refs['timeout']._verification()) {
        return
      }
      // Verify node parameters
      if (!this.$refs[this.taskType]._verification()) {
        return
      }

      $(`#${this.id}`).find('span').text(this.name)
      this.conditionResult.successNode[0] = this.successBranch
      this.conditionResult.failedNode[0] = this.failedBranch
      // Store the corresponding node data structure
      this.$emit('addTaskInfo', {
        item: {
          type: this.taskType,
          id: this.id,
          name: this.name,
          taskCode: this.taskCode,
          errorType: this.errorType,
          errorNumbers: this.errorNumbers,
          params: this.params,
          description: this.description,
          runFlag: this.runFlag,
          conditionResult: this.conditionResult,
          dependence: this.dependence,
          maxRetryTimes: this.maxRetryTimes,
          retryInterval: this.retryInterval,
          timeout: this.timeout,
          taskInstancePriority: this.taskInstancePriority,
          workerGroup: this.workerGroup,
          status: this.status,
          branch: this.branch
        },
        fromThis: this
      })

      // set run flag
      this._setRunFlag()
    },
    /**
     * Sub-workflow selected node echo name
     */
    _onSetProcessName(name) {
      this.name = name
    },
    /**
     *  set run flag
     */
    _setRunFlag() {
      const dom = $(`#${this.id}`).find('.ban-p')
      dom.html('')
      if (this.runFlag === 'FORBIDDEN') {
        dom.append(rtBantpl())
      }
    },
    /**
     * Submit verification
     */
    ok() {
      this._verification()
    },
    /**
     * Close and destroy component and component internal events
     */
    close() {
      let flag = false
      // Delete node without storage
      if (!this.backfillItem.name) {
        flag = true
      }
      this.isContentBox = false
      // flag Whether to delete a node this.$destroy()
      this.$emit('close', {
        item: {
          type: this.cacheBackfillItem.type,
          id: this.cacheBackfillItem.id,
          name: this.cacheBackfillItem.name,
          taskCode: this.cacheBackfillItem.taskCode,
          errorType: this.cacheBackfillItem.errorType,
          errorNumbers: this.cacheBackfillItem.errorNumbers,
          params: this.cacheBackfillItem.params,
          description: this.cacheBackfillItem.description,
          runFlag: this.cacheBackfillItem.runFlag,
          conditionResult: this.cacheBackfillItem.conditionResult,
          dependence: this.cacheBackfillItem.dependence,
          maxRetryTimes: this.cacheBackfillItem.maxRetryTimes,
          retryInterval: this.cacheBackfillItem.retryInterval,
          timeout: this.cacheBackfillItem.timeout,
          taskInstancePriority: this.cacheBackfillItem.taskInstancePriority,
          workerGroup: this.cacheBackfillItem.workerGroup,
          status: this.cacheBackfillItem.status,
          branch: this.cacheBackfillItem.branch
        },
        flag: flag,
        fromThis: this
      })
    }
  },
  computed: {
    /**
     * Child workflow entry show/hide
     */
    _isGoSubProcess() {
      return this.taskType === 'SUB_PROCESS' && this.name
    },
    // Define the item model
    _item() {
      return {
        type: this.taskType,
        id: this.id,
        name: this.name,
        taskCode: this.taskCode,
        errorType: this.errorType,
        errorNumbers: this.errorNumbers,
        description: this.description,
        runFlag: this.runFlag,
        dependence: this.cacheDependence,
        maxRetryTimes: this.maxRetryTimes,
        retryInterval: this.retryInterval,
        timeout: this.timeout,
        taskInstancePriority: this.taskInstancePriority,
        workerGroup: this.workerGroup,
        successBranch: this.successBranch,
        failedBranch: this.failedBranch
      }
    }
  },
  watch: {
    /**
     * Watch the item change, cache the value it changes
     **/
    _item(val) {
      // this._cacheItem()
    },
    errorType(val) {
      if (val === '1') {
        this.errorhide = true
        if (this.errorNumbers == null) {
          this.errorNumbers = 3
        }
      }
      if (val === '0') {
        this.errorhide = false
        this.errorNumbers = null
      }
    }
  },
  created() {
    // Unbind copy and paste events
    JSP.removePaste()
    // Backfill data
    const taskList = this.store.state.dag.tasks

    // fillback use cacheTasks
    const cacheTasks = this.store.state.dag.cacheTasks
    let o = {}
    if (cacheTasks[this.id]) {
      o = cacheTasks[this.id]
      this.backfillItem = cacheTasks[this.id]
    } else {
      if (taskList.length) {
        taskList.forEach(v => {
          if (v.id === this.id) {
            o = v
            this.backfillItem = v
          }
        })
      }
    }
    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.name = o.name
      this.taskCode = o.taskCode
      this.errorType = o.errorType
      this.errorNumbers = o.errorNumbers
      this.taskInstancePriority = o.taskInstancePriority
      this.runFlag = o.runFlag || 'NORMAL'
      this.description = o.description
      this.maxRetryTimes = o.maxRetryTimes
      this.retryInterval = o.retryInterval
      this.timeout = o.timeout
      if (o.conditionResult) {
        this.successBranch = o.conditionResult.successNode[0]
        this.failedBranch = o.conditionResult.failedNode[0]
      }
      // If the workergroup has been deleted, set the default workergroup
      // eslint-disable-next-line no-unused-vars
      var hasMatch = false
      for (let i = 0; i < this.store.state.security.workerGroupsListAll.length; i++) {
        var workerGroup = this.store.state.security.workerGroupsListAll[i].id
        if (o.workerGroup === workerGroup) {
          hasMatch = true
          break
        }
      }
      if (o.workerGroup === undefined) {
        this.store.dispatch('dag/getTaskInstanceList', {
          pageSize: 10, pageNo: 1, processInstanceId: this.instanceId, name: o.name
        }).then(res => {
          this.workerGroup = res.totalList[0].workerGroup
        })
      } else {
        this.workerGroup = o.workerGroup
      }

      this.params = o.params || {}
      this.dependence = o.dependence || {}
      this.cacheDependence = o.dependence || {}
    } else {
      // this.workerGroup = -1
      this.workerGroup = this.store.state.security.workerGroupsListAll[0].id
    }
    this.cacheBackfillItem = o
    this.isContentBox = true
  },
  mounted() {

  },
  updated() {
  },
  beforeDestroy() {
  },
  destroyed() {
  },
  components: {
    mSql,
    mJava,
    mLog,
    mTimeoutAlarm,
    mPriority,
    mWorkerGroups
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
@import "./formModel";
.ans-radio-disabled {
  .ans-radio-inner:after {
    background-color: #6f8391;
  }
}
.propwidth{
  width:500px
}
</style>
