<template>
    <el-container>
        <el-main>
            <el-tabs :value="page">
                <el-tab-pane label="常规" name="filter">
                    <div class="form-group">
                        <input type="text" class="form-control" onkeyup="filter.searchOnChange()" id="search" placeholder="请输入搜索条件">
                    </div>
                    <div style="height: 100%;overflow-y:auto;cursor:pointer">
                        <div style="height: 100%">
                            <table id="colData">
                            </table>
                        </div>
                    </div>
                    <button class="btn btn-primary" type="button" onclick="filter.allElection()">全选</button>
                    <button class="btn btn-default" type="button" onclick="filter.reverseElection()">取消全选</button>
                </el-tab-pane>
                <el-tab-pane label="条件" name="convention">
                    <div class="main-view">
                        <div id="builder"></div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="高级" name="seniors">
                    <div class="form-group">
                        <label for="formula" class="col-sm-2 control-label">请输入公式：</label>
                        <textarea style="height: 300px;" class="form-control" id="formula" placeholder="请输入公式，例如：like '%某某银行%'"></textarea>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-main>
        <el-footer>
            <button class="btn btn-primary" type="button" onclick="enter()">确定</button>
            <button class="btn btn-default" type="button" onclick="closeDialog()">取消</button>
        </el-footer>
    </el-container>
</template>
<script>
import request from '@/utils/request'
import * as $ from "jquery";
import { Loading } from 'element-ui'

// require("@/lib/querybulider/js/jQuery.extendext.min")
// require("@/lib/querybuilder/js/doT")
// require("@/lib/querybulider/js/sql-parser.min")
// require("@/lib/querybuilder/js/query-builder")
// require("@/lib/querybuilder/js/query-builder.zh-CN")
// require("@/lib/querybuilder/js/moment-with-locales")
// require("@/lib/querybuilder/js/moment")
// import "/lib/querybuilder/css/query-builder.default.css"

