<template>
  <div class="app-container">
    <el-container>
      <el-aside class="left-side" height="748px">
        <el-scrollbar>
          <el-tabs tab-position="left" style="height: 100%;">
            <el-tab-pane>
              <span slot="label" class="tab-indicator"><i class="el-icon-s-marketing"></i>指标</span>
                <el-input v-model="searchAnalysis" id="search" placeholder="搜索"></el-input>
                <tree :nodes="inTreeNodes" :setting="inTreeSetting" @onCreated="inTreeCreate"/>
            </el-tab-pane>
            <el-tab-pane>
              <span slot="label" class="tab-common"><i class="el-icon-s-grid"></i>常用分析</span>
                <el-input v-model="searchAnalysis" id="searchAnalysis" placeholder="搜索"></el-input>
                <tree :nodes="commonTreeNodes" :setting="commonTreeSetting" @onCreated="commonTreeCreate"/>
            </el-tab-pane>
          </el-tabs>
          <div class="side-footer">
            <el-dropdown v-if="isInManager == 'true' || isOrgManager == 'true'">
              <el-button style="border-color: aliceblue" class="el-dropdown-link">
                <span style="font-size: 30px;color: #C0C0C0;background: ghostwhite;" class="icon iconfont">&#xe606;</span></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="nativeIndicatrixDesign">原生指标设计</el-dropdown-item>
                <el-dropdown-item @click.native="addDeriveIn">派生指标设计</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
<!--            <el-button type="primary" style="margin: 5px;float: left;margin-left: 9px;" size="mini" @click="nativeIndicatrixDesign">原</el-button>
            <el-button type="primary" size="mini" @click="addDeriveIn">派</el-button>-->
          </div>
        </el-scrollbar>
      </el-aside>
      <el-main v-loading="theRightLoding">
        <div class="top-collapse-container">
          <div class="top-collapse-con">
            <div class="toggle-btn J_slideup_btn" @click="packUpClick"><i class="icon-toggle"></i><span>收起</span></div>
            <div class="collapse-panel">
              <div class="tag-left-con">
                <div class="in-outer-layer" id="inRegion">
                  <div class="collapse-panel-head">分析个数 <span id="analysisCount">0</span></div>
                  <div class="tags-item-con" id="analysisRegion" analysisRegion='inAnalysisRegion'
                       style="cursor:pointer" onclick="switchDim(this,'inDimAnalysisRegion')">
                    <div class="tags-item" id="inAnalysisRegion" analysisRegion='inAnalysisRegion'>
                      <div class="tags-order" id="inAnalysisRegionCount">1</div>
                      <div class="tag-select">
                        <i class="icon-add">+</i>
                        <span style='margin-top: -5px;' onclick="addTempIn(this)" analysisRegion='inAnalysisRegion'>新增临时指标</span>
                      </div>
                      <div title="设置阈值" class='tags-set'>
                        <span class="icon iconfont" id="setValueinAnalysisRegion" style="color:#aeaeae;" onclick="setValue('inAnalysisRegion')">&#xe606;</span>
                      </div>
                      <div title="删除分析区" class='tags-del'><i onclick='delAnalysisRegion("inAnalysisRegion")'></i>
                      </div>
                    </div>
                  </div>
                  <div class="tags-left-create-con" id="createAnalysis" style="cursor:pointer"
                       onclick="createAnalysisRegion()">创建并列分析
                  </div>
                </div>
              </div>
              <div class="tag-right-con" id="dimRegion">
                <div class="row table-view-caption pull-right">
<!--                  <el-button type="primary" size="mini" @click="test">测试</el-button>-->
                  <el-button type="primary" size="mini" @click="queryData">查询</el-button>
                  <el-button type="primary" size="mini" @click="clearAnalysis">清空</el-button>
                  <el-button type="primary" size="mini" @click="saveChangYongAnalysis">保存为常用分析</el-button>
                </div>
                <div class="collapse-panel-head clearfix" id="dimTitle">分析维度</div>
                <div id="dimAnalysisRegion">
                  <div class="tags-item-con" id="inDimAnalysisRegion">
                    <div class="tag-select">
                      <i class="icon-add">+</i>
                      <span style='margin-top: -5px;' @click="addTempDim('inAnalysisRegion')">新增临时维度</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="slide-container">
          <div class="collapse-slideup-con">
            <div class="slideup-left" id="analysisIn">
              <span>分析个数</span><em id="count">1</em>
            </div>
            <a href="#" @click="openDisplay" class="collapse-set-btn J_slidedown_btn">展开</a>
          </div>
        </div>
        <div :style="{height:this.tableHeight == 'height:80%'?'calc(100vh - 143px)':'calc(100vh - 292px)'}">
          <div id="dataView">
<!--          style="height: 650px;overflow-y:scroll"-->
          <div class="recommendPage">
            <el-menu default-active="0" class="el-menu-demo" mode="horizontal">
              <div v-for="(dataObj,indexI) in dataList">
                <el-menu-item :index="indexI.toString()" @click="jump(indexI)">{{dataObj.measureName}}<i :class="dataObj.icon"></i></el-menu-item>
              </div>
            </el-menu>
            <swiper :options="swiperOption" ref="mySwiper">
                <swiper-slide v-for="(dataObj,index) in dataList" v-loading="dataObj.loading" element-loading-text="正在执行SQL,请稍候...">
                  <div class="btn-div"  v-if="dataObj.isError == false">
                    <div :class="dataObj.btnTableClass" :ref="dataObj.id + 'btnTable'" @click="switchDivStyle(dataObj.id + 'btnTable',dataObj.id)"><span class="icon iconfont" style="position: absolute;top: 8px;left: 17px;">&#xecee;</span></div>
                    <div :class="dataObj.btnChartClass" :ref="dataObj.id + 'btnChart'" @click="switchDivStyle(dataObj.id + 'btnChart',dataObj.id)"><span class="icon iconfont" style="position: absolute;top: 8px;left: 65px;">&#xe6d8;</span></div>
                  </div>
                  <ag-grid-vue
                    v-show=dataObj.isShowTable
                    :ref="dataObj.id + 'table'" v-if="dataObj.isLoad == true && dataObj.isError == false"
                    :style="tableHeight"
                    class="table ag-theme-balham"
                    :column-defs="dataObj.data.columnDefs"
                    :row-data="dataObj.data.data"
                    :get-row-style="(params) => {return setRowColor(params,dataObj.id)}"
                    rowMultiSelectWithClick="true"
                    :enable-col-resize="true"
                    row-selection="multiple"
                    row-height="40"
                  />
                  <mtEditor :graphConfigHeight="160" v-show=dataObj.isShowChart :ref="dataObj.id" :data='dataObj.data'
                            :chartBoxStyle="chartBoxStyle"
                            v-if="dataObj.chartConfig != undefined && dataObj.isLoad == true && dataObj.isError == false" :chart-config='dataObj.chartConfig'></mtEditor>
                  <mtEditor :graphConfigHeight="160" v-show=dataObj.isShowChart :ref="dataObj.id" :data='dataObj.data' :chartBoxStyle="chartBoxStyle"
                            v-else-if="dataObj.isLoad == true && dataObj.isError == false"></mtEditor>
                  <div style="color:red;text-align: left" v-else>{{dataObj.message}}</div>
                </swiper-slide>
              <div class="swiper-pagination" slot="pagination"></div>
            </swiper>
          </div>
        </div>
        </div>
      </el-main>
    </el-container>
    <div id="inMenu" class="menuDemo" style="display:none;">
      <el-menu class="el-menu-demo" mode="horizontal">
        <el-menu-item @click="inFilter()" index="2-1">筛选器</el-menu-item>
        <el-submenu index="2-2">
          <template slot="title">度量</template>
          <el-menu-item @click="updateInGroup('sum')" index="2-2-1">合计</el-menu-item>
          <el-menu-item @click="updateInGroup('count')" index="2-2-2">计数</el-menu-item>
          <el-menu-item @click="updateInGroup('max')" index="2-2-3">最大值</el-menu-item>
          <el-menu-item @click="updateInGroup('min')" index="2-3-3">最小值</el-menu-item>
          <el-menu-item @click="updateInGroup('avg')" index="2-4-3">平均值</el-menu-item>
          <el-menu-item @click="updateInGroup('distinct')" index="2-5-3">差异计数</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <el-dialog :title="deriveInType==='2'?'派生指标':'临时指标'" v-if="dialogAddderiveinVisible" width="70%"
               :visible.sync="dialogAddderiveinVisible">
      <addderivein @closeAddderiveinDialog="closeAddderiveinDialog" v-if="dialogAddderiveinVisible" :type="deriveInType" :addType="addDeriveInType"
                   :nowAnalysisRegionId="nowAnalysisRegionId" :parentUuid="nowParentUuid"
                   :inMeasureUuid="nowInMeasureUuid" @loadInMeasueData="loadInMeasueData"
                   @delAnalysisListDownIn="delAnalysisListDownIn"/>
    </el-dialog>
    <el-dialog title="临时维度" v-if="dialogEdittemdimVisible" :visible.sync="dialogEdittemdimVisible">
      <edittemdim @closeEdittemdimDialog="closeEdittemdimDialog" :nowAnalysisRegionId="nowAnalysisRegionId"
                  :nowDimAnalysisRegionId="nowDimAnalysisRegionId" :dimId="dimId" :dimDivId="dimDivId"
                  :analysisList="analysisList" @verTemDimName="verTemDimName" @getInDimList="getInDimList"
                  @initTemDimToFrom="initTemDimToFrom" @delTemDim="delTemDim" :addTempDimAnalysisRegionId="addTempDimAnalysisRegionId"/>
    </el-dialog>
    <el-dialog title="维度过滤器" v-if="dialogFilterVisible" :visible.sync="dialogFilterVisible">
      <dimfilter @closeFilterDialog="closeFilterDialog"
                 @dimSetFilter="dimSetFilter"
                 v-if="dialogFilterVisible"
                 :dimName="dimTriangleClick.dimName"
                 :dimId="dimTriangleClick.dimId"
                 :inId="dimTriangleClick.inId"
                 :sup="dimTriangleClick.sup"
                 :filterJson="nowFilterObj.filterJson"
                 :analysisRegionId="dimTriangleClick.analysisRegionId"
                 columnType="string"
                 :filter="nowFilterObj.filter"
                 :filterList="nowFilterObj.filterList"
                 :analysisList="analysisList"
                 />
    </el-dialog>
    <el-dialog title="保存常用指标分析" v-if="dialogsSaveAnalysisVisible" :visible.sync="dialogsSaveAnalysisVisible">
      <saveanalysis @closeSaveAnalysisDialog="closeSaveAnalysisDialog" @initCommonlyAnalysisZtree="initCommonlyAnalysisZtree" @addAnalistsNode="addAnalistsNode" :isInManager="isInManager" :isOrgManager="isOrgManager"/>
    </el-dialog>
    <el-dialog title="指标设计" v-if="dialogDesignVisible" :visible.sync="dialogDesignVisible" :fullscreen="true">
      <indicatordesign :currentLoginUser="currentLoginUser"></indicatordesign>
    </el-dialog>
    <el-dialog title="指标过滤" :close-on-click-modal="false" v-if="inMeasureFilter" :visible.sync="inMeasureFilter" width="30%">
      <inmeasurefilter v-if="inMeasureFilter" :filterIn="nowFilterObj.filter" :filterListIn="nowFilterObj.filterList" :analysisListIn="this.analysisList"
                       :columnName="updateInObj.columnName" columnType="string" :filterJson="nowFilterObj.filterJson" :columnNameCN="updateInObj.columnNameCN"
      :analysisRegionId="updateInObj.analysisRegionId" :inId="updateInObj.inId" @closeInmeasuerFilter="closeInmeasuerFilter" @inSetFilter="inSetFilter"></inmeasurefilter>
    </el-dialog>
    <el-dialog title="阈值关联" :close-on-click-modal="false" v-if="thresholdValueDialog" :visible.sync="thresholdValueDialog" width="50%">
      <ThresholdValueRel v-if="thresholdValueDialog" :setThreasholdValueObj="setThreasholdValueObj" @clearThresholdValue="clearThresholdValue" @closeThresholdValueRel="closeThresholdValueRel" @inSetThresholdValue="inSetThresholdValue"></ThresholdValueRel>
    </el-dialog>
  </div>
