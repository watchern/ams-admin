<template>
  <el-container>
          <el-form role="form">
              <el-table
                @row-click="onCellSelect"
                :data="tableData"
                style="width: 100%">
                <el-table-column
                  prop="dimensionName"
                  label="维度名称"
                  width="180">
                </el-table-column>
                <el-table-column
                  prop="columnName"
                  label="关联列" width="200">
                </el-table-column>
                <el-table-column
                  prop="tableName"
                  label="来源表" width="200">
                </el-table-column>
                <el-table-column
                  prop="dimensionMemo"
                  label="维度说明" width="220">
                </el-table-column>
              </el-table>
              <el-row>
                <el-col>
                  <el-form-item label="关联维度">
                    <el-input id="dimName" v-model="form.dimName" readonly="readonly"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            <el-row>
              <el-col>
                <el-form-item label="维度表">
                  <el-input id="tableName" v-model="form.tableName" readonly="readonly"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-form-item label="维度列">
                  <el-input id="colName" v-model="form.colName" readonly="readonly"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
    <el-footer>
      <div style="float: right">
        <el-button type="primary" @click="saveRelDim">保存</el-button>
        <el-button type="primary" @click="closeDialog">取消</el-button>
      </div>
    </el-footer>
  </el-container>
</template>
<script type="text/javascript">
  import {Loading} from "element-ui";
  import $ from "jquery";
  export default {
    name: 'index',
    props: ['tableId','columnId','tableName','columnName'],
    data() {
      return {
        //表格数据
        tableData:[],
        //维度编号
        dimId :"",
        //维度名称
        dimName :"",
        form:{
          tableName:'',
          colName:'',
          dimName:''
        }
      }
    },
    watch: {

    },
    mounted() {
      this.form.tableName = this.tableName
      this.form.colName = this.columnName
      this.getAllDimension()
    },
    created() {

    },
    methods: {
      saveRelDim() {
        var that = this;
        if (this.dimId == "") {
          that.$message({info:'info',text:"请选择要关联的维度"});
          return;
        }
        var verUrl = this.contextUrl + "/InDimension/verDimRel";
        $.post(verUrl, {dimId: this.dimId, tableId: this.tableId}, function (res) {
          if (res == true) {
            that.$message({info:'info',text:"该表与当前维度已经有关联列，不允许重复添加，每张表关联列只允许关联一次"});
            return;
          } else {
            var url = that.contextUrl + "/InDimension/relHaveDim";
            var data = {
              inDimColumnUuid: '',
              inDimensionUuid: that.dimId,
              tableUuid: that.tableId,
              columnUuid: that.columnId
            };
            $.post(url, {inDimColumn: JSON.stringify(data)}, function (res) {
              if (res == true) {
                that.$emit('getAllDimension',that.tableId)
                that.$emit('closeRelDim')
                //close();
              } else {

              }
            }, "json")
          }
        }, "json")
      },
      /**
       * 获取所有维度
       */
      getAllDimension() {
        var that = this
        var url = this.contextUrl + "/InDimension/getYesRelDimension";
        $.post(url, {tableName: this.tableName}, function (res) {
          that.tableData = res
        }, "json");
      },
      /**
       * 搜索维度
       */
      searchDim() {
        var searchFilters = $("#searchFilter").val();
        var table = $("#gridTableDim").find("tr");
        table.each(function (num) {
          if (num == 0) {
            return;
          }
          var tableTr = $(this);
          var trValue = tableTr.text();
          if (!trValue.match(searchFilters)) {
            tableTr.hide();
          } else {
            tableTr.show();
          }
        })
      },
      /**
       * 获取点击行的行号，列号，点击的数据
       * @param row 选中行数据
       * @param column 选中列数据
       * @param event 事件
       */
      onCellSelect(row, column, event) {
        this.dimId = row.inDimensionUuid;
        this.dimName = row.dimensionName;
        this.form.dimName = row.dimensionName
      },
      /**
       * 关闭窗体
       */
      closeDialog() {
        this.$emit('closeRelDim')
      },
    }
  }
</script>