export default {
  name: 'dimFilter',
  props: ['columnType','analysisRegionId','dimId','dimName','inId','sup','filterJson'],
  components: {
    tree: resolve => require(["../../lib/ztree/ztree.vue"], resolve)
  },
  data() {
    return {
        /**
         * 存储也签
         * @type {string}
         */
        page:  "",

        f:  false
    }
  },
  mounted() {
    var filter = sessionStorage.getItem("filter");
    filter = filter.replace(this.dimId,"");
    // initData(dimName,dimId,filterJson,filter);
    this.initColData(this.dimName,this.filterJson,filter);
  },
  created() {

  },
  methods: {
    /**
     * 初始化过滤器数据
     */
    initData(columnName,dimId,filterJson,filter,item) {
        var operators = []
        var columnTypeUp = this.columnType.toUpperCase()
        if(columnTypeUp.indexOf("TIME") != -1|| columnTypeUp.indexOf("DATE") != -1 || columnTypeUp.indexOf("INT") != -1|| columnTypeUp.indexOf("FLOAT") != -1|| columnTypeUp.indexOf("DOUBLE") != -1){
             operators = [
                "equal",
                "not_equal",
                "less",
                "less_or_equal",
                "greater",
                "greater_or_equal",
                "between",
                "not_between",
                "begins_with",
                "not_begins_with",
                "contains",
                "not_contains",
                "ends_with",
                "not_ends_with",
                "greater_than" ,
                "is_empty",
                "is_not_empty",
                "is_null",
                "is_not_null"
            ]//初始化querybuilder
        }
        else {
            operators = [
                "equal",
                "not_equal",
                "contains",
                "not_contains",
                "ends_with",
                "not_ends_with",
                "greater_than" ,
                "begins_with",
                "not_begins_with",
                "is_empty",
                "is_not_empty",
                "is_null",
                "is_not_null"
            ]//初始化querybuilder
        }
        var options = this.getFilters(columnTypeUp,operators,columnName,item)//初始化querybuilder
        $('#builder').queryBuilder(options)
        var json ={
            condition: "OR",
            rules: [
                {
                    id: dimId,
                    field: dimId,
                    type: columnTypeUp,
                    input: columnTypeUp,
                    operator: "equal",
                    value: ""
                }
            ],
            valid: true
        }
        //filterJson = json
        $('#builder').queryBuilder('setRules', json)//默认显示指定json
        this.antiDisplay(filterJson,filter)
    },

    /**
     * 根据列类型获取条件
     * @param type 类型 数据库所有字段类型  只识别时间即可 其他的全部统一
     * @param operators 筛选类型
     */
    getFilters(type,operators,columnName,item) {
        var options
        if(type.indexOf("TIME") != -1){
            $("#builder").on('afterUpdateRuleValue.queryBuilder',function (e,rule) {
                if(rule.filter.plugin === 'datepicker'){
                    rule.$el.find('.rule-value-container input').datepicker('update')
                }
            })
            var f = [{
                id: this.dimId,
                label: columnName,
                type: "date",
                validation:{
                    format:'YYYY-MM-DD'
                },
                plugin:'datepicker',
                plugin_config:{
                    format:'yyyy-mm-dd',
                    todayBtn:'linked',
                    todayHighlight:true,
                    autoclose:true
                },
                operators: operators
            }]
             options = {
                plugins:['bt-tooltip-errors'],
                lang: "zh-CN",
                filters: f,
                rules: []
            }
        }
        else{
            options = {
                lang: "zh-CN",
                filters: [ {
                    id: this.dimId,
                    label: columnName,
                    type: "string",
                    input: "string",
                    operators: operators
                }
                ],
                rules: []
            }
        }
        return options
    },
    /**
     * 返现过滤条件
     * @param filterJson 判断JSON串 用它来判断需要返现到哪个界面
     * @constructor
     */
    antiDisplay(filterJson,filter) {
        if(filterJson == ""){
            this.page = 'convention'
        }
        //如果为空则证明是第一次打开，如果为1则证明是常规，如果为2则证明是通配符，如果以下都不是则证明是一个JSON
        if(filterJson != "" && filterJson!="1"  && filterJson!="2"  && filterJson!="3"){
            this.page = 'filter'
            $('#builder').queryBuilder('setRules', JSON.parse(filterJson))
        }
        if(filterJson == "1"){
            this.page = 'convention'
        }
        if(filterJson == "2"){
            this.page = 'senior'
            $("#formula").text(filter)
        }
    },
    /**
     * 初始化列数据
     */
    initColData(columnName,filterJson,filter) {
        var that = this
        let loadingInstance = Loading.service({ fullscreen: true })
        var analysisList = JSON.parse(sessionStorage.getItem("analysisList"))
        var inList = []
        var dimList = []
        $.each(analysisList,function (num,value) {
            if(value == null){
                return
            }
            if(value.id == this.analysisRegionId){
                inList = value.objInList
                dimList = value.objDimList
            }
        })
        var colDataUrl = this.contextUrl + "/indicatrixAnalysis/getColData"
        $.post(colDataUrl,{inMeasures:JSON.stringify(inList),listDim:JSON.stringify(dimList),dimId:this.dimId,columnName:columnName},function (res) {
            var columnTypeUp = that.columnType.toUpperCase()
            //TODO
            // if(res.length != 0){
            //     if(columnTypeUp.indexOf("INT") != -1){
            //         //如果是int类型就按数值排序
            //         res = res.sort(sortNumber)
            //     }
            //     else{
            //         res = res.sort()
            //     }
            // }
            $("#colData").html("")
            var filterList = sessionStorage.getItem("filterList")
            var item = []
            $.each(res,function (num,value) {
                var obj = {id:value,name:value}
                item.push(obj)
                var uuid = that.getuuid()
               // var domTr = "<tr id='" + uuid + "'check='false' onclick='filter.tableColOnClick(this,\"colData\")'></tr>"
                var domTr = "<tr id='" + uuid + "'></tr>"
                $("#colData").append(domTr)
                for(var i = 0;i< 2; i++){
                    if(i == 0){
                        var domTd = ""
                        if(filterList.indexOf(value) > -1){
                            domTd = "<td>" + "<input type='checkbox' onclick='filter.checkOnClick(this)' checked='checked' id='" + value + "'>" + "</td>"
                        }
                        else{
                            domTd = "<td>" + "<input type='checkbox' onclick='filter.checkOnClick(this)' id='" + value + "'>" + "</td>"
                        }

                        $("#" + uuid).append(domTd)
                    }
                    else {
                        var domTd = "<td>" + value + "</td>"
                        $("#" + uuid).append(domTd)
                    }
                }
            })
            that.initData(columnName,that.dimId,filterJson,filter,item)
            loadingInstance.close()
        },"json")
    },

    sortNumber(a,b) {
        return a - b
    },
    /**
     * 表行单击事件
     * @param obj 选中的tr对象
     * @param id table编号  colTable列表  gridTableIn指标表  gridTableDim维度表
     */
    tableColOnClick(obj,id) {
        var check = $(obj).attr("check")
        var checkbox = $(obj).find("input[type='checkbox']")
        if(check == "false"){
            $(obj).attr("check",true)
            checkbox.attr("checked",'checked')
        }
        if(check == "true"){
            $(obj).attr("check",false)
            checkbox.removeAttr("checked")
        }
    },

    /**
     * check点击事件
     * @param obj
     */
    checkOnClick(obj) {
        var state = $(obj).attr('checked')
        if(state == undefined){
            $(obj).attr("checked",'checked')
        }
        else{
            $(obj).removeAttr("checked")
        }
    },

    /**
     * 关闭窗体
     */
    closeDialog() {
        this.$emit('closeFilterDialog')
    },

    /**
     * 确定按钮
     */
    enter() {
        var filters = ""
        if(this.page == "filter"){//条件
            var result = $('#builder').queryBuilder('getSQL')
            if (result == null) {
                //如果为空则直接按照常规的方式添加，
                this.$emit('setFilter',this.analysisRegionId,filters,this.inId,this.dimId,this.sup,JSON.stringify(1),[],this.dimName)
                this.closeDialog()
            }
            var filterJson = $('#builder').queryBuilder('getRules')
            this.$emit('setFilter',this.analysisRegionId,result.sql,this.inId,this.dimId,this.sup,JSON.stringify(filterJson, null, 2),[],this.dimName)
            this.closeDialog()
        }
        if(this.page == "convention"){//常规
            var list = []
            $("#colData").find("tr").each(function () {
                var checkbox = $(this).children().find("input[type='checkbox']")
                var isDisplay = $(this).css('display')
                var checkState = checkbox.prop("checked")
                if(checkState == "checked" || checkState == true){
                   var data = $(this).children("td").eq(1).text()
                    filters += "'" + data + "'" + ","
                    list.push(data)
                }
            })
            if(list.length != 0){
                filters = filters.substring(0,filters.length - 1)
                filters = "{0} in ({1})".format(dimId,filters)
            }
            this.$emit('setFilter',this.analysisRegionId,filters,this.inId,this.dimId,this.sup,JSON.stringify(1),list,this.dimName)
            this.closeDialog()
        }
        if(this.page == "senior"){//高级
            var filters = $("#formula").val()
            this.$emit('setFilter',this.analysisRegionId,filters,this.inId,this.dimId,this.sup,JSON.stringify(2),[])
            this.closeDialog()
        }
    },
    /**
     * 文本框的值改变事件
     * @param value 更改的值
     */
    searchOnChange() {
        var searchFilters = $("#search").val()
        var table = $("#colData").find("tr")
        table.each(function () {
            var tableTr = $(this)
            var trValue = tableTr.text()
            if(!trValue.match(searchFilters)){
                tableTr.hide()
            }
            else{
                tableTr.show()
            }
        })
    },

    /**
     * 全选
     * @constructor
     */
    allElection() {
        this.isNoSelect(true)
    },

    /**
     * 反选
     * @constructor
     */
    reverseElection() {
        this.isNoSelect(false)
    },

    /**
     * 是否全选
     * @param isNo true false
     */
    isNoSelect(isNo) {
        if(isNo){
            $('input:checkbox').prop('checked','checked')
        }
        else{
            $('input:checkbox').prop('checked','')
        }
    }
  }
}
</script>
<style>
    .query-builder .rules-group-header .group-conditions .btn.readonly:not(.active), .query-builder .rules-group-header .group-conditions input[name$='_cond'] {
        width: auto;
        height: auto;
        position: static;
        margin: auto;
        white-space: unset;
    }
</style>
