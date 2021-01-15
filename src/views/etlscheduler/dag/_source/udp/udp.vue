<template>
  <el-dialog :append-to-body="true" :title="routerType === 'instance'? '修改流程实例':isCreate===true?'新增流程' :'修改流程'" style="margin-bottom: 60px;" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
    <el-form
      v-if="routerType !== 'instance'"
      ref="dataForm"
      :model="temp"
      :rules="rules"
      label-position="right"
      class="detail-form"
    >
      <el-form-item
        label="流程名称"
        prop="name"
      >
        <el-input
          v-model="temp.name"
          :disabled="isDetails"
          placeholder="请输入名称(必填)"
        />
      </el-form-item>
      <el-form-item
        label="流程状态"
        prop="status"
      >
        <el-select v-model="temp.status" placeholder="请选择状态" style="width:100%">
          <el-option
            v-for="(model,$index) in statusList"
            :key="$index"
            :value="model.value"
            :label="model.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="排序号"
        prop="orderNo"
      >
        <el-input
          v-model.number="temp.orderNo"
          :disabled="isDetails"
          placeholder="请输入排序号(选填)"
        />
      </el-form-item>
      <el-form-item
        label="参数描述"
        prop="description"
      >
        <x-input
          v-model="temp.description"
          :disabled="isDetails"
          type="textarea"
          placeholder="请输入描述(选填)"
        />
      </el-form-item>
    </el-form>
    <el-form
      v-if="routerType === 'instance'"
      ref="dataForm"
      :model="temp"
      :rules="instanceRules"
      label-position="right"
      class="detail-form"
    >
      <el-form-item
        label="流程实例名称"
        prop="name"
      >
        <el-input
          v-model="temp.name"
          :disabled="isDetails"
          placeholder="请输入名称(必填)"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close()">取消</el-button>
      <el-button type="primary" @click="ok()">保存</el-button>
    </div>
  </el-dialog>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/etl/mixin/disabledState'
import Affirm from '../jumpAffirm'
export default {
  name: 'Udp',
  mixins: [disabledState],
  props: {
    dialogFormVisible: Boolean,
    routerType: String
  },
  data() {
    return {
      temp: {
        orderNo: null,
        status: null,
        syncDefine: false,
        description: '',
        name: ''
      },
      instanceRules:{
        name: [{ required: true, message: '请填写流程实例名称', trigger: 'change' },
          { max: 100, message: '流程名称在100个字符之内', trigger: 'change' }]
      },
      rules: {
        name: [{ required: true, message: '请填写流程名称', trigger: 'change' },
          { max: 100, message: '流程名称在100个字符之内', trigger: 'change' }],
        status: [{ required: true, message: '请选择流程状态', trigger: 'change' }],
        description: [{ max: 500, message: '流程描述在500个字符之内', trigger: 'change' }],
        // orderNo: [{ required: false, type: 'number', message: '排序号必须为数字值', trigger: 'change' }]
        // 为数字且非必填
        orderNo: [{
          validator: (rule, value, callback) => {
            if (value !== '' && value !== null) {
              if ((/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/).test(value) === false) {
                callback(new Error('排序号必须为大于0的数字'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
      },
      statusList: [{ label: '停用', value: `0` }, { label: '启用', value: `1` }],
      isCreate: true
    }
  },
  watch: {
  },
  created() {
    const dag = _.cloneDeep(this.store.state.dag)
    this.isCreate = _.isEmpty(dag.name)
    this.temp.name = dag.name
    this.temp.status = '' + dag.status
    this.temp.orderNo = dag.orderNo
    this.temp.description = dag.description
    this.temp.syncDefine = dag.syncDefine
  },
  mounted() {
  },
  methods: {
    // _verifOrderNo() {
    //   const reg = /^[1-9]\d*$/
    //   if (!reg.test(this.orderNo)) {
    //     this.$message.warning(`排序号请输入大于 0 的正整数`)
    //     return false
    //   }
    //   return true
    // },
    _accuStore() {
      this.store.commit('dag/setName', _.cloneDeep(this.temp.name))
      this.store.commit('dag/setDesc', _.cloneDeep(this.temp.description))
      this.store.commit('dag/setSyncDefine', this.temp.syncDefine)
      this.store.commit('dag/setStatus', _.cloneDeep(this.temp.status))
      this.store.commit('dag/setOrderNo', _.cloneDeep(this.temp.orderNo))
    },
    /**
     * submit
     */
    ok() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const _verif = () => {
            this.dialogFormVisible = false
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
        }
      })
    },
    /**
     * Close the popup
     */
    close() {
      this.dialogFormVisible = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.$emit('onClose')
    }
  }
}
</script>
