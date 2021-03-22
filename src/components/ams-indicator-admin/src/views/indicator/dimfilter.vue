<template>
    <el-container v-loading="loading" element-loading-text="正在加载数据中...">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="常规" name="convention">
          <div style="height: 500px;" id="convention">
            <el-input id="inMeasureFilterSearch" v-model="inDimFilterSearch" @input="searchOnChange()" placeholder="请输入搜索条件"></el-input>
            <div style="height: 400px;overflow-y:auto;cursor:pointer">
              <table id="dimColData">
              </table>
            </div>
            <el-button type="primary" @click="isNoSelect(true)">全选</el-button>
            <el-button type="default" @click="isNoSelect(false)">取消全选</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="条件" name="filter">
          <myquerybuilder v-if="isLoadQueryBuilder" ref="myQueryBuilder" :columns="queryRules" :data="queryBuilderJson" :inputselectvalue=inputselectvalue></myquerybuilder>
        </el-tab-pane>
      </el-tabs>
      <el-footer>
        <div style="float: right">
          <el-button type="primary" @click="enter">确定</el-button>
          <el-button type="primary" @click="closeDialog">取消</el-button>
        </div>
      </el-footer>
    </el-container>
</template>
<script>
import request from '@/utils/request'
import $ from "jquery";
import { Loading } from 'element-ui'
import myquerybuilder from "../indicator/myquerybuilder";
export default {
  name: 'dimFilter',
  props: ['columnType','analysisRegionId','dimId','dimName','inId','sup','filterJson','filter','filterList','analysisList'],
  components: {
    myquerybuilder
  },
  data() {
    return {
      //菜单页签
      activeName:'convention',
      //是否加载queryBuilder
      isLoadQueryBuilder:false,
      //查询条件
      queryRules:{},
      //反显queryBuilder
      queryBuilderJson:{},
      //queryBuilder下拉框值
      inputselectvalue:[],
      //搜索框值
      inDimFilterSearch:'',
      //遮罩层
      loading:false
    }
  },
  mounted() {

  },
  created() {
    this.initData()
    this.initColData()
  },
  methods: {
    initData(){
      var filterJson = this.filterJson;
      if(filterJson === ""){
        this.activeName = "convention"
      }
      if (filterJson != "" && filterJson != "1") {
        this.activeName = "filter"
      }
      if (filterJson == "1") {
        this.activeName = "convention"
      }
    },
    handleClick(){

    },
    /**
     * 关闭窗体
     */
    closeDialog() {
        this.$emit('closeFilterDialog')
    },
    /**
     * 初始化列数据
     */
    initColData() {
      this.loading = true
      var that = this
      var columnName = this.dimName
      var filterJson = this.filterJson
      var filter = this.filter
      var analysisList = this.analysisList;
      var analysisRegionId = this.analysisRegionId;
      var inList = [];
      var dimList = [];
      $.each(this.analysisList,function (num,value) {
        if(value == null){
          return;
        }
        if(value.id == analysisRegionId){
          inList = value.objInList;
          dimList = value.objDimList;
        }
      });
      var colDataUrl = this.contextUrl + "/indicatrixAnalysis/getColDataIn";
      $.post(colDataUrl,{inMeasures:JSON.stringify(inList),listDim:JSON.stringify(dimList),inId:this.dimId,columnName:columnName},function (res) {
        if(res.isError){
          that.$message({type:"error",message:res.message})
          return
        }
        $("#dimColData").html("");
        var filterList = that.filterList;
        var item = [];
        $.each(res.result,function (num,value) {
          var obj = {id:value,name:value,outputColumnName:value};
          that.inputselectvalue.push(obj)
          item.push(obj);
          var uuid = that.getuuid();
          var domTr = "<tr id='" + uuid + "'></tr>";
          $("#dimColData").append(domTr);
          for(var i = 0;i < 2; i++){
            if(i == 0){
              var domTd = "";
              if(filterList!= undefined && filterList.indexOf(value) > -1){
                domTd = "<td style='padding-top: 5px;'>" + "<input type='checkbox' click='checkOnClick(this)' checked='checked' id='" + value + "'>" + "</td>";
              }
              else{
                domTd = "<td style='padding-top: 5px;'>" + "<input type='checkbox' click='checkOnClick(this)' id='" + value + "'>" + "</td>";
              }
              $("#" + uuid).append(domTd);
            }
            else {
              var domTd = "<td style='width: 100%;padding: 4px;'>" + value + "</td>";
              $("#" + uuid).append(domTd);
            }
          }
        });
        that.setQueryBuilderColumn()
        if(that.activeName === "filter"){
          that.queryBuilderJson = JSON.parse(that.filterJson)
        }
        that.isLoadQueryBuilder = true
        that.loading = false
      },"json");
/*      var obj = {id:1,name:2,outputColumnName:3};
      that.inputselectvalue.push(obj)
      that.setQueryBuilderColumn()
      if(that.activeName === "filter"){
        that.queryBuilderJson = JSON.parse(that.filterJson)
      }
      that.isLoadQueryBuilder = true
      that.loading = false*/
    },
    sortNumber(a,b) {
      return a - b;
    },
    /**
     * check点击事件
     * @param obj
     */
    checkOnClick(obj) {
      alert(123)
      var state = $(obj).attr('checked');
      if(state == undefined){
        $(obj).attr("checked",'checked');
      }
      else{
        $(obj).removeAttr("checked");
      }
    },
    enter(){
      var inId = this.inId;
      var sup = this.sup;
      var dimName = this.dimName;
      var analysisRegionId = this.analysisRegionId;
      if(this.activeName == "convention"){//常规
        var filters = "";
        var list = [];
        $("#dimColData").find("tr").each(function () {
          var checkbox = $(this).children().find("input[type='checkbox']");
          var isDisplay = $(this).css('display');
          var checkState = checkbox.prop("checked");
          if(checkState == "checked" || checkState == true){
            var data = $(this).children("td").eq(1).text();
            filters += "'" + data + "'" + ",";
            list.push(data);
          }
        });
        if(list.length != 0){
          filters = filters.substring(0,filters.length - 1);
          filters = "{0} in ({1})".format(this.dimId,filters);
        }
        if(filters === ""){
          this.$message({type:'info',message:"您选择的是常规，请选择条件"})
          return
        }
        this.$emit('dimSetFilter',analysisRegionId,filters,inId,this.dimId,sup,JSON.stringify(1),list,dimName)
        this.closeDialog();
      }
      if(this.activeName == "filter"){//条件
        var result = this.$refs.myQueryBuilder.getSelectSql();
        if (result == null || result === "") {
          this.$message({type:'info',message:"您选择的是条件，请输入条件设置"})
          return
        }
        var filterJson = result.queryJson;
        this.$emit('dimSetFilter',analysisRegionId,result.sql,inId,this.dimId,sup,JSON.stringify(filterJson, null, 2),[],dimName)
        this.closeDialog();
      }
    },
    /**
     * 是否全选
     * @param isNo true false
     */
    isNoSelect(isNo) {
      if(isNo){
        $('input:checkbox').prop('checked','checked');
      }
      else{
        $('input:checkbox').prop('checked','');
      }
    },
    /**
     * 设置queryBuilder列
     */
    setQueryBuilderColumn() {
      let queryRules = []
      const obj = {}
      obj.columnType = "varchar"
      obj.columnName = this.dimName
      queryRules.push(obj)
      this.queryRules.columnList = queryRules
    },
  }
}
</script>
<style scoped>
>>>.el-tabs__item{
  font-size: 20px;
  margin: 5px;
}
>>>.el-tabs__active-bar{
  left:6px;
}
</style>