</template>
<script>
// 引入样式文件
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
// 引入ag-grid-vue
import { AgGridVue } from "ag-grid-vue";
import request from '@/utils/request'
//import 'iview/dist/styles/iview.css'
import mtEditor from 'ams-datamax'
import $ from 'jquery'
import {Loading} from 'element-ui';
import {fuzzySearch} from '../lib/ztree/ext/fuzzysearch.js'
import { Message } from 'element-ui'
import { swiper, swiperSlide } from "vue-awesome-swiper";
import "swiper/dist/css/swiper.css";
import Inmeasurefilter from "../views/indicator/inmeasurefilter";
import ThresholdValueRel from "../views/indicator/thresholdvaluerel"
import {handleDataSingleValue,handleDataManyValue} from '../../../../api/analysis/thresholdvalue'
export default {
  name: 'index',
  components: {
    Inmeasurefilter,
    tree: resolve => require(["../lib/ztree/ztree.vue"], resolve),
    addderivein: resolve => require(["../views/indicator/addderivein.vue"], resolve),
    edittemdim: resolve => require(["../views/indicator/edittemdim.vue"], resolve),
    dimfilter: resolve => require(["../views/indicator/dimfilter.vue"], resolve),
    saveanalysis: resolve => require(["../views/indicator/saveanalysis.vue"], resolve),
    indicatordesign: resolve => require(["../views/indicator/indicatordesign.vue"], resolve),
    inmeasurefilter: resolve => require(["../views/indicator/inmeasurefilter.vue"], resolve),
    mtEditor,swiper, swiperSlide,AgGridVue,ThresholdValueRel
  },
  data() {
    return {
      inTree: null,
      commonTree: null,
      inTreeNodes: null,
      inTreeSetting: null,
      commonTreeNodes: null,
      commonTreeSetting: null,
      uuidArr: new Array(),
      uuidName: new Array(),
      //当前登录人
      currentLoginUser:null,
      // 长连接
      webSocket: null,
      //当前界面长连接编号
      currentPageWebSocketUuid:'',
      //当前界面长连接业务ID
      currentPageWebSocketBusinessId:'_indicator',
      //region Fields
      /**
       * 存储指标分析列表 里面存放的是指标和维度
       * @type {Array}
       */
      analysisList: [
        {
          id: 'inAnalysisRegion',
          objInList: [],//指标对象列表
          objDimList: [],//维度对象列表
          supDimIdList: [],//维度id列表
          dimDivIdList: []//div维度id列表
        }
      ],

      /**
       * 记录指标与维度框区的映射  初始的时候就有一个映射的关系
       * @type {Array}
       */
      inRegionAndDimRegionMapping: [
        {
          inAnalysisRegionId: 'inAnalysisRegion',//指标分析区编号
          dimAnalysisRegionId: 'inDimAnalysisRegion'//维度分析区编号
        }],

      /**
       * 点击指标三角号时候用来存储数据
       * @type {string}
       */
      updateInObj: {
        inId: '',
        analysisRegionId: '',
        group: '',
        yesNoTem: '',
        type: '',
        columnName: '',
        columnNameCN: ''
      },

      /**
       * 点击维度三角号的时候用来存储数据  （实在起不出来名了，怎么起都重复☺）
       * @type {{}}
       */
      dimTriangleClick: {
        analysisRegionId: '',
        inId: '',
        dimName: '',
        dimId: '',
        sup: ''
      },

      /**
       *为临时维度设置全局变量
       */
      dataMap: new Map(),
      /**定义全局变量方便临时维度查询是否有函数相加*/
      number: 0,
      /**
       *节点列表
       * @type {Array}
       */
      nodeList: [],
      /**
       * 为树改变搜索颜色的key事件
       */
      key: null,

      /**
       * 为常用分析树改变搜索颜色的key事件
       */
      keyAnalysisZtree: null,
      /**
       * 记录类名
       * @type {string}
       */
      className: 'dark',

      classNameAnalysisZtree: 'dark',

      /**
       * 记录zTree的路径
       * @type {string}
       */
      path: '',

      pathNameTree: '',
      /**
       * 指标树节点  用于添加派生指标时避免刷新界面
       */
      node: null,

      /**
       * 常用分析树节点，用于添加常用指标分析时避免刷新界面
       */
      analysisNode: null,

      /**
       * 是否为指标管理员
       * @type {string}
       */
      isInManager: '',

      /**
       * 是否为机构管理员
       * @type {string}
       */
      isOrgManager: '',

      /**
       * 将后台查出来的数据缓存到界面，用于展示图表
       * result,columnNames,columnTypes,executeTask,executeSQL,listenerType
       * @type {Array}
       */
      dataList: [],

      /**
       * 当前登录人信息
       * @type {string}
       */
      personInfo: null,

      /**
       * 临时维度列表
       * @type {{dimId: string, temDimObj: Array, dimDivId:string,analysisRegionId:string}[维度编号,维度对象]}
       */
      temDimList: [],

      /**
       * 存储每次点击的常用分析编号
       */
      oftenAnalysisId: '',
      /**
       * 存储每次点击的常用分析编号
       * @type {string}
       */
      oftenAnalysisName: '',

      /**
       * 特征值列表
       * @type {Array}
       */
      promptList: [],
      //endregion Fields

      /**
       * 用这个变量存储维度名
       */
      inDimList: [],
      nowAnalysisRegionId: null,
      nowDimAnalysisRegionId: null,
      dimId: null,
      dimDivId: null,
      nowInMeasureUuid: null,
      nowParentUuid: null,
      nowFilterObj: {
        filterJson: ''
      },
      deriveInType: null,
      addDeriveInType: null,
      dialogAddderiveinVisible: false,
      dialogEdittemdimVisible: false,
      dialogFilterVisible: false,
      dialogsSaveAnalysisVisible: false,
      dialogDesignVisible: false,
      //当前鼠标移入指标树节点的最父级节点
      currentInMeasureTreeParentNode: null,
      searchAnalysis:'',
      currentLoading:null,
      swiperOption: {
        loop: false,
        observer: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true, //允许分页点击跳转
        }
      },
      addTempDimAnalysisRegionId:'',
      inMeasureFilter:false,
      //每个分析区所需要展示的过滤条件，里面包含analysisRegionId,条件显示的sql对象
      thresholdValueDialog:false,
      //设置阈值需要的对象
      setThreasholdValueObj:{},
      chartBoxStyle: {
        height: '200px',
        width: '100%'
      },
      tableHeight:"height:60%",
      // 右半部分loding
      theRightLoding: false
    }
  },
  watch: {
    dialogAddderiveinVisible(val) {
      var url = this.contextUrl + "/InMeasure/castResources";
      $.post(url, {}, function () {
      });
    }
  },
  mounted() {
    this.initPower()
    this.initIndicatrixZtree()
    this.initCommonlyAnalysisZtree()
    this.initEvent()
    this.initMenu()
    this.getLoginUuid()
    this.initCurrentLoginUser()
    this.initWebSocket()
  },
  created() {
    var that = this
    window.searchOnChange = that.searchOnChange
    window.switchDim = that.switchDim
    window.addTempIn = that.addTempIn
    window.delAnalysisRegion = that.delAnalysisRegion
    window.setValue = that.setValue
    window.createAnalysisRegion = that.createAnalysisRegion
    window.queryData = that.queryData
    window.clearAnalysis = that.clearAnalysis
    window.saveChangYongAnalysis = that.saveChangYongAnalysis
    window.addTempDim = that.addTempDim
    window.inFilter = that.inFilter
    window.showAppointMenu = that.showAppointMenu
    window.updateInGroup = that.updateInGroup
    window.dimFilterBtn = that.dimFilterBtn
    window.openChart = that.openChart
    window.updateTempIn = that.updateTempIn
    window.delAnalysisListDownIn = that.delAnalysisListDownIn
    window.inTriangle = that.inTriangle
    window.dimClickSup = that.dimClickSup
    window.plusClick = that.plusClick
    window.filterBtn = that.filterBtn
    window.delTemDim = that.delTemDim
    window.updateTemDim = that.updateTemDim
    window.switchDim = that.switchDim
    window.changeChartType = that.changeChartType
    window.featuresValue = that.featuresValue
    window.addConstantForm = that.addConstantForm
    window.saveToSpace = that.saveToSpace
    window.addDeriveIn = that.addDeriveIn
    window.nativeIndicatrixDesign = that.nativeIndicatrixDesign
  },
  methods: {
    /**
     *初始化webSocket
     */
    initWebSocket() {
      this.webSocket = this.getWebSocket()
    },
    /**
     *
     * 使用说明：
     * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
     * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
     */
    getWebSocket() {
      this.currentPageWebSocketUuid = this.getuuid();
      const webSocketPath = process.env.this.AmsWebsocket.getWSBaseUrl(this.AmsModules.INDICATOR) + this.currentPageWebSocketUuid + this.currentPageWebSocketBusinessId
        // process.env.this.AmsWebsocket.getWSBaseUrl(this.AmsModules.INDICATOR) + this.currentPageWebSocketUuid + this.currentPageWebSocketBusinessId
      // WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址
      this.webSocket = new WebSocket(webSocketPath) // 建立与服务端的连接
      // 当服务端打开连接
      this.webSocket.onopen = function(event) {}
      // 发送消息
      this.webSocket.onmessage = function(event) {
        const dataObj = JSON.parse(event.data)
        func1(dataObj)
      }
      const func2 = function func3(val) {
        let dataList = {}
        //找到当前分析区的对象
        for(let i = 0; i < this.dataList.length;i++){
          if(this.dataList[i].id === val.analysisRegionId){
            dataList = this.dataList[i]
          }
        }
        let thresholdValueRel
        for(let i = 0; i < this.analysisList.length;i++){
          if(this.analysisList[i].id === val.analysisRegionId){
            thresholdValueRel = this.analysisList[i].thresholdValueRelObj
          }
        }
        if(val.executeSQL.state == 2){
          let columnDefs = []
          for(let i = 0; i < val.columnNames.length;i++){
            let obj
            //如果阈值类型是多值的时候才会增加处理颜色情况
            //判断当前列名与要设置颜色的列名是否相同  如果相同择加事件  不相同则不加
            if(thresholdValueRel && thresholdValueRel.thresholdValue.thresholdValueType == 2 && thresholdValueRel.modelResultColumnName === val.columnNames[i]){
              obj =  {headerName: val.columnNames[i], field: val.columnNames[i],width:300,cellRenderer:(params) => {return this.changeCellColor(params,val.analysisRegionId,thresholdValueRel)}}
            }
            else{
              obj =  {headerName: val.columnNames[i], field: val.columnNames[i],width:300}
            }
            columnDefs.push(obj)
          }
          let result = {
            column:val.columnNames,
            columnType:val.columnTypes,
            data:val.result,
            columnDefs:columnDefs,
            id:val.analysisRegionId,
            name:val.measureName
          }
          //处理aggrid的列信息
          let data = {id:val.analysisRegionId,data:result,measureName:val.measureName,chartConfig:val.chartConfig}
          //根据返回的结果id找到数组里面的数据进行修改
            dataList.data = result
            dataList.loading = false
            dataList.isLoad = true
            dataList.icon = 'el-icon-check'
            dataList.isError = false
/*          for(let i = 0; i < this.dataList.length;i++){
            //如果相等则修改数据
            if(this.dataList[i].id == val.analysisRegionId){
              this.dataList[i].data = result
              this.dataList[i].loading = false
              this.dataList[i].isLoad = true
              this.dataList[i].icon = 'el-icon-check'
              this.dataList[i].isError = false
            }
          }*/
        }
        else{
          dataList.loading = false
          dataList.isLoad = false
          dataList.icon = 'el-icon-close'
          dataList.message = val.executeSQL.msg
          dataList.isError = true
/*          for(let i = 0; i < this.dataList.length;i++){
            //如果相等则修改数据
            if(this.dataList[i].id == val.analysisRegionId){
              this.dataList[i].loading = false
              this.dataList[i].isLoad = false
              this.dataList[i].icon = 'el-icon-close'
              this.dataList[i].message = val.executeSQL.msg
              this.dataList[i].isError = true
            }
          }*/
        }
      }
      const func1 = func2.bind(this)
      this.webSocket.onclose = function(event) {}

      // 通信失败
      this.webSocket.onerror = function(event) {}
    },
    initCurrentLoginUser(){
      var that = this
      var url = this.baseContextUrl + "/getUserByCookie";
      $.ajax({
        type: "get",
        url: url,
        data: {},
        async: false,
        dataType: "json",
        success: function (res) {
          that.currentLoginUser = res.data
        }
      });
    },
    inTreeCreate(inTree) {
      this.inTree = inTree
      this.inTree.expandAll(true)
      fuzzySearch(this.inTree, '#search', null, false)
    },
    commonTreeCreate(commonTree) {
      this.commonTree = commonTree
      this.commonTree.expandAll(true)
      fuzzySearch(this.commonTree, '#searchAnalysis', null, false)
    },
    /**
     * 初始化指标树
     */
    initIndicatrixZtree() {
      var urlOne = this.contextUrl + "/InFolder/getIndicatrixTree";
      var that = this;
      $.post(urlOne, {}, function (res) {
        var setting = {
          check: {
            enable: false,
            chkboxType: {"Y": "s", "N": "ps"},
            drag: {
              autoExpandTrigger: true,
              prev: false,
              inner: false,
              next: false
            }
          },
          data: {
            key: {
              name: "name",
              title: "title"
            },
            simpleData: {
              enable: true,
              idKey: "id",
              pIdKey: "pid"
            }
          },
          callback: {
            beforeDrag: that.beforeDragOne,
            beforeDrop: that.beforeDrop,
            onDrop: that.onDrop,
            beforeEditName: that.beforeEditName,
            beforeRemove: that.beforeRemove,
            beforeRename: that.beforeRename,
            onRemove: that.onRemove,
            onRename: that.onRename,
            onClick: that.onClick
          },
          view: {
            addDiyDom: that.addIndicatrixDiyDom,
            addHoverDom: that.addHoverDom,
            removeHoverDom: that.removeHoverDom,
            selectedMulti: false,
            fontCss: that.getFontCss,
            showLine: false,
            dblClickExpand: false
          },
          edit: {
            drag: {
              autoExpandTrigger: true,
              prev: that.dropPrev,
              inner: that.dropInner,
              next: that.dropNext
            },
            enable: true,
            editNameSelectAll: true,
            showRemoveBtn: that.showRemoveBtn,
            showRenameBtn: that.showRenameBtn
          }
        };
        //初始化树
        // var zTree = $.fn.zTree.init($("#tree"), setting, zNodes);
        that.inTreeNodes = res;
        that.inTreeSetting = setting;
      }, "json");
    },

    /**
     * 刷新指标树
     */
    refreshInTree() {
      this.initIndicatrixZtree();
    },

    /**
     * 是否允许拖拽到目标前
     * @param treeId 树编号
     * @param nodes 拖拽的节点
     * @param targetNode 目标节点
     * @returns {boolean}
     */
    dropPrev(treeId, nodes, targetNode) {
      /*     if(nodes[0].auditorOrauditorgan != targetNode.auditorOrauditorgan){
            console.log("1");
            return false;
        }
        if(targetNode.type !="folder"){
            if(nodes[0].getParentNode().id != targetNode.getParentNode().id){
                console.log("2");
                return false;
            }
        }
        if(targetNode.type == "folder"){
            console.log("3");
            return false;
        }*/
      //console.log("4");
      return false;
    },

    /**
     * 是否允许拖拽到目标
     * @param treeId 书编号
     * @param nodes 拖拽的节点
     * @param targetNode 目标节点
     * @returns {boolean}
     */
    dropInner(treeId, nodes, targetNode) {
      if (!this.verDrop(nodes[0].auditorOrauditorgan)) {
        return false;
      }
      if (nodes[0].auditorOrauditorgan != targetNode.auditorOrauditorgan) {
        return false;
      }
      if (targetNode.type != "folder") {
        if (nodes[0].getParentNode().id != targetNode.getParentNode().id) {
          return false;
        }
      }
      if (targetNode.type == "folder" && targetNode.level != 0) {
        return true;
      }
      return false;
    },

    /**
     * 是否允许拖拽到目标后边
     * @param treeId
     * @param nodes
     * @param targetNode
     * @returns {boolean}
     */
    dropNext(treeId, nodes, targetNode) {
      if (!this.verDrop(nodes[0].auditorOrauditorgan)) {
        return false;
      }
      if (nodes[0].auditorOrauditorgan != targetNode.auditorOrauditorgan) {
        return false;
      }
      if (targetNode.type != "folder") {
        if (nodes[0].getParentNode().id != targetNode.getParentNode().id) {
          return false;
        }
      }
      /*        if(targetNode.type == "folder"){
            return false;
        }*/
      return true;
    },

    /**
     * 拖拽所属  1、全行  2、机构  3个人
     * @param auditorOrauditorgan
     * @returns {boolean}
     */
    verDrop(auditorOrauditorgan) {
      if (auditorOrauditorgan == 1 && this.isInManager == "true") {
        return true;
      }
      if (auditorOrauditorgan == 2 && this.isInManager == "true") {
        return true;
      }
      //判断是否为机构管理员  若是机构管理员则显示全行下分类的添加按钮
      if (auditorOrauditorgan == 2 && this.isOrgManager == "true") {
        return true;
      }
      if (auditorOrauditorgan == 3) {
        return true;
      }
      return false;
    },
    /**
     * 拖拽前事件
     * @param treeId 拖拽的树节点编号
     * @param treeNodes 拖拽的树节点
     * @returns {boolean} 是否成功
     */
    beforeDragOne(treeId, treeNodes) {
      /*       if (treeNodes[0].type == "folder") {
            return false;
        }*/
      for (var i = 0, l = treeNodes.length; i < l; i++) {
        if (treeNodes[i].drag === false) {
          return false;
        }
      }
      this.addAnalysisRegionDiyDom();
      return true;
    },

    /**
     * 用于捕获节点拖拽操作结束之前的事件回调函数，并且根据返回值确定是否允许此拖拽操作
     * @param treeId 拖拽的树节点编号
     * @param treeNodes 拖拽的树节点
     * @param targetNode 选中节点
     * @returns {boolean} 返回是否允许拖拽
     */
    beforeDrop(treeId, treeNodes, targetNode, moveType) {
      var ascription = this.getTargetTreeCN(treeNodes[0].auditorOrauditorgan);
      var falg = false;
      if (targetNode.type == "folder" && targetNode.level != 0) {
        falg = this.updateMeasureFolder(treeNodes[0].id, targetNode.id);
        var info = "'{0}'指标'{1}'被移动到了'{2}'文件夹内".format(ascription, treeNodes[0].name, targetNode.name);
        this.addOperLogByParam(this.log_module, this.log_edit, this.log_info);
      }
      if (targetNode.type == "folder" && targetNode.level == 0) {
        Message("不允许拖动到根目录！");
        return falg;
      }
      if (targetNode.type == "indicatrix" && treeNodes[0].type == "indicatrix") {
        var info = "编辑{0}指标'{1}'和'{2}'的排序位置".format(ascription, treeNodes[0].name, targetNode.name);
        this.addOperLogByParam(this.log_module, this.log_edit, this.log_info);
        falg = this.updateIndex(treeNodes[0].id, targetNode.id, targetNode.getParentNode().id);
      }
      if (targetNode.type == "folder" && treeNodes[0].type == "folder") {
        var parFolderId = targetNode.getParentNode().id;
        var parFolderIdTwo = treeNodes[0].getParentNode().id;
        if (parFolderId == parFolderIdTwo) {
          falg = this.updateFolderIndex(treeNodes[0].id, targetNode.id, parFolderId);
        } else {
          falg = this.updateFolderPar(treeNodes[0].id, parFolderId);
        }

      }
      if (targetNode.type == "folder" && treeNodes[0].type == "folder" && moveType == "inner") {
        falg = this.updateFolderPar(treeNodes[0].id, targetNode.id);
      }
      return falg;
    },

    /**
     * 修改文件夹父级
     * @param folderId 文件夹编号
     * @param targetId 目标父级编号
     */
    updateFolderPar(folderId, targetId) {
      var url = this.contextUrl + "/InFolder/updateFolderPan";
      var flag = false;
      $.ajax({
        type: "post",
        url: url,
        data: {folderId: folderId, parId: targetId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message("排序失败");
          } else {
            flag = true;
          }
        }
      });
      return flag;
    },
    /**
     * 修改文件夹索引
     * @param folderIdOne 文件夹一
     * @param folderIdTwo 文件夹二
     * @param parFolderId 父级编号
     * @returns {*}
     */
    updateFolderIndex(folderIdOne, folderIdTwo, parFolderId) {
      var url = this.contextUrl + "/InFolder/updateIndex";
      var flag = false;
      $.ajax({
        type: "post",
        url: url,
        data: {folderIdOne: folderIdOne, folderIdTwo: folderIdTwo, parFolderId: parFolderId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message("排序失败");
          } else {
            flag = true;
          }
        }
      });
      return flag;
    },
    /**
     * 修改俩指标的索引号
     * @param inIdOne 指标1
     * @param inIdTwo 指标2
     * @param folderId 文件夹编号
     * @returns {boolean} 返回是否成功
     */
    updateIndex(inIdOne, inIdTwo, folderId) {
      var url = this.contextUrl + "/InMeasure/updateIndex";
      var falg = false;
      $.ajax({
        type: "post",
        url: url,
        data: {inIdOne: inIdOne, inIdTwo: inIdTwo, folderId: folderId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message("排序失败");
          } else {
            falg = true;
          }
        }
      });
      return falg;
    },

    /**
     * 修改指标文件夹编号
     * @param inId 指标编号
     * @param folderId 文件夹编号
     */
    updateMeasureFolder(inId, folderId) {
      var url = this.contextUrl + "/InMeasure/updateMeasureFolder";
      var falg = false;
      $.ajax({
        type: "post",
        url: url,
        data: {inId: inId, folderId: folderId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message("排序失败");
          } else {
            falg = true;
          }
        }
      });
      return falg;
    },
    /**
     * 拖拽结束事件  确定位置是否可以放下
     * @param event 事件
     * @param treeId 树编号
     * @param treeNodes 树节点
     * @param targetNode 选中节点
     * @param moveType 移动类型
     */
    onDrop(event, treeId, treeNodes, targetNode, moveType) {
      if (targetNode != null) {
        if (targetNode.type == "folder" && treeNodes[0].type == "indicatrix") {
          //对指标的路径进行更改
          var path = getPah();
          var url = this.contextUrl + "/InMeasure/updateByPrimaryKeySelective";
          var data = {
            inMeasureUuid: treeNodes[0].id,
            measureName: null,
            measureType: null,
            inFolderUuid: null,
            measureMemo: null,
            measureGroup: null,
            measureFormula: null,
            tableUuid: null,
            isDelete: 0,
            createTime: null,
            updateTime: null,
            createPersonUuid: null,
            createPersonName: null,
            measurePath: path,
            measureAlias: null,
            belongOrg: null,
            belongType: null,
            pbScopeUuid: null
          };
          $.post(url, {inMeasure: JSON.stringify(data)}, function () {

          }, "json");
        }
      }
      this.removeAnalysisRegionDiyDom();
      var type = treeNodes[0].indicatrixType;
      var targetId = event.target.id;
      var analysisRegion = $(event.target).attr("analysisregion");
      var id = treeNodes[0].id;
      if (targetId.indexOf("inAnalysisRegion") != -1) {//判断拖放停止目标id 若id里包含指定的字符串则证明可以放置
        this.loadInMeasueData(type, targetId, id, false);
      } else {
        if (analysisRegion == undefined) {
          return;
        }
        if (analysisRegion.indexOf("inAnalysisRegion") != -1) {//判断拖放停止目标id 若id里包含指定的字符串则证明可以放置
          this.loadInMeasueData(type, analysisRegion, id, false);
        }
      }
    },

    /**
     * 编辑按钮事件
     * @param treeId 编辑的节点编号
     * @param treeNode 编辑的树节点
     * @returns {boolean}
     */
    beforeEditName(treeId, treeNode) {
      if (treeNode.indicatrixType == 2) {
        this.nowInMeasureUuid = treeNode.id;
        this.nowParentUuid = treeNode.pid
        this.dialogAddderiveinVisible = true;
        return false;
      } else {
        this.className = (this.className === "dark" ? "" : "dark");
        this.inTree.selectNode(treeNode);
        var that = this;
        setTimeout(function () {
          setTimeout(function () {
            that.inTree.editName(treeNode);
          }, 0);
        }, 0);
        return false;
      }
    },

    /**
     * 删除节点
     * @param treeId 要删除的节点编号
     * @param treeNode
     * @returns {boolean}
     */
    beforeRemove(treeId, treeNode) {
      var url = this.contextUrl + "/InFolder/deleteVer";
      var flag = false;
      var message = "确认删除-- " + treeNode.name + " 吗？";
      var that = this;
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        $.ajax({
          type: "post",
          url: url,
          data: "inFolderUuid=" + treeNode.id,
          async: false,
          success: function (res) {
            if (res.state == false) {
              Message({ type: 'info', message: res.message })
              return flag;
            }
            that.className = (that.className === "dark" ? "" : "dark");
            that.inTree.selectNode(treeNode);
            //flag = confirm("确认删除-- " + treeNode.name + " 吗？");
            that.onRemove("", treeId, treeNode);
            that.inTree.removeNode(treeNode);
          }
        });
      }).catch(() => {
      });
      return flag;
    },

    /**
     * 修改节点名称
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @param newName 新节点名称
     * @param isCancel
     * @returns {boolean}
     */
    beforeRename(treeId, treeNode, newName, isCancel) {
      var flag = false;
      var message = "";
      if (treeNode.name == newName) {
        return true;
      }
      var verUrl = this.contextUrl + "/InFolder/verNodeName";
      var that = this;
      $.ajax({
        type: "post",
        url: verUrl,
        data: {newName: newName, pbScopeUuid: treeNode.pbScopeUuid},
        dataType: "json",
        async: false,
        success: function (res) {
          if (res.state == false) {
            message = res.message;
            flag = res.state;
          } else {
            flag = true;
            var ascription = that.getTargetTreeCN(treeNode.auditorOrauditorgan);
            var info = "编辑{0}指标业务分类'{1}'为'{2}'".format(ascription, treeNode.name, newName);
            that.addOperLogByParam(that.log_module, that.log_edit, that.log_info);
          }
          return flag;
        }
      });
      if (flag == false) {
        Message(message);
        return false;
      }
      this.className = (this.className === "dark" ? "" : "dark");
      if (newName.trim().length == 0) {
        var that = this;
        setTimeout(function () {
          that.inTree.cancelEditName();
          Message("节点名称不能为空.");
        }, 0);
        return false;
      }
      this.editNodeName(treeNode, newName);
      return true;
    },


    /**
     * 移除树节点后事件
     * @param e 事件
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    onRemove(e, treeId, treeNode) {
      var type = treeNode.indicatrixType;
      if (type == 2) {
        var info = "删除了派生指标:'{0}'".format(treeNode.name);
        this.addOperLogByParam(this.log_module, this.log_del, this.log_info);
      } else {
        var ascription = this.getTargetTreeCN(treeNode.auditorOrauditorgan);
        var info = "删除了{0}指标分类:'{1}'".format(ascription, treeNode.name);
        this.addOperLogByParam(this.log_module, this.log_del, this.log_info);
      }
      this.removeTreeNode(treeNode.id, type);
    },


    /**
     * 修改节点成功后事件
     * @param e 事件
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @param isCancel 修改是否成功
     */
    onRename(e, treeId, treeNode, isCancel) {

    },

    /**
     * 指标树单击事件
     * @param e 事件
     * @param treeId 点击树节点编号
     * @param treeNode 树节点
     */
    onClick(e, treeId, treeNode) {
      this.inTree.expandNode(treeNode);
    },


    /**
     * 树添加按钮
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    addHoverDom(treeId, treeNode) {
      $("#" + treeNode.tId + "_remove").attr("title", "删除");
      $("#" + treeNode.tId + "_edit").attr("title", "编辑");
      var sObj = $("#" + treeNode.tId + "_span");
      var aObj = $("#" + treeNode.tId + "_span");
      if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
      var btn;
      var addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='新增' onfocus='this.blur();'></span>";
      if (treeNode.editNameFlag || $("#shareBtn_" + treeNode.id).length > 0) return;
      if (treeNode.type == "indicatrix" && treeNode.auditorOrauditorgan == 3) {
        //2021年1月6日 14:53:51   共享相关代码  注释掉
/*        var editStr = "<span class='button shareBtn' id='shareBtn_" + treeNode.id + "' title='共享' onfocus='this.blur();'></span>";
        aObj.append(editStr);
        var btnEdit = $("#shareBtn_" + treeNode.id);
        if (btnEdit) {
          btnEdit.bind("click", function () {
            // revokeOption(event, treeId, treeNode);
            this.shareIndicatrix(treeId, treeNode);
          });
        }*/
      }
      if (treeNode.type == "indicatrix") {
        return false;
      }
      //判断是否为全行或总行的指标管理员  若是指标管理员则显示全行下分类的添加按钮
      if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
        sObj.after(addStr);
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
        sObj.after(addStr);
      }
      //判断是否为机构管理员  若是机构管理员则显示全行下分类的添加按钮
      if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
        sObj.after(addStr);
      }
      //如果是个人则直接显示添加按钮，不做任何权限控制
      if (treeNode.auditorOrauditorgan == 3) {
        sObj.after(addStr);
      }
      btn = $("#addBtn_" + treeNode.tId);
      var that = this;
      if (btn) {
        btn.bind("click", function (e) {
          var openResult = that.inTree.expandNode(treeNode, true);
          if (!openResult && openResult != null) {
            return false;
          }
          var url = that.contextUrl + "/InFolder/getNewFolderNameCount";
          $.post(url, {}, function (res) {
            var uuid = that.getuuid();
            var name = "新文件夹" + "(" + (parseInt(res.message) + 1) + ")";
            var data = {
              id: uuid,
              pId: treeNode.id,
              type: "folder",
              name: name,
              isParent: true,
              open: true,
              auditorOrauditorgan: treeNode.auditorOrauditorgan,
              iconSkin: 'ztree_2',
              nocheck: true,
              pbScopeUuid: treeNode.pbScopeUuid
            };
            that.inTree.addNodes(treeNode, data);
            that.addFolder(uuid, treeNode.id, name, treeNode.pbScopeUuid);
            if (treeNode.children != undefined) {
              that.inTree.editName(treeNode.children[treeNode.children.length - 1]);
            }
            var ascription = that.getTargetTreeCN(treeNode.auditorOrauditorgan);
            var info = "新增了{0}指标分类:'{1}'".format(ascription, name);
            that.addOperLogByParam(that.log_module, that.log_add, that.log_info);
            return false;
          }, "json")
        });
      }
    },

    /**
     * 修改节点颜色
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns {*}
     */
    getFontCss(treeId, treeNode) {
      return (!!treeNode.highlight) ? {color: "#FF8000", "font-weight": "bold"} : {
        color: "#333",
        "font-weight": "normal"
      };
    },

    /**
     * 显示删除按钮
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns {boolean}
     */
    showRemoveBtn(treeId, treeNode) {
      this.getParentTreeNode(treeNode)
      treeNode.auditorOrauditorgan = this.currentInMeasureTreeParentNode.auditorOrauditorgan
      //首级节点不显示删除按钮
      if (treeNode.level == 0) {
        return false;
      }
      //如果是派生指标则直接显示
      if (treeNode.indicatrixType == 2) {
        //判断是否为全行并且是否有全行管理权限
        if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
          return true;
        }
        //判断是否为机构并且是否有全行管理权限
        if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
          return true;
        }
        //判断是否为机构并且是否有机构管理权限
        if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
          return true;
        }
        if (treeNode.auditorOrauditorgan == 3) {
          return true;
        }
        return true;
      }
      //如果树节点为文件夹则判断是否有权限删除
      if(treeNode.type == "folder"){
        if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
          return true;
        }
        //判断是否为机构并且是否有全行管理权限
        if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
          return true;
        }
        //判断是否为机构并且是否有机构管理权限
        if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
          return true;
        }
        if (treeNode.auditorOrauditorgan == 3) {
          return true;
        }
      }
      return false;
    },
    /**
     * 获取鼠标移入的最父级节点
     * @param treeNode 树节点
     */
    getParentTreeNode(treeNode) {
      let parentNode = treeNode.getParentNode();
      if (parentNode == null) {
        this.currentInMeasureTreeParentNode = treeNode
      } else {
        let parentNodeOne = parentNode.getParentNode()
        if (parentNodeOne != undefined) {
          this.getParentTreeNode(parentNodeOne)
        }
      }
    },
    /**
     * 显示编辑按钮
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns {boolean}
     */
    showRenameBtn(treeId, treeNode) {
      this.getParentTreeNode(treeNode)
      treeNode.auditorOrauditorgan = this.currentInMeasureTreeParentNode.auditorOrauditorgan
      //首级节点不显示修改按钮
      if (treeNode.level == 0) {
        return false;
      }
      //如果是派生指标则直接显示
      if (treeNode.indicatrixType == 2) {
        if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
          return true;
        }
        if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
          return true;
        }
        if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
          return true;
        }
        if (treeNode.auditorOrauditorgan == 3) {
          return true;
        }
        return true;
      }
      //若为机构或全行下的指标则不显示编辑按钮
      if (treeNode.auditorOrauditorgan == 1 || treeNode.auditorOrauditorgan == 2) {
        if (treeNode.type == "indicatrix") {
          return false;
        }
      }
      if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 3 && treeNode.type == "folder") {
        return true;
      }
      return false;
    },

    /**
     * 移除dom
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    removeHoverDom(treeId, treeNode) {
      $("#addBtn_" + treeNode.tId).unbind().remove();
      $("#shareBtn_" + treeNode.id).unbind().remove();
    },

    // endregion 指标树操作

    //region 常用分析树操作

    /**
     * 初始化常用分析树
     */
    initCommonlyAnalysisZtree() {
      var urlOne = this.contextUrl + "/InOfteninfolder/getCommonlyAnalysisZtree";
      var that = this;
      $.post(urlOne, {}, function (res) {
        var zNodes = res;
        var setting = {
          check: {
            enable: true,
            chkboxType: {"Y": "s", "N": "ps"}
          },
          data: {
            key: {
              name: "name"
            },
            simpleData: {
              enable: true,
              idKey: "id",
              pIdKey: "pid"
            }
          },
          async: {
            enable: false
          },
          callback: {
            beforeDrop: that.beforeDropAnalysisZtree,
            beforeDrag: that.beforeDragAnalysisZtree,
            beforeEditName: that.beforeEditNameAnalysisZtree,
            beforeRemove: that.beforeRemoveAnalysisZtree,
            beforeRename: that.beforeRenameAnalysisZtree,
            onRemove: that.onRemoveAnalysisZtree,
            onRename: that.onRenameAnalysisZtree,
            onClick: that.onClickAnalysisZtree
          },
          view: {
            addDiyDom: that.addDiyDom,
            addHoverDom: that.addHoverDomAnalysisZtree,
            removeHoverDom: that.removeHoverDomAnalysisZtree,
            selectedMulti: false,
            fontCss: that.getFontCssAnalysisZtree,
            showLine: false,
            dblClickExpand: false
          },
          edit: {
            drag: {
              autoExpandTrigger: true,
              prev: that.dropPrevAnalysisZtree,
              inner: that.dropInnerAnalysisZtree,
              next: that.dropNextAnalysisZtree
            },
            enable: true,
            editNameSelectAll: true,
            showRemoveBtn: that.showRemoveBtnAnalysisZtree,
            showRenameBtn: that.showRenameBtnAnalysisZtree
          }
        };
        //初始化树
        that.commonTreeNodes = zNodes;
        that.commonTreeSetting = setting;
      }, "json");
    },

    /**
     * 用于捕获节点拖拽操作结束之前的事件回调函数，并且根据返回值确定是否允许此拖拽操作
     * @param treeId 拖拽的树节点编号
     * @param treeNodes 拖拽的树节点
     * @param targetNode 选中节点
     * @returns {boolean} 返回是否允许拖拽
     */
    beforeDropAnalysisZtree(treeId, treeNodes, targetNode, moveType) {
      var ascription = this.getTargetTreeCN(treeNodes[0].auditorOrauditorgan);
      var flag = false;
      if (treeNodes[0].type == "analysis" && targetNode.type == "folder" && targetNode.level != 0) {
        flag = this.updateAnalysisFolder(treeNodes[0].id, targetNode.id);
        var info = "'{0}'分析'{1}'被移动到了'{2}'文件夹内".format(ascription, treeNodes[0].name, targetNode.name);
        this.addOperLogByParam(this.log_module, this.log_edit, this.log_info);
        return flag;
      }
      if (targetNode.type == "folder" && targetNode.level == 0) {
        Message({ type: 'info', message: '不允许拖动到根目录！' })
        return falg;
      }
      if (targetNode.type != "folder" && treeNodes[0].type != "folder") {
        var info = "编辑{0}分析'{1}'和'{2}'的排序位置".format(ascription, treeNodes[0].name, targetNode.name);
        this.addOperLogByParam(this.log_module, this.log_edit, this.log_info);
        flag = this.updateAnalysisIndex(treeNodes[0].id, targetNode.id, targetNode.getParentNode().id);
        return flag;
      }
      if (targetNode.type == "folder" && treeNodes[0].type == "folder" && moveType == "inner") {
        flag = this.updateFolderParent(treeNodes[0].id, targetNode.id);
        return flag;
      }
      if (targetNode.type == "folder" && treeNodes[0].type == "folder" && moveType == "next") {
        var parFolderId = targetNode.getParentNode().id;
        var parFolderIdTwo = treeNodes[0].getParentNode().id;
        if (parFolderId == parFolderIdTwo) {
          flag = this.updateAnalysisFolderIndex(treeNodes[0].id, targetNode.id, parFolderId);
          return flag;
        } else {
          flag = this.updateFolderParent(treeNodes[0].id, parFolderId);
          return flag;
        }
      }
      /*        if(targetNode.type == "folder" && treeNodes[0].type == "folder"){
            alert("文件夹排序")
            return false;
        }*/
      return flag;
    },

    /**
     * 修改文件夹的文件夹排序
     * @param folderIdOne 第一个文件夹编号
     * @param folderIdTwo 第二个文件夹编号
     * @param parFolderId 父级编号
     */
    updateAnalysisFolderIndex(folderIdOne, folderIdTwo, parFolderId) {
      var that = this;
      var url = this.contextUrl + "/InOfteninfolder/updateFolderIndex";
      var falg = false;
      $.ajax({
        type: "post",
        url: url,
        data: {folderIdOne: folderIdOne, folderIdTwo: folderIdTwo, parFolderId: parFolderId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: '排序失败' })
          } else {
            falg = true;
          }
        }
      });
      return falg;
    },
    /**
     * 修改文件夹编号
     * @param folderId 文件夹编号
     * @param parId 文件夹父级编号
     */
    updateFolderParent(folderId, parId) {
      var that = this;
      var url = this.contextUrl + "/InOfteninfolder/updateFolderParent";
      var falg = false;
      $.ajax({
        type: "post",
        url: url,
        data: {folderId: folderId, parId: parId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: '排序失败' })
          } else {
            falg = true;
          }
        }
      });
      return falg;
    },
    /**
     * 修改常用分析的文件夹
     * @param analysisId 分析编号
     * @param folderId 文件夹编号
     * @returns {boolean}
     */
    updateAnalysisFolder(analysisId, folderId) {
      var that = this;
      var url = this.contextUrl + "/InOftenindicators/updateAnalysisFolder";
      var falg = false;
      $.ajax({
        type: "post",
        url: url,
        data: {analysisId: analysisId, folderId: folderId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: '排序失败' })
          } else {
            falg = true;
          }
        }
      });
      return falg;
    },

    /**
     * 修改分析索引
     * @param analysisIdOne 分析1
     * @param analysisIdTwo 分析2
     * @returns {boolean}
     */
    updateAnalysisIndex(analysisIdOne, analysisIdTwo, folderId) {
      var that = this;
      var url = this.contextUrl + "/InOftenindicators/updateTwoAnalysisIndex";
      var falg = false;
      $.ajax({
        type: "post",
        url: url,
        data: {analysisIdOne: analysisIdOne, analysisIdTwo: analysisIdTwo, folderId: folderId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: '排序失败' })
          } else {
            falg = true;
          }
        }
      });
      return falg;
    },
    /**
     * 是否允许拖拽到目标前
     * @param treeId 树编号
     * @param nodes 拖拽的节点
     * @param targetNode 目标节点
     * @returns {boolean}
     */
    dropPrevAnalysisZtree(treeId, nodes, targetNode) {
      /*        if(nodes[0].auditorOrauditorgan != targetNode.auditorOrauditorgan){
            return false;
        }
        if(targetNode.type !="folder"){
            if(nodes[0].getParentNode().id != targetNode.getParentNode().id){
                return false;
            }
        }
        if(targetNode.type == "folder"){
            return false;
        }*/
      return false;
    },

    /**
     * 是否允许拖拽到目标
     * @param treeId 书编号
     * @param nodes 拖拽的节点
     * @param targetNode 目标节点
     * @returns {boolean}
     */
    dropInnerAnalysisZtree(treeId, nodes, targetNode) {
      if (!this.verDrop(nodes[0].auditorOrauditorgan)) {
        return false;
      }
      if (nodes[0].auditorOrauditorgan != targetNode.auditorOrauditorgan) {
        return false;
      }
      if (targetNode.type != "folder") {
        if (nodes[0].getParentNode().id != targetNode.getParentNode().id) {
          return false;
        }
      }
      if (targetNode.type == "folder" && targetNode.level != 0 && targetNode.name != "共享文件夹") {
        return true;
      }
      return false;
    },

    /**
     * 是否允许拖拽到目标后边
     * @param treeId
     * @param nodes
     * @param targetNode
     * @returns {boolean}
     */
    dropNextAnalysisZtree(treeId, nodes, targetNode) {
      if (!this.verDrop(nodes[0].auditorOrauditorgan)) {
        return false;
      }
      if (nodes[0].auditorOrauditorgan != targetNode.auditorOrauditorgan) {
        return false;
      }
      if (targetNode.type != "folder") {
        if (nodes[0].getParentNode().id != targetNode.getParentNode().id) {
          return false;
        }
      }
      return true;
    },

    /**
     * 添加dom样式 常用分析树
     * @param treeId 树编号
     * @param treeNode 树节点
     */
    addDiyDom(treeId, treeNode) {
      var spantxt = $("#" + treeNode.tId + "_span").html();
      if (spantxt.length > 10) {
        spantxt = spantxt.substring(0, 10) + "...";
        $("#" + treeNode.tId + "_span").html(spantxt);
      }

      var aObj = $("#" + treeNode.tId + "_a");
      var editStr1 = "<i class='icon-circle-3'></i>"
      var editStr2 = "<i class='icon-circle-4'></i>";
      var editStr3 = "<div class='icon-circle-5'><i></i><span>收起</span></div>";
      if (treeNode.iconSkin === 'ztree_2') {
        aObj.append(editStr1);
      }
      if (treeNode.iconSkin === 'ztree_3') {
        aObj.append(editStr2);
      }

      if (treeNode.iconSkin === 'ztree_4') {
        //aObj.append(editStr3);
      }
      if (treeNode.iconSkin === 'ztree_5') {
        //aObj.append(editStr1);
      }
    },
    /**
     * 添加dom样式 指标树
     * @param treeId 树编号
     * @param treeNode 树节点
     */
    addIndicatrixDiyDom(treeId, treeNode) {
      var spantxt = $("#" + treeNode.tId + "_span").html();
      if (spantxt.length > 10) {
        var newspantxt = spantxt.substring(0, 10) + "...";
        $("#" + treeNode.tId + "_span").html(newspantxt);
      }
      $("#" + treeNode.tId + "_span").attr("title", spantxt);
      var aObj = $("#" + treeNode.tId + "_a");
      if (treeNode.type == "folder" && treeNode.title != undefined) {
        console.log(treeNode)
        //xudaiqng  20191119  start
        aObj.append("<span class='node_num'>" + treeNode.childCount + "</span>");
        //xudaiqng  20191119  end
      }
    },


    /**
     * 常用分析书点击事件
     * @param e 事件
     * @param treeId 点击树节点编号
     * @param treeNode 树节点
     */
    onClickAnalysisZtree(e, treeId, treeNode) {
      if (treeNode.type == "folder") {
        this.commonTree.expandNode(treeNode);
      } else {
        var url = this.contextUrl + "/InOftenindicators/selectByPrimaryKey";
        var that = this;
        $.post(url, {inOftenindicatorsUuid: treeNode.id}, function (res) {
          that.clearAnalysis();
          that.oftenAnalysisId = treeNode.id;
          that.oftenAnalysisName = treeNode.name;
          //displayAnalisys(res.oftenindicatorsAnalysisobject);
          that.displayAnalisys(res);
        }, "json")
      }
      this.analysisNode = treeNode;
    },

    /**
     * 显示删除按钮（常用分析树）
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns {boolean}
     */
    showRemoveBtnAnalysisZtree(treeId, treeNode) {
      this.getParentTreeNode(treeNode)
      treeNode.auditorOrauditorgan = this.currentInMeasureTreeParentNode.auditorOrauditorgan
      //首级节点不显示修改删除按钮
      if (treeNode.level == 0) {
        return false;
      }
      if (treeNode.verButton == 4) {
        return false;
      }
      if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 3) {
        return true;
      }
      return false;
    },

    /**
     * 显示编辑按钮（常用分析树）
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns
     * {boolean}
     */
    showRenameBtnAnalysisZtree(treeId, treeNode) {
      this.getParentTreeNode(treeNode)
      treeNode.auditorOrauditorgan = this.currentInMeasureTreeParentNode.auditorOrauditorgan
      //首级节点不显示修改编辑按钮
      if (treeNode.level == 0) {
        return false;
      }
      if (treeNode.verButton == 4) {
        return false;
      }
      if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
        return true;
      }
      if (treeNode.auditorOrauditorgan == 3) {
        return true;
      }
      return false;
    },

    /**
     * 调用前事件（常用分析树）
     * @param treeId 树节点编号
     * @param treeNodes 树节点
     * @returns {boolean}
     */
    beforeDragAnalysisZtree(treeId, treeNodes) {
      /*        if(treeNodes[0].type == "folder"){
            return false;
        }*/
      return true;
    },


    /**
     * 树添加按钮（常用分析树）
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    addHoverDomAnalysisZtree(treeId, treeNode) {
      this.getParentTreeNode(treeNode)
      treeNode.auditorOrauditorgan = this.currentInMeasureTreeParentNode.auditorOrauditorgan
      var that = this;
      $("#" + treeNode.tId + "_remove").attr("title", "删除");
      $("#" + treeNode.tId + "_edit").attr("title", "编辑");
      var sObj = $("#" + treeNode.tId + "_span");
      var aObj = $("#" + treeNode.tId + "_span");
      if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
      var addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='新增' onfocus='this.blur();'></span>";
      if (treeNode.verButton == 4) {
        return false;
      }
      //验证当前登录人选择的文件夹下的分析是否可以共享
      if (treeNode.editNameFlag || $("#shareBtn_" + treeNode.id).length > 0) return;
      if (treeNode.type == "analysis" && treeNode.auditorOrauditorgan == 3) {
/*        var editStr = "<span class='button shareBtn' id='shareBtn_" + treeNode.id + "' title='共享' onfocus='this.blur();'></span>";
        aObj.append(editStr);
        var btnEdit = $("#shareBtn_" + treeNode.id);
        if (btnEdit) {
          btnEdit.bind("click", function () {
            // revokeOption(event, treeId, treeNode);
            that.shareAnalysis(treeId, treeNode);
          });
        }*/
      }
      if (treeNode.type == "analysis") {
        return false;
      }
      //判断是否为全行或总行的指标管理员  若是指标管理员则显示全行下分类的添加按钮
      if (treeNode.auditorOrauditorgan == 1 && this.isInManager == "true") {
        sObj.after(addStr);
      }
      if (treeNode.auditorOrauditorgan == 2 && this.isInManager == "true") {
        sObj.after(addStr);
      }
      //判断是否为机构管理员  若是机构管理员则显示全行下分类的添加按钮
      if (treeNode.auditorOrauditorgan == 2 && this.isOrgManager == "true") {
        sObj.after(addStr);
      }
      //如果是个人则直接显示添加按钮，不做任何权限控制
      if (treeNode.auditorOrauditorgan == 3) {
        sObj.after(addStr);
      }
      var btn;
      btn = $("#addBtn_" + treeNode.tId);
      if (btn) btn.bind("click", function () {
        var url = that.contextUrl + "/InOfteninfolder/getNewFolderNameCount";
        $.post(url, {}, function (res) {
          var uuid = that.getuuid();
          var name = "新文件夹" + "(" + (parseInt(res.message) + 1) + ")";
          that.commonTree.addNodes(treeNode, {
            id: uuid,
            pId: treeNode.id,
            type: "folder",
            name: name,
            auditorOrauditorgan: treeNode.auditorOrauditorgan,
            isParent: true,
            iconSkin: 'ztree_5',
            nocheck: true,
            pbScopeUuid: treeNode.pbScopeUuid
          });
          if (treeNode.children != undefined) {
            that.commonTree.editName(treeNode.children[treeNode.children.length - 1]);
          }
          that.addCommonlyAnalysisFolder(uuid, treeNode.id, name, treeNode.pbScopeUuid);
          var ascription = that.getTargetTreeCN(treeNode.auditorOrauditorgan);
          var info = "新增了{0}常用分析分类:'{1}'".format(ascription, name);
          that.addOperLogByParam(that.log_module, that.log_add, that.log_info);
          return false;
        }, "json");
      });
    },

    /**
     * 修改节点成功后事件（常用分析树）
     * @param e 事件
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @param isCancel 修改是否成功
     */
    onRenameAnalysisZtree(e, treeId, treeNode, isCancel) {

    },

    /**
     * 移除dom（常用分析树）
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    removeHoverDomAnalysisZtree(treeId, treeNode) {
      $("#addBtn_" + treeNode.tId).unbind().remove();
      $("#shareBtn_" + treeNode.id).unbind().remove();
    },

    /**
     * 编辑按钮事件（常用分析树）
     * @param treeId 编辑的节点编号
     * @param treeNode 编辑的树节点
     * @returns {boolean}
     */
    beforeEditNameAnalysisZtree(treeId, treeNode) {
      this.classNameAnalysisZtree = (this.classNameAnalysisZtree === "dark" ? "" : "dark");
      this.commonTree.selectNode(treeNode);
      var that = this;
      setTimeout(function () {
        setTimeout(function () {
          that.commonTree.editName(treeNode);
        }, 0);
      }, 0);
      return false;
    },

    /**
     * 删除节点（常用分析树）
     * @param treeId 要删除的节点编号
     * @param treeNode
     * @returns {boolean}
     */
    beforeRemoveAnalysisZtree(treeId, treeNode) {
      var flag = false;
      var verUrl = this.contextUrl + "/InOfteninfolder/verFolderAnalysis";
      var message = "确认删除-- " + treeNode.name + " 吗？";
      var that = this;
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        $.ajax({
          type: "post",
          url: verUrl,
          data: {inOfteninfolderUuid: treeNode.id},
          dataType: "json",
          async: false,
          success: function (res) {
            if (res.state == false) {
              Message({ type: 'info', message: res.message })
              return;
            }
            that.classNameAnalysisZtree = (that.classNameAnalysisZtree === "dark" ? "" : "dark");
            that.commonTree.selectNode(treeNode);
            //flag = confirm("确认删除-- " + treeNode.name + " 吗？");
            that.commonTree.removeNode(treeNode);
            that.onRemoveAnalysisZtree("", treeId, treeNode);
          }
        });
      }).catch(() => {
      });
      return flag;
    },

    /**
     * 修改节点名称（常用分析树）
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @param newName 新节点名称
     * @param isCancel
     * @returns {boolean}
     */
    beforeRenameAnalysisZtree(treeId, treeNode, newName, isCancel) {
      if (treeNode.name == newName) {
        return true;
      }
      var flag = false;
      var message = "";
      var verUrl = "";
      if (treeNode.type == "folder") {
        verUrl = this.contextUrl + "/InOfteninfolder/verNodeName";
      } else {
        verUrl = this.contextUrl + "/InOftenindicators/verAnalysisName";
      }
      var ascription = this.getTargetTreeCN(treeNode.auditorOrauditorgan);
      var that = this;
      $.ajax({
        type: "post",
        url: verUrl,
        data: {newName: newName, pbScopeUuid: treeNode.pbScopeUuid},
        dataType: "json",
        async: false,
        success: function (res) {
          if (res.state == false) {
            message = res.message;
            flag = res.state;
          } else {
            flag = true;
          }
          return flag;
        }
      });
      if (flag == false) {
        Message({ type: 'info', message: message })
        return false;
      }
      this.classNameAnalysisZtree = (this.classNameAnalysisZtree === "dark" ? "" : "dark");
      if (newName.trim().length == 0) {
        setTimeout(function () {
          that.commonTree.cancelEditName();
          Message({ type: 'info', message: "节点名称不能为空" })
        }, 0);
        return false;
      }
      this.editNodeNameCommonlyAnalysisZtree(treeNode, newName);
      return true;
    },

    /**
     * 移除树节点后事件（常用分析树）
     * @param e 事件
     * @param treeId 树节点编号
     * @param treeNode 树节点
     */
    onRemoveAnalysisZtree(e, treeId, treeNode) {
      this.removeTreeNodeAnalysisZtree(treeNode);
    },

    /**
     * 移除常用分析成功回调
     * @param treeNode 树节点
     */
    removeTreeNodeAnalysisZtree(treeNode) {
      var that = this;
      if (treeNode.type == "folder") {
        var url = this.contextUrl + "/InOfteninfolder/deleteByPrimaryKey";
        $.post(url, {inOfteninfolderUuid: treeNode.id}, function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: res.message })
            return;
          }
        }, "json")
      } else {
        var url = this.contextUrl + "/InOftenindicators/deleteByPrimaryKey";
        $.post(url, {inOftenindicatorsUuid: treeNode.id}, function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: res.message })
            return;
          }
        }, "json")
      }
    },

    //endregion 常用分析树操作

    //region 其他

    /**
     * 显示可拖进去的分析区域
     */
    addAnalysisRegionDiyDom() {
      //给所有分析区增加高亮显示
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        $("#" + value.inAnalysisRegionId).parent().addClass("analysisRegionSelected");
      });
    },

    /**
     * 移出分析区的高亮显示
     */
    removeAnalysisRegionDiyDom() {
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        $("#" + value.inAnalysisRegionId).parent().removeClass("analysisRegionSelected");
      });
    },
    /**
     * 根据类型返回  个人、全行、机构
     * @param type
     */
    getTargetTreeCN(type) {
      if (type == 1) {
        return "全行";
      }
      if (type == 2) {
        return "机构";
      }
      if (type == 3) {
        return "个人";
      }
    },
    /**
     * 搜索树
     */
    searchOnChange() {

    },
    /**
     * 获取当前登录人编号
     */
    getLoginUuid() {
      var url = this.contextUrl + "/indicatrixAnalysis/getLoginUuid";
      var that = this;
      $.post(url, {}, function (res) {
        that.personInfo = res;
      }, "json")
    },
    /**
     * 初始化权限
     */
    initPower() {
      var url = this.contextUrl + "/indicatrixAnalysis/getVerLoginPersonPower";
      var that = this;
      $.ajax({
        type: "post",
        url: url,
        data: {},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.isInManager == undefined) {
            that.isInManager = "false";
          } else {
            that.isInManager = res.isInManager;
          }
          if (res.isOrgManager == undefined) {
            that.isOrgManager = "false";
          } else {
            that.isOrgManager = res.isOrgManager;
          }
          sessionStorage.setItem('isOrgManager', that.isOrgManager)
          sessionStorage.setItem('isInManager', that.isInManager)
        }
      });
    },

    resizeChartView(type) {
      var collapseSlideConH = 41
      var topCollapseH = $(".top-collapse-container").outerHeight()
      var winH = $(window).height()

      if (type === 1) {
        $(".main-view-con").css("height", winH - collapseSlideConH)
        return
      }
      $(".main-view-con").css("height", winH - topCollapseH)
    },

    J_slideup_btnClick(J_slideup_btn) {
      $("#analysisIn a").remove();//清空下面的a标签从新绑定
      var dom = "";
      var i = 0;
      $.each(this.analysisList, function (num, value) {
        if (value == null || value == undefined) {
          return;
        }
        $.each(value.objInList, function (num, inMeasure) {
          dom += "<a href='#'>" + inMeasure.measureName + "</a>";
          i++;
        });
      });
      $("#analysisIn").append(dom);
      $("#count").text(i);
      $(".J_slideup_btn").parents(".top-collapse-container").slideUp(200);
      $(".slide-container").slideDown(200);
      var that = this;
      setTimeout(that.resizeChartView(1), 500);
    },
    J_slidedown_btnClick(J_slidedown_btn) {
      $(".J_slidedown_btn").parents(".slide-container").slideUp(200);
      $(".top-collapse-container").slideDown(200);
      var that = this;
      setTimeout(that.resizeChartView, 500)
    },

    /**
     * 初始化收起按钮点击事件
     */
    initEvent() {
      var that = this;
      $(".J_slideup_btn").on("click", function () {
        that.J_slideup_btnClick(this);
      });

      $(".J_slidedown_btn").on("click", function () {
        that.J_slidedown_btnClick(this);
      })
      this.resizeChartView();
      //$(window).on("resize", resizeChartView)
    },


    /**
     * 调用前事件
     * @param treeId 树节点编号
     * @param treeNodes 树节点
     * @returns {boolean}
     */
    beforeDrag(treeId, treeNodes) {
      return false;
    },

    /**
     * 添加个人下的文件夹或指标
     * @constructor
     */
    AddFolderOdIn(treeId, treeNode) {
      if (treeNode.level == 0) {
        var uuid = this.getuuid();
        var name = "新文件夹";
        this.inTree.addNodes(treeNode, {
          id: uuid,
          pId: treeNode.id,
          type: "folder",
          name: name,
          isParent: true,
          auditorOrauditorgan: treeNode.auditorOrauditorgan,
          iconSkin: "ztree_2",
          nocheck: true
        });
        this.addFolder(uuid, treeNode.id, name);
        return;
      }
      var that = this;
      this.$confirm('请选择是文件夹或派生指标', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '文件夹',
        cancelButtonText: '派生指标'
      })
        .then(() => {
          var url = that.contextUrl + "/InFolder/getNewFolderNameCount";
          $.post(url, {}, function (res) {
            var uuid = that.getuuid();
            var name = "新文件夹" + "(" + (parseInt(res.message) + 1) + ")";
            that.inTree.addNodes(treeNode, {
              id: uuid,
              pId: treeNode.id,
              type: "folder",
              name: name,
              isParent: true,
              auditorOrauditorgan: treeNode.auditorOrauditorgan,
              iconSkin: "ztree_2",
              nocheck: true
            });
            that.addFolder(uuid, treeNode.id, name);
            layer.closeAll();
          }, "json")
        })
        .catch(action => {
          node = treeNode;
          that.addDeriveIn();
        });
    },

    /**
     * 将分类添加到数据库
     * @param id 分类编号
     * @param pid 父级编号
     * @param name 分类名称
     * @param pbScopeUuid 作用域编号
     */
    addFolder(id, pid, name, pbScopeUuid) {
      var url = this.contextUrl + "/InFolder/insertSelective";
      var inFolderObject = {
        inFolderUuid: id,
        folderName: name,
        panentUuid: pid,
        createTime: '',
        updateTime: '',
        createPersonName: '',
        createPersonUuid: '',
        pbScopeUuid: pbScopeUuid
      };
      $.post(url, {inFolderObject: JSON.stringify(inFolderObject)}, function (res) {

      }, "json")
    },
    closeThresholdValueRel(){
      this.thresholdValueDialog = false
    },
    /**
     * 将常用分析树添加到数据库
     * @param id 编号
     * @param pid 父级编号
     * @param name 分类名称
     */
    addCommonlyAnalysisFolder(id, pid, name, pbScopeUuid) {
      var url = this.contextUrl + "/InOfteninfolder/insertSelective";
      var inOfteninfolder = {
        inOfteninfolderUuid: id,
        ofteninfolderName: name,
        parentUuid: pid,
        createTime: '',
        updateTime: '',
        createPersonName: '',
        createPersonUuid: '',
        pbScopeUuid: pbScopeUuid
      };
      $.post(url, {inOfteninfolder: JSON.stringify(inOfteninfolder)}, function (res) {

      }, "json")
    },

    /**
     * 修改数据库节点名称
     * @param treeNode 树节点
     * @param newName 新名
     */
    editNodeName(treeNode, newName) {
      var url = this.contextUrl + "/InFolder/updateByPrimaryKeySelective";
      var inFolderObject = {
        inFolderUuid: treeNode.id,
        folderName: newName,
        panentUuid: treeNode.pid,
        createTime: '',
        updateTime: '',
        createPersonName: '',
        createPersonUuid: ''
      };
      $.post(url, {inFolderObject: JSON.stringify(inFolderObject)}, function (res) {
      }, "json")
    },

    /**
     * 修改数据库节点名称
     * @param treeNode 树节点
     * @param newName 新名
     */
    editNodeNameCommonlyAnalysisZtree(treeNode, newName) {
      var that = this;
      if (treeNode.type == "folder") {
        var url = this.contextUrl + "/InOfteninfolder/updateByPrimaryKeySelective";
        var inOfteninfolder = {
          inOfteninfolderUuid: treeNode.id,
          ofteninfolderName: newName,
          parentUuid: null,
          createTime: null,
          updateTime: null,
          createPersonName: null,
          createPersonUuid: null
        };
        $.post(url, {inOfteninfolder: JSON.stringify(inOfteninfolder)}, function (res) {
          if (res.state == false) {
            Message({ type: 'info', message: res.message })
          }
        }, "json")
      } else {
        var urlUpdAnalists = this.contextUrl + "/InOftenindicators/updateByPrimaryKeySelective";
        var data = {
          inOftenindicatorsUuid: treeNode.id,
          oftenindicatorsName: newName,
          ofteninfolderUuid: null,
          oftenindicatorsAnalysisobject: null,
          oftenindicatorsIsdelete: null,
          oftenindicatorsMemo: null,
          createTime: null,
          updateTime: null,
          createPersonUuid: null,
          createPersonName: null
        }
        $.post(urlUpdAnalists, {inOftenindicators: JSON.stringify(data)}, function (res) {
          if (res.state == false) {
            that.$message(res.message);
          }
        }, "json")
      }

    },

    /**
     * 移除节点
     * @param id 要移除的编号
     */
    removeTreeNode(id, type) {
      var that = this;
      if (type == 2) {
        var url = this.contextUrl + "/InMeasure/delDeriveIn";
        $.post(url, {inMeasureUuid: id}, function (res) {
          if (res == true) {
            Message("删除成功");
          } else {
            Message(res);
          }
        }, "json")
      } else {
        var url = this.contextUrl + "/InFolder/deleteByPrimaryKey";
        $.post(url, {inFolderUuid: id}, function (res) {
        }, "json")
      }
    },

    /**
     *递归获取zTree选中节点的所有父级节点
     * @param Node
     * @returns {string}
     */
    getzTreePath(Node) {
      var pNode = this.inTree.getNodesByParam("id", Node[0].pid, null);
      this.path += Node[0].id + ",";
      this.pathNameTree += Node[0].name + ",";
      if (pNode.length != 0) {
        this.getzTreePath(pNode);
      }
      return path;
    },

    /**
     * 原生指标设计
     */
    nativeIndicatrixDesign() {
      var that = this;
      if (this.isInManager == undefined && this.isOrgManager == undefined) {
        Message("您没有添加此指标的权限");
        return;
      }
      if (this.isInManager == false && this.isOrgManager == false) {
        Message("您没有添加此指标的权限");
        return;
      }
      this.dialogDesignVisible = true;
    },

    /**
     * 获取选中节点的路径
     * @returns {string} 返回路径
     */
    getPah() {
      this.path = "";
      var selNode = this.inTree.getSelectedNodes();
      var ztreePath = this.getzTreePath(selNode);
      return ztreePath;
    },

    /**
     * 展开树节点的第一、二、三层
     */
    openFirstTreenode() {
      /* 获取所有树节点 */
      var nodes = treeObj.transformToArray(treeObj.getNodes());
      //展开第一级树
      this.inTree.expandNode(nodes[0], true);
      this.inTree.expandNode(nodes[1], true);
      this.inTree.expandNode(nodes[2], true);

      /*
        var treeAnalysis = $.fn.zTree.getZTreeObj("commonlyAnalysisZtree");
        var nodesAnalysis = treeAnalysis.transformToArray(treeAnalysis.getNodes());
        //展开第一级树
        treeAnalysis.expandNode(nodesAnalysis[0], true);
        treeAnalysis.expandNode(nodesAnalysis[1], true);
        treeAnalysis.expandNode(nodesAnalysis[2], true);*/
    },

    //endregion 其他

    //region 派生指标操作

    /**
     * 添加派生指标
     */
    addDeriveIn() {
      this.nowInMeasureUuid = ""
      this.nowParentUuid = ""
      this.deriveInType = "2";
      this.addDeriveInType = "1"
      this.dialogAddderiveinVisible = true;
    },

    /**
     * 添加派生指标时的节点
     * @param uuid 指标编号
     * @param name 指标名称
     */
    addDeriveNode(uuid, name) {
      this.inTree.addNodes(node,
        {
          id: uuid,
          pId: node.id,
          type: "indicatrix",
          name: name,
          isParent: false,
          auditorOrauditorgan: node.auditorOrauditorgan,
          iconSkin: "ztree_3",
          nocheck: false,
          indicatrixType: 2
        });
    },

    //endregion 派生指标操作

    //region ztree搜索相关

    /**
     * 移除Ztreediv样式
     * @param e 事件
     */
    focusKey(e) {
      if (key.hasClass("empty")) {
        key.removeClass("empty");
      }
    },

    /**
     * 移除Ztreediv样式
     * @param e 事件
     */
    focusKeyAnalysisZtree(e) {
      if (this.keyAnalysisZtree.hasClass("empty")) {
        this.keyAnalysisZtree.removeClass("empty");
      }
    },

    /**
     * 设置div样式
     * @param e 事件
     */
    blurKey(e) {
      if (key.get(0).value === "") {
        key.addClass("empty");
      }
    },

    /**
     * 设置div样式
     * @param e 事件
     */
    blurKeyAnalysisZtree(e) {
      if (this.keyAnalysisZtree.get(0).value === "") {
        this.keyAnalysisZtree.addClass("empty");
      }
    },

    /**
     *文本框值改变绑定事件
     * @param e
     */
    clickChange(e) {
      this.searchNode(e);
    },

    /**
     *文本框值改变绑定事件（常用分析树）
     * @param e
     */
    clickChangeAnalysisZtree(e) {
      this.searchNodeAnalysisZtree(e);
    },

    /**
     * 搜索节点并修改节点
     * @param e 事件
     */
    searchNode(e) {
      var value = $.trim(key.get(0).value);
      var keyType = "name";
      this.updateNodes(false);
      this.nodeList = this.inTree.getNodesByParamFuzzy(keyType, value);
      this.updateNodes(true);
      //判断如果内容为空则清除ztree样式
      var val = $("#name").val();
      if (val == "" && val != undefined) {
        this.updateNodes(false);
      }
    },

    /**
     * 搜索节点并修改节点（常用分析树）
     * @param e 事件
     */
    searchNodeAnalysisZtree(e) {
      var value = $.trim(this.keyAnalysisZtree.get(0).value);
      var keyType = "name";
      this.updateNodesAnalysisZtree(false);
      this.nodeList = this.commonTree.getNodesByParamFuzzy(keyType, value);
      this.updateNodesAnalysisZtree(true);
      //判断如果内容为空则清除ztree样式
      var val = $("#search").val();
      if (val == "" && val != undefined) {
        this.updateNodesAnalysisZtree(false);
      }
    },

    /**
     * 修改节点颜色样式
     * @param highlight 节点
     */
    updateNodes(highlight) {
      for (var i = 0, l = this.nodeList.length; i < l; i++) {
        this.nodeList[i].highlight = highlight;
        this.inTree.updateNode(this.nodeList[i]);
      }
    },

    /**
     * 修改节点颜色样式（常用分析树）
     * @param highlight 节点
     */
    updateNodesAnalysisZtree(highlight) {
      for (var i = 0, l = this.nodeList.length; i < l; i++) {
        this.nodeList[i].highlight = highlight;
        this.commonTree.updateNode(this.nodeList[i]);
      }
    },

    /**
     * 修改节点颜色
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns {*}
     */
    getFontCssAnalysisZtree(treeId, treeNode) {
      return (!!treeNode.highlight) ? {color: "#FF8000", "font-weight": "bold"} : {
        color: "#333",
        "font-weight": "normal"
      };
    },

    //endregion ztree搜索相关

    //region 查询以及数据显示到界面操作
    /**
     * 组织叠加分析的列数据，用来展示图表
     * @param columns 从后台拿回来的列名
     * @param values 前台组织的指标列名
     */
    organizeSupAnaColData(columns, values) {
      var colList = [];
      $.each(columns, function (num, value) {//循环判断拿回来的列里有哪些不包含在指标列表内，就证明哪些是要展示的X轴数据的列名
        if (values.indexOf(value) == -1) {
          var obj = {};
          obj.columnName = value;
          colList.push(obj);
        }
      })
      return colList;
    },

    /**
     * 获取并列分析的最大值最小值等信息
     * @param measureAlias 指标别名
     * @param res 数据
     */
    getconAnalysisPrompt(measureAlias, res) {
      var data = res.result;
      measureAlias = measureAlias.toLowerCase();
      //整理要高亮显示的数据 最大值、最小值、计数、合计、平均值
      var valueList = [];//存储指标数值的list，方便一会拿出最小值最大值
      var countValue = 0; //合计  指标值得总数
      //循环获取指标的平均值，顺便将数据加到列表里
      $.each(data, function (num, value) {
        if (value[measureAlias] != "null" && value[measureAlias] != "" && value[measureAlias] != undefined) {//去除不为空的值
          countValue += value[measureAlias];
          valueList.push(value[measureAlias]);
        }
      });
      valueList = valueList.sort(softNumber);//对数组进行排序
      var median = this.getMedian(valueList);//中位数
      var count = data.length; //计数 指标的数据量
      var avgValue = countValue / data.length;//平均值
      var standardDeviation = this.getStandardDeviation(valueList, avgValue);//标准差
      var disConfficient = standardDeviation / avgValue;//离散系数
      var maxValue = Math.max.apply(Math, valueList);//最大值
      var minValue = Math.min.apply(Math, valueList);//最小值
      //var modeNumber = getModeNumber(valueList);  //众数
      var prompt = measureAlias + "<br>最大值:{0}  <br>最小值:{1}  <br>计数:{2}  <br>合计:{3}  <br>平均值:{4} <br>中位数:{5} <br>标准差(样本):{6} <br>离散系数(样本):{7}".format(maxValue, minValue, count, countValue, avgValue, median, standardDeviation, disConfficient);
      return prompt;
    },

    /**
     * 求数组里面的众数
     * @param valueList 要求的数组
     * @returns {Array} 返回重复数据
     */
    getModeNumber(valueList) {
      var repeatData = [];
      for (var i = 0; i < valueList.length; i++) {
        if (valueList[i] == valueList[i + 1]) {
          repeatData.push(valueList[i]);
        }
      }
      return repeatData;
    },
    /**
     * 对数组的大小进行排序
     * @param a 值1
     * @param b 值2
     * @returns {number}
     */
    softNumber(a, b) {
      return a - b;
    },

    /**
     * 获取数组里的标准差
     * @param valueList 数组
     * @param avgValue 平均值
     */
    getStandardDeviation(valueList, avgValue) {
      if (valueList.length == 0) {
        return 0;
      }
      //求和
      var sum = function (x, y) {
        return x + y;
      };
      //求积数
      var square = function (x) {
        return x * x;
      };
      var deviations = valueList.map(function (x) {
        return x - avgValue;
      }); //获取偏差
      var stddev = Math.sqrt(deviations.map(square).reduce(sum) / (valueList.length - 1)); //获取标准差
      return stddev;
    },

    /**
     * 获取列表里的中位数
     * @param valueList 值列表
     */
    getMedian(valueList) {
      var median;
      if (Math.round(valueList.length % 2) == 0) {
        //如果是偶数则取出偶数+1 和-1取出的数值的平均值
        // console.log(valueList.length / 2)
        var number = Math.round(valueList.length / 2);
        var valueOne = valueList[number];
        var valueTwo = valueList[number - 1];
        median = (valueOne + valueTwo) / 2;
      } else {
        //奇数的话直接四舍五入取值就行
        median = valueList[Math.round(valueList.length / 2)];//中位数
      }

      return median;
    },
    /**
     * 获取叠加分析指标提示值
     * @param measureAlias 指标别名列表
     * @param res 数据
     */
    getSupAnalysisPrompt(measureAlias, res) {
      var data = res.result;
      var prompt = "";
      $.each(measureAlias, function (num, valueName) {
        //整理要高亮显示的数据 最大值、最小值、计数、合计、平均值
        var valueList = [];//存储指标数值的list，方便一会拿出最小值最大值
        var countValue = 0; //合计  指标值得总数
        //循环获取指标的平均值，顺便将数据加到列表里
        $.each(data, function (num, value) {
          countValue += parseInt(value[valueName]);
          valueList.push(parseInt(value[valueName]));
        });
        var count = data.length; //计数 指标的数据量
        var avgValue = countValue / data.length;//平均值
        var maxValue = Math.max.apply(Math, valueList);//最大值
        var minValue = Math.min.apply(Math, valueList);//最小值
        var median = getMedian(valueList);//中位数
        var standardDeviation = getStandardDeviation(valueList, avgValue);//标准差
        var disConfficient = standardDeviation / avgValue;//离散系数
        prompt += valueName + "<br>最大值:{0}  <br>最小值:{1}  <br>计数:{2}  <br>合计:{3}  <br>平均值:{4} <br>中位数:{5} <br>标准差(样本):{6} <br>离散系数(样本):{7}".format(maxValue, minValue, count, countValue, avgValue, median, standardDeviation, disConfficient) + "<br><br>";
      });
      return prompt;
    },

    /**
     * 追加显示区域
     * @param uuid 唯一编号
     * @param name 名称
     * @param analysisRegionId 分析区编号
     * @param analysisRegionId 分析区编号
     */
    addDataViewRegion(uuid, name, analysisRegionId, prompt) {
      var anaRegId = analysisRegionId.substring(0, analysisRegionId.length - 4);
      var div = "<div class=\"view-grid\"  style='overflow: auto' analysisRegionId ='" + analysisRegionId + "' id='" + uuid + name + "'>\n" +
        // "            <div class=\"main-view-panel\">\n" +
        // "                <div class=\"main-view-panel-head\">\n" +
        // "                    <strong>" + name + "</strong>\n" +
        // "                    <div class=\"icon-tools-group\">\n" +
        // "                        <a href=\"#\" class=\"btn-creat-charts\"name='" + uuid + name + "' onclick='saveToSpace(\""+anaRegId+"\")'>保存到空间</a>\n" +
        // "                        <div class=\"icon-tools-con\">\n" +
        // "                            <a href=\"#\" name='" + uuid + name + "' class=\"icon-tools icon-tools-2\" onclick='getAlableName(this)'></a>\n" +
        // "                            <a href=\"#\" class=\"icon-tools icon-tools-4\" onclick='bigDiv(\""+ uuid + name +"\")'></a>\n" +
        // "                        </div>\n" +
        // "                    </div>\n" +
        // "                </div>\n" +
        // "                <div class=\"main-view-panel-body\">\n" +
        "                    <div class=\"table-view\" ditem='true' itemobj='" + uuid + "' objname='" + name + "' id='table-view_" + uuid + "'>" +
        "                        <table class=\"table table-striped\" id='" + uuid + "'></table>\n" + "<div id='pagger" + uuid + "'></div>" +
        "                    </div>\n" +
        // "                </div>\n" +
        // "            </div>\n" +
        "        </div>";
      $("#dataView").append(div);
      this.uuidArr.push(uuid);
      this.uuidName.push({id: uuid, name: name, prompt: prompt, analysisRegionId: analysisRegionId});
    },

    /**
     * 放大图表
     * @param obj 要放大的对象
     */
    openChart(obj, uuid) {
      //document.getElementById("chartFrame_"+uuid).contentWindow.showMenu();
      layer.open({
        type: 1,
        title: false,
        area: ['100%', '98%'],
        content: $(obj),
        cancel: function () {
          $(obj).children().css({"width": "45%", "height": "298"});
          //console.log(JSON.stringify(document.getElementById("chartFrame_"+uuid).contentWindow.getJson()));
        }
      });
      $(obj).children().css({"width": "100%", "height": "800px"});
    },

    /**
     * 加载图表
     * @param id 指标编号
     * @param data 数据
     * @param uuid 唯一编号
     * @param name 名称
     */
    loadChart(id, data, uuid, name, json) {
      var chartFrame = "<div onclick='openChart(this,\"" + uuid + "\")' ditem='true' itemobj='" + uuid + "' objname='" + name + "' id='chartFrameDiv_" + uuid + "'><iframe  id='chartFrame_" + uuid + "' frameborder='0' name='chartFrame' width='100%' height='350px' src='../../lib/chart-editor/index.html' scrolling='no'></iframe></div>";
      $("#" + id).parent().append(chartFrame);
      var cw = document.getElementById("chartFrame_" + uuid);
      cw.onload = function () {
        cw.contentWindow.loadChart(data, json, false);
      };
      // resizeGrid(uuid,name);
    },

    /**
     * 设置grid样式
     * @param uuid 唯一编号
     * @param name 指标名
     * @param type 类型
     */
    resizeGrid(uuid, name, type) {
      $("#" + uuid + name).css({"width": "100%"});
      $("#table-view_" + uuid).css({"width": "50%", "float": "left"});
    },

    /**
     * 在指定div下生成图表
     */
    buildChars(uuid, name) {
      var divId = uuid + name;
      var data = getChartData(divId);
      var json = getChartXYJSON(divId);
      if (json == null) {
        return;
      }
      loadChart("table-view_" + uuid, data, uuid, name, json);
    },

    /**
     * 获取图表的JSON
     * @param xList x轴列表
     * @param xsrc x轴src列表
     * @param inAliasNameList 指标别名列表
     */
    getChartYsrcJSON(xList, xsrc, inAliasNameList, divId) {
      var inMeasureName = divId.substring(36, divId.lengh);
      var testData = {};
      var data = [];
      $.each(inAliasNameList, function (num, value) {//循环指标 开始组织Y轴
        var json = {
          mode: "markers",
          orientation: "v",
          type: "bar",
          x: xList.length == 1 ? xList[0] : xList,
          xsrc: xsrc.length == 1 ? xsrc[0] : xsrc,
          y: "{#" + value + "#}",
          ysrc: value,
          name: value
        };
        data.push(json);
      });
      testData.data = data;
      testData.layout = {
        autosize: true,
        xaxis: {
          autorange: true,
          type: "category",
          title: {
            text: "这是X轴"
          }
        },
        yaxis: {
          autorange: true,
          type: "linear",
          title: {
            text: "这是y轴"
          }
        },
        title: {
          text: inMeasureName
        }
      };
      return testData;
    },
    /**
     * 删除图表
     * @param obj 要删除的对象
     */
    delEcharts(obj) {
      $("#" + $(obj).attr("name")).remove();
    },

    /**
     * 放大div
     */
    bigDiv(id) {
      var obj = $("#" + id);
      layer.open({
        type: 1,
        title: '数据',
        shadeClose: true,
        shade: false,
        maxmin: false, //开启最大化最小化按钮
        area: ['100%', '100%'],
        content: $(obj)
      });
    },

    /**
     * 根据选中的指标高亮显示该指标的维度，主要用于并列分析
     * @param inMeasureId 指标编号
     */
    checkInDisplayDim(inMeasureId) {
      var check = $("#" + inMeasureId).attr("check");
      if (check == undefined || check == "") {
        $("#" + inMeasureId).removeClass();
        $("#" + inMeasureId).addClass("tag-select tag-warning");
        $("#" + inMeasureId).attr("check", "true");
      } else {
        $("#" + inMeasureId).removeClass();
        $("#" + inMeasureId).addClass("tag-select tag-warning tag-ouline");
        $("#" + inMeasureId).attr("check", "");
      }
    },

    /**
     * 修改分析个数
     */
    updateAnalysisCount() {
      var count = 0;
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        count += value.objInList.length;
      });
      $("#analysisCount").text(count);
    },

    //endregion 查询以及数据显示操作

    //region 临时维度以及临时指标操作
    /**
     * 添加临时指标
     * @param obj 触发事件本身
     */
    addTempIn(obj) {
      var that = this;
      var analysisRegionId = $(obj).attr("analysisRegion");
      this.deriveInType = "3";
      this.addDeriveInType = "2";
      this.nowAnalysisRegionId = analysisRegionId;
      this.nowInMeasureUuid = null;
      //this.isDelete=1
      this.dialogAddderiveinVisible = true;
    },

    /**
     * 修改临时指标
     * @param uuid 传过来div编号
     * @param analysisRegionId 分析区编号
     * @param inMeasureId 指标编号
     * @param type 指标类型
     * @param yesNoTem 是否临时
     */
    updateTempIn(uuid, analysisRegionId, inMeasureId, type, yesNoTem) {
      var that = this;
      if (yesNoTem == true || yesNoTem == "true") {
        this.nowInMeasureUuid = inMeasureId;
        this.nowAnalysisRegionId = analysisRegionId
        this.nowParentUuid = uuid
        this.dialogAddderiveinVisible = true;
      } else {
        Message("只有临时指标才能在此处更改！");
        return;
      }
    },
    /**
     * 添加临时维度
     */
    addTempDim(analysisRegionId) {
      this.addTempDimAnalysisRegionId = analysisRegionId
      this.dimId = null;
      this.dimDivId = null;
      var that = this;
      //  根据分析区编号找到分析区下的指标和维度编号
      //  找到之后将其发送到后台，通过后台找到该维度与该指标关联的列名展示到前台。
      var obj = this.getAnalysisRegionInAndDim(analysisRegionId);
      if (!obj.success) {
        return;
      }
      var objInList = obj.objInList;
      var supDimIdList = obj.supDimIdList;
      this.nowDimAnalysisRegionId = obj.dimAnalysisRegionId;
      var url = this.contextUrl + "/indicatrixAnalysis/getInRelDimCol";
      $.post(url, {
        objInList: JSON.stringify(objInList),
        supDimIdList: JSON.stringify(supDimIdList)
      }, function (res, status) {
        if (res.state == false) {
          that.$message(res.message);
        }
        var resultObj = res.resultObj;
        sessionStorage.setItem("resultObj", JSON.stringify(resultObj));
        /*$.each(resultObj,function(num,value){
            	that.analysisList.objDimList.push(value.dimensionName);
            })*/
        for (var i = 0; i < resultObj.length; i++) {
          that.inDimList.push(resultObj[i].dimensionName);
        }
        that.nowAnalysisRegionId = analysisRegionId
        that.dialogEdittemdimVisible = true
      }, "json")
    },

    /**
     * 这个方法用来返回维度名称
     */
    getInDimList() {
      return this.inDimList;
    },

    /**
     * 这个方法用来清除维度名称
     */
    clearInDimList() {
      this.inDimList = [];
    },

    /**
     * 获取指定分析区的指标以及维度
     * @param analysisRegionId 分析区编号
     */
    getAnalysisRegionInAndDim(analysisRegionId) {
      //  根据分析区编号找到分析区下的指标和维度编号
      //   找到之后将其发送到后台，通过后台找到该维度与该指标关联的列名展示到前台。
      var obj = {objInList: null, supDimIdList: null, dimAnalysisRegionId: '', success: false};
      var flag = false;
      $.each(this.analysisList, function (num, value) {//找到分析区内的指标和维度编号
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          if (value.objInList.length == 0) {
            return false;
          }
          flag = true;
          obj.success = true;
          obj.objInList = value.objInList;
          obj.supDimIdList = value.supDimIdList;
        }
      });
      var dimAnalysisRegionId = this.getAnalysisRegionDimId(analysisRegionId);
      if (!flag) {
        Message("该分析区下没有任何指标，不能新增临时维度！");
        return false;
      }
      obj.dimAnalysisRegionId = dimAnalysisRegionId;
      return obj;
    },
    //endregion 临时维度以及临时指标操作

    //region 常用分析操作
    /**
     * 保存为常用分析按钮
     */
    saveChangYongAnalysis() {
      if (this.analysisList[0].objInList.length == 0) {
        Message("请先选择指标！");
        return;
      }
      if (this.oftenAnalysisId == "") {
        this.saveAnalysis();
        return;
      }
      var that = this;
      this.$confirm('保存为常用分析', '提示', {
        confirmButtonText: '覆盖',
        cancelButtonText: '另存为',
        type: 'warning'
      }).then(() => {
        that.saveAnalysisOne();
      }).catch(() => {
        that.saveAnalysis();
      });
    },

    /**
     * 保存为常用分析、另存为
     */
    saveAnalysis() {
      this.openSaveAnalysis();
    },

    /**
     * 保存常用分析（修改）
     */
    saveAnalysisOne() {
      var that = this;

      this.$confirm('是否保存常用分析“{0}”？'.format(this.oftenAnalysisName), '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleChartConfig()
        var objSupAnalysis = {
          analysisList: this.analysisList
        };
        var inRegionStyle = $("#inRegion").html();
        var dimRegionStyle = $("#dimAnalysisRegion").html();
        var mapping = JSON.stringify(that.inRegionAndDimRegionMapping);
        var data = {
          inOftenindicatorsUuid: that.oftenAnalysisId,
          oftenindicatorsName: null,
          ofteninfolderUuid: null,
          oftenindicatorsAnalysisobject: JSON.stringify(objSupAnalysis),
          oftenindicatorsIsdelete: 0,
          oftenindicatorsMemo: null,
          createTime: null,
          updateTime: null,
          createPersonUuid: null,
          createPersonName: null,
          pbScopeUuid: null,
          inRegionStyle: inRegionStyle,
          dimRegionStyle: dimRegionStyle,
          mapping: mapping
        };
        var url = that.contextUrl + "/InOftenindicators/updateByPrimaryKeySelective";
        $.post(url, {inOftenindicators: JSON.stringify(data)}, function (res) {
          if (res.state == false) {
            that.$message(res.message);
            return;
          }
          var info = "编辑了常用分析:'{0}'".format(that.oftenAnalysisName);
          that.addOperLogByParam(that.log_module, that.log_add, that.log_info);
          that.oftenAnalysisId = "";
          that.oftenAnalysisName = "";
          that.$message("保存成功！");
        }, "json");
      }).catch(() => {
      });
    },
    /**
     * 打开保存常用分析界面
     */
    openSaveAnalysis() {
      var that = this;
      this.dialogsSaveAnalysisVisible = true;
    },

    /**
     * 添加常用分析树节点
     * @param name 名称
     */
    addAnalistsNode(name, pbScopeUuid, folderId) {
      debugger
      var inRegionStyle = $("#inRegion").html();
      var dimRegionStyle = $("#dimAnalysisRegion").html();
      var mapping = JSON.stringify(this.inRegionAndDimRegionMapping);
      let that = this
      //整理叠加分析的对象
      //获取当前界面分析对象的图表配置
      this.handleChartConfig()
      var objSupAnalysis = {
        analysisList: this.analysisList
      };
      var uuid = this.getuuid();
      var data = {
        inOftenindicatorsUuid: uuid,
        oftenindicatorsName: name,
        ofteninfolderUuid: folderId,
        oftenindicatorsAnalysisobject: JSON.stringify(objSupAnalysis),
        oftenindicatorsIsdelete: 0,
        oftenindicatorsMemo: '',
        createTime: '',
        updateTime: '',
        createPersonUuid: '',
        createPersonName: '',
        pbScopeUuid: pbScopeUuid,
        inregionstyle: inRegionStyle,
        dimregionstyle: dimRegionStyle,
        mapping: mapping
      };
      var url = this.contextUrl + "/InOftenindicators/insertSelective";
      $.post(url, {inOftenindicators: JSON.stringify(data)}, function (res) {
        if (res.state == false) {
          that.$message(res.message);
          return;
        }
        var info = "";
        if (that.oftenAnalysisId != "") {
          info = "将常用分析'{0}'另存为'{1}'".format(that.oftenAnalysisName, name);
        } else {
          info = "新增了常用分析:'{0}'".format(name);
        }
        that.addOperLogByParam(that.log_module, that.log_add, that.log_info);
      }, "json");
      /*        zTree.addNodes(this.analysisNode,
        {
            id: uuid,
            pId: this.analysisNode.id,
            type: "analysis",
            name: name,
            auditorOrauditorgan: this.analysisNode.auditorOrauditorgan,
            iconSkin: "ztree_no",
            nocheck: true,
            pbScopeUuid:this.analysisNode.pbScopeUuid
        });*/
      this.oftenAnalysisId = "";
      this.oftenAnalysisName = "";
    },
    /**
     *  处理图表置
     */
    handleChartConfig(){
      //获取当前界面分析对象的图表配置
      for(let i = 0;i < this.analysisList.length;i++){
        if(this.$refs[this.analysisList[i].id] != undefined && this.$refs[this.analysisList[i].id].length != 0){
          console.log(this.$refs[this.analysisList[i].id][0].getChartConfig)
          if(this.$refs[this.analysisList[i].id][0].getChartConfig){
            console.log(this.$refs[this.analysisList[i].id][0].getChartConfig())
            this.analysisList[i].chartConfig = this.$refs[this.analysisList[i].id][0].getChartConfig()
          }
        }
      }
    },
    /**
     * 共享派生指标
     */
    shareIndicatrix(treeId, treeNode) {
      var that = this;
      var formUrl = analysisUrl + "/tree/personOrgTree?ismore=1&isjurid=1&notSelData=''";
      pubDialog({
        id: "getPerson",
        title: "共享人员选择",
        url: formUrl,
        params: {jsondata: ''},
        width: "1000px",
        height: "600px",
        scrollbar: false,
        closureObj: "personOrgTree",
        callBackFun: function (data) {
          if (!data || data.length <= 0) {
            return false;
          }
          if (that.personInfo.orgName != data[0].orgname) {
            that.$message("不允许不同机构下的派生指标共享");
            return false;
          }
          var idArrayId = new Array();
          var idArrayName = new Array();
          $.each(data, function (index, element) {
            idArrayId.push(element.personuuid);
            idArrayName.push(element.fullName);
          });
          var uuid = that.getuuid();
          var url = that.contextUrl + "/InMeasure/shareIndicatix";
          $.post(url, {
            inMesureUuid: treeNode.id,
            newUuid: uuid,
            sharePersonUuid: JSON.stringify(idArrayId),
            sharePersonName: JSON.stringify(idArrayName)
          }, function (res) {
            if (res.state == false) {
              that.$message(res.message);
              return;
            }
            that.$message("共享成功");
            var remindUrl = analysisUrl + "/pbRemind/addPBRemindToKpi";
            $.each(idArrayId, function (num, value) {
              var info = that.personInfo.orgPathName + that.personInfo.personName + '共享' + treeNode.name + "派生指标给您。"
              that.addOperLogByParam("派生指标", "派生指标共享", log_info);
              that.addMessage("指标共享[" + treeNode.name + "]", log_info, value, 1);
            })
          }, "json")
        }
      });
    },
    /**
     * 共享常用分析
     */
    shareAnalysis(treeId, treeNode) {
      var that = this;
      var selNode = treeNode;
      if (selNode.type == "folder") {
        Message("您选择的是分类，不能共享！");
        return;
      }
      if (selNode.auditorOrauditorgan == 1 || selNode.auditorOrauditorgan == 2) {
        Message("只能共享个人的常用分析！");
        return;
      }
      var formUrl = analysisUrl + "/tree/personOrgTree?ismore=1&isjurid=1&notSelData=''";
      pubDialog({
        id: "getPerson",
        title: "共享人员选择",
        url: formUrl,
        params: {jsondata: ''},
        width: "1000px",
        height: "600px",
        scrollbar: false,
        closureObj: "personOrgTree",
        callBackFun: function (data) {
          if (!data || data.length <= 0) {
            return false;
          }
          if (that.personInfo.orgName != data[0].orgname) {
            that.$message("不允许不同机构下的常用分析共享");
            return false;
          }
          var idArrayId = new Array();
          var idArrayName = new Array();
          $.each(data, function (index, element) {
            idArrayId.push(element.personuuid);
            idArrayName.push(element.fullName);
          });
          var uuid = that.getuuid();
          var url = that.contextUrl + "/InOftenindicators/shareAnalysis";
          $.post(url, {
            inOftenindicatorsUuid: selNode.id,
            newUuid: uuid,
            sharePersonUuid: JSON.stringify(idArrayId),
            sharePersonName: JSON.stringify(idArrayName)
          }, function (res) {
            if (res.state == false) {
              that.$message(res.message);
              return;
            }
            that.$message("共享成功");
            var remindUrl = analysisUrl + "/pbRemind/addPBRemindToKpi";
            $.each(idArrayId, function (num, value) {
              var info = that.personInfo.orgPathName + that.personInfo.personName + '共享' + treeNode.name + "常用分析给您。"
              that.addOperLogByParam("常用分析", "常用分析共享", log_info);
              that.addMessage("常用分析[" + treeNode.name + "]", log_info, value, 2);
            })
          }, "json")
        }
      });
    },

    /**
     * 复制常用分析
     */
    copyAnalysis() {
      var selNode = this.commonTree.getSelectedNodes();
      var parentNode = this.commonTree.getSelectedNodes()[0].getParentNode();
      if (selNode.length == 0) {
        Message("请选择要复制的分析！");
        return;
      }
      if (selNode.length > 1) {
        Message("不允许批量复制！");
        return;
      }
      if (selNode[0].type == "folder") {
        Message("您选择的是分类，不能复制！");
        return;
      }
      var newUuid = this.getuuid();
      var url = this.contextUrl + "/InOftenindicators/copyAnalysis";
      var that = this;
      $.post(url, {inOftenindicatorsUuid: selNode[0].id, newUuid: newUuid}, function (res) {
        if (res.state == false) {
          that.$message(res.message);
          return;
        }
        that.commonTree.addNodes(parentNode,
          {
            id: newUuid,
            pId: parentNode.id,
            type: "analysis",
            name: res.message,
            auditorOrauditorgan: parentNode.auditorOrauditorgan,
            iconSkin: "ztree_no",
            nocheck: true
          });
      }, "json")
    },

    //endregion 常用分析操作

    //region 新分析方式代码区
    /**
     * 加载指标数据
     * @param type 指标类型
     * @param targetId 目标编号
     * @param id 指标编号
     * @param yesNoTem 是否临时
     */
    loadInMeasueData(type, targetId, id, yesNoTem, list) {
      var supDimIdListOne = [];
      $.each(this.analysisList, function (num, value) {
        if (value == null || value == undefined) {
          return;
        }
        if (value.id == targetId) {
          supDimIdListOne = value.supDimIdList;
        }
        if (list != null) {
          supDimIdListOne = list;
        }
      });
      if (yesNoTem == true) {//如果是临时指标则验证当前指标编号是不是存在
        if (supDimIdListOne.indexOf(id) != -1) {
          supDimIdListOne.splice([supDimIdListOne.indexOf(id), 1]);
        }
      }
      var verUrl = this.contextUrl + "/indicatrixAnalysis/supAnalysisVerification";//验证指标的维度顺便拿到维度
      var that = this;
      $.ajax({
        type: "post",
        url: verUrl,
        data: {indicatrixId: id, listDimId: JSON.stringify(supDimIdListOne)},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.length == 0) {
            that.$message('该指标与当前指标没有任何关联维度，不能进行叠加分析');
            if (yesNoTem == true) {
              that.delDer(id);
            }
            return;
          }
          that.clearAnalysisRegionAppoingArray(targetId, "supDimIdList");
          that.initInToForm(id, type, targetId, yesNoTem);//加载指标到界面
          var analysisDimRegionId = that.getAnalysisRegionDimId(targetId);
          that.nativeInDimSup(id, res, analysisDimRegionId, targetId);
        }
      });
    },

    /**
     * 初始化指标到界面
     * @param id 指标编号
     * @param type 指标类型
     * @param targetId 目标id
     * @param yesNoTem 是否临时
     */
    initInToForm(id, type, targetId, yesNoTem) {
      //clearAnalysisRegionTemDim(targetId);
      var that = this;
      var url = this.contextUrl + "/indicatrixAnalysis/getIndicatrixAnalysis";
      $.ajax({
        type: "post",
        url: url,
        data: {indicatrixId: id, type: type},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res == null) {
            that.$message("该指标表被删除，请联系数据管理员。", {time: 30000, btn: ['知道了']});
          }
          var inMeasureGroupList = that.verInMeasureExist(targetId, id);
          if (inMeasureGroupList.length != 0) {
            var group = that.getGroup(inMeasureGroupList);
            if (group == undefined) {
              that.$message("该指标的所有聚合方式均已存在，不能再继续新增！", {time: 30000, btn: ['知道了']});
              return;
            }
            that.$message("指标已经存在,聚合方式更改为：" + group);
            res.measureGroup = group;
          }
          var uuid = that.getuuid();
          var spanUuid = that.getuuid();
          var name = "";
          if (type == 2) {
            name = res.measureName;
          }
          if (type == 1) {
            name = that.updateGroupDisplay(res.measureGroup, res.measureName);
          }
          var parameter = "";
          if (type == 2) {
            parameter = "\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\"".format(uuid, targetId, id, type, yesNoTem, "false");//组织click事件里的参数
          }
          if (type == 1) {
            parameter = "\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\"".format(uuid, targetId, id, res.measureGroup, "false");//组织click事件里的参数
          }
          var newName = name.replace("(", "").replace(")", "");
          var sanJiao = "";
          var tringleId = that.getuuid();
          if (res.measureType == '2') {
            var columnName = res.measureName;
            sanJiao = "\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",\"{8}\"".format(uuid, targetId, id, res.measureGroup, type, yesNoTem, columnName, columnName, spanUuid);
          } else {
            sanJiao = "\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",\"{8}\",\"{9}\"".format(uuid, targetId, id, res.measureGroup, type, yesNoTem, res.columnName, newName, spanUuid, tringleId);
          }

          var can = "\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\"".format(uuid, targetId, id, type, yesNoTem);//组织click事件里的参数
          var dom = "<div id='" + uuid + "' onclick='updateTempIn(" + can + ")'>" +
            "<i class='icon-close' onclick='delAnalysisListDownIn(" + parameter + ")'></i>" +
            "<span id='" + spanUuid + "'></span>" +
            "<i class='icon-down' id = '" + tringleId + "' onclick='inTriangle(" + sanJiao + ")'></i>" +
            "</div>";
          $("#" + targetId).children(":first").after(dom);
          if (yesNoTem == true) {
            $("#" + uuid).addClass("tag-select tag-info active");
            $("#" + spanUuid).html("<i class='icon-clock'></i>" + name);
          } else {
            $("#" + uuid).addClass("tag-select tag-info");
            $("#" + spanUuid).html(name);
          }
          $("#" + uuid).attr("title", res.measureMemo);
          $("#" + uuid).attr("name", id);
          $("#" + uuid).attr("updateGroup", targetId + id + res.measureGroup);
          res.updateGroup = targetId + id + res.measureGroup;
          //指标展示到界面之后将指标的对象放入到大的分析列表里的指定分析区内
          $.each(that.analysisList, function (num, value) {
            if (value == null) {
              return;
            }
            if (value.id == targetId) {
              value.objInList.push(res);
            }
          });
          that.updateAnalysisCount();
        }
      });
    },

    /**
     * 验证指标是否在分析区里存在并获取已经存在的指标的聚合方式
     * @param analistsInRegionId 分析区编号
     * @param inId 指标编号
     */
    verInMeasureExist(analistsInRegionId, inId) {
      var inMeasureGroupList = [];
      $.each(this.analysisList, function (num, value) {//循环找到分析区
        if (value == null) {
          return;
        }
        if (value.id == analistsInRegionId) {//判断分析区编号是否一致
          $.each(value.objInList, function (count, inMeasure) {
            if (inMeasure == null) {
              return;
            }
            if (inMeasure.inMeasureUuid == inId) {
              inMeasureGroupList.push(inMeasure.measureGroup);
            }
          })
        }
      });
      return inMeasureGroupList;
    },

    /**
     * 循环验证指定的聚合方式在列表里是否存在
     * @param groupList 聚合方式列表
     */
    getGroup(groupList) {
      var list = ['sum', 'count', 'distinct', 'max', 'min', 'avg'];
      for (var i = 0; i < list.length; i++) {
        if (groupList.indexOf(list[i]) == -1) {
          return list[i];
        }
      }
    },
    /**
     * 初始化指标维度
     * @param id 指标编号
     * @param res 后台返回来的维度结果集
     * @param analysisDimRegionId 维度分析区编号
     * @param inAnalysisRegionId 指标分析区编号
     */
    nativeInDimSup(id, res, analysisDimRegionId, inAnalysisRegionId) {
      //清空指定分析区的维度div编号以及分析维度列表
      $.each(this.analysisList, function (num, value) {
        if (value == null || value == undefined) {
          return;
        }
        if (value.id == inAnalysisRegionId) {
          if (value.dimDivIdList == undefined) {
            return;
          }
          $.each(value.dimDivIdList, function (count, dimDivId) {//清空当前叠加分析下的所有维度重新绑定
            if (dimDivId == null || dimDivId == undefined) {
              return;
            }
            $("#" + dimDivId).remove();
          });
          $("#" + analysisDimRegionId).html("");
          value.dimDivIdList = [];
          value.objDimList = [];
          value.supDimList = [];
          return false;
        }
      });
      var dom = "<div class=\"tag-select\">\n" +
        "<i class='icon-add'>+</i>" +
        "<span style='margin-top: -5px;' onclick='addTempDim(\"" + inAnalysisRegionId + "\")'>新增临时维度</span>" +
        "</div>";
      $("#" + analysisDimRegionId).append(dom);
      var supDimIdListOne = [];
      var dimDivIdListOne = [];
      var that = this;
      $.each(res, function (num, value) {
        var newId = analysisDimRegionId + id;
        supDimIdListOne.push(value.inDimensionUuid);//每次重新绑定都会将新的维度编号放进维度编号列表，用于添加新指标验证
        dimDivIdListOne.push(newId);
        if (value.dimensionOperation == 3) {
          that.prependDimShow(id, analysisDimRegionId, inAnalysisRegionId, value, newId, true, null);
        } else {
          that.prependDimShow(id, analysisDimRegionId, inAnalysisRegionId, value, newId, false, null);
        }
      });
      //动态增加临时数据
      this.addTemporaryDataDynamically(res);

      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == inAnalysisRegionId) {
          value.supDimIdList = supDimIdListOne;
          value.dimDivIdList = dimDivIdListOne;
        }
      })
    },

    /**
     * 追加维度显示框
     * @param id 指标编号
     * @param analysisDimRegionId 维度分析区编号
     * @param inAnalysisRegionId 指标分析区编号
     * @param newId 维度分析区编号+指标编号
     * @param obj 对象
     * @param newId 新的编号 用来控制删除维度框
     * @param splitLevel 是否继续拆分
     */
    prependDimShow(id, analysisDimRegionId, inAnalysisRegionId, obj, newId, splitLevel, elmObj) {
      var uuid = analysisDimRegionId + this.getuuid();
      var iuuid = this.getuuid();
      var plusUuid = this.getuuid();
      var parentElmUuid = this.getuuid();
      var dom = "";
      if (obj.dimensionOperation == 3 || obj.dimensionOperation == 2) {
        if (splitLevel == true) {
          dom = "<div " + "id='" + newId + "'parentElmUuid='" + parentElmUuid + "'onclick='dimClickSup(this," + "\"" + inAnalysisRegionId + "\"" + ")'>"
            + "<i id='" + plusUuid + "' onclick='plusClick(this)' style='font-size: 20px' class='icon-add'>+</i>" + "<span id='" + uuid + "'>+</span>" +
            "<i id='" + iuuid + "' onclick='filterBtn(this," + "\"" + inAnalysisRegionId + "\"" + ")'></i>" +
            "</div>";
        } else {
          dom = "<div " + "id='" + newId + "'parentElmUuid='" + parentElmUuid + "'onclick='dimClickSup(this," + "\"" + inAnalysisRegionId + "\"" + ")'>"
            + "<i id='" + plusUuid + "' style='display:none;' onclick='plusClick(this)' class='icon-add'>+</i>" + "<span id='" + uuid + "'>+</span>" +
            "<i id='" + iuuid + "' onclick='filterBtn(this," + "\"" + inAnalysisRegionId + "\"" + ")'></i>" +
            "</div>";
        }
      } else {
        dom = "<div " + "id='" + newId + "'parentElmUuid='" + parentElmUuid + "'onclick='dimClickSup(this," + "\"" + inAnalysisRegionId + "\"" + ")'>"
          + "<i id='" + plusUuid + "' style='display:none;' onclick='plusClick(this)' class='icon-add'>+</i>" + "<span id='" + uuid + "'>+</span>" +
          "<i id='" + iuuid + "' onclick='filterBtn(this," + "\"" + inAnalysisRegionId + "\"" + ")'></i>" +
          "</div>";
      }
      var level = 0;
      if (obj.level != undefined) {
        level = obj.level;
      }
      var yesNoSplitLevel = false;
      if (obj.yesNoSplitLevel != undefined) {
        yesNoSplitLevel = true;
      }
      var splitLevelType = "无";
      if (obj.splitLevelType != undefined) {
        splitLevelType = obj.splitLevelType;
      }
      var oldName = "";
      if (obj.oldName == undefined) {
        oldName = obj.dimensionName;
      } else {
        oldName = obj.oldName;
      }
      if (elmObj != null) {
        $(elmObj).parent().after(dom);
      } else {
        $("#" + analysisDimRegionId).prepend(dom);
      }

      $("[parentElmUuid='" + parentElmUuid + "']").addClass("tag-select tag-warning tag-ouline");
      $("[parentElmUuid='" + parentElmUuid + "']").attr("name", obj.inDimensionUuid);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("isChecked", false);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("dimId", obj.inDimensionUuid);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("dimIdAndName", obj.inDimensionUuid + obj.dimensionName + newId);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("title", obj.dimensionMemo);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("yesNoTem", false);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("custom", obj.dimensionName);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("operation", obj.dimensionOperation);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("level", level);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("yesNoSplitLevel", yesNoSplitLevel);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("splitLevelType", splitLevelType);
      $("[parentElmUuid='" + parentElmUuid + "']").attr("oldName", oldName);
      $("[parentElmUuid='" + parentElmUuid + "']").addClass("tag-select tag-warning tag-ouline");

      /*        $("#" + newId).attr("name", obj.inDimensionUuid);
        $("#" + newId).attr("isChecked", false);
        $("#" + newId).attr("dimId", obj.inDimensionUuid);
        $("#" + newId).attr("dimIdAndName", obj.inDimensionUuid + obj.dimensionName + newId);
        $("#" + newId).attr("title", obj.dimensionMemo);
        $("#" + newId).attr("yesNoTem", false);
        $("#" + newId).attr("custom", obj.dimensionName);
        $("#" + newId).attr("operation", obj.dimensionOperation);
        $("#" + newId).attr("level", level);
        $("#" + newId).attr("yesNoSplitLevel", yesNoSplitLevel);
        $("#" + newId).attr("splitLevelType", splitLevelType);*/

      $("#" + uuid).attr("name", obj.inDimensionUuid);
      $("#" + uuid).attr("isChecked", false);
      $("#" + uuid).text(obj.dimensionName);
      $("#" + uuid).attr("dimId", obj.inDimensionUuid);
      $("#" + uuid).attr("operation", obj.dimensionOperation);

      $("#" + iuuid).attr("dimId", obj.inDimensionUuid);
      $("#" + iuuid).attr("name", obj.dimensionName);
      $("#" + iuuid).attr("sup", true);
      $("#" + iuuid).attr("operation", obj.dimensionOperation);
      $("#" + iuuid).addClass("icon-down");

      $("#" + plusUuid).attr("dimId", obj.inDimensionUuid);
      $("#" + plusUuid).attr("dimName", obj.dimensionName);
      $("#" + plusUuid).attr("oldName", oldName);
      $("#" + plusUuid).attr("newId", newId);
      $("#" + plusUuid).attr("level", level);
      $("#" + plusUuid).attr("inMeasureId", id);
      $("#" + plusUuid).attr("analysisDimRegionId", analysisDimRegionId);
      $("#" + plusUuid).attr("inAnalysisRegionId", inAnalysisRegionId);
    },
    /**
     * 初始化临时维度到界面
     * @param data 数据对象  具体详情请看editTemDim.js里的saveTemDim()方法
     */
    initTemDimToFrom(data) {
      if (this.dataMap.get(data.id) != undefined) {
        this.dataMap.delete(data.id);
        this.dataMap.set(data.id, data);
      } else {
        this.dataMap.set(data.id, data);
      }
      var inAnalysisRegionId = data.analysisRegionId;
      var analysisDimRegionId = data.dimAnalysisRegionId;//指定分析区的维度分析区编号
      var newId = this.getuuid();
      var uuid = analysisDimRegionId + this.getuuid();
      var iuuid = this.getuuid();
      var delParameter = "\"{0}\",\"{1}\",\"{2}\",\"{3}\"".format(inAnalysisRegionId, data.id, newId, "false");//组织删除click事件里的参数;
      var updateParameter = "\"{0}\",\"{1}\",\"{2}\"".format(data.id, newId, inAnalysisRegionId);//组织修改click事件里的参数;
      var dom = "<div " + "id='" + newId + "'  onclick='dimClickSup(this," + "\"" + inAnalysisRegionId + "\"" + ")'>" +
        "<i class='icon-close' onclick='delTemDim(" + delParameter + ")'></i>" +
        "<i class='icon-edit' onclick='updateTemDim(" + updateParameter + ")'></i>" +
        "<span id='" + uuid + "'>+</span>" +
        "<i id='" + iuuid + "' onclick='filterBtn(this," + "\"" + inAnalysisRegionId + "\"" + ")'></i>" +
        "</div>";
      $("#" + analysisDimRegionId).prepend(dom);
      var dimIdAndName = "";
      if (data.dimIdAndName != undefined) {
        dimIdAndName = data.dimIdAndName;
      } else {
        dimIdAndName = data.id + data.dimensionName + newId;
      }
      $("#" + newId).addClass("tag-select tag-warning tag-ouline");
      $("#" + newId).attr("name", data.columnName);
      $("#" + newId).attr("isChecked", false);
      $("#" + newId).attr("dimId", data.id);
      $("#" + newId).attr("dimIdAndName", dimIdAndName);
      $("#" + newId).attr("title", data.dimMemo);
      $("#" + newId).attr("yesNoTem", data.yesNoTem);
      $("#" + newId).attr("custom", data.dimensionName);

      $("#" + uuid).attr("name", data.columnName);
      $("#" + uuid).attr("isChecked", false);
      $("#" + uuid).text(data.dimensionName);
      $("#" + uuid).attr("dimId", data.id);
      $("#" + iuuid).attr("dimId", data.id);
      $("#" + iuuid).attr("name", data.dimensionName);
      $("#" + iuuid).attr("sup", true);
      $("#" + iuuid).addClass("icon-down");
      var obj = {
        dimId: data.id,
        temDimObj: data,
        dimDivId: newId,
        analysisRegionId: inAnalysisRegionId
      };
      this.temDimList.push(obj);
      this.inDimList.push(data.dimensionName);
    },

    /**
     * 验证维度名称是否重复
     * @param analysisRegionId 分析区编号
     * @param name 维度名
     * @returns {boolean}
     */
    verTemDimName(analysisRegionId, name) {
      var flag = true;
      $.each(this.analysisList, function (num, value) {
        if (value.id == analysisRegionId) {
          $.each(value.objDimList, function (count, dim) {
            if (dim.dimensionName == name) {
              flag = false;
            }
          })
        }
        if (value.id == "inAnalysisRegion") {
          $.each(value.objDimList, function (count, dim) {
            if (dim.dimensionName == name) {
              flag = false;
            }
          })
        }
      });
      return flag;
    },
    /**
     * 创建分析区域
     */
    createAnalysisRegion() {
      //创建指标分析区
      var uuid = this.getuuid();
      var inAnalysisRegionId = "inAnalysisRegion" + uuid;
      var dimAnalysisRegionId = "dimAnalysisRegion" + uuid;
      this.createInAnalysisRegion(inAnalysisRegionId, dimAnalysisRegionId);
      this.createDimAnalysisRegion(inAnalysisRegionId, dimAnalysisRegionId);
      //将编号的映射关系存到映射关系数组
      this.addMapping(inAnalysisRegionId, dimAnalysisRegionId);
      //创建完成之后直接显示新创建的维度灰框，其他的全部隐藏
      this.switchDim(null, dimAnalysisRegionId);
      //创建完成之后在列表里将分析区的编号放进分析列表
      this.addAnalysisList(inAnalysisRegionId);
    },

    /**
     * 创建指标分析区
     * @param InId 指标分析区编号
     * @param dimId 维度分析区编号 直接绑定到事件里
     */
    createInAnalysisRegion(InId, dimId) {
      var count = this.inRegionAndDimRegionMapping.length + 1;
      var inDom = "<div class='tags-item-con'   style='cursor:pointer' onclick='switchDim(this," + "\"" + dimId + "\"" + ")'>" +
        " <div class='tags-item' id='" + InId + "'  analysisRegion='" + InId + "'>" +
        "<div class='tags-order' id='" + InId + "Count" + "' >" + count + "</div>" +
        "<div class='tag-select'>" +
        "<i class='icon-add'>+</i>" +
        "<span style='margin-top: -5px;' onclick='addTempIn(this)' analysisRegion='" + InId + "'>新增临时指标</span>" +
        "</div>" +
        "<div title=\"设置阈值\" class='tags-set'>\n" +
        "<span class='icon iconfont' id='setValue" + InId + "' style='color:#aeaeae;' onclick='setValue(\"" + InId + "\")'>&#xe606;</span>\n" +
        "</div>"
        +
        "<div class='tags-del'><i class='icon-del' onclick='delAnalysisRegion(\"" + InId + "\")'></i></div>" +
        "</div>" +
        "</div>";
      $("#createAnalysis").before(inDom);
    },

    /**
     * 创建维度分析区
     * @param dimId 维度编号
     */
    createDimAnalysisRegion(InId, dimId) {
      //创建维度分析区
      var dimDom = "<div class='tags-item-con' id='" + dimId + "'>" +
        "<div class='tag-select'>" +
        "<i class='icon-add'>+</i>" +
        "<span style='margin-top: -5px;' onclick='addTempDim(\"" + InId + "\")'>新增临时维度</span>" +
        "</div>" +
        "</div>";
      /*        $.each(this.inRegionAndDimRegionMapping, function(num, value) {//隐藏所有维度分析区
            $("#" + value.dimAnalysisRegionId).hide();
        });*/
      //$("#dimAnalysisRegion").before(dimDom);
      $("#dimAnalysisRegion").append(dimDom);
      // $("#" + dimId).show();
    },

    /**
     * 将指标区与维度区的映射关系存放到数组
     * @param inAnalysisRegionId 指标分析区编号
     * @param dimAnalysisRegionId 维度分析区编号
     */
    addMapping(inAnalysisRegionId, dimAnalysisRegionId) {
      var obj = {
        inAnalysisRegionId: inAnalysisRegionId,
        dimAnalysisRegionId: dimAnalysisRegionId
      };
      this.inRegionAndDimRegionMapping.push(obj);
    },

    /**
     * 将新增的区域信息新增到分析列表
     * @param inAnalysisRegionId 指标分析区编号
     */
    addAnalysisList(inAnalysisRegionId) {
      var obj = {
        id: inAnalysisRegionId,
        objInList: [],
        objDimList: [],
        supDimIdList: [],
        dimDivIdList: []
      };
      this.analysisList.push(obj);
    },

    /**
     * 根据元素编号切换维度区
     * @param elementId
     */
    switchDim(obj, elementId) {
      event.stopPropagation();
      //先隐藏掉所有维度灰框以及去掉所有分析框的样式
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        $("#" + value.inAnalysisRegionId).parent().removeClass("analysisRegionSelected");
        $("#" + value.dimAnalysisRegionId).hide();

      });
      //显示传进来的灰框
      $("#" + elementId).show();
      if (obj != null) {
        $(obj).removeClass();
        $(obj).addClass("tags-item-con analysisRegionSelected");
      }
    },

    selectJson() {
      var url = this.contextUrl + "/InCalculationColumn/geeee";
      $.post(url, {}, function () {

      }, "json");
    },

    /**
     * 删除分析列表下的指定指标
     * @param parentId 父级编号 用于删除元素
     * @param inId 指标编号
     * @param analysisRegionId 分析区编号
     * @param type 指标类型  1原生指标  2派生指标
     * @param yseNoTemIn 是否临时指标
     * @param yesNoUpdateTemIn 是否修改临时指标
     */
    delAnalysisListDownIn(parentId, analysisRegionId, inId, type, yseNoTemIn, yesNoUpdateTemIn, flag, callback) {
      if (event != null) {
        event.stopPropagation();
      }
      var that = this;
      if (yseNoTemIn == "true" && yesNoUpdateTemIn == "false") {
        this.$confirm('该指标为临时指标，若删除将不可恢复，是否继续删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.clearAnalysisRegionAppoingArray(analysisRegionId, "supDimIdList");
          $.ajax({
            url: that.contextUrl + "/InMeasure/deleteName",
            method: "POST",
            cache: false,
            dataType: "json",
            data: {
              "id": inId
            },
            traditional: true, // 默认false
            async: false,
          });
          //删除当前分析区内指定的指标块以及维度saveToSpace
          $.each(this.analysisList, function (num, value) {
            if (value == null) {
              return;
            }
            if (value.id == analysisRegionId) {
              $.each(value.dimDivIdList, function (num, value) {//清空当前叠加分析下的所有维度重新绑定
                $("#" + value).remove();
              })
            }
          });
          that.clearAnalysisRegionAppoingArray(analysisRegionId, "dimDivIdList");
          $("#" + parentId).remove();
          $.each(this.analysisList, function (num, value) {//循环最外层列表找到该分析区
            if (value == null) {
              return;
            }
            if (value.id == analysisRegionId) {//找到该分析区下的指标并删除
              $.each(value.objInList, function (num, inMeasure) {
                if (inMeasure == null) {
                  return;
                }
                if (inMeasure.inMeasureUuid == inId) {
                  value.objInList.splice(num, 1);
                  return false;
                }
              })
            }
          });
          that.getInIntersectionDim(analysisRegionId);
          that.updateAnalysisCount();
        }).catch(() => {
        });
      } else {
        var list = that.clearAnalysisRegionAppoingArray(analysisRegionId, "supDimIdList", flag);
        that.clearAnalysisRegionTemDim(analysisRegionId);
        //删除当前分析区内指定的指标块以及维度saveToSpace
        $.each(this.analysisList, function (num, value) {
          if (value == null) {
            return;
          }
          if (value.id == analysisRegionId) {
            $.each(value.dimDivIdList, function (num, value) {//清空当前叠加分析下的所有维度重新绑定
              $("#" + value).remove();
            })
          }
        });
        that.clearAnalysisRegionTemDim(analysisRegionId);
        list = that.clearAnalysisRegionAppoingArray(analysisRegionId, "dimDivIdList", flag);
        $("#" + parentId).remove();
        $.each(this.analysisList, function (num, value) {//循环最外层列表找到该分析区
          if (value == null) {
            return;
          }
          if (value.id == analysisRegionId) {//找到该分析区下的指标并删除
            $.each(value.objInList, function (num, inMeasure) {
              if (inMeasure == null) {
                return;
              }
              if (inMeasure.inMeasureUuid == inId) {
                value.objInList.splice(num, 1);
                return false;
              }
            })
          }
        });
        if (flag != "modify") {
          that.getInIntersectionDim(analysisRegionId);
        }
        that.updateAnalysisCount();
      }
      if (flag == "modify") {
        if (callback) {
          callback(list);
        }
        return list;
      }
    },

    /**
     * 维度拆分的加号事件
     * @param obj 自己
     */
    plusClick(obj) {
      event.stopPropagation();
      var name = $(obj).text();
      if (name == "-") {
        this.packUpDim(obj);
        return;
      }
      var dimId = $(obj).attr("dimId");
      var level = $(obj).attr("level");
      var oldName = $(obj).attr("oldName");
      if (oldName == "") {
        oldName = $(obj).attr("dimName");
      }
      // var newDimName = $(obj).attr("dimName");
      var newId = $(obj).attr("newId");
      var inMeasureId = $(obj).attr("inMeasureId");
      var analysisDimRegionId = $(obj).attr("analysisDimRegionId");
      var inAnalysisRegionId = $(obj).attr("inAnalysisRegionId");
      var columnType = this.getDimColumnType(dimId);
      if (columnType.indexOf("TIME") != -1 || columnType.indexOf("DATE") != -1) {//如果包含time则证明是时间拆分
        var dimNameObj = this.getTimeSplitLeveDimName(oldName, level);
        var data = {
          inDimensionUuid: dimId,
          dimensionName: dimNameObj.newDimName,
          dimensionMemo: '这是维度' + oldName + "所拆分出来的" + dimNameObj.type + "维度",
          dimensionTemporary: 0,
          dimensionIsdeletetemp: 0,
          dimensionOperation: 3,
          level: dimNameObj.level,
          yesNoSplitLevel: true,
          splitLevelType: "time",
          oldName: oldName
        };
        if (level == 3) {
          this.prependDimShow(inMeasureId, analysisDimRegionId, inAnalysisRegionId, data, newId, false, obj);
        } else {
          this.prependDimShow(inMeasureId, analysisDimRegionId, inAnalysisRegionId, data, newId, true, obj);
        }
      } else {
        var dimNameObj = getUnitySplitLeveDimName(oldName, level);
        var data = {
          inDimensionUuid: dimId,
          dimensionName: dimNameObj.newDimName,
          dimensionMemo: '这是维度' + oldName + "所拆分出来的" + dimNameObj.type + "维度",
          dimensionTemporary: 0,
          dimensionIsdeletetemp: 0,
          dimensionOperation: 3,
          level: dimNameObj.level,
          yesNoSplitLevel: true,
          splitLevelType: "unity",
          oldName: oldName
        };
        if (level == 3) {
          this.prependDimShow(inMeasureId, analysisDimRegionId, inAnalysisRegionId, data, newId, false, obj);
        } else {
          this.prependDimShow(inMeasureId, analysisDimRegionId, inAnalysisRegionId, data, newId, true, obj);
        }
      }
      $(obj).parent().attr("operationLevel", "true");
      $(obj).text('-');
    },

    /**
     * 收起拆分出来的维度
     * @param obj 选中收起的级别元素
     */
    packUpDim(obj) {
      var that = this;
      var oldName = $(obj).attr("oldName");
      var dims = $("[oldName=" + oldName + "]");
      var level = parseInt($(obj).attr("level"));
      var analysisRegionId = $(obj).attr("inanalysisregionid");//指标区编号
      var analysisDimRegionid = $(obj).attr("analysisdimregionid");//选中的维度区编号
      $.each(dims, function (num, dim) {
        //清除界面的框框
        var dimLevel = parseInt($(dim).attr("level"));
        var dimAnalysisRegion = $(dim).attr("analysisdimregionid");//获取到的维度块的维度区编号
        if (dimLevel > level && analysisDimRegionid == dimAnalysisRegion) {
          var dimParent = $(dim).parent();
          var columnName = $(dimParent).attr("name");
          var custom = $(dimParent).attr("custom");
          that.delAnalysisRegionDim(columnName, custom, analysisRegionId);
          $(dim).parent().remove();
        }
      });
      $(obj).text("+");
    },
    /**
     * 获取层级拆分的新维度名称
     * @param oldName 旧维度名
     * @param level 界别
     * @returns {{newDimName: string, type: string, level: number}}
     */
    getTimeSplitLeveDimName(oldName, level) {
      var newDimName = "";
      var type = "";
      var obj = {
        newDimName: '',
        type: '',
        level: 0
      };
      if (level == 0) {
        level++;
        type = "年";
        newDimName = type + "_" + oldName;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      } else if (level == 1) {
        level++;
        type = "季度";
        newDimName = type + "_" + oldName;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      } else if (level == 2) {
        level++;
        type = "月";
        newDimName = type + "_" + oldName;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      } else if (level == 3) {
        level++;
        type = "日";
        newDimName = type + "_" + oldName;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      }
    },

    /**
     * 获取机构拆分的维度名
     * @param oldName 维度名
     * @param level 级别
     * @returns {{newDimName: string, type: string, level: number}}
     */
    getUnitySplitLeveDimName(oldName, level) {
      var newDimName = "";
      var type = "";
      var obj = {
        newDimName: '',
        type: '',
        level: 0
      };
      if (level == 0) {
        level++;
        type = "一级分行";
        newDimName = type;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      } else if (level == 1) {
        level++;
        type = "二级分行";
        newDimName = type;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      } else if (level == 2) {
        level++;
        type = "一级支行";
        newDimName = type;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      } else if (level == 3) {
        level++;
        type = "二级支行";
        newDimName = type;
        obj.newDimName = newDimName;
        obj.type = type;
        obj.level = level;
        return obj;
      }
    },
    /**
     * 获取维度列类型
     * @param dimId 维度编号
     */
    getDimColumnType(dimId) {
      var columnType = "";
      var url = this.contextUrl + "/indicatrixAnalysis/getDimType";
      $.ajax({
        type: "post",
        url: url,
        data: {dimId: dimId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.resultObj) {
            columnType = res.resultObj.toUpperCase();
          }
        }
      });
      return columnType;
    },
    /**
     * 删除指定派生指标
     * @param inId 派生指标编号
     */
    delDer(inId) {
      var that = this;
      var url = this.contextUrl + "/InMeasure/delDeriveIn";
      $.post(url, {inMeasureUuid: inId}, function (res) {
        if (res == true) {
          //that.$message("删除成功");
        } else {
          that.$message(res);
        }
      }, "json")
    },
    /**
     * 获取叠加分析列表里所有指标的交集维度
     * @param analysisRegionId 分析区编号
     */
    getInIntersectionDim(analysisRegionId) {
      var that = this;
      var url = this.contextUrl + "/indicatrixAnalysis/getInIntersectionDim";
      var inObj;
      var inList = [];
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) { //找到分析区
          //找到分析区之后找到该分析区下的第一个指标
          $.each(value.objInList, function (num, inMeasure) {
            if (inObj == undefined && value != null) {//取出整个列表里的第一个指标
              inObj = inMeasure;
            } else if (value != null) {
              inList.push(inMeasure);
            }
          })
        }
        //
      });
      $.post(url, {inObj: JSON.stringify(inObj), supAnalysisList: JSON.stringify(inList)}, function (res) {
        if (res != null) {
          var analysisDimRegionId = that.getAnalysisRegionDimId(analysisRegionId);
          that.nativeInDimSup(that.getuuid(), res, analysisDimRegionId, analysisRegionId);
        } else {
          that.dataMap = new Map();
        }
      }, "json")
    },

    /**
     * 指标三角号点击事件
     * @param parentId 父级编号
     * @param inId 指标编号
     * @param analysisRegionId 分析区编号
     * @param group 聚合方式
     * @param type 指标类型  1原生指标  2派生指标
     * @param yesNoTem 是否临时
     * @param columnName 列名
     * @param spanUuid 记录名称的spanuuid
     */
    inTriangle(parentId, analysisRegionId, inId, group, type, yesNoTem, columnName, measureName, spanUuid, tringleId) {
      this.updateInObj.inId = inId;
      this.updateInObj.analysisRegionId = analysisRegionId;
      this.updateInObj.group = group;
      this.updateInObj.yesNoTem = yesNoTem;
      this.updateInObj.id = tringleId;
      this.updateInObj.type = type;
      columnName = $("#" + spanUuid).text().replace("(", "").replace(")", "");
      this.updateInObj.columnName = columnName;
      this.updateInObj.columnNameCN = columnName;
      this.showMenu(event.clientX, event.clientY, "inMenu");
      event.stopPropagation();
    },

    /**
     * 根据点击位置显示菜单
     * @param x X轴
     * @param y Y轴
     * @param elementId 要显示的div编号
     */
    showMenu(x, y, elementId) {
      $("#" + elementId).show();
      y += document.body.scrollTop;
      x += document.body.scrollLeft;
      $("#" + elementId).css({"top": y + "px", "left": x + "px", "visibility": "visible",position: "fixed"});
      var that = this;
      $("body").bind("mousedown", function () {
        that.onBodyMouseDownHideMenu(event, elementId);
      });
    },

    /**
     * 点击菜单栏以外的部分隐藏
     * @param event 事件
     * @param elementId 隐藏得编号
     */
    onBodyMouseDownHideMenu(event, elementId) {
      if (!(event.target.id == elementId || $(event.target).parents("#" + elementId).length > 0)) {
        $("#" + elementId).hide();
        //同时隐藏指标与维度的二级菜单
        $("#switchHierarchy").hide();
        $("#measure").hide();
      }
    },

    /**
     * 初始化指标三角号的菜单背景
     */
    initMenu() {
      $(".hoverLi").hover(function () {
        $(this).css("background-color", "beige");
      }, function () {
        $(this).css("background-color", "white");
      });
    },

    /**
     * 更改指标的聚合方式
     */
    updateInGroup(group) {
      var inId = this.updateInObj.inId;//指标编号
      var analysisRegionId = this.updateInObj.analysisRegionId;//分析区编号
      var type = this.updateInObj.type;//是否为临时指标
      if (type == 2) {
        Message("派生指标不能更改聚合方式！");
        $("#inMenu").hide();
        return;
      }
      var groupOne = this.verInMeasureExist(analysisRegionId, inId);
      if (groupOne.indexOf(group) != -1) {
        Message("您选择的聚合方式在该分析区内已经有同样的指标存在。", {area: ['430px'], time: 30000, btn: ['知道了']});
        $("#inMenu").hide();
        return;
      }
      var updateGroup = analysisRegionId + inId + this.updateInObj.group;
      var that = this;
      $.each(this.analysisList, function (num, value) {//循环最外层列表找到该分析区
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {//找到该分析区下的聚合方式并更改
          $.each(value.objInList, function (num, inMeasure) {
            if (inMeasure == null) {
              return;
            }
            if (inMeasure.updateGroup == updateGroup) {
              var spanDiv = $("[updategroup='" + updateGroup + "']");
              var name = that.updateGroupDisplay(group, inMeasure.measureName);
              spanDiv.find("span").html(name);
              inMeasure.measureGroup = group;
              //return false;
            }
          })
        }
      });
      $("#inMenu").hide();
    },

    /**
     * 维度标签单击事件
     * @param obj 自己
     * @param analysisRegionId 分析区编号
     */
    dimClickSup(obj, analysisRegionId) {
      var isChecked = $(obj).attr("isChecked");
      if (isChecked == "false") {
        $(obj).removeClass();
        $(obj).addClass("tag-select tag-warning");
        $(obj).attr("isChecked", "true");
        var dimObj = {};
        dimObj.columnName = $(obj).attr("name");
        dimObj.filterType = "";
        dimObj.values = [];
        dimObj.id = $(obj).attr("dimId");
        dimObj.custom = $(obj).attr("custom");
        dimObj.dimensionName = $(obj).attr("custom");
        dimObj.filter = "";
        dimObj.filterJson = "";
        dimObj.isCheck = true;
        dimObj.dimIdAndName = $(obj).attr("dimIdAndName");
        dimObj.yesNoTem = $(obj).attr("yesNoTem");
        dimObj.yesNoSplitLevel = $(obj).attr("yesNoSplitLevel");
        dimObj.level = $(obj).attr("level");
        dimObj.splitLevelType = $(obj).attr("splitLevelType");
        dimObj.operationLevel = $(obj).attr("operationLevel");
        dimObj.oldName = $(obj).attr("oldName");
        $.each(this.analysisList, function (num, value) {//循环最外层列表找到该分析区
          if (value == null) {
            return;
          }
          if (value.id == analysisRegionId) {
            value.objDimList.push(dimObj);
          }
        })
      } else {
        $(obj).removeClass();
        $(obj).addClass("tag-select tag-warning tag-ouline");
        $(obj).attr("isChecked", "false");
        var columnName = $(obj).attr("name");
        var custom = $(obj).attr("custom");
        this.delAnalysisRegionDim(columnName, custom, analysisRegionId);
      }
      //  queryAnalysisRegionData(analysisRegionId);
    },

    /**
     * 删除指定分析区下的指定维度
     * @param columnName
     * @param custom
     * @param analysisRegionId
     */
    delAnalysisRegionDim(columnName, custom, analysisRegionId) {
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objDimList, function (num, dim) {
            if (dim == null || dim == undefined) {
              return;
            }
            if (dim.columnName == columnName && dim.custom == custom) {
              value.objDimList.splice(num, 1);
            }
          });
        }
      });
    },
    /**
     * 根据指标分析区编号获取与该区域关联的维度分析区
     * @param analistsInRegionId 分析区编号
     * @returns {string}
     */
    getAnalysisRegionDimId(analistsInRegionId) {
      var analysisDimRegionId = "";
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        if (value.inAnalysisRegionId == analistsInRegionId) {
          analysisDimRegionId = value.dimAnalysisRegionId;
        }
      });
      return analysisDimRegionId;
    },

    /**
     * 维度三角号按钮
     * @param obj 自己
     * @param analysisRegionId 分析区编号
     */
    filterBtn(obj, analysisRegionId) {
      this.dimTriangleClick.analysisRegionId = analysisRegionId;
      this.dimTriangleClick.inId = event.srcElement.parentElement.id;
      this.dimTriangleClick.dimName = $(obj).attr("name");
      this.dimTriangleClick.dimId = $(obj).attr("dimId");
      this.dimTriangleClick.sup = $(obj).attr("sup");
      this.dimTriangleClick.operation = $(obj).attr("operation");
      this.dimTriangleClick.id = $(obj).attr("id");
      if (this.verDimCheck(analysisRegionId, this.dimTriangleClick.dimId, this.dimTriangleClick.sup, this.dimTriangleClick.inId, this.dimTriangleClick.dimName) == null) {
        Message("请先选择维度！");
        $("#dimMenu").hide();
        return;
      }
      this.dimFilterBtn();
      // showMenu(event.clientX, event.clientY, "dimMenu");
      event.stopPropagation();
    },

    /**
     * 维度菜单-筛选器
     */
    dimFilterBtn() {
      var analysisRegionId = this.dimTriangleClick.analysisRegionId;
      var inId = this.dimTriangleClick.inId;
      var dimName = this.dimTriangleClick.dimName;
      var dimId = this.dimTriangleClick.dimId;
      var sup = this.dimTriangleClick.sup;
      this.nowFilterObj = this.getDimFilterJson(analysisRegionId, dimId, sup, inId, dimName);
      var columnType = this.getDimColumnType(dimId);
      this.dialogFilterVisible = true;
      $("#dimMenu").hide();
    },

    /**
     * 指标筛选器按钮
     */
    inFilter() {
      this.nowFilterObj = this.getInFilterObj(this.updateInObj.analysisRegionId, this.updateInObj.inId);
      this.inMeasureFilter = true;
      $("#inMenu").hide();
    },

    /**
     * 获取指定分析区下的指标过滤条件对象
     * @param analysisRegionId 分析区编号
     * @param inId 指标编号
     */
    getInFilterObj(analysisRegionId, inId) {
      var filterObj = {};
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objInList, function (num, inMeasure) {
            if (inMeasure == undefined) {
              return;
            }
            if (inMeasure.inMeasureUuid == inId) {
              if (inMeasure.filterJson == undefined) {
                filterObj.filterJson = "";
              } else {
                filterObj.filterJson = inMeasure.filterJson;
              }
              if (inMeasure.filter == undefined) {
                filterObj.filter = "";
              } else {
                filterObj.filter = inMeasure.filter;
              }
              if (inMeasure.filterList == undefined) {
                filterObj.filterList = "";
              } else {
                filterObj.filterList = inMeasure.filterList;
              }

            }
          })
        }
      });
      return filterObj;
    },
    /**
     * 获取指定维度的filterJson以及条件  用于反显
     * @param analysisRegionId 分析区编号
     * @param dimId 维度编号
     * @param sup 是否叠加
     * @param inId 指标编号
     * @param dimName 维度名
     * @returns {string} 返回JSON反显数据
     */
    getDimFilterJson(analysisRegionId, dimId, sup, inId, dimName) {
      var filterObj = {};
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objDimList, function (num, dim) {
            if (dim == undefined) {
              return;
            }
            if (dim.id == dimId && dim.custom == dimName) {
              filterObj.filterJson = dim.filterJson;
              filterObj.filter = dim.filter;
              filterObj.filterList = dim.filterList;
            }
          })
        }
      });
      return filterObj;
    },

    /**
     * 验证维度是否选中
     * @param analysisRegionId 分析区编号
     * @param dimId 维度编号
     * @param sup 叠加分析或并列分析
     * @param inId 指标编号
     * @param dimName 维度名
     * @returns {*} 返回对象
     */
    verDimCheck(analysisRegionId, dimId, sup, inId, dimName) {
      var obj = null;
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objDimList, function (num, dim) {
            if (dim == undefined) {
              return;
            }
            if (dim.id == dimId && dim.custom == dimName) {
              obj = dim;
            }
          })
        }
      });
      return obj;
    },

    /**
     * 设置过滤条件
     * @param analysisRegionId 分析区编号
     * @param filter 过滤条件
     * @param inId 指标编号
     * @param dimId 维度编号
     * @param sup 分析类型
     * @param filterJson 过滤条件json
     * @param filterList 过滤条件的list列表  只有常规过滤才有
     * @param dimName 维度名 因增加了拆分 维度编号可能会重复 但用维度名以及维度编号不会重复
     */
    dimSetFilter(analysisRegionId, filter, inId, dimId, sup, filterJson, filterList, dimName) {
      var that = this;
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objDimList, function (num, dim) {
            if (dim == undefined) {
              return;
            }
            if (dim.id == dimId && dim.custom == dimName) {
              if (filter.length != 0) {
                //在这添加过滤样式
                var id = that.dimTriangleClick.id;
                $("#" + id).removeClass('icon-down');
                $("#" + id).addClass('icon-filter');
                dim.filter = "(" + filter + ")";
              } else {
                //在这去掉过滤样式
                var id = that.dimTriangleClick.id;
                $("#" + id).removeClass('icon-filter');
                $("#" + id).addClass('icon-down');
                dim.filter = "";
              }
              dim.filterJson = filterJson;
              dim.filterList = filterList;
            }
          });
        }
      });
      this.queryData();
    },

    /**
     * 设置指标过滤条件
     * @param analysisRegionId 分析区编号
     * @param filter 过滤sql
     * @param inId 指标编号
     * @param filterJson 过滤JSON
     * @param filterList 过滤条件的值列表
     */
    inSetFilter(analysisRegionId, filter, inId, filterJson, filterList) {
      var that = this;
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objInList, function (num, inMeasure) {
            if (inMeasure == undefined) {
              return;
            }
            if (inMeasure.inMeasureUuid == inId) {
              if (filter.length != 0) {
                //在这添加过滤样式
                var id = that.updateInObj.id;
                $("#" + id).removeClass('icon-down');
                $("#" + id).addClass('icon-filter');
              } else {
                //在这去掉过滤样式
                var id = that.updateInObj.id;
                $("#" + id).removeClass('icon-filter');
                $("#" + id).addClass('icon-down');
              }
              inMeasure.filter = filter;
              inMeasure.filterJson = filterJson;
              inMeasure.filterList = filterList;
            }
          })
        }
      });
      this.queryData();
    },
    test(){
      handleDataManyValue()
    },
    /**
     * 查询数据
     */
    queryData() {
      this.uuidArr = new Array();
      this.uuidName = new Array();
      this.dataList = [];
      //验证列表里是否有指标和维度
      var result = this.queryVer();
      if (result.state == false) {
        Message(result.message, {area: ['430px'], time: 30000, btn: ['知道了']});
        return;
      }
      var that = this;
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        var i = 0;
        $.each(value.objInList, function (num, inMeasure) {
          if (inMeasure == null) {
            return;
          }
          i++;
        });
        if (i > 1) {
          that.supQuery(value.objInList, value.objDimList, value.id + "data",value.chartConfig);
        } else {
          that.bingLieQuery(value.objInList, value.objDimList, value.id + "data",value.chartConfig);
        }
      });
    },

    /**
     * 查询指定分析区的数据
     * @param analysisRegionId 分析区编号
     */
    queryAnalysisRegionData(analysisRegionId) {
      var analysisRegionIdData = analysisRegionId + "data";
      $("[analysisregionid='" + analysisRegionIdData + "']").html("");
      var that = this;
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          var i = 0;
          $.each(value.objInList, function (num, inMeasure) {
            if (inMeasure == null) {
              return;
            }
            i++;
          });
          if (i > 1) {
            that.supQuery(value.objInList, value.objDimList, analysisRegionIdData);
          } else {
            that.bingLieQuery(value.objInList, value.objDimList, analysisRegionIdData);
          }
        }
      });
    },

    /**
     * 添加运行指标日志
     * @param inName 指标名
     */
    addRunLog(inName) {
      var url = analysisUrl + "/pbOperLog/addOperLogRunKpi";
      $.post(url, {kpiName: inName}, function (res) {
      }, "json")
    },

    /**
     * 验证查询是否可执行
     * @returns {number}
     */
    queryVer() {
      var obj = {};
      var message = "";
      var state = false;
      $.each(this.analysisList, function (num, value) {
        var inCount = 0;
        if (value == null || value == undefined) {
          return;
        }
        $.each(value.objInList, function (numIn, inMeasure) {
          if (inMeasure == null) {
            return;
          }
          ++inCount;
          var dimCount = 0;
          if (inMeasure.measureType == 2) {
            $.each(value.objDimList, function (count, dim) {
              if (dim == null || dim == undefined) {
                return;
              }
              ++dimCount;
            })
            if (dimCount == 0) {
              message += "第{0}个分析区的指标是派生指标，不能没有维度，请选择维度！".format(num + 1);
            }
          }
        });
        var dimCount = 0;
        $.each(value.objDimList, function (count, dim) {
          if (dim == null || dim == undefined) {
            return;
          }
          ++dimCount;
        });
        if (dimCount == 0) {
          message += "第{0}个分析区没有维度，请选择维度！".format(num + 1);
        }
      });
      if (message == "") {
        state = true;
      }
      obj.state = state;
      obj.message = message;
      return obj;
    },

    /**
     * 获取指定分析区下的原生指标个数
     * @param analysisRegionId 分析区编号
     */
    getAnalysisRegionIn(analysisRegionId) {
      var i = 0;
      $.each(this.analysisList, function (num, value) {
        if (value.id == analysisRegionId) {
          $.each(value.objInList, function (num, inMeasure) {
            if (inMeasure == null || inMeasure == undefined) {
              return;
            }
            i++;
          })
        }
      });
      return i;
    },

    /**
     * 获取指定分析区下的派生指标个数
     * @param analysisRegionId 分析区编号
     */
    getAnalysisRegionDerIn(analysisRegionId) {
      var i = 0;
      $.each(this.analysisList, function (num, value) {
        if (value.id == analysisRegionId) {
          $.each(value.objInList, function (num, inMeasure) {
            if (inMeasure == null || inMeasure == undefined) {
              return;
            }
            if (inMeasure.measureType == 2) {
              i++;
            }
          })
        }
      });
      return i;
    },

    /**
     * 调用后台的叠加查询
     * @param objInList 指标列表
     * @param objDimList 维度列表
     * @param analysisRegionId 分析区编号
     * @param chartConfig 图表配置
     */
    supQuery(objInList, objDimList, analysisRegionId,chartConfig) {
      var that = this;
      var url = this.contextUrl + "/indicatrixAnalysis/supAnalysis";
      // let loadingInstance = Loading.service({fullscreen: true});
      this.theRightLoding = true
      var newInList = [];
      let filterShow = [];
      //取出每个分析区的第一个指标并删除，用该指标与其他指标进行组织sql
      $.each(objInList, function (num, indicatrixObj) {
        if (indicatrixObj == null) {
          return;
        }
        newInList.push(indicatrixObj);
        //将指标最后生成的列名、条件显示sql记录到对象里，用于后边渲染颜色
        let indicatorName = that.updateGroupDisplay(indicatrixObj.measureGroup,indicatrixObj.measureName).replace("(","").replace(")","")
      });
      $.ajax({
        type: "post",
        url: url,
        data: {inMeasures: JSON.stringify(newInList), listDim: JSON.stringify(objDimList)},
        async: true,
        dataType: "json",
        success: function (res) {
          //开始组织指标数据
          var inMeasureUuid = that.getuuid();
          var name = "";
          var listValues = [];
          var logName = "";
          $.each(newInList, function (num, value) {
            var group = that.updateGroupDisplay(value.measureGroup, value.measureAlias);
            group = group.replace("(", "").replace(")", "");
            listValues.push(group);
            name = value.measureName;
            logName += value.measureName + ",";
          });
          // loadingInstance.close()
          that.theRightLoding = false
          if (res.isError == true) {
            let dataView = {
              id:analysisRegionId,
              measureName:name,
              chartConfig:chartConfig,
              isLoad:false,
              loading:false,
              icon:'el-icon-close',
              isError:true,
              message:"分析出错，" + res.message}
            that.dataList.push(dataView)
            return;
          }
          let newAnalysisRegionId = analysisRegionId.substring(0,analysisRegionId.length - 4)
          //任务获取之后将菜单加载到界面，然后等待任务返回
          that.executeSql(res.executeSQLList,logName,newAnalysisRegionId,chartConfig)
        },
        error: function (res) {
            // loadingInstance.close();
            that.theRightLoding = false
            that.$message("分析出错，" + res.message, {time: 30000, btn: ['知道了']});
            return;
        }
      });
    },

    /**
     * 调用后台的并列分析查询
     * @param objInList 指标列表
     * @param objDimList 维度列表
     * @param analysisRegionId 分析区编号
     */
    bingLieQuery(objInList, objDimList, analysisRegionId,chartConfig) {
      var that = this;
      var url = this.contextUrl + "/indicatrixAnalysis/getInData";
      // let loadingInstance = Loading.service({fullscreen: true});
      this.theRightLoding = true
      var indicatrixObj = null;
      let filterShow = [];
      $.each(objInList, function (num, value) {
        if (value == null) {
          return;
        }
        indicatrixObj = value;
        //将指标最后生成的列名、条件显示sql记录到对象里，用于后边渲染颜色
        let indicatorName = that.updateGroupDisplay(indicatrixObj.measureGroup,indicatrixObj.measureName).replace("(","").replace(")","")
      });
      $.ajax({
        type: "post",
        url: url,
        data: {inMeasure: JSON.stringify(indicatrixObj), listDim: JSON.stringify(objDimList)},
        async: true,
        success: function (res) {
          // loadingInstance.close();
          that.theRightLoding = false
          if (res.isError == true) {
            let dataView = {
              id:analysisRegionId,
              measureName:indicatrixObj.measureName,
              chartConfig:chartConfig,
              isLoad:false,
              loading:false,
              icon:'el-icon-close',
              isError:true,
              message:"分析出错，" + res.message}
              that.dataList.push(dataView)
            return;
          }
          let newAnalysisRegionId = analysisRegionId.substring(0,analysisRegionId.length-4)
          that.executeSql(res.executeSQLList,indicatrixObj.measureName,newAnalysisRegionId,chartConfig)
        },
        error: function (res) {
          if (res.state == false) {
            // loadingInstance.close();
            that.theRightLoding = false
            that.$message("分析出错，" + res.message, {time: 30000, btn: ['知道了']});
            return;
          }
          // loadingInstance.close();
          that.theRightLoding = false
        }
      });
    },
    /**
     *  执行任务
     * @param executeSQLList 任务列表
     * @param measureName 指标名称
     * @param analysisRegionId 分析区编号
     * @param chartConfig 图表配置
     */
    executeSql(executeSQLList,measureName,analysisRegionId,chartConfig){
      let dataView = {id:analysisRegionId,measureName:measureName,chartConfig:chartConfig,isLoad:false,
        loading:true,icon:'el-icon-loading',isError:false,isShowTable:true,isShowChart:false,btnChartClass:'el-btn-no-color',btnTableClass:'el-btn-color'}
      this.dataList.push(dataView)
      let url = this.contextUrl + "/indicatrixAnalysis/executeSql";
      let data = {
        executeSQLList:executeSQLList,
        webSocketUuid:this.currentPageWebSocketUuid + this.currentPageWebSocketBusinessId,
        measureName:measureName,
        analysisRegionId:analysisRegionId
      }
      if(chartConfig != undefined){
        data.chartConfig = chartConfig
      }
      $.ajax({
        type: "post",
        url: url,
        data: {param:JSON.stringify(data)},
        async: false,
        success: function (res) {
        },
        error: function (res) {
        }
      });
    },
    /**
     * 添加特征值
     * @param uuid id
     * @param prompt 特征值
     */
    addPromptList(uuid, prompt) {
      var obj = {
        id: uuid,
        prompt: prompt
      };
      this.promptList.push(obj);
    },
    /**
     * 清空指定分析区下的指定数组
     * @param type 要清空的类型  dimDivIdList  supDimIdList
     * @param analysisRegionId 分析区编号
     */
    clearAnalysisRegionAppoingArray(analysisRegionId, type, flag) {
      if (flag == "modify") {
        return this.analysisList[0].supDimIdList;
      }
      $.each(this.analysisList, function (num, value) {
        if (value.id == analysisRegionId) {
          if (type == "dimDivIdList") {
            value.dimDivIdList = [];
          }
          if (type == "supDimIdList") {
            value.supDimIdList = [];
          }
        }
      });
    },


    /**
     * 清空当前界面所有指标、维度等内容包括数组
     */
    clearAnalysis() {
      this.oftenAnalysisId = "";
      this.oftenAnalysisName = "";
      this.dataMap = new Map();
      this.dataList = [];
      //循环指标区与维度区的映射
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        if (num == 0) {//第一个数组不清除，因为是默认的，直接清除div下边的指标和维度
          $("#analysisRegion").html("");
          $("#dimAnalysisRegion").html("");
          //$("#inAnalysisRegion").parent().remove();
          var inDom = "<div class=\"tags-item\" id=\"inAnalysisRegion\" analysisRegion='inAnalysisRegion'>" +
            "<div class=\"tags-order\" id=\"inAnalysisRegionCount\" >1</div>" +
            "<div class=\"tag-select\">" +
            "<i class=\"icon-add\">+</i>" +
            "<span style='margin-top: -5px;' onclick=\"addTempIn(this)\" analysisRegion='inAnalysisRegion'>新增临时指标</span>" +
            "</div>" +
            "<div title=\"设置阈值\" class='tags-set'>\n" +
            "<span class=\"icon iconfont\" id=\"setValueinAnalysisRegion\" style=\"color:#aeaeae;\" onclick=\"setValue('inAnalysisRegion')\">&#xe606;</span>\n" +
            "</div>"+
            "<div class='tags-del'><i class='icon-del' onclick='delAnalysisRegion(\"inAnalysisRegion\")'></i></div>" +
            "</div>";
          $("#analysisRegion").append(inDom);
          var dimDom = "<div class=\"tags-item-con\" id=\"inDimAnalysisRegion\">" +
            "<div class='tag-sele0ct'>" +
            "<i class='icon-add'>+1</i>" +
            "<span onclick='addTempDim(\"" + "inAnalysisRegion" + "\")'>新增临时维度</span>" +
            "</div>" +
            "</div>";
          $("#dimAnalysisRegion").append(dimDom);
          $("#dimAnalysisRegion").show();
          return;
        }
        if (value == null || value == undefined) {
          return;
        }
        $("#" + value.inAnalysisRegionId).parent().remove();
        $("#" + value.dimAnalysisRegionId).remove();
      });
      //数据清空完成之后给初始化数组清空
      this.analysisList = [];
      var newAnalysisRegionObj = {
        id: "inAnalysisRegion",
        objInList: [],
        objDimList: [],
        supDimIdList: [],
        dimDivIdList: []
      };
      this.analysisList.push(newAnalysisRegionObj);
      this.inRegionAndDimRegionMapping = [];
      var newMappingRegionObj = {
        inAnalysisRegionId: "inAnalysisRegion",
        dimAnalysisRegionId: "inDimAnalysisRegion"
      };
      this.inRegionAndDimRegionMapping.push(newMappingRegionObj);
    },

    /**
     * 反显常用分析对象
     * @param obj 要反显的对象
     */
    displayAnalisys(obj) {
      //先将JSON转换为数组
      this.analysisList = JSON.parse(obj.oftenindicatorsAnalysisobject).analysisList;
      this.inRegionAndDimRegionMapping = JSON.parse(obj.mapping);
      $("#inRegion").html(obj.inRegionStyle);
      $("#dimAnalysisRegion").html(obj.dimRegionStyle);
    },

    /**
     * 循环给维度增加样式
     * @param dimList 维度列表
     * @param inAnalysisRegionId 分析区编号
     * @param dimAnalysisRegionId 维度分析区编号
     */
    addDimStyle(dimList, inAnalysisRegionId, dimAnalysisRegionId) {
      var that = this;
      $.each(dimList, function (num, dim) {
        if (dim == null || dim == undefined) {
          return;
        }
        if (dim.yesNoTem == "true") {
          dim.analysisRegionId = inAnalysisRegionId;
          dim.dimAnalysisRegionId = dimAnalysisRegionId;
          that.initTemDimToFrom(dim);
        }
        if (dim.yesNoSplitLevel == "true") {
          var oldName = "测试";//到时候直接存对象里
          var dimNameObj = that.getTimeSplitLeveDimName(oldName, dim.level);
          var data = {
            inDimensionUuid: dim.dimId,
            dimensionName: dimNameObj.newDimName,
            dimensionMemo: '这是维度' + oldName + "所拆分出来的" + dimNameObj.type + "维度",
            dimensionTemporary: 0,
            dimensionIsdeletetemp: 0,
            dimensionOperation: 3,
            level: dimNameObj.level,
            yesNoSplitLevel: true,
            splitLevelType: "time",
            oldName: oldName
          };
          if (dim.level == 3) {
            //prependDimShow(inAnalysisRegionId,dimAnalysisRegionId,inAnalysisRegionId,data,newId,false,obj);
          } else {
            //prependDimShow(inMeasureId,analysisDimRegionId,inAnalysisRegionId,data,newId,true,obj);
          }
        }
        if (dim.isCheck == true) {
          //若选中状态为true，则选中并给class以及选中状态 根据dimIdAndName属性，此属性是由维度编号、维度名或列名，指标编号组成的唯一编号
          $("[dimidandname='" + dim.dimIdAndName + "']").removeClass();
          $("[dimidandname='" + dim.dimIdAndName + "']").addClass("tag-select tag-warning");
          $("[dimidandname='" + dim.dimIdAndName + "']").attr("ischecked", true);
        }
      });
    },

    /**
     * 删除指定分析区
     * @param analysisRegionId 分析区编号
     */
    delAnalysisRegion(analysisRegionId) {
      var that = this;
      if (this.inRegionAndDimRegionMapping.length == 1) {
        Message("只剩下一个分析区，不允许删除！");
        return;
      }
      //删除指定分析区下的映射关系
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.inAnalysisRegionId == analysisRegionId) {
          $("#" + analysisRegionId).parent().remove();
          $("#" + value.dimAnalysisRegionId).remove();
          that.inRegionAndDimRegionMapping.splice(num, 1);
        }
      });
      //从新整理分析区编号
      $.each(this.inRegionAndDimRegionMapping, function (num, value) {
        if (value == null) {
          return;
        }
        $("#" + value.inAnalysisRegionId + "Count").text(num + 1);
      });
      //删除指定分析区的指标以及维度
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          that.analysisList.splice(num, 1);
        }
      });
      var dimRegionId = this.inRegionAndDimRegionMapping[0].dimAnalysisRegionId;
      $("#" + dimRegionId).show();
    },

    /**
     * 鼠标移入显示指定编号的菜单
     */
    showAppointMenu(id) {
      $("#" + id).show();
    },

    /**
     *
     */
    mouseRemoveHide(id) {
      if (id == "measure") {
      }
      if (id == "switchHierarchy") {

      }
    },

    /**
     * 拆分层级
     * @param level 拆分的级别
     */
    splitSwitch(level) {
      $("#dimMenu").hide();
      var analysisRegionId = this.dimTriangleClick.analysisRegionId;//分析区编号
      var dimId = this.dimTriangleClick.dimId;//维度编号
      var operation = this.dimTriangleClick.operation; //操作 1、无操作 2、层级切换 3、层级拆分
      if (operation != 2) {
        Message("该维度不能进行层级切换！");
        return;
      }
      this.setDimColumnName(analysisRegionId, dimId, dimId, false, 0);
      var inDimObj = this.selAnalysisRegionInDim(analysisRegionId);
      var inMeasures = JSON.stringify(inDimObj.objInList);
      var listDim = JSON.stringify(inDimObj.objDimList);
      if (level == 0) {
        this.queryData();
        return;
      }
      var url = this.contextUrl + "/indicatrixAnalysis/getSplitSwitchData";
      var that = this;
      $.ajax({
        type: "post",
        url: url,
        data: {inMeasures: inMeasures, listDim: listDim, level: level, splitDimId: dimId},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            that.$message("分析出错，" + res.message, {time: 30000, btn: ['知道了']});
            return;
          }
          //获取成功之后将拿到的列放入到指定的维度columnName里。
          that.setDimColumnName(analysisRegionId, res.resultObj, dimId, true, level);
          that.queryData();
        }
      });
      /*this.uuidArr = new Array();
        var analysisRegionId = this.dimTriangleClick.analysisRegionId;//分析区编号
        var dimId = this.dimTriangleClick.dimId;//维度编号
        var analysisRegionIdData = analysisRegionId + "data";//分析区数据展示id  方便清除数据
        var inDimObj = selAnalysisRegionInDim(analysisRegionId);
        var inMeasures = JSON.stringify(inDimObj.objInList);
        var listDim = JSON.stringify(inDimObj.objDimList);
        var url = this.contextUrl + "/indicatrixAnalysis/getSplitLevelData";
        $.ajax({
            type: "post",
            url: url,
            data: {inMeasures:inMeasures,listDim:listDim,level:level,splitDimId:dimId},
            async: false,
            dataType: "json",
            success: function(res) {
                if (res.state == false) {
                    layer.close(index);
                    Message("分析出错，" + res.message,{time:30000,btn:['知道了']});
                    return;
                }
                $("[analysisregionid='" + analysisRegionIdData + "']").html("");
                //开始组织指标数据
                var inMeasureUuid = getuuid();
                var name = "";
                var listValues = [];
                var logName = "";
                $.each(inDimObj.objInList, function(num, value) {
                    var group = updateGroupDisplay(value.measureGroup,value.measureAlias);
                    group = group.replace("(","").replace(")","");
                    listValues.push(group);
                    name = value.measureName;
                    logName += value.measureName + ",";
                });
                addRunLog(logName.substring(0,logName.length-1));
                var obj = {};
                obj.id = inMeasureUuid + name;//由uuid+指标名称组成的编号
                obj.name = name;
                obj.res = res.result;//后台拿回来的数据
                obj.values = listValues;
                obj.rows = organizeSupAnaColData(res.result.columns, listValues);
                //结束组织指标数据
                var prompt = getSupAnalysisPrompt(listValues, res.result);
                addDataViewRegion(inMeasureUuid, name,analysisRegionIdData,prompt);
                addPromptList(inMeasureUuid,prompt);
                bindData(res.result, name, inMeasureUuid, "");
            }
        });*/
      //
    },

    /**
     * 对指定分析区的指定维度的columnName赋值
     * @param analysisRegionId
     * @param columnName 列
     * @param dimId 维度编号
     * @param yesNolevel 是否层级拆分
     * @param level 级别
     */
    setDimColumnName(analysisRegionId, columnName, dimId, yesNolevel, level) {
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          $.each(value.objDimList, function (num, dim) {
            if (dim.id == dimId) {
              dim.columnName = columnName;
              dim.yesNoSwitchlevel = yesNolevel;
              dim.level = level;
              dim.filter = "";
              dim.filterJson = "";
              dim.filterList = "";
            }
          })
        }
      });
    },
    /**
     * 查找到指定分析区的指标和维度
     * @param analysisRegionId 分析区编号
     */
    selAnalysisRegionInDim(analysisRegionId) {
      var obj = {};
      $.each(this.analysisList, function (num, value) {
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {
          obj.objInList = value.objInList;
          obj.objDimList = value.objDimList;
        }
      });
      return obj;
    },

    /**
     * 删除指定分析区下的临时维度
     * @param analysisRegionId 分析区编号
     * @param dimId 维度编号
     * @param dimDivId 临时维度的div编号
     * @param yesNoUpdateTemDim 是否修改临时维度
     */
    delTemDim(analysisRegionId, dimId, dimDivId, yesNoUpdateTemDim) {
      var that = this;
      if (event != null) {
        event.stopPropagation();
      }
      if (yesNoUpdateTemDim == "false") {
        this.$confirm('该维度为临时维度，若删除将不可恢复，是否继续删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //清除指定分析区下的指定维度
          $.each(that.analysisList, function (num, value) {
            if (value == null) {
              return;
            }
            if (value.id == analysisRegionId) {
              $.each(value.objDimList, function (num, dim) {
                if (dim == null || dim == undefined) {
                  return;
                }
                if (dim.id == dimId) {
                  value.objDimList.splice(num, 1);
                }
              })
            }
          });
          $.each(that.temDimList, function (num, value) {
            if (dimId == value.dimId) {
              //that.temDimList.splice(num,1);
              that.inDimList.splice($.inArray(value.temDimObj.dimensionName, that.inDimList), 1)
            }
          });
          $("#" + dimDivId).remove();
          //清除临时维度 在map中的数据
          that.dataMap.delete(dimId);
        }).catch(() => {
        });
      } else {
        $.each(that.analysisList, function (num, value) {
          if (value == null) {
            return;
          }
          if (value.id == analysisRegionId) {
            $.each(value.objDimList, function (num, dim) {
              if (dim == null || dim == undefined) {
                return;
              }
              if (dim.id == dimId) {
                value.objDimList.splice(num, 1);
              }
            })
          }
          if (value.id == "inAnalysisRegion") {
            $.each(value.objDimList, function (num, dim) {
              if (dim == null || dim == undefined) {
                return;
              }
              if (dim.id == dimId) {
                value.objDimList.splice(num, 1);
              }
            })
          }
          $("#" + dimDivId).remove();
          //清除临时维度 在map中的数据
          that.dataMap.delete(dimId);
        });
      }
    },

    /**
     * 清除指定分析区下的所有临时维度
     * @param analysisRegionId 分析区编号
     */
    clearAnalysisRegionTemDim(analysisRegionId) {
      var that = this;
      //清除指定分析区下的指定维度
      $.each(that.analysisList, function (num, value) {//先循环分析区
        if (value == null) {
          return;
        }
        if (value.id == analysisRegionId) {//对比id是否一样
          $.each(value.objDimList, function (num, dim) {//循环分析区下的维度列表
            if (dim == null || dim == undefined) {
              return;
            }
            if (dim.yesNoTem == true || dim.yesNoTem == "true") {//判断是否为临时维度
              value.objDimList.splice(num, 1);//清除数组下的维度
            }
          })
        }
      });
      $.each(that.temDimList, function (num, value) {//清理临时维度列表
        if (value != undefined && analysisRegionId == value.analysisRegionId) {
          $("#" + value.dimDivId).remove();
          that.temDimList.splice(num, 1);
        }
      });
    },

    /**
     * 修改临时维度
     * @param dimId 维度编号
     * @param dimDivId 维度div编号
     * @param inAnalysisRegionId 分析区编号
     */
    updateTemDim(dimId, dimDivId, inAnalysisRegionId) {
      var that = this;
      var obj = this.getAnalysisRegionInAndDim(inAnalysisRegionId);
      var url = this.contextUrl + "/indicatrixAnalysis/getInRelDimCol";
      $.ajax({
        type: "post",
        url: url,
        data: {objInList: JSON.stringify(obj.objInList), supDimIdList: JSON.stringify(obj.supDimIdList)},
        async: false,
        dataType: "json",
        success: function (res) {
          if (res.state == false) {
            that.$message(res.message);
          }
          var resultObj = res.resultObj;
          sessionStorage.setItem("resultObj", JSON.stringify(resultObj));
        }
      });
      event.stopPropagation();
      var temDimObj = null;
      $.each(that.temDimList, function (num, value) {
        if (dimId == value.dimId) {
          temDimObj = value.temDimObj;
        }
      });
      if (temDimObj == null) {
        return;
      }
      sessionStorage.setItem("temDimObj", JSON.stringify(temDimObj));
      that.dialogEdittemdimVisible = true
      this.nowAnalysisRegionId = temDimObj.analysisRegionId
      this.nowDimAnalysisRegionId = temDimObj.dimAnalysisRegionId
      this.dimId = temDimObj.id
      this.dimDivId = dimDivId
    },

    /**
     * 将指定分析区的数据保存到空间
     * @param analysisRegionId 分析区编号
     */
    saveToSpace(uuid, name) {
      var formUrl = "../../content/indicatrixAnalysis/saveData.html?id={0}&name={1}".format(uuid, name);
      this.openLayer('300px', '230px', formUrl, '保存数据', 2);
      /*        analysisRegionId = analysisRegionId.substring(0,analysisRegionId.length-4);
        var url = this.contextUrl + "/indicatrixAnalysis/saveToSpace";
        var objInList;
        var objDimList;
        $.each(this.analysisList,function(num,value) {//找到分析区内的指标和维度编号
            if(value == null) {
                return;
            }
            if(value.id == analysisRegionId){
                objInList = value.objInList;
                objDimList = value.objDimList;
            }
        });
        $.post(url,{inMeasures:JSON.stringify(objInList),listDim:JSON.stringify(objDimList)},function(res) {

        },"json")*/
    },
    //endregion 新分析方式代码区

    //region 公共方法

    /**
     * 打开layer窗口
     * @param width 宽度
     * @param height 高度
     * @param url url
     * @param title 标题
     * @param type 类型 一般为2
     */
    openLayer(width, height, url, title, type) {
      layer.open({
        type: type,
        title: title,
        shadeClose: false,
        shade: [0],
        resize: false,
        maxmin: true, //开启最大化最小化按钮
        area: [width, height],
        content: encodeURI(url)
      });
    },

    /***
     *判断是否包含特殊字符
     *判断后的个数放到全局变量中
     */
    determineWhetherTIsIncluded(keys) {
      this.number = 1;
      if (keys.indexOf("]+[") > 0) {
        var a = (keys.split("]+[")).length - 1;
        this.number = this.number + a;
      }
      if (keys.indexOf("]-[") > 0) {
        var a = (keys.split("]+[")).length - 1;
        this.number = this.number + a;
      }
      if (keys.indexOf("]*[") > 0) {
        var a = (keys.split("]+[")).length - 1;
        this.number = this.number + a;
      }
      if (keys.indexOf("]/[") > 0) {
        var a = (keys.split("]+[")).length - 1;
        this.number = this.number + a;
      }
    },
    /**动态增加临时数据*/
    addTemporaryDataDynamically(res) {
      var that = this;
      var numberss = 0;
      //判断that.dataMap是否为空如果为空直接跳过 当部位空是判断临时维度主键是否都在数据中
      //全部在的情况xia显示临时维度 否则不显示此维度
      if (that.dataMap.size > 0) {
        //遍历map
        var aa = that.dataMap.size;
        var sizes = 0;
        that.dataMap.forEach(function (value, key, map) {

          if (sizes == aa) {
            return;
          } else {
            sizes = sizes + 1;
          }

          var ss = value;
          that.determineWhetherTIsIncluded(ss.columnName);
          $.each(res, function (num, value) {
            if (ss.columnName.indexOf(value.inDimensionUuid) >= 0) {
              var a = (ss.columnName.split(value.inDimensionUuid)).length - 1;
              numberss = numberss + a;
            }
          });

          //当临时维度中的主键可以对应上时调用临时指标加载方法
          if (that.number == numberss) {
            that.initTemDimToFrom(ss);
            numberss = 0;
          } else {
            that.dataMap.delete(key);
            numberss = 0;
          }
        });
      }
    },

    /**
     * 刷新ztree树
     */
    refreshTree() {

    },

    /**
     * 图表展示方式修改事件
     * @param itemobj divId
     * @param select 选中的类型
     */
    changeChartType(itemobj, selectBtn, btnType) {
      var selectVal = $("#data-select" + itemobj).val();
      if ($(selectBtn).hasClass("active")) {
        if ((btnType == 0 && (!$("#result-type-chart" + itemobj).hasClass("active"))) || (btnType == 1 && (!$("#result-type-table" + itemobj).hasClass("active")))) {
          return;
        } else {
          $(selectBtn).removeClass("active");
        }
      } else {
        $(selectBtn).addClass("active");
      }

      if ($("#result-type-table" + itemobj).hasClass("active") && $("#result-type-chart" + itemobj).hasClass("active")) {
        selectVal = "1";
      } else if ($("#result-type-table" + itemobj).hasClass("active") && (!$("#result-type-chart" + itemobj).hasClass("active"))) {
        selectVal = "2";
      } else if ((!$("#result-type-table" + itemobj).hasClass("active")) && $("#result-type-chart" + itemobj).hasClass("active")) {
        selectVal = "3";
      } else {
        return;
      }

      if (selectVal == '1') {
        $("#table-view_" + itemobj).attr("itemobj", itemobj);
        $("#chartFrameDiv_" + itemobj).attr("itemobj", itemobj);
      } else if (selectVal == '2') {
        $("#table-view_" + itemobj).attr("itemobj", itemobj);
        $("#chartFrameDiv_" + itemobj).attr("itemobj", "");
      } else if (selectVal == '3') {
        $("#table-view_" + itemobj).attr("itemobj", "");
        $("#chartFrameDiv_" + itemobj).attr("itemobj", itemobj);
      }
      this.changeBtnType(selectVal, itemobj);
      $("#data-select" + itemobj).val(selectVal);
    },

    changeBtnType(selectVal, itemobj) {
      if (selectVal == '1') {
        $("#result-type-table" + itemobj).addClass("active");
        $("#result-type-chart" + itemobj).addClass("active");
      } else if (selectVal == '2') {
        $("#result-type-table" + itemobj).addClass("active");
        $("#result-type-chart" + itemobj).removeClass("active");
      } else if (selectVal == '3') {
        $("#result-type-table" + itemobj).removeClass("active");
        $("#result-type-chart" + itemobj).addClass("active");
      }
    },

    /**
     * 显示特征值
     * @param uuid 编号
     */
    featuresValue(uuid, name) {
      var prompt = "";
      $.each(this.promptList, function (num, value) {
        if (value.id == uuid) {
          prompt = value.prompt;
        }
      });
      layer.confirm(prompt, {title: "统计量", btn: ['确定']});
    },

    /**
     * 添加常量窗体
     * @param uuid 数据展示区域的div编号
     * @param name 指标名称
     */
    addConstantForm(uuid, name, prompt) {
      var formUrl = "../../content/indicatrixAnalysis/constant.html?uuid={0}&name={1}&promptList={2}".format(uuid, name, JSON.stringify(prompt));
      this.openLayer('360px', '280px', formUrl, '新增常量', 2);
    },

    /**
     * 添加常量
     * @param uuid 数据展示区域的div编号
     * @param name 指标名称
     * @param columnName 列名
     * @param value 指标值
     */
    addConstant(uuid, name, columnName, value) {
      var divId = uuid + name;
      var data = this.getChartDataConstant(divId, columnName, value);
      var json = this.getChartXYJSONConstant(divId, columnName);
      if (json == null) {
        return;
      }
      var cw = document.getElementById("chartFrame_" + uuid);
      cw.src = "../../lib/chart-editor/index.html";
      cw.onload = function () {
        cw.contentWindow.loadChart(data, json, false);
      }
    },
    closeAddderiveinDialog() {
      this.dialogAddderiveinVisible = false;
    },
    closeEdittemdimDialog() {
      this.dialogEdittemdimVisible = false;
    },
    closeFilterDialog() {
      this.dialogFilterVisible = false;
    },
    closeSaveAnalysisDialog() {
      this.dialogsSaveAnalysisVisible = false;
    },
    closeInmeasuerFilter(){
      this.inMeasureFilter = false
    },
    getCurrentLogin(){
      return this.currentLoginUser;
    },
    jump(index){
      this.$refs.mySwiper.swiper.slideTo(index, 500, false);//切换到第一个slide，速度为0.5秒
    },
    switchDivStyle(refId,analysisRegionId){
      //根据返回的结果id找到数组里面的数据进行修改
      for(let i = 0; i < this.dataList.length;i++){
        //如果相等则修改数据
        if(this.dataList[i].id == analysisRegionId){
          if(refId.indexOf("btnTable") != -1){
            this.dataList[i].isShowTable = true
            this.dataList[i].isShowChart = false
            this.dataList[i].btnChartClass = 'el-btn-no-color'
            this.dataList[i].btnTableClass = 'el-btn-color'
          }
          else if(refId.indexOf("btnChart") != -1){
            this.dataList[i].isShowTable = false
            this.dataList[i].isShowChart = true
            this.dataList[i].btnChartClass = 'el-btn-color'
            this.dataList[i].btnTableClass = 'el-btn-no-color'
          }
        }
      }
      //根据分析区编号找到分析区的对象，修改分析区对象的属性值改变现实表格还是图表，同时修改div样式
    },
    /**\
     *
     *设置背景颜色
     * @param params aggrid回调参数
     * @param regionAnalysiId 自定义参数
     * @returns {undefined|{"background-color": (string), color: *}|{"background-color": *, color: *}}
     */
    setRowColor(params,regionAnalysiId){
      let thresholdValueRel
      for(let i = 0; i < this.analysisList.length;i++){
        if(this.analysisList[i].id === regionAnalysiId){
          thresholdValueRel = this.analysisList[i].thresholdValueRelObj
        }
      }
      if(thresholdValueRel && thresholdValueRel.thresholdValue.thresholdValueType == 1){
        //判断颜色等信息
        return handleDataSingleValue(params.data,thresholdValueRel)
      }
    },
    setValue(analysisRegionId){
      //设置传到设置阈值界面的对象
      this.setThreasholdValueObj = {}
      this.setThreasholdValueObj.analysisRegionId = analysisRegionId
      //找到该分析区最后会产生的列名
      let columns = []
      for(let i = 0;i < this.analysisList.length;i++){
        if(this.analysisList[i].id === analysisRegionId){
          //找到该分析区下边的指标列表和维度列表
          //设置是否反显，如果反显则证明已经有值了。
          this.setThreasholdValueObj.isDisplay = false
          let objInList = this.analysisList[i].objInList
          let objDimList = this.analysisList[i].objDimList
          objInList.forEach((inObj) => {
            let name = this.updateGroupDisplay(inObj.measureGroup,inObj.measureName).replace("(","").replace(")","")
            columns.push(name)
          })
          objDimList.forEach((dimObj) => {
            columns.push(dimObj.dimensionName)
          })
          //如果该对象有值则说明是反显，将反显的对象传到那个界面
          if(this.analysisList[i].thresholdValueRelObj){
            this.setThreasholdValueObj.isDisplay = true
            this.setThreasholdValueObj.thresholdValueRelObj = this.analysisList[i].thresholdValueRelObj
          }
        }
      }
      this.setThreasholdValueObj.columns = columns
      this.thresholdValueDialog = true
    },
    changeCellColor(params,regionAnalysisId,thresholdValueRel){
      if(thresholdValueRel){
        //进行特殊处理
        return handleDataManyValue(params,thresholdValueRel)
      }
      else{
        return params.value
      }
    },
    /**
     * 设置阈值关联
     * @param data 阈值关联对象
     * @param analysisRegionId 分析区编号
     */
    inSetThresholdValue(data,analysisRegionId){
      //根据分析区编号找到分析区对象，给对象赋值
      for(let i = 0; i < this.analysisList.length;i++){
        if(this.analysisList[i].id === analysisRegionId){
          this.analysisList[i].thresholdValueRelObj = data
          break
        }
      }
      $("#setValue" + analysisRegionId).css("color","#3D80C4")
    },
    clearThresholdValue(analysisRegionId){
      //根据分析区编号找到分析区对象，给对象赋值
      for(let i = 0; i < this.analysisList.length;i++){
        if(this.analysisList[i].id === analysisRegionId){
          this.analysisList[i].thresholdValueRelObj = undefined
          break
        }
      }
      $("#setValue" + analysisRegionId).css("color","#aeaeae")
    },
    packUpClick(){
      //更改表格高度
      this.tableHeight = "height:80%"

    },
    openDisplay(){
      //更改表格高度
      this.tableHeight = "height:60%"
    }
  }
}
/**
 * Created by Chuang on 2018-6-13.
 */

