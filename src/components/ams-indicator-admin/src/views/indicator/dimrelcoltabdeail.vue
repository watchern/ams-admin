<template>
    <el-container>
        <el-main>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column label="序号" :width="60">
                    <template slot-scope="scope">
                        {{scope.$index+1}}
                    </template>
                </el-table-column>
                <el-table-column prop="tableName" label="表名" :width="300"></el-table-column>
                <el-table-column prop="columnName" label="列名" :width="200"></el-table-column>
                <el-table-column prop="columnType" label="列类型" :width="100"></el-table-column>
                <el-table-column prop="" label="操作" >
                    <template slot-scope="scope">
                        <el-button @click="delRel(scope.row.inDimColumnUuid)" type="text" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'
export default {
  name: 'addDimension',
  props: ['dimId','dimName'],
  components: {

	},
  data() {
    return {
        setting: {
                pageId:"pagger",
                rownumbers: true,//序号
                multiselect: true,//多选框
                colModel: [
                    {name:'inDimColumnUuid',hidden: true},
                    {name:'tableName',lable:'表名',align:'center'},
                    {name:'columnName',lable:'列名',align:'center'},
                    {name:'columnType',lable:'列类型',align:'center'},
                ],
                colNames: ['维度编号','表名','列名','列类型'],
                height:196,
                caption:'维度关联列表'
            },
        tableData: null
    }
  },
  mounted() {
      this.initData()
  },
  created() {
  },
  methods: {/**
     * 初始化过滤器数据
     */
    initData() {
      var that = this
      var url = this.contextUrl + "/InDimColumn/getDimRelColTab?dimId=" + this.dimId
      $.ajax({
        url: url,
        method:"post",
        dataType:"json",
        async: false,
        success: function(data, textStatus, jqXHR){
          that.tableData = data.body.result
        },
        error:function (data,textStatus){
          that.$message({info:'info',message:'读取列信息失败!'})
        }
      })
    },

    /**
     * 删除关联
     */
    delRel(inDimColumnUuid) {
      var that = this
      var url = that.contextUrl + "/InDimColumn/deleteRel"
      $.ajax({
          type: "post",
          url: url,
          data: {inDimColumnUuid:inDimColumnUuid},
          async: false,
          success: function (res) {
            that.initData()
            that.$emit('refreshDimList')
          }
      })
    }
  }
}
</script>


