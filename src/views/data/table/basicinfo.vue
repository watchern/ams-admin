<template>
  <div class="page-container">
    <div class="detail-form">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="right"
        style="width:90%;min-width:500px; margin-left:50px;"
      >
        <el-form-item label="表名称" prop="tbName">
          <el-input v-model="temp.tbName" readonly />
        </el-form-item>
<!-- 2021/06/07 @黄鑫 因暂无业务需求，隐藏表物理路径 -->
<!--        <el-form-item label="表物理路径" prop="tablePath">-->
<!--          <el-input v-model="temp.tablePath" readonly />-->
<!--        </el-form-item>-->
        <el-form-item label="字段数" prop="fieldsNum">
          <el-input v-model="temp.fieldsNum" readonly />
        </el-form-item>
        <!--  <el-form-item label="行数" prop="rowNum">
           <el-input v-model="temp.rowNum" readonly />
         </el-form-item>
         <el-form-item label="表容量" prop="tableSize">
           <el-input v-model="temp.tableSize" readonly />
         </el-form-item>-->
        <el-form-item label="行数" prop="rowNum">
          <el-input v-model="temp.rowNum" readonly />
        </el-form-item>
<!--  2021/06/08 @黄鑫 db2环境由于缓冲区的影响，表大小存在不显示的情况，暂时隐藏后期优化-->
<!--        <el-form-item label="表容量" prop="tableSize">-->
<!--          <el-input v-model="temp.tableSize" readonly />-->
<!--        </el-form-item>-->
      </el-form>
    </div>
    <!-- <div slot="footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
    </div> -->
  </div>
</template>

<script>
import { getBasicInfo } from '@/api/data/table-info'

export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['tableId'],
  data() {
    return {
      temp: {
        tableMetaUuid: undefined,
        tbName: '',
        tablePath: '',
        fieldsNum: '',
        rowNum: '',
        tableSize: ''
      }
    }
  },
  created() {
    this.initBasicInfo(this.tableId)
  },
  methods: {
    initBasicInfo(tableId) {
      if (this.openType !== 'addTable') {
        getBasicInfo(tableId).then(resp => {
          this.temp = resp.data
        })
      }
    }
  }
}
</script>
