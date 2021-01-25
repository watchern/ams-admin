<template>
    <el-row>
        <el-col class="page-col-1" :span="7">
          <el-input placeholder="输入关键字进行过滤" v-model="treeSearchText"></el-input>
          <el-tree style="height:700px;overflow-y:auto;cursor:pointer" :data="dataTreeNodes" default-expand-all
            node-key="id" ref="tree" highlight-current @node-click="onClickAllTable" :filter-node-method="tableTreeFilterNode">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <div v-if="data.type=='table'"><span class="icon iconfont"><div class="code-name">&#xecee;{{ node.label }}</div></span></div>
              <div v-else-if="data.type=='view'"> <span class="icon iconfont"><div class="code-name">&#xe6cd;{{ node.label }}</div></span></div>
              <div v-else-if="data.type=='folder'"> <span> <i class="el-icon-folder" />{{ node.label }} </span></div>
            </span>
          </el-tree>
        </el-col>
        <el-col class="page-col-2" :span="7">
          <el-input placeholder="输入关键字进行过滤" v-model="searchFilter"></el-input>
            <div>
                <div class="row table-view-caption" style="margin:0px;">
                    <el-button type="primary" size="mini" @click="addIndicatrix">新增指标</el-button>
                    <el-button type="primary" size="mini" @click="addDimension">新增维度</el-button>
                    <el-button type="primary" size="mini" @click="relHaveDim">关联维度</el-button>
                    <el-button type="primary" size="mini" @click="addCalculationColumn">计算列</el-button>
                    <el-button type="primary" size="mini" @click="selectTableData">查看数据</el-button>
                </div>
            </div>
            <div id="colInfo" style="height:674px;overflow-y:auto;cursor:pointer">
                <table id="colTable" class="border-table"></table>
            </div>
        </el-col>
        <el-col class="page-col-3" :span="10">
            <el-row>
                <div class="row table-view-caption" style="margin:0px;">
                    <el-button type="primary" size="mini" @click="editIndicatrix">编辑指标</el-button>
                    <el-button type="primary" size="mini" @click="delIndicatrix">删除指标</el-button>
                    <el-button type="primary" size="mini" @click="getAllIn">查看所有指标</el-button>
                </div>
                <div class="table-view m-b-20">
                    <table id="gridTableIn" class="border-table">
                      <tr><td>指标名称</td><td>指标类型</td><td>聚合方式</td><td>关联列</td><td>来源表</td><td>指标说明</td></tr>
                    </table>
                  <div style="text-align: center" id="dimIn">暂无数据</div>
                </div>
            </el-row>
            <el-row>
                <div class="row table-view-caption" style="margin:0px">
                    <el-button type="primary" size="mini" @click="editDimension">编辑维度</el-button>
                    <el-button type="primary" size="mini" @click="delDimension">删除维度</el-button>
                    <el-button type="primary" size="mini" @click="getAllDim">查看所有维度</el-button>
                </div>
                <div class="table-view m-b-20" >
                    <table id="gridTableDim" class="border-table">
                      <tr><td>维度名称</td><td>维度类型</td><td>关联列</td><td>来源表</td><td>维度说明</td></tr>
                    </table>
                  <div style="text-align: center" id="dimZan">暂无数据</div>
                </div>
            </el-row>
        </el-col>
        <el-dialog append-to-body title="计算列" v-if="dialogCalculationcolumnVisible" :visible.sync="dialogCalculationcolumnVisible" >
            <editcalculationcolumn :tableName="dmTableName" :tableId="dmTableUuid" :rawTableName="rawTableName" :calculationColId="calculationColId" @getAllColumn="getAllColumn" @closeCalculationcolumn="closeCalculationcolumn"/>
        </el-dialog>
        <el-dialog append-to-body title="指标" v-if="dialogAddIndicatrixVisible" :visible.sync="dialogAddIndicatrixVisible" >
            <addindicatrix v-if="dialogAddIndicatrixVisible" :tableId="dmTableUuid" :tableName="rawTableName" :columnId="columnId" :columnName="columnName" :inUUID="inMeasureObj.inMeasureUuid"
                           @addInTable="addInTable" @getAllIndicatrix="getAllIndicatrix" @getAllColumn="getAllColumn" @closeAddIndicatrix="closeAddIndicatrix" />
        </el-dialog>
        <el-dialog append-to-body title="维度" v-if="dialogDimensionVisible" :visible.sync="dialogDimensionVisible" >
            <adddimension v-if="dialogDimensionVisible" :tableId="dmTableUuid" :tableName="rawTableName" :columnId="columnId" :columnName="columnName" :dimUUID="inDimObj.inDimensionUuid"
                          @addInTable="addInTable" @getAllDimension="getAllDimension" @getAllColumn="getAllColumn" @closeDimension="closeDimension" />
        </el-dialog>
        <el-dialog append-to-body title="关联维度详细" v-if="dialogDimrelcoltabdeailVisible" :visible.sync="dialogDimrelcoltabdeailVisible" >
            <dimrelcoltabdeail @refreshDimList="refreshDimList" :dimId="inDimObj.inDimensionUuid" :dimName="inDimObj.dimensionName"/>
        </el-dialog>
        <el-dialog append-to-body title="查看数据" v-if="seeSqlDataDialog" :visible.sync="seeSqlDataDialog" >
          <seeSqlData :seeDataSql="seeDataSql"/>
        </el-dialog>
        <el-dialog append-to-body title="关联维度" v-if="relDimDialog" :visible.sync="relDimDialog">
          <relDim @getAllDimension="getAllDimension" @closeRelDim="closeRelDim" :tableName="dmTableName" :tableId="dmTableUuid" :columnId="columnId" :columnName="columnName"/>
        </el-dialog>
        <el-dialog append-to-body :title="seeinOrDimTitle" v-if="seeinOrDimDialog" :visible.sync="seeinOrDimDialog">
          <seeinordim :type="seeinOrDimType" />
        </el-dialog>
    </el-row>
