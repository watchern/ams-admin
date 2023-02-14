<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6">
        <div class="left-upPart-container">
          <LeftTrees ref="tree_left"></LeftTrees>
        </div>
        
      </el-col>

      <el-col :span="12">
        <div class="centre-upPart-container">

        </div>
      </el-col>

      <el-col :span="6">
        <div class="left-upPart-container">
          <span style="color:#5887B3">表连接</span>
          <el-input
            type="textarea"
            :readonly="true"
            v-model="orderContents"
          >
          </el-input>
          <span style="color:#5887B3">连接条件</span>
          <el-input
            type="textarea"
            :readonly="true"
            v-model="orderContents"
          >
          </el-input>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <div class="left-downPart-container">
          <span style="color:#5887B3">排序</span>
          <el-input
            type="textarea"
            :readonly="true"
            :rows="6"
            v-model="orderContents">
          </el-input>
        </div>
      </el-col>
      <el-col :span="18">
        <div>
          <el-table
          :data="tableData"
          style="width: 100%">
            <el-table-column
              prop="date"
              label="来源"
              width="80">
            </el-table-column>
            <el-table-column
              prop="name"
              label="英文字段名称"
              width="120">
            </el-table-column>
            <el-table-column
              prop="address"
              width="120"
              label="中文字段名称">
            </el-table-column>
            <el-table-column
              prop="name"
              label="别名"
              width="80">
            </el-table-column>
            <el-table-column
              prop="name"
              label="聚合函数"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="排序"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="筛选"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="分组"
              width="120">
            </el-table-column>
          </el-table>
        </div>
        <el-input
            type="textarea"
            :readonly="true"
            v-model="resultSQL"
          >
          </el-input>
      </el-col>
    </el-row>
    
  </div>
</template>
<script>
import LeftTrees from "@/components/loginTree/leftTree.vue";

export default {
  name: 'AssistSqlEditor',
  components: { LeftTrees },
  data() {
    return {
      orderContents:"",//排序内容
      tableData:[],
      resultSQL:"",//最终返回结果SQL
      aggregateFun:{
        
      }
    }
  },
  computed: {

  },
  created() {
    
  },
  mounted () {
    this.init();
  },
  methods: {
    //初始化事件
    init(){
      this.$refs.tree_left.loadLeftTreeTypeFun("1");

    }
    
  }
}
</script>
<style scoped>
#container {
  width: 100%;
  height: 100%;
}
.left-upPart-container{
  height: 70vh;
}
.centre-upPart-container{
  width: 100%;
  background: black;
}

</style>
