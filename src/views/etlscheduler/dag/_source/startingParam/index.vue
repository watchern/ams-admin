<template>
  <div class="starting-params-dag-index">
    <template v-if="isView && isActive">
      <div class="box">
        <p class="box-hd"><em class="fa ans-icon-arrow-circle-right" /><strong>启动参数</strong></p>
        <ul class="box-bd">
          <li><span class="tab">启动类型：</span><span class="content">{{ _rtRunningType(startupParam.commandType) }}</span></li>
          <li><span class="tab">补数范围：</span><span
            v-if="startupParam.commandParam && startupParam.commandParam.complementStartDate"
            class="content"
          >{{ startupParam.commandParam.complementStartDate }}-{{ startupParam.commandParam.complementEndDate }}</span><span
            v-else
            class="content"
          >-</span></li>
          <li><span class="tab">失败策略：</span><span class="content">{{ startupParam.failureStrategy === 'END' ? '结束' : '继续' }}</span></li>
          <li><span class="tab">流程优先级：</span><span class="content">{{ startupParam.processInstancePriority }}</span></li>
          <li><span class="tab">Worker分组：</span><span
            v-if="workerGroupList.length"
            class="content"
          >{{ startupParam.workerGroup }}</span></li>
          <li><span class="tab">通知策略：</span><span class="content">{{ _rtWarningType(startupParam.warningType) }}</span></li>
          <li><span class="tab">通知组：</span><span
            v-if="notifyGroupList.length"
            class="content"
          >{{ _rtNotifyGroupName(startupParam.warningGroupId) }}</span></li>
          <li><span class="tab">收件人：</span><span class="content">{{ startupParam.receivers || '-' }}</span></li>
          <li><span class="tab">抄送人：</span><span class="content">{{ startupParam.receiversCc || '-' }}</span></li>
        </ul>
      </div>
    </template>
  </div>
</template>
<script>
// import store from '@/components/Dolphin/store'
import _ from 'lodash'
import store from '@/store'
import { runningType } from '@/views/etlscheduler/dag/_source/config'
import { warningTypeList } from '@/views/etlscheduler/workflow/util'

export default {
  name: 'StartingParamsDagIndex',
  data() {
    return {
      store,
      startupParam: store.state.dag.startup,
      isView: false,
      isActive: true,
      notifyGroupList: null,
      workerGroupList: null
    }
  },
  watch: {
    '$route': {
      deep: true,
      handler() {
        this.isActive = false
        this.$nextTick(() => (this.isActive = true))
      }
    }
  },
  mounted() {
    this._getNotifyGroupList()
    this._getWorkerGroupList()
  },
  methods: {
    _toggleParam() {
      this.isView = !this.isView
    },
    _rtRunningType(code) {
      return _.filter(runningType, v => v.code === code)[0].desc
    },
    _rtWarningType(id) {
      return _.filter(warningTypeList, v => v.id === id)[0].code
    },
    _rtNotifyGroupName(id) {
      const o = _.filter(this.notifyGroupList, v => v.id === id)
      if (o && o.length) {
        return o[0].code
      }
      return '-'
    },
    _rtWorkerGroupName(id) {
      const o = _.filter(this.workerGroupList, v => v.id === id)
      if (o && o.length) {
        return o[0].name
      }
      return '-'
    },
    _getNotifyGroupList() {
      const notifyGroupListS = _.cloneDeep(this.store.state.dag.notifyGroupListS) || []
      if (!notifyGroupListS.length) {
        this.store.dispatch('dag/getNotifyGroupList').then(res => {
          this.notifyGroupList = res
        })
      } else {
        this.notifyGroupList = notifyGroupListS
      }
    },
    _getWorkerGroupList() {
      const stateWorkerGroupsList = this.store.state.security.workerGroupsListAll || []
      if (!stateWorkerGroupsList.length) {
        this.store.dispatch('security/getWorkerGroupsAll').then(res => {
          this.workerGroupList = res
        })
      } else {
        this.workerGroupList = stateWorkerGroupsList
      }
    }
  }
}
</script>
<style lang="scss">
.starting-params-dag-index {
  .box {
    padding: 5px 10px 10px;
    .box-hd {
      .fa {
        color: #0097e0;
        margin-right: 4px;
      }
      font-size: 16px;
    }
    .box-bd {
      margin-left: 20px;
    }
  }
}
.tab {
  font-size: 12px;
  font-weight: bold;
}
.content {
  font-size: 12px;
  &:hover {
    color: #47c3ff;
  }
}
</style>