//region 日志公共参数
var module = "指标分析";
var add = "新增";
var edit = "编辑";
var del = "删除";
var see = "查看";

</script>
<style scoped>
>>>.left-side {
  box-shadow: rgba(63, 68, 77, 0.07) 15px 0px 15px 0px;
}

>>>.left-side .el-tabs__active-bar {
  background-color: transparent;
}

>>>.left-side .el-tabs__nav-scroll {
  border-radius:25px;
  height:92%;
  background: #f6f6f6;
}

>>>.left-side i {
  padding: 5px;
}

>>>.left-side .el-tabs__header {
  position: fixed;
}

>>>.left-side .el-tabs__content {
  margin-left: 40px
}
.el-tabs__item.is-active {
  background: #ffffff;
  border-top: 2px solid #dfe4ed;
  border-bottom: 2px solid #dfe4ed;
}

>>>.side-footer {
  width: 38px;
/*  height: 40px;*/
  bottom: 50px;
  position: fixed;
  padding: 82px 3px;
/*  left: 67px;*/
}

>>>.side-footer .el-button {
  padding: 0px;
  font-size: 20px;
}

>>>.tab-indicator {
  writing-mode: tb-rl;
  -webkit-writing-mode: vertical-rl;
  padding: 10px 0px;
  font-size: 14px;
  font-weight: bold;
  color: #9B4C4C;
}

