<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="title">查询结构列表</span>
      </div>
      
      <div>
        <el-table
          ref="multipleTable"
          height = "calc(93.9vh - 450px)"
          :data="tableData"
          tooltip-effect="dark"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="45" />
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="codeName" :label="dataSortName+'类型名称'" width="300" />
          <el-table-column prop="codeValue" :label="dataSortName+'类型编码'" width="180" />
          <el-table-column prop="codeDesc" :label="dataSortName+'类型描述'" />
        </el-table>
        <div class="divBtn" style="float:right;padding:20px 0 0 0">
            <el-button v-if="this.editTag!=1" type="primary" class="oper-btn add" size="mini" title="添加" @click="saveCodeData"></el-button>
            <el-button v-if="this.editTag!=1" type="primary" class="oper-btn again-2" size="mini" title="刷新" @click="resetForm"></el-button>
            <el-button v-if="this.editTag!=1" type="primary" class="oper-btn edit" size="mini" :disabled="handleSelectionChange.length !== 1" title="修改" @click="editCodeData"></el-button>
            <el-button v-if="this.editTag!=1" type="danger" class="oper-btn delete" size="mini" :disabled="handleSelectionChange.length === 0" title="删除" @click="delCodeData"></el-button>
            <!-- <el-button type="primary" size="mini" @click="returnList">返回</el-button> -->
          </div>
        <div class="operate-div">
          <BaseCodeTreeOperate
            ref="baseCodeOperate"
            :code-operate="seleteLengthData"
            @closeMain="query"
          />
          <div class="divBtn" style="float:right">
            <el-button type="primary" size="mini" @click="returnList">返回</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseCodeTreeOperate from '@/views/base/sysdata/basecodetreeoperate'
import { inItCode, delSecond } from '@/api/base/sysdata'
export default {
  components: {
    BaseCodeTreeOperate
  },
  data() {
    return {
      dataSortUuid: '',
      dataSortName: '',
      codeUuid: '',
      parentCodeUuid: '',
      tableData: [],
      seleteLengthData: [],
      editTag: '',
      objCode: {},
      pageQuerySecond: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      }
    }
  },
  computed: {
    ...mapState({
      baseCode: state => state.dataSort.baseCodes
    })
  },
  watch: {
    baseCode: {
      handler: function(val) {
        var baseCode = JSON.parse(val)
        this.dataSortName = baseCode.codeName
        this.dataSortUuid = baseCode.dataSortUuid
        this.parentCodeUuid = baseCode.codeUuid
        this.editTag = this.$route.query.editTag
        this.query()
      },
      deep: true
    }
  },
  mounted: function() {
    // 字段设置
    let baseCode = this.$store.state.dataSort.baseCodes
    baseCode = JSON.parse(baseCode)
    this.dataSortName = baseCode.codeName
    this.dataSortUuid = baseCode.dataSortUuid
    this.parentCodeUuid = baseCode.codeUuid
    this.editTag = this.$route.query.editTag
  },
  methods: {
    handleSelectionChange(val) {
      this.seleteLengthData = val
    },
    saveCodeData() {
      // 调用子路由方法
      var sortUuid = this.dataSortUuid
      var parentCodeUuid = this.parentCodeUuid
      this.$refs.baseCodeOperate.saveCedeData(sortUuid, parentCodeUuid)
    },
    // 修改
    editCodeData() {
      var sortUuid = this.dataSortUuid
      var parentCodeUuid = this.parentCodeUuid
      if (this.seleteLengthData.length !== 1) {
        this.$notify.error({
          title: '错误',
          message: '请选中一条数据进行修改',
          position: 'bottom-right'
        })
        return false
      }
      this.$refs.baseCodeOperate.editCodeData(sortUuid, parentCodeUuid)
    },
    // 删除
    delCodeData() {
      if (this.seleteLengthData.length < 1) {
        this.$notify.error({
          title: '错误',
          message: '请选中一条以上数据进行删除',
          position: 'bottom-right'
        })
        return false
      }
      this.$confirm(this.$t('confirm.delete'), this.$t('confirm.title'),{
        confirmButtonText: this.$t('confirm.okBtn'),
        cancelButtonText: this.$t('confirm.cancelBtn'),
        type: 'warning'
      }).then(() => {
        var ids = []
        this.seleteLengthData.forEach((r, i) => { ids.push(r) })
        delSecond(ids).then(() => {
          this.query()
          this.$notify({
            title: this.$t('message.title'),
            message: this.$t('message.delete.success'),
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
        })
      })
    },
    // 查询列表
    query() {
      this.objCode.parentCodeUuid = this.parentCodeUuid
      this.pageQuerySecond.condition = Object.assign({}, this.objCode)
      inItCode(this.pageQuerySecond).then(resp => {
        this.tableData = resp.data.records
      }).catch(function(error) {
        console.log(error)
      })
    },
    resetForm() {
      this.$refs.baseCodeOperate.resetForm()
    },
    returnList() {
      this.$router.push({
        path: `/base/sysdata`
      })
    }
  }
}
</script>

<style scoped>
.box-card{
  height: calc(93.3vh);
  border-radius: 10px;
  overflow: auto;
}
.operate-div {
  margin-top: 20px;
}
.divBtn {
  text-align: center;
}
.title {
  font-family: PingFangSC-Medium;
  font-size: 14px;
  color: #42444d;
  font-weight: 600;
}
.el_divBtn_button {
  background: #6c6d70;
  height: 24px;
  padding: 0px 15px;
  line-height: 23px;
  border-radius: 4px;
  border-color: #909399;
}
</style>
