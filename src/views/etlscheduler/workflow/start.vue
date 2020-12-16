<template>
  <div class="start-process-model">
    <div class="title-box">
      <span>启动前请先设置参数</span>
    </div>
    <div class="clearfix list">
      <div class="text">
        {{ $t('Process Name') }}
      </div>
      <div style="line-height: 32px;">{{ workflowName }}</div>
    </div>
    <div class="clearfix list">
      <div class="text">
        失败策略
      </div>
      <div class="cont">
        <x-radio-group
          v-model="failureStrategy"
          style="margin-top: 7px;"
        >
          <x-radio :label="'CONTINUE'">继续</x-radio>
          <x-radio :label="'END'">结束</x-radio>
        </x-radio-group>
      </div>
    </div>
    <div
      v-if="sourceType === 'contextmenu'"
      class="clearfix list"
      style="margin-top: -8px;"
    >
      <div class="text">
        节点执行
      </div>
      <div
        class="cont"
        style="padding-top: 6px;"
      >
        <x-radio-group v-model="taskDependType">
          <x-radio :label="'TASK_POST'">向后执行</x-radio>
          <x-radio :label="'TASK_PRE'">向前执行</x-radio>
          <x-radio :label="'TASK_ONLY'">仅执行当前节点</x-radio>
        </x-radio-group>
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        通知策略
      </div>
      <div class="cont">
        <x-select
          v-model="warningType"
          style="width: 200px;"
        >
          <x-option
            v-for="city in warningTypeList"
            :key="city.id"
            :value="city.id"
            :label="city.code"
          />
        </x-select>
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        流程优先级
      </div>
      <div class="cont">
        <m-priority v-model="processInstancePriority" />
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        Worker分组
      </div>
      <div class="cont">
        <m-worker-groups v-model="workerGroup" />
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        通知组
      </div>
      <div class="cont">
        <x-select
          v-model="warningGroupId"
          style="width: 200px;"
          :disabled="!notifyGroupList.length"
        >
          <x-input
            slot="trigger"
            slot-scope="{ selectedModel }"
            readonly
            placeholder="请选择通知组"
            :value="selectedModel ? selectedModel.label : ''"
            style="width: 200px;"
            @on-click-icon.stop="warningGroupId = ''"
          >
            <em
              v-show="warningGroupId"
              slot="suffix"
              class="ans-icon-fail-solid"
              style="font-size: 15px;cursor: pointer;"
            />
            <em
              v-show="!warningGroupId"
              slot="suffix"
              class="ans-icon-arrow-down"
              style="font-size: 12px;"
            />
          </x-input>
          <x-option
            v-for="city in notifyGroupList"
            :key="city.id"
            :value="city.id"
            :label="city.code"
          />
        </x-select>
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        收件人
      </div>
      <div
        class="cont"
        style="width: 688px;"
      >
        <m-email
          v-model="receivers"
          :repeat-data="receiversCc"
        />
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        抄送人
      </div>
      <div
        class="cont"
        style="width: 688px;"
      >
        <m-email
          v-model="receiversCc"
          :repeat-data="receivers"
        />
      </div>
    </div>
    <div class="clearfix list">
      <div class="text">
        补数
      </div>
      <div class="cont">
        <div style="padding-top: 6px;">
          <x-checkbox v-model="execType">是否补数</x-checkbox>
        </div>
      </div>
    </div>
    <template v-if="execType">
      <div
        class="clearfix list"
        style="margin:-6px 0 16px 0"
      >
        <div class="text">
          执行方式
        </div>
        <div class="cont">
          <x-radio-group
            v-model="runMode"
            style="margin-top: 7px;"
          >
            <x-radio :label="'RUN_MODE_SERIAL'">串行执行</x-radio>
            <x-radio :label="'RUN_MODE_PARALLEL'">并行执行</x-radio>
          </x-radio-group>
        </div>
      </div>
      <div class="clearfix list">
        <div class="text">
          调度日期
        </div>
        <div class="cont">
          <x-datepicker
            style="width: 360px;"
            :panel-num="2"
            placement="bottom-start"
            :value="scheduleTime"
            type="daterange"
            placeholder="选择日期区间"
            format="YYYY-MM-DD HH:mm:ss"
            @on-change="_datepicker"
          />
        </div>
      </div>
    </template>
    <div class="submit">
      <x-button
        type="text"
        @click="close()"
      > 取消 </x-button>
      <x-button
        type="primary"
        shape="circle"
        :loading="spinnerLoading"
        @click="ok()"
      >{{ spinnerLoading ? 'Loading...' : '开始' }} </x-button>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import dayjs from 'dayjs'