>>>.tab-common {
  writing-mode: tb-rl;
  -webkit-writing-mode: vertical-rl;
  padding: 10px 0px;
  font-size: 14px;
  font-weight: bold;
  color: #514559;
}

>>>.el-tabs__item {
  padding: 0px;
  height: auto;
}

>>>.pull-right {
  float: right;
}

>>>.tag-select {
  font-size: 0;
  display: inline-block;
  height: 21px;
  line-height: 21px;
  border: 1px dashed transparent;
  border-radius: 2px;
  /*margin-right: 9px;*/
  /*margin-bottom: 9px;*/
  margin: 3px;
  cursor: pointer;
  padding: 0 4px;
}

>>>.tag-select:hover {
  border-color: #9D9D9D;
}

>>>.tag-select i {
  margin-top: -6px;
  display: inline-block;
  width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-position: center;
  font-size: 12px;
  font-style: normal;
}

>>>.tag-select i.icon-close {
  background-image: url("../styles/icons/close.png");
  border-right: 1px solid #DCE6ED;
  padding-left: 4px;
  float: left;
  margin-top: 3px;
}

>>>.tag-select i.icon-edit {
  background-image: url("../styles/icons/icon-tools-3.png");
  border-right: 1px solid #DCE6ED;
  padding-left: 4px;
  margin-top:-8px;
}