</template>
<script>
import $ from 'jquery'
import {Loading} from 'element-ui'

export default {
  name: 'index',
  props: ['currentLoginUser'],
  components: {
    editcalculationcolumn: resolve => require(["../../views/indicator/editcalculationcolumn.vue"], resolve),
    addindicatrix: resolve => require(["../../views/indicator/addindicatrix.vue"], resolve),
    adddimension: resolve => require(["../../views/indicator/adddimension.vue"], resolve),
    dimrelcoltabdeail: resolve => require(["../../views/indicator/dimrelcoltabdeail.vue"], resolve),
    seeSqlData: resolve => require(["../../views/indicator/seesqldata.vue"], resolve),
    relDim: resolve => require(["../../views/indicator/reldim.vue"], resolve),
    seeinordim: resolve => require(["../../views/indicator/seeinordim.vue"], resolve),
  },
  data() {
    return {
      /**
       * 查看数据sql
       * @type {string}
       */
        seeDataSql:'',
        /**
         * 列编号
         * @type {string}
         */
        columnId:  "",
        /**
         * 列名称
         * @type {string}
         */
        columnName:  "",
        /**
         * 树路径
         * @type {string}
         */
        treePath:  "",
        /**
         * 树编号
         * @type {string}
         */
        treeId:  "",
        /**
         * 树名称
         * @type {string}
         */
        treeName:  "",

        /**
         * 用来隐藏已经存在的指标表
         * @type {Array}
         */
        inTableId:  [],

        /**
         * 点击gridTableIn tr事件的时候存放指标对象
         * @type {string}
         */
        inMeasureObj:  {},

        /**
         * gridTableDim tr事件的时候存放维度编号
         * @type {string}
         */
        inDimObj:  {},
        /**
         * 构造函数
         * @param query 初始值
         */

        /**
         * 记录维度总数
         * @type {number}
         */
        dimCount:  0,

        /**
         * 记录指标总数
         * @type {number}
         */
        inCount:  0,

        /**
         * 记录表编号
         * @type {string}
         */
        dmTableUuid:  "",

        /**
         * 记录表名称
         * @type {string}
         */
        dmTableName:  "",

        calculationColId: null,
        /**
         * 原始表名
         * @type {string}
         */
        rawTableName:  "",
        isOrgManager: sessionStorage.getItem('isOrgManager'),
        isInManager: sessionStorage.getItem('isInManager'),
        dataTree: null,
        dataTreeNodes: null,
        dialogCalculationcolumnVisible: false,
        dialogAddIndicatrixVisible: false,
        dialogDimensionVisible: false,
        dialogDimrelcoltabdeailVisible: false,
        //查看数据界面dialog
        seeSqlDataDialog:false,
        //树搜索框
        treeSearchText:'',
        //列搜索框
        searchFilter:'',
        //关联维度dialog
        relDimDialog:false,
        //查看指标或者维度dialog
        seeinOrDimDialog:false,
        //查看指标或维度类型
        seeinOrDimType:1,
        seeinOrDimTitle:''
    }
  },
  watch: {
    treeSearchText(val) {
      this.$refs.tree.filter(val);
    },
    searchFilter(val){
      this.searchOnChange("colTable",val)
    }
  },
  mounted() {
      this.init()
  },
  created() {
    var that = this
    window.tableColOnClick = that.tableColOnClick
    window.onColDragOver = that.onColDragOver
    window.onColDrop = that.onColDrop
    window.onColDragStart = that.onColDragStart
    window.delCalculationCol = that.delCalculationCol
    window.editCalculationCol = that.editCalculationCol
    window.detailDim = that.detailDim
  },
  methods: {
    dataTreeCreate(dataTree) {
        this.dataTree = dataTree
        this.dataTree.expandAll(true)
    },
    tableTreeFilterNode(value, data){
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //region 所有表树操作
    getTableAll() {
        var that = this
        let loadingInstance = Loading.service({ fullscreen: true })
        var url = this.dataContextUrl + '/tableMeta/getResELTree'
        //加载数据表
        const scenecode = "auditor";
        const datauserid = this.currentLoginUser.personcode
        $.ajax({
          type: "get",
          url: url,
          data: {sceneCode:scenecode,dataUserId:datauserid,type:'common'},
          async: true,
          dataType: "json",
          success: function (res) {
            that.dataTreeNodes = res.data
            loadingInstance.close()
          }
        });
    },

    /**
     * 所有表树点击事件
     * @param data
     * @param node
     */
    onClickAllTable(data,node) {
      if(data.type == "folder"){
        return
      }
      this.dmTableUuid = data.id
      this.dmTableName = data.label
      this.rawTableName = data.label
      this.getAllColumn(data.id)
      this.getAllIndicatrix(data.id)
      this.getAllDimension(data.id)
    },

    /**
     * 树加载完成回调
     */
    onAsyncSuccess() {
    },

    //endregion

    //region 废弃

    /**
     * 获取所有指标表
     */
    getIndicatrixTable() {
        var that = this
        var url = this.contextUrl + "/InTableRelation/getIndicatrixTable"
        $.post(url, {}, function (res) {
            $.each(res, function (num, value) {
                that.inTableId.push(value.id)
            })
        }, "json")
    },
    //region 其他

    /**
     * 文本框的值改变事件
     * @param value 更改的值
     */
    searchOnChange(id,searchFilters) {
      var table = $("#" + id).find("tr")
      table.each(function (num) {
          if(num == 0){
              return
          }
          var tableTr = $(this)
          var trValue = tableTr.text()
          if (!trValue.match(searchFilters)) {
              tableTr.hide()
          }
          else {
              tableTr.show()
          }
      })
    },

    /**
     * 查看表内部分数据 默认展示前50条
     */
    selectTableData() {
      if (this.dmTableName == "") {
          this.$message("请选择数据表！")
          return
      }
      var sql = "select * from {0}".format(this.rawTableName)
      this.seeDataSql = sql
      this.seeSqlDataDialog = true
    },

    /**
     * 获取表所有列名
     */
    getTableColumn(tableId) {
        $("#colName").html("")
        var url = this.contextUrl + "/InDimColumn/getTableColumn"
        $.post(url, {tableId: tableId}, function (res) {
            $.each(res, function (number, value) {
                var li = $("<li id='" + value.columnUuid + "'>" + value.columnName + "</li>")
                for (var i = 0; i < li.length; i++) {
                    li[i].onclick = setStyle
                }
                $("#colName").append(li)
            })
        }, "json")
    },

    /**
     * 获取选择表所有没设置为指标的列
     */
    getAllColumn(tableId) {
      if(tableId == null){
        return
      }
        var that = this
        let loadingInstance = Loading.service({ fullscreen: true })
        var colModel = [
            {name: 'colMetaUuid', lable: '', hidden: true},
            {name: 'colName', lable: '英文列名称', align: 'center'},
            {name: 'chnName', lable: '中文列名称', align: 'center'},
            {name: 'operation', lable: '操作', align: 'center'}
        ]
        $("#colTable").html("")
        //循环添加列信息
        var dom = "<thead><tr id='colTitle'></tr></thead>"
        var tbody = "<tbody id='colTitleTb'></tbody>"
        $("#colTable").append(dom)
        $("#colTable").append(tbody)
        $.each(colModel, function (num, value) {
            var domTd = "<th "+(value.hidden?"class='td-hidden'":"")+" >" + value.lable + "</th>"
            $("#colTitle").append(domTd)
        })
        var url = this.dataContextUrl + '/tableMeta/getCols'
        $.post(url, { tableMetaUuid: tableId }, function (res) {
          //获取到表列之后获取计算列
          var getCalculationColUrl = that.contextUrl + '/InCalculationColumn/getTableIdData'
            $.post(getCalculationColUrl, { tableId: tableId }, function (resCalculation) {
              //处理列属性  以产品的列为准
              if(resCalculation.head.status == 50){
                that.message({info:'error',text:'数据读取失败,' + resCalculation.head.message})
              }
              else{
                for(var i = 0;i < resCalculation.body.result.length;i++){
                  var obj = {
                    colMetaUuid:resCalculation.body.result[i].inCalculationColumnUuid,
                    colName:resCalculation.body.result[i].calculationColumnName,
                    chnName:resCalculation.body.result[i].calculationColumnName,
                    type:2
                  };
                  res.data.push(obj)
                }
              }
              //循环数据
              $.each(res.data, function (num, data) {
                  var uuid = that.getuuid()
                  var domTr = "<tr id='" + uuid + "' onclick='tableColOnClick(this,\"colTable\")' " +
                      "ondragover='onColDragOver(event)' " +
                      "ondragend='onColDrop(event)' " +
                      "ondragstart='onColDragStart(event)'></tr>"
                  $("#colTitleTb").append(domTr)
                  //注入事件和属性
                  $("#" + uuid).attr("check", "false")
                  $("#" + uuid).attr("draggable", "true")
                  $("#" + uuid).attr("columnType", data["dataType"])
                  //循环行
                  $.each(colModel, function (num, value) {
                      if (num == 0) {
                          var domTd = "<td class='td-hidden'>" + "<input type='hidden' id='" + data[value.name] + "'>" + "</td>"
                          $("#" + uuid).append(domTd)
                      }
                      else {
                          if (value.name == "operation") {//判断是不是操作类型，如果是操作类型则显示编辑删除按钮
                              var type = data["type"]
                              if (type == 1 || type == undefined) {
                                  var domTd = "<td id='" + that.getuuid() + "'>无</td>"
                                  $("#" + uuid).append(domTd)
                                  return
                              }
                              var domTd = "<td id='" + that.getuuid() + "'>" +
                                  "<button class='btn btn-primary pull-left' style='padding: 2px;margin: 5px;' onclick='delCalculationCol(\"" + data["colMetaUuid"] + "\")'>删除</button>" +
                                  "<button class='btn btn-primary pull-left' style='padding: 2px;margin: 5px;' onclick='editCalculationCol(\"" + data["colMetaUuid"] + "\")'>编辑</button>" +
                                  "</td>"
                              $("#" + uuid).append(domTd)
                          }
                          else {
                            var colName = "";
                            if(data[value.name] == null){
                              colName = "无";
                            }
                            else{
                              colName = data[value.name];
                            }
                              var domTd = "<td id='" + that.getuuid() + "'>" + colName + "</td>"
                              $("#" + uuid).append(domTd)
                          }
                      }
                  })
              })
            },"json")
            loadingInstance.close()
        }, "json")
    },

    /**
     * 获取所有指标
     */
    getAllIndicatrix(tableId) {
        var that = this
        $("#gridTableIn").html("")
        var colModel = [
            {name: 'inMeasureUuid', lable: '', hidden: true},
            {name: 'measureName', lable: '指标名称', align: 'center'},
            {name: 'columnType', lable: '指标类型', hidden: false},
            {name: 'measureGroup', lable: '聚合方式', align: 'center'},
            {name: 'columnName', lable: '关联列', align: 'center'},
            {name: 'tableName', lable: '来源表', align: 'center'},
            {name: 'measureMemo', lable: '指标说明', align: 'center'}
        ]
        var dom = "<thead><tr id='colIn'></tr></thead>"
        var tbody = "<tbody id='colInTb'></tbody>"
        $("#gridTableIn").append(dom)
        $("#gridTableIn").append(tbody)
        //循环添加列信息
        $.each(colModel, function (num, value) {
            var domTd = "<th "+(value.hidden?"class='td-hidden'":"")+" >" + value.lable + "</th>"
            $("#colIn").append(domTd)
        })
        var url = this.contextUrl + "/InMeasure/getTableDownAllIn"
        //获取数据
        $.post(url, {tableId: tableId}, function (res) {
            that.inCount = res.body.result.length
            //循环数据
          if(res.body.result != 0){
            $("#dimIn").html("")
          }
          else{
            $("#dimIn").html("暂无数据")
          }
            $.each(res.body.result, function (num, value) {
                var uuid = that.getuuid()
                var domTr = "<tr id='" + uuid + "'check='false' onclick='tableColOnClick(this,\"gridTableIn\")'></tr>"
                $("#colInTb").append(domTr)
                //循环列
                $.each(colModel, function (num, columnName) {
                    if (num == 0) {
                        var domTd = "<td class='td-hidden'>" + "<input type='hidden' id='" + value[columnName.name] + "'>" + "</td>"
                        $("#" + uuid).append(domTd)
                    }
                    else {
                        if(columnName.name == "measureMemo"){
                            var str = value[columnName.name]
                            if(str == undefined){
                              str = "无";
                            }
                            else{
                              str = str.substring(0,10) + "..."
                            }
                            var domTd = "<td title='"+ value[columnName.name] +"'>" + str + "</td>"
                            $("#" + uuid).append(domTd)
                        }
                        else{
                            var domTd = "<td>" + value[columnName.name] + "</td>"
                            $("#" + uuid).append(domTd)
                        }
                    }
                })
            })
        }, "json")
    },

    refreshDimList(){
      this.getAllDimension(this.dmTableUuid)
    },
    /**
     * 获取所有维度
     */
    getAllDimension(tableId) {
        var that = this
        $("#gridTableDim").html("")
        var colModel = [
            {name: 'inDimensionUuid', lable: '', hidden: true},
            {name: 'dimensionName', lable: '维度名称', align: 'center'},
            {name: 'columnType', lable: '维度类型', hidden: false},
            {name: 'columnName', lable: '关联列', align: 'center'},
            {name: 'tableName', lable: '来源表', align: 'center'},
            {name: 'dimensionMemo', lable: '维度说明', align: 'center'}
        ]
        var dom = "<thead><tr id='colDim'></tr></thead>"
        var tbody = "<tbody id='colTb'></tbody>"
        $("#gridTableDim").append(dom)
        $("#gridTableDim").append(tbody)
        //循环添加列信息
        $.each(colModel, function (num, value) {
            var domTd = "<th "+(value.hidden?"class='td-hidden'":"")+" >" + value.lable + "</th>"
            $("#colDim").append(domTd)
        })
        var url = this.contextUrl + "/InDimension/getTableDownAllDim"
        $.post(url, {tableId: tableId}, function (res) {
            that.dimCount = res.body.result.length
            //循环数据
            if(res.body.result != 0){
              $("#dimZan").html("")
            }
            else{
              $("#dimZan").html("暂无数据")
            }
            $.each(res.body.result, function (num, value) {
                var uuid = that.getuuid()
                var domTr = "<tr id='" + uuid + "'check='false' onclick='tableColOnClick(this,\"gridTableDim\")'></tr>"
                $("#colTb").append(domTr)
                //循环列
                $.each(colModel, function (num, columnName) {
                    if (num == 0) {
                        var domTd = "<td class='td-hidden'>" + "<input type='hidden' id='" + value[columnName.name] + "'>" + "</td>"
                        $("#" + uuid).append(domTd)
                    }
                    else {
                        if(columnName.name == "dimensionMemo"){
                            var str = value[columnName.name]
                            if(str == undefined){
                              str = "无";
                            }
                            else{
                              str = str.substring(0,10) + "..."
                            }
                            var domTd = "<td title='"+ value[columnName.name] +"'>" + str + "</td>"
                            $("#" + uuid).append(domTd)
                        }
                        else if (columnName.name != "columnName") {
                            var domTd = "<td>" + value[columnName.name] + "</td>"
                            $("#" + uuid).append(domTd)
                        }
                        else {
                            var parameter = "\"{0}\",\"{1}\"".format(value["inDimensionUuid"],value["dimensionName"])
                            var domTd = "<td><a onclick='detailDim(" + parameter + ")' >" + value[columnName.name] + "</a></td>"
                            $("#" + uuid).append(domTd)
                        }
                    }
                })
            })
        }, "json")
    },

    /**
     * 刷新界面
     */
    refreshForm() {
        this.getAllColumn(this.dmTableUuid)
        this.getAllIndicatrix(this.dmTableUuid)
        this.getAllDimension(this.dmTableUuid)
    },

    /**
     * 设置li选中样式并获取ID和名称
     */
    setStyle() {
        $("#colName li").removeClass()
        this.columnId = $(this).attr("id")
        this.columnName = $(this).text()
        $(this).addClass("selected")
    },

    /**
     * 初始化数据
     */
    init() {
        this.getIndicatrixTable()
        this.getTableAll()
    },

    /**
     * 计算树拖拽位置是否是所传ID
     * @param id 要进行判断的编号
     */
    calculationPosition(id) {
        var left = $("#" + id).offset().left //获取控件左侧位置
        var top = $("#" + id).offset().top   //获取控件上方位置
        var rowDimWight = $("#" + id).width()    //获取控件宽度
        var rowDimHEIGHT = $("#" + id).height()  //获取控件高度
        var right = left + rowDimWight       //获取控件右侧宽度
        var down = top + rowDimHEIGHT            //获取控件底下距离
        if (event.clientX > left && event.clientX < right) //鼠标放开之后判断当前鼠标所在位置是否大于控件左侧并且小于控件右侧
        {
            if (event.clientY > top && event.clientY < down) //判断成功后再次判断鼠标Y轴是否在空间内
            {
                return true
            }
        }
        return false
    },

    /**
     * 删除指标表
     */
    delInTable(tableId) {
        var that = this
        var url = this.contextUrl + "/InTableRelation/deleteByPrimaryKey"
        $.post(url, {inTablerelationUuid: tableId}, function (res) {
            if (res.state == true) {
            }
            else {
                that.$message(res.message)
            }
        }, "json")
    },

    /**
     * 添加指标表
     * @param treeNodes 树节点
     */
    addInTable(tableId) {
        var inTableRelation = {
            inTablerelationUuid: '',
            tableuuid: tableId
        }
        var url = this.contextUrl + "/InTableRelation/insertSelective"
        $.post(url, {inTableRelation: JSON.stringify(inTableRelation)}, function (res) {
        }, "json")
    },

    //endregion 其他

    //region 计算列操作

    /**
     * 添加计算列
     */
    addCalculationColumn() {
        if (this.dmTableUuid == "" || this.dmTableUuid == undefined) {
            this.$message("请选择数据表！")
            return
        }
        this.dialogCalculationcolumnVisible = true
    },

    /**
     * 编辑计算列
     * @param calculationColId 计算列编号
     */
    editCalculationCol(calculationColId) {
        if (this.dmTableUuid == "" || this.dmTableUuid == undefined) {
            this.$message("请选择数据表！")
            return
        }
        this.calculationColId = calculationColId
        this.dialogCalculationcolumnVisible = true
    },

    /**
     * 删除计算列
     * @param calculationColId 计算列编号
     */
    delCalculationCol(calculationColId) {
        var that = this
        this.$confirm('确认删除吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
          var flag = this.checkRoot(calculationColId)
          if(flag == true){
            that.$message("删除失败，请先删除关联维度")
            return
          }
          var url = that.contextUrl + "/InCalculationColumn/deleteByPrimaryKey"
          $.post(url, {inCalculationColumnUuid: calculationColId}, function (res) {
            debugger
            if (res.state == false) {
              that.$message(res.message)
              return
            }
            that.getAllColumn(that.dmTableUuid)
          }, "json")
        }).catch(() => {
        })
    },
    //验证计算列是否有关联维度
    checkRoot(columnId){
    	var flag
    	var url = this.contextUrl+ "/InDimension/checkRoot"
    	$.ajax({
    		url : url,
    		data : {columnId:columnId},
    		method:"POST",
    		cache : false,
    		dataType:"json",
    		async: false,
    		success: function(result){
    			flag = result
    		}
    	})
    	return flag
    },
    //endregion 计算列操作

    //region table操作
    /**
     * 列tr拖拽开始事件
     * @param event
     */
    onColDragStart(event) {
        event.dataTransfer.setData("FuJi", event.srcElement.parentElement.id)
    },

    /**
     * tr拖拽中
     * @param event 拖拽事件
     */
    onColDragOver(event) {
        event.preventDefault()
        $("#indicatrixInfo").addClass("analysisRegionSelected")
        $("#dimInfo").addClass("analysisRegionSelected")
    },

    /**
     * 拖拽结束
     * @param event
     */
    onColDrop(event) {
        var id = event.target.id//拖拽目标的编号
        var obj = $("#" + id)
        var checkbox = $(obj).find("input[type='hidden']")
        var columnType = obj.attr("columnType")
        this.columnId = checkbox.attr("id")
        this.columnName = $(obj).children("td").eq(1).text()
        if (this.calculationPosition("indicatrixInfo")) {
            if (columnType == 0) {
                this.addIndicatrix()
            }
            if (columnType == 4) {
                this.calculationIndicatrix()
            }
        }
        if (this.calculationPosition("dimInfo")) {
            this.addDimension()
        }
        $("#indicatrixInfo").removeClass()
        $("#dimInfo").removeClass()
    },

    /**
     * 表行单击事件
     * @param obj 选中的tr对象
     * @param id table编号  colTable列表  gridTableIn指标表  gridTableDim维度表
     */
    tableColOnClick(obj, id) {
        var check = $(obj).attr("check")
        var hidden = $(obj).find("input[type='hidden']")
        if (check == "false") {
            $("#" + id).find("tr").each(function () {
                $(this).removeClass("border-table-td-select")
                $(this).attr("check", "false")
            })
            $(obj).addClass("border-table-td-select")
            $(obj).attr("check", "true")
            //checkbox.attr("checked","true")
            if (id == "gridTableIn") {
                this.inMeasureObj.inMeasureUuid = hidden.attr("id")//指标编号
                this.inMeasureObj.measureName = $(obj).children("td").eq(1).text()//指标名称
                this.inMeasureObj.rowId = $(obj).attr("id")
                this.inMeasureObj.measureType = parseInt($(obj).children("td").eq(8).text())
            }
            else if (id == "gridTableDim") {
                this.inDimObj.inDimensionUuid = hidden.attr("id")
                this.inDimObj.dimensionName = $(obj).children("td").eq(1).text()
                this.inDimObj.rowId = $(obj).attr("id")
                this.inDimObj.dimensionTemporary = parseInt($(obj).children("td").eq(5).text())
            }
            else if (id == "colTable") {
                this.columnId = hidden.attr("id")
                this.columnName = $(obj).children("td").eq(1).text()
            }
        }
        if (check == "true") {
            $(obj).removeClass("border-table-td-select")
            $(obj).attr("check", "false")
            this.columnId = ""
            this.columnName = ""
            this.inMeasureObj = {}
            this.inDimObj = {}
        }
    },

    //endregion table操作

    //region 指标操作
    /**
     * 添加指标
     */
    addIndicatrix() {
        var that = this
        if (this.dmTableUuid == undefined || this.dmTableUuid == "" && that.columnId == undefined || that.columnId == "") {
            this.$message("请选择数据表和数据列！")
            return
        }
        var urlVer = this.contextUrl + "/InDimension/verIsNoDim"
        $.post(urlVer, {columnUuid: that.columnId}, function (res) {
            if (res.state == false) {
                that.$message(res.message)
                return
            }
            else {
                that.inMeasureObj.inMeasureUuid = null
                that.dialogAddIndicatrixVisible = true
            }
        }, "json")
    },

    /**
     * 修改指标
     */
    editIndicatrix() {
        var inMeasureUuid = this.inMeasureObj.inMeasureUuid
        if (inMeasureUuid == undefined || inMeasureUuid == "") {
            this.$message("请选择要编辑的指标!")
            return
        }
        this.dialogAddIndicatrixVisible = true
    },

    /**
     * 删除指标
     */
    delIndicatrix() {
        var that = this
        var inMeasureUuid = this.inMeasureObj.inMeasureUuid
        if (inMeasureUuid == '' || inMeasureUuid == undefined) {
            this.$message("请选择要删除的指标")
            return
        }
        var measureNames = this.inMeasureObj.measureName
        this.$confirm('若要删除该指标将会删除该指标与维度的关联，确认删除 ' + measureNames + '吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
        	var url = that.contextUrl + "/InMeasure/verInRel"
        	$.post(url, {inMeasureUuid: inMeasureUuid}, function (res) {
        		if (res.state == false) {
        			that.$message(res.message)
        			return
        		}
        		else {
        			var url = that.contextUrl + "/InMeasure/deleteByPrimaryKey"
        			$.post(url, {inMeasureUuid: inMeasureUuid}, function (res) {
        				if (res.state == true) {
        					var info = "删除了指标:'{0}'".format(measureNames)
        					that.addOperLogByParam(that.log_module,that.log_del,that.log_info)
        					$("#" + that.inMeasureObj.rowId).remove()
        					that.$message("该指标与维度的关联关系已删除。")
        					that.refreshForm()
        					that.inCount = that.inCount - 1
        					that.verDelTableId()
        				}
        			}, "json")
        		}
        	}, "json")
        	that.inMeasureObj = {}
        }).catch(() => {
        })
    },

    /**
     * 计算指标
     */
    calculationIndicatrix() {
        if (this.dmTableUuid == undefined || this.dmTableUuid == "") {
            this.$message("请选择数据表!")
            return
        }
        var url = "../../content/indicatrixAnalysis/indicatrixCalculation.html?&tableId={0}&tableName={1}&columnId={2}".format(this.dmTableUuid, dmTableName, this.columnId)
        layer.open({
            type: 2,
            title: '编辑计算指标',
            shadeClose: true,
            shade: [0],
            resize :false,
            maxmin: false, //开启最大化最小化按钮
            area: ['1200px', '600px'],
            content: [encodeURI(url), 'yes']
        })
    },

    //endregion 指标操作

    //region 维度操作
    /**
     * 添加维度
     */
    addDimension() {
        var that = this
        if (that.dmTableName == undefined || that.dmTableName == "" && that.columnId == undefined || that.columnId == "") {
            that.$message("请选择数据表和数据列！")
            return
        }
        var urlVer = that.contextUrl + "/InMeasure/verIsNoIn"  //验证该列是否为指标
        $.post(urlVer, {columnUuid: that.columnId}, function (res) {
            if (res.state == false) {
                that.$message(res.message)
            }
            else {
                var verDimUrl = that.contextUrl + "/InDimension/verIsNoDim"//验证该列是不是已经作为了维度
                $.post(verDimUrl, {columnUuid: that.columnId}, function (res) {
                    if (res.state == false) {
                        that.$message(res.message)
                        return
                    }
                    else {
                        that.inDimObj.inDimensionUuid = null
                        that.dialogDimensionVisible = true
                    }
                }, "json")
            }
        }, "json")
    },

    /**
     * 修改维度
     */
    editDimension() {
        var dimId = this.inDimObj.inDimensionUuid
        if (dimId == "" || dimId == undefined) {
            this.$message("请选择数据表！")
            return
        }
        this.dialogDimensionVisible = true
    },

    /**
     * 删除维度
     */
    delDimension() {
        var that = this
        var dimId = this.inDimObj.inDimensionUuid
        var dimName = this.inDimObj.dimensionName
        if (dimId == undefined || dimId == "") {
            this.$message("请选择要删除的维度！")
            return
        }
        this.$confirm('若删除该维度将会删除该维度与指标的全部关联，确认删除 --' + dimName + '--吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
        	var url = that.contextUrl + "/InDimension/deleteByPrimaryKey"
        	$.post(url, {inDimensionUuid: dimId}, function (res) {
        		if (res.state == true) {
        			var info = "删除了维度:'{0}'".format(dimName)
        			that.addOperLogByParam(that.log_module,that.log_del,that.log_info)
        			$("#" + that.inDimObj.rowId).remove()
        			that.$message("该维度与指标的关联关系已删除。")
        			that.dimCount = that.dimCount - 1
        			that.refreshForm()
        			that.verDelTableId()
        		}
        		else {
        			that.$message(res.message)
        		}
        	}, "json")
        	that.inDimObj = {}
        }).catch(() => {
        })
    },

    /**
     * 计算维度
     */
    calculationDimension() {
        if (this.dmTableUuid == undefined || this.dmTableUuid == "") {
            this.$message("请选择数据表！")
            return
        }
        var url = "../../content/indicatrixAnalysis/dimensionCalculation.html?tableName={0}&tableId={1}&columnId={2}&columnName={3}".format(dmTableName, dmTableUuid, this.columnId, columnName)
        openLayer('1000px', '680px', url, '编辑计算维度', 2)
    },

    /**
     * 关联已有维度
     */
    relHaveDim() {
      if (this.dmTableUuid == undefined || this.dmTableUuid == "" && this.columnId == undefined || this.columnId == "") {
          this.$message("请选择表或维度!")
          return
      }
      this.relDimDialog = true
    },

    /**
     * 查看维度关联详细
     * @param id 维度编号
     * @param name 维度名称
     */
    detailDim(id,name) {
        this.inDimObj.inDimensionUuid = id
        this.inDimObj.dimensionName = name
        this.dialogDimrelcoltabdeailVisible = true
    },

    /**
     * 验证维度与指标是否全部为0，如果全部为0则删除指标表的关联，
     */
    verDelTableId() {
        var that = this
        if (that.inCount == 0 && that.dimCount == 0) {
            $.each(that.inTableId, function (num, value) {
                delete that.inTableId[value]
            })
            this.delInTable(this.dmTableUuid)
        }
        this.getIndicatrixTable()
    },

    /**
     * 查看所有维度
     */
    getAllDim() {
      this.seeinOrDimDialog = true
      this.seeinOrDimType = 2
      this.seeinOrDimTitle = '全部维度'
    },

    /**
     * 查看所有指标
     */
    getAllIn() {
      this.seeinOrDimDialog = true
      this.seeinOrDimType = 1
      this.seeinOrDimTitle = '全部指标'
    },
    //endregion 维度操作

    /**
     * 设置表名
     * @param tableName 表名
     */
    setTableName(tableName) {
        $("#searchTable").val(tableName)
    },
    closeCalculationcolumn(){
        this.dialogCalculationcolumnVisible = false
    },
    closeAddIndicatrix(){
        this.dialogAddIndicatrixVisible = false
    },
    closeDimension(){
        this.dialogDimensionVisible = false
    },
    closeRelDim(){
      this.relDimDialog = false
    }
  }
}
</script>
<style scoped>
>>>.border-table{
        width:100%;
        line-height: 30px;
    }
>>>.td-hidden{
        display:none;
    }
>>>.border-table-td-select{
        background-color: #e8f4ff!important;
        color: #46a6ff!important;
    }
>>>a{
        cursor:pointer;
        text-decoration:underline;
        color: #46a6ff
    }
>>>.analysisRegionSelected{
        cursor: pointer;
        box-shadow: 0px 0px 10px 0px rgb(115, 163, 228), 0px 0px 1px 1px rgba(0, 0, 0, 0.09), 0px 0px 10px 1px rgba(0, 0, 0, 0.06);
    }
>>>.page-col-2{
        background: hsla(0,0%,41.6%,.08627450980392157);
        border-radius: 15.5px;
    }
>>>.page-col-3{
        background: hsla(0,0%,41.6%,.08627450980392157);
        border-radius: 15.5px;
    }
</style>