import mEmail from './email.vue'
import store from '@/store'
import { warningTypeList } from './utilstart'
import mPriority from '@/components/etl/priority/priority'
import mWorkerGroups from '@/views/etlscheduler/dag/_source/formModel/_source/workerGroups'

export default {
  name: 'StartProcess',
  components: { mEmail, mPriority, mWorkerGroups },
  props: {
    item: Object,
    startNodeList: {
      type: String,
      default: ''
    },
    sourceType: String
  },
  data() {
    return {
      store,
      processDefinitionId: 0,
      failureStrategy: 'CONTINUE',
      warningTypeList: warningTypeList,
      workflowName: '',
      warningType: '',
      notifyGroupList: [],
      warningGroupId: '',
      scheduleTime: '',
      spinnerLoading: false,
      execType: false,
      taskDependType: 'TASK_POST',
      receivers: [],
      receiversCc: [],
      runMode: 'RUN_MODE_SERIAL',
      processInstancePriority: 'MEDIUM',
      workerGroup: 'default'

    }
  },
  computed: {},
  watch: {
    execType(a) {
      this.scheduleTime = a ? [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 00:00:00')] : ''
    }
  },
  created() {
    this.warningType = this.warningTypeList[0].id
    this.workflowName = this.item.name

    this._getReceiver()
    const stateWorkerGroupsList = this.store.state.security.workerGroupsListAll || []
    if (stateWorkerGroupsList.length) {
      this.workerGroup = stateWorkerGroupsList[0].id
    } else {
      this.store.dispatch('security/getWorkerGroupsAll').then(res => {
        this.$nextTick(() => {
          if (res.length > 0) {
            this.workerGroup = res[0].id
          }
        })
      })
    }
  },
  mounted() {
    this._getNotifyGroupList().then(() => {
      this.$nextTick(() => {
        this.warningGroupId = ''
      })
    })
    this.workflowName = this.item.name
  },
  methods: {
    _datepicker(val) {
      this.scheduleTime = val
    },
    _start() {
      this.spinnerLoading = true
      const param = {
        processDefinitionId: this.item.id,
        scheduleTime: this.scheduleTime.length && this.scheduleTime.join(',') || '',
        failureStrategy: this.failureStrategy,
        warningType: this.warningType,
        warningGroupId: this.warningGroupId === '' ? 0 : this.warningGroupId,
        execType: this.execType ? 'COMPLEMENT_DATA' : null,
        startNodeList: this.startNodeList,
        taskDependType: this.taskDependType,
        runMode: this.runMode,
        processInstancePriority: this.processInstancePriority,
        receivers: this.receivers.join(',') || '',
        receiversCc: this.receiversCc.join(',') || '',
        workerGroup: this.workerGroup
      }
      // Executed from the specified node
      if (this.sourceType === 'contextmenu') {
        param.taskDependType = this.taskDependType
      }
      this.store.dispatch('dag/processStart', param).then(res => {
        this.$notify({
          title: this.$t('message.title'),
          message: res.msg,
          type: 'success',
          duration: 2000,
          position: 'bottom-right'
        })
        this.$emit('onUpdate')
        setTimeout(() => {
          this.spinnerLoading = false
          this.close()
        }, 500)
      }).catch(e => {
        this.$message.error(e.msg || '')
        this.spinnerLoading = false
      })
    },
    _getNotifyGroupList() {
      return new Promise((resolve, reject) => {
        const notifyGroupListS = _.cloneDeep(this.store.state.dag.notifyGroupListS) || []
        if (!notifyGroupListS.length) {
          this.store.dispatch('dag/getNotifyGroupList').then(res => {
            this.notifyGroupList = res
            resolve()
          })
        } else {
          this.notifyGroupList = notifyGroupListS
          resolve()
        }
      })
    },
    _getReceiver() {
      this.store.dispatch('dag/getReceiver', { processDefinitionId: this.item.id }).then(res => {
        this.receivers = res.receivers && res.receivers.split(',') || []
        this.receiversCc = res.receiversCc && res.receiversCc.split(',') || []
      })
    },
    ok() {
      this._start()
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.start-process-model {
  width: 860px;
  min-height: 300px;
  background: #fff;
  border-radius: 3px;
  .title-box {
    margin-bottom: 18px;
    span {
      padding-left: 30px;
      font-size: 16px;
      padding-top: 29px;
      display: block;
    }
  }
  .list {
    margin-bottom: 14px;
    .text {
      width: 140px;
      float: left;
      text-align: right;
      line-height: 32px;
      padding-right: 8px;
    }
    .cont {
      width: 350px;
      float: left;
      .add-email-model {
        padding: 20px;
      }
    }
  }
  .submit {
    text-align: right;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 30px;
  }
}
</style>
