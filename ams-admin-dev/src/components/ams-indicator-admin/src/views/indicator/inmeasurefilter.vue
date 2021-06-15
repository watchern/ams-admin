<template>
  <el-container v-loading="loading" element-loading-text="正在加载数据中...">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="常规" name="convention">
        <div style="height: 500px;" id="convention">
          <el-input id="inMeasureFilterSearch" v-model="inMeasureFilterSearch" @input="searchOnChange()" placeholder="请输入搜索条件"></el-input>
          <div style="height: 400px;overflow-y:auto;cursor:pointer">
              <table id="colData">
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
import $ from "jquery";
import myquerybuilder from "../indicator/myquerybuilder";
export default {
  name: 'inmeasurefilter',
  components: {myquerybuilder},
  props: ['filterIn','filterListIn','analysisListIn','columnName','columnType','filterJson','columnNameCN','analysisRegionId','inId'],
  data() {
    return {
      activeName:'convention',
      //遮罩层
      loading:false,
      //存储也签
      //反显queryBuilder的JSON数据
      queryBuilderJson:{},
      //queryBuilder列对象
      queryRules: {},
      //queryBuilder下拉框的值
      inputselectvalue:[],
      //是否加载queryBuilder
      isLoadQueryBuilder:false,
      //常规过滤条件搜索
      inMeasureFilterSearch:''
    }
  },
  mounted() {

  },
  created() {
    this.initData()
    this.initColData()
  },
  methods:{
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
    handleClick(tab, event){

    },
    /**
     * 初始化列数据
     */
    initColData() {
      this.loading = true
      let that = this
      var analysisList = this.analysisListIn
      var analysisRegionId = this.analysisRegionId
      var columnName = this.columnNameCN
      var inId = this.inId
      var inList = []
      var dimList = []
      $.each(analysisList,function (num,value) {
        if(value == null){
          return;
        }
        if(value.id == analysisRegionId){
          inList = value.objInList;
          dimList = value.objDimList;
        }
      });
      var colDataUrl = this.contextUrl + "/indicatrixAnalysis/getColDataIn";
      $.post(colDataUrl,{inMeasures:JSON.stringify(inList),listDim:JSON.stringify(dimList),inId:inId,columnName:columnName},function (res) {
        if(res.isError){
          that.$message({type:"error",message:res.message})
          return
        }
        $("#colData").html("");
        res = res.result.sort(that.sortNumber);
        var filterList = that.filterListIn;
        var item = [];
        $.each(res,function (num,value) {
          var obj = {id:value,name:value,outputColumnName:value};
          that.inputselectvalue.push(obj)
          item.push(obj);
          var uuid = that.getuuid();
          var domTr = "<tr id='" + uuid + "'></tr>";
          $("#colData").append(domTr);
          for(var i = 0;i < 2; i++){
            if(i == 0){
              var domTd = "";
              if(filterList.indexOf(value) > -1){
                domTd = "<td style='padding-top: 5px;'>" + "<input type='checkbox' checked='checked' id='" + value + "'>" + "</td>";
              }
              else{
                domTd = "<td style='padding-top: 5px;'>" + "<input type='checkbox' id='" + value + "'>" + "</td>";
              }

              $("#" + uuid).append(domTd);
            }
            else {
              var domTd = "<td style='width: 100%;padding: 4px;'>" + value + "</td>";
              $("#" + uuid).append(domTd);
            }
          }
        });
        that.loading = false
        that.setQueryBuilderColumn()
        if(that.activeName === "filter"){
          that.queryBuilderJson = JSON.parse(that.filterJson)
        }
        that.isLoadQueryBuilder = true
      },"json");
    },
    sortNumber(a,b) {
      return a - b;
    },
    enter(){
      var inId = this.inId;
      var analysisRegionId = this.analysisRegionId;
      if(this.activeName == "convention"){//常规
        var filters = "";
        var list = [];
        $("#colData").find("tr").each(function () {
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
          filters = "{0} in ({1})".format(this.columnName,filters);
        }
        if(filters === ""){
          this.$message({type:'info',message:"您选择的是常规，请选择条件"})
          return
        }
        this.$emit('inSetFilter',analysisRegionId,filters,inId,JSON.stringify(1),list)
        this.closeDialog()
      }
      if(this.activeName == "filter"){//条件
        var result = this.$refs.myQueryBuilder.getSelectSql();
        if (result == null || result === "") {
          this.$message({type:'info',message:"您选择的是条件，请输入条件设置"})
          return
        }
        var filterJson = result.queryJson;
        this.$emit('inSetFilter',analysisRegionId,result.sql,inId,JSON.stringify(filterJson, null, 2),[])
        this.closeDialog()
      }
    },
    /**
     * check点击事件
     * @param obj
     */
    checkOnClick(obj) {
      var state = $(obj).attr('checked');
      if(state == undefined){
        $(obj).attr("checked",'checked');
      }
      else{
        $(obj).removeAttr("checked");
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
     * 关闭当前窗体
     */
    closeDialog() {
      this.$emit('closeInmeasuerFilter')
    },
    initQueryBuilder(columnName,item){
      //this.antiDisplay(this.filterJson,this.filter);
    },
    /**
     * 根据列类型获取条件
     * @param operators 筛选类型
     */
    getFilters(operators,columnName,item) {
      var options;
      options = {
        lang: "zh-CN",
        filters: [ {
          id: columnName,
          label: columnName,
          type: "string",
          input: "string",
          operators: operators
        }],
        rules: []
      };
      return options;
    },
    /**
     * 返现过滤条件
     * @param filterJson 判断JSON串 用它来判断需要返现到哪个界面
     * @constructor
     */
    antiDisplay(filterJson,filter) {
      //如果为空则证明是第一次打开，如果为1则证明是常规，如果为2则证明是通配符，如果以下都不是则证明是一个JSON
      if(filterJson == ""){
        this.activeName = "convention"
      }
      if(filterJson != "" && filterJson!="1"  && filterJson!="2"){
        this.activeName = "filter"
        $('#builder').queryBuilder('setRules', JSON.parse(filterJson));
      }
      if(filterJson == "1"){
        this.activeName = "convention"
      }
    },
    /**
     *  设置选中的页签
     * @param pages
     */
    setFilterPage(pages) {
      this.page = pages;
    },
    /**
     * 设置queryBuilder列
     */
    setQueryBuilderColumn() {
      let queryRules = []
      const obj = {}
      obj.columnType = "INT"
      obj.columnName = this.columnName
      queryRules.push(obj)
      this.queryRules.columnList = queryRules
    },
    /**
     * 搜索
     */
    searchOnChange() {
      var searchFilters = this.inMeasureFilterSearch
      var table = $("#colData").find("tr");
      table.each(function () {
        var tableTr = $(this);
        var trValue = tableTr.text();
        if(!trValue.match(searchFilters)){
          tableTr.hide();
        }
        else{
          tableTr.show();
        }
      })
    }
  },
}

</script>
<style scoped>
>>>.el-tabs__item{
  font-size: 20px;
  margin: 5px;
}
</style>