>>>.tag-select i.icon-down {
  background-image: url("../styles/icons/sanjiao.png");
  float: right;
  margin-top: 3px;
}

>>>.tag-select i.icon-filter {
  background-image: url("../styles/icons/filter.png");
}

>>>.tag-select i.icon-clock {
  margin-top: -2px;
  background-image: url("../styles/icons/linshi.png");
}

>>>.tag-select i.icon-add {
  color: #9C9C9C;
  line-height: 15px;
}

>>>.tag-info.active > span {
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #759EEC;
  letter-spacing: 0;
}

>>>.tag-select span {
  display: inline-block;
  height: 21px;
  font-family: PingFangSC-Regular;
  font-size: 12px;
  letter-spacing: 0;
  color: #9D9D9D;
  min-width: 50px;
}

>>>.tag-select i, .tag-select span {
  vertical-align: middle;
}

>>>.tag-default {
  background: #BDBDBD;
}

>>>.tag-info {
  background: #E1E9F8;
}

>>>.tag-warning {
  background: #FBD694;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  border-radius: 15px !important;
}

>>>.tag-default span,
>>>.tag-warning span,
>>>.tag-info span {
  color: #434343;
}

>>>.tag-ouline {
  background-color: #fff;
}

>>>.tag-warning.tag-ouline {
  color: #FCCC77;
  border-color: #FCCC77;
  border-style: solid;

  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  border-radius: 15px !important;
}

