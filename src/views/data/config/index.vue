<template>
  <div class="page-container">
    <el-link @click="save">
      保存当前数据源为标准结构
    </el-link>
    <el-link @click="compare">
      将当前数据源与标准结构对比
    </el-link>
    <el-table :data="tableData">
      <el-table-column label="标准表名-列名" width="200px" align="center" prop="standard" />
      <el-table-column label="当前数据源表名-列名" width="200px" align="center" prop="current" />
    </el-table>
  </div>
</template>
<script>
import { saveAsStandard, compareWithStandard } from '@/api/data/folder'
import { commonNotify } from '@/utils'

export default {
  components: { },
  data() {
    return{
      tableData: [],
      allData: []
    }
  },
  methods: {
    save(){


    },
    compare(){

    }

  }
}

</script>

<style lang="scss" scoped>
  .dialog-bottom-btns{

  }
  .bottom-btn{
    float: right;
    padding-right: 100px
  }
</style>

