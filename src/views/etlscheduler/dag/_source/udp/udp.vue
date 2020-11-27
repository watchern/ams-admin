<template>
  <div class="udp-model" style="margin-bottom: 60px;">
    <div class="scrollbar contpi-boxt">
      <div class="title">
        <span>添加流程</span>
      </div>

      <div>
        <div class="cont-box">
          <div class="titleText">
            <span style="color: red;">*</span>
            <span>流程名称</span>
          </div>
          <label class="label-box">
            <x-input
              v-model="name"
              class="inputcss"
              type="text"
              :disabled="isDetails"
              placeholder="请输入名称(必填)"
            />
          </label>
        </div>
        <div style="margin-top:10px">
          <div class="titleText">
            <span style="color: red;">*</span>
            <span>排序号</span>
          </div>
          <label class="label-box">
            <x-input
              v-model="orderNo"
              class="inputcss"
              type="text"
              :disabled="isDetails"
              placeholder="请输入排序号(必填)"
            />
          </label>
        </div>
        <div style="margin-top:10px">
          <div class="titleText">
            <span style="color: red;">*</span>
            <span>流程状态</span>
          </div>
          <label class="label-box">
            <x-select
              v-model="status"
              placeholder="请选择状态"
              class="inputcss"
              :disabled="isDetails"
            >
              <!-- <x-option
            label="启用"
            :value="1"
          />
          <x-option
            label="停用"
            :value="0"
          /> -->
              <x-option
                v-for="model in statusList"
                :key="model.value"
                :value="model.value"
                :label="model.label"
              />
            </x-select>
          </label>
        </div>
        <template>
          <div style="padding-top: 12px;">
            <div class="titleText" style="display:inline-flex;">
              <span>流程描述</span>
            </div>
            <label class="label-box">
              <x-input
                v-model="description"
                :disabled="isDetails"
                type="textarea"
                :autosize="{minRows:2}"
                class="inputcss"
                placeholder="请输入描述(选填)"
                autocomplete="off"
              />
            </label>
          </div>
        </template>

        <div
          class="title"
          style="padding-top: 6px;display:none"
        >
          <span class="text-b">选择租户</span>
          <x-input
            v-model="tenantId"
            type="text"
            :disabled="isDetails"
            autocomplete="off"
          />
        <!-- <form-tenant v-model="tenantId" /> -->
        </div>
        <div
          class="title"
          style="padding-top: 6px;display:none"
          :disabled="isDetails"
        >
          <span class="text-b">超时告警</span>
          <span style="padding-left: 5%;">
            <x-switch v-model="checkedTimeout" />
          </span>
        </div>
        <div
          v-if="checkedTimeout"
          class="content"
          :disabled="isDetails"
          style="padding-bottom: 10px;"
        >
          <span>
            <x-input
              v-model="timeout"
              style="width: 160px;"
              :disabled="isDetails"
              maxlength="9"
            >
              <span slot="append">分</span>
            </x-input>
          </span>
        </div>

        <!-- <div
          class="title"
          style="padding-top: 6px;"
        >
          <span>设置全局</span>
        </div> -->
        <div
          class="content"
          style="display:none"
        >
          <div>
            <m-local-params
              ref="refLocalParams"
              :udp-list="udpList"
              :hide="false"
              :disabled="isDetails"
              @on-local-params="_onLocalParams"
            />
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="submit">
          <!-- <template>
            <div class="lint-pt">
              <x-checkbox v-model="syncDefine">是否更新流程定义</x-checkbox>
            </div>
          </template> -->
          <x-button
            type="text"
            @click="close()"
          > 取消 </x-button>
          <x-button
            type="primary"
            shape="circle"
            :disabled="isDetails"
            @click="ok()"
          >保存</x-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import mLocalParams from '../formModel/tasks/_source/localParams'