>>>.tag-warning.tag-ouline:hover {
  border-style: dashed;
}

>>>.tag-warning.active > span {
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #F3A71F;
  letter-spacing: 0;
}

>>>.tag-warning.active .icon-clock {
  background-image: url("../styles/icons/linshiweidu.png");
}

>>>.tag-gray {
  background-color: #edeef2;
  padding-top: 0;
  padding-bottom: 0;
}

>>>.tag-gray .icon-down {
  border-left: 1px solid #e8e9ec;
  border-right: 1px solid #e8e9ec;
  background-image: url("../styles/icons/icon-down-blue.png") !important;
}

>>>.tag-gray span {
  color: #3d84c8;
}

>>>.tag-gray:hover,
>>>.tag-info:hover,
>>>.tag-info.active {
  border-color: #749EEC;
}

>>>.tag-warning:hover,
>>>.tag-warning.active {
  border-style: dashed;
}
>>>span.title{
  display:block;
  width:100px;
  height:30px;
  position:relative;
  top:-15px;
  text-align: center;
  background: white;
}
>>>.recommendPage .swiper-container{
  position: relative;
  height: 85vh;
/*  width: 100%;
  height: 100%;*/
}
>>>.recommendPage .swiper-container .swiper-slide{
  width: 100%;
  font-size: 16px;
  text-align: center;
}
>>>div.aaa{
  width:100%;
  height:100%;
  padding:5px 30px;
  border:2px solid #CCCCCC;
}
>>>.ivu-layout-content{
  width:650px;
}
>>>.el-menu-item {
  float: left;
  height: 40px;
  line-height: 40px;
  margin: 0;
}
>>>.el-tabs--left .el-tabs__nav-wrap.is-left::after{
  height:92%
}
.el-submenu__title{
  border-bottom: 2px solid transparent;
}
.is-active{
  border-bottom: 2px solid #ffffff;
}
>>>.el-btn-no-color{
  width: 40px;
  float: left;
  border: solid 1px #E0E0E0;
  height: 26px;
  margin: 2px;
  cursor: pointer;
}
>>>.el-btn-color{
  background: aliceblue;
  width: 40px;
  float: left;
  border: solid 1px #E0E0E0;
  height: 26px;
  margin: 2px;
  cursor: pointer;
}
>>>.btn-div{
  margin: 1px;
  height: 36px;
}
>>>.iconfont-div{
  margin-left: 10px;
  font-size: 22px;
  margin-top: -3px;
  float: left;
}
>>>.background-color{
  background-color: aliceblue;
}
>>>.ag-header-cell{
  background-color: #f8f8f9;
}
>>>.ag-header-viewport{
  border-bottom: 1px solid #e6e6e6;
}
#app .app-container>>>.ag-row-odd{
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  border-top: 1px solid #e6e6e6;
}
#app .app-container>>>.ag-root{
  border: 1px solid #e6e6e6;
}
.app-container>>>.ag-theme-balham .ag-cell{
  line-height: 40px;
  text-align: left;
}
#dataView{height: 100%;overflow: auto}
</style>
