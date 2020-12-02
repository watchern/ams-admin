<template>
  <!-- <div > -->
  <el-dialog :append-to-body="true" :title="isCreate===true?'新增流程' :'修改流程'" style="margin-bottom: 60px;" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
    <el-form
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
        label="流程状态"
        prop="status"
      >
        <el-select v-model="temp.status" placeholder="请选择状态">
          <el-option
            v-for="(model,$index) in statusList"
            :key="$index"
            :value="model.value"
            :label="model.label"
          />
        </el-select>
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
    <div slot="footer" class="dialog-footer">
      <el-button @click="close()">取消</el-button>
      <el-button type="primary" @click="ok()">保存</el-button>
    </div>
  </el-dialog>
  <!-- </div> -->
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/etl/mixin/disabledState'
export default {
  name: 'Udp',
  mixins: [disabledState],
  props: {
    dialogFormVisible: Boolean
  },
  data() {
    return {
      temp: {
        orderNo: '',
        status: null,
        syncDefine: true,
        description: '',
        name: ''
      },

      rules: {
        name: [{ required: true, message: '请填写参数名', trigger: 'change' }],
        status: [{ required: true, message: '请选择参数状态', trigger: 'change' }],
        orderNo: [{ type: 'number', message: '排序号必须为数字值', trigger: 'change' }]
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
    _verifOrderNo() {
      const reg = /^[1-9]\d*$/
      if (!reg.test(this.orderNo)) {
        this.$message.warning(`排序号请输入大于 0 的正整数`)
        return false
      }
      return true
    },
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
      const _verif = () => {
        this.dialogFormVisible = false
        this._accuStore()
        // Affirm.setIsPop(false)
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
      this.dialogFormVisible = false
      this.$emit('onClose')
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
// .el-dialog__header {
// 	font-weight: bold;
// 	line-height: 24px;
// 	font-size: 18px;
// 	color: #303133;
//   padding-left: 0px;
//   padding-top: 0px;
//   margin-bottom: 10px;
// }
.ans-btn-text:hover {
	color: #252d39;
}
.btnclass ,.btnclass:hover{
  background: #353a43;
  border-color: hsl(219, 12%, 24%);
  font-weight: bold;
  color: #c8ff8c;
  margin-right: 10px;
}
.ans-btn-primary[disabled],.ans-btn-primary[disabled]:hover {
	color: #fff;
	background-color: #c6cfd6;
	border-color: #c6cfd6;
}
.titleText{
  width:13%;
  display:inline-block;
}
.inputcss{
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