import disabledState from '@/components/etl/mixin/disabledState'
import Affirm from '../jumpAffirm'
// import FormTenant from './_source/selectTenant'
export default {
  name: 'Udp',
  // components: { FormTenant, mLocalParams },
  components: { mLocalParams },
  mixins: [disabledState],
  props: {
  },
  data() {
    return {
      // dag name
      name: '',
      // dag description
      description: '',
      // Global custom parameters
      udpList: [],
      // Global custom parameters
      udpListCache: [],
      // Whether to update the process definition
      syncDefine: true,
      // Timeout alarm
      timeout: 0,

      tenantId: -1,
      // checked Timeout alarm
      checkedTimeout: true,
      statusList: [{ label: '停用', value: `0` }, { label: '启用', value: `1` }],
      orderNo: '',
      status: null
    }
  },
  watch: {
    checkedTimeout(val) {
      if (!val) {
        this.timeout = 0
        this.store.commit('dag/setTimeout', _.cloneDeep(this.timeout))
      }
    }
  },
  created() {
    const dag = _.cloneDeep(this.store.state.dag)
    this.udpList = dag.globalParams
    this.udpListCache = dag.globalParams
    this.name = dag.name
    this.status = '' + dag.status
    this.orderNo = dag.orderNo
    this.description = dag.description
    this.syncDefine = dag.syncDefine
    this.timeout = dag.timeout || 0
    this.checkedTimeout = this.timeout !== 0
    this.$nextTick(() => {
      // if (dag.tenantId === -1) {
      //   this.tenantId = this.store.state.user.userInfo.tenantId
      // } else {
      this.tenantId = dag.tenantId
      // }
    })
  },
  mounted() {
  },
  methods: {
    /**
     * udp data
     */
    _onLocalParams(a) {
      this.udpList = a
    },
    _verifTimeout() {
      const reg = /^[1-9]\d*$/
      if (!reg.test(this.timeout)) {
        this.$message.warning(`请输入大于 0 的正整数`)
        return false
      }
      return true
    },
    _verifOrderNo() {
      const reg = /^[1-9]\d*$/
      if (!reg.test(this.orderNo)) {
        this.$message.warning(`排序号请输入大于 0 的正整数`)
        return false
      }
      return true
    },
    _accuStore() {
      this.store.commit('dag/setGlobalParams', _.cloneDeep(this.udpList))
      this.store.commit('dag/setName', _.cloneDeep(this.name))
      this.store.commit('dag/setTimeout', _.cloneDeep(this.timeout))
      this.store.commit('dag/setTenantId', _.cloneDeep(this.tenantId))
      this.store.commit('dag/setDesc', _.cloneDeep(this.description))
      this.store.commit('dag/setSyncDefine', this.syncDefine)
      // TODO
      this.store.commit('dag/setStatus', _.cloneDeep(this.status))
      this.store.commit('dag/setOrderNo', _.cloneDeep(this.orderNo))
    },
    /**
     * submit
     */
    ok() {
      if (!this.name) {
        this.$message.warning(`流程名称不能为空`)
        return
      }
      if (!this.orderNo) {
        this.$message.warning(`排序号不能为空`)
        return
      }
      if (!this.status) {
        this.$message.warning(`状态不能为空`)
        return
      }
      const _verif = () => {
        // verification udf
        if (!this.$refs.refLocalParams._verifProp()) {
          return
        }
        if (!this.$refs.refLocalParams._verifValue()) {
          return
        }
        // verification timeout
        if (this.checkedTimeout && !this._verifTimeout()) {
          return
        }
        if (this.orderNo && !this._verifOrderNo()) {
          return
        }
        // Storage global globalParams
        this._accuStore()

        Affirm.setIsPop(false)
        this.$emit('onUdp')
      }

      // Edit => direct storage
      // if (this.store.state.dag.name) {
      _verif()
      // } else {
      // New First verify that the name exists
      // this.store.dispatch('dag/verifDAGName', this.name).then(res => {
      // _verif()
      // }).catch(e => {
      //   this.$message.error(e.msg || '')
      // })
      // }
    },
    /**
     * Close the popup
     */
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.titleText{
  width:13%;
  display:inline-block;
}
.inputcss{
  // width:85%;
  width:32vw;
  padding-left: 1vw;
}
.udp-model {
  width: 624px;
  min-height: 420px;
  background: #fff;
  border-radius: 3px;
  padding: 20px 0;
  position: relative;
  .contpi-boxt {
    max-height: 600px;
    overflow-y: scroll;
    padding: 0 20px;
  }
  .title {
    line-height: 36px;
    padding-bottom: 10px;
    span {
      font-size: 16px;
      color: #333;
    }
  }
  .bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: right;
    height: 56px;
    line-height: 56px;
    border-top: 1px solid #dcdedc;
    background: #fff;
    .submit {
      padding-right: 20px;
      margin-top: -4px;
    }
    .lint-pt {
      position: absolute;
      left: 20px;
      top: -2px;
      > label {
        font-weight: normal;
      }
    }
  }
  .content {
    padding-bottom: 50px;
    .user-def-params-model {
      .add {
        a {
          color: #0097e0;
        }
      }
    }
  }
}
</style>
