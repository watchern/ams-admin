<template>
    <el-container>
        <el-aside class="left-tree">
            <input type="text" class="form-control" id="search" placeholder="搜索">
            <div class="panel panel-default">
                <div class="panel-body" style="height: 500px;overflow-y: auto">
                    <tree :nodes="inTreeNodes" :setting="inTreeSetting" @onCreated="inTreeCreate"/>
                </div>
            </div>
        </el-aside>
        <el-container>
            <el-main>
                <el-form ref="form" :model="form" >
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="指标名称">
                                <el-input v-model="form.inName" id="inName" placeholder="请输入指标名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" v-if="addType != 2">
                            <el-form-item label="所属分类">
                                <el-select v-model="form.folderName" placeholder="请选择所属分类" style="width: 100%" ref="folderName">
                                    <el-option :value="form.folderName" :label="form.folderName" style="width: 100%;height:200px;overflow: auto;background-color:#fff">
                                        <publictree :setFolderIdAndName="setFolderIdAndName" :type="2"></publictree>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="指标公式" id="gongShi">
                        <el-button type="primary" size="mini" @click="appendText('+')">+</el-button>
                        <el-button type="primary" size="mini" @click="appendText('-')">-</el-button>
                        <el-button type="primary" size="mini" @click="appendText('*')">*</el-button>
                        <el-button type="primary" size="mini" @click="appendText('/')">/</el-button>
                        <el-button type="primary" size="mini" @click="appendText('(')">(</el-button>
                        <el-button type="primary" size="mini" @click="appendText(')')">)</el-button>
                        <textarea id="code" ref="code" v-model="form.code"></textarea>
                    </el-form-item>
                    <el-form-item label="指标说明">
                        <el-input type="textarea" id="inMemo" v-model="form.inMemo"></el-input>
                    </el-form-item>
                </el-form>
            </el-main>
            <el-footer>
                <div style="float: right">
                    <el-button type="primary" @click="saveDimension">保存</el-button>
                    <el-button type="primary" @click="closeDialog">取消</el-button>
                </div>
            </el-footer>
        </el-container>
        <el-dialog append-to-body title="选择聚合方式" :visible.sync="groupDialogVisible" width="30%" >
            <el-button-group >
                <el-button type="primary" @click="addGroup('sum'),groupDialogVisible=false">合计</el-button>
                <el-button type="primary" @click="addGroup('count'),groupDialogVisible=false">计数</el-button>
                <el-button type="primary" @click="addGroup('avg'),groupDialogVisible=false">平均值</el-button>
                <el-button type="primary" @click="addGroup('max'),groupDialogVisible=false">最大值</el-button>
                <el-button type="primary" @click="addGroup('min'),groupDialogVisible=false">最小值</el-button>
                <el-button type="primary" @click="addGroup('distinct'),groupDialogVisible=false">差异计数</el-button>
            </el-button-group>
        </el-dialog>
        <!-- <div id="group" class="menuDemo" style="display: block; top: 15px; left: 314px; visibility: visible;">
            <ul id="menuShow" class="dropdown-menu">
                <li class="hoverLi" id="m_sum" onclick="addDeriveIn.updateGroup('sum')" style="background-color: white;">总计</li>
                <li class="hoverLi" id="m_count" onclick="addDeriveIn.updateGroup('count')" style="background-color: white;">计数</li>
                <li class="hoverLi" id="m_max" onclick="addDeriveIn.updateGroup('max')">最大值</li>
                <li class="hoverLi" id="m_min" onclick="addDeriveIn.updateGroup('min')">最小值</li>
                <li class="hoverLi" id="m_avg" onclick="addDeriveIn.updateGroup('avg')">平均值</li>
                <li class="hoverLi" id="m_distinct" onclick="addDeriveIn.updateGroup('distinct')">差异计数</li>
            </ul>
        </div> -->
    </el-container>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'
// 引入全局实例
import CodeMirror from 'codemirror'
// 核心样式
import 'codemirror/lib/codemirror.css'
// 引入主题后还需要在 options 中指定主题才会生效
import 'codemirror/theme/cobalt.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/vue/vue.js'
import {fuzzySearch} from '../../lib/ztree/ext/fuzzysearch.js'

export default {
  name: 'addderiveIn',
  props: ['type','addType','inMeasureUuid','parentUuid','nowAnalysisRegionId'],
  components: {
    tree: resolve => require(["../../lib/ztree/ztree.vue"], resolve),
    publictree: resolve => require(["../../views/indicator/publictree.vue"], resolve)
  },
  data() {
    return {
        form: {
          inName: '',
          folderName: '',
          code: '',
          inMemo: ''
        },
        inTree: null,
        inTreeNodes: null,
        inTreeSetting: null,
        /**
         * CodeMirror对象
         * @type {null}
         */
        editor: null,

        /**
         * 修改时的对象
         * @type {null}
         */
        editData: null,

        /**
         * 存储指标编号
         * @type {Array}
         */
        listInId: [],

        /**
         * 所属分类编号
         * @type {string}
         */
        treeIds: "",

        /**
         * 作用域编号
         * @type {string}
         */
        pbScopeUuid: "",

        /**
         * 节点路径
         * @type {string}
         */
        treePath: "",

        /**
         * 验证当前人所选的机构所属 1、全行、2机构、3个人
         */
        auditorOrauditorgan: null,

        /**
         * 记录每次拖拽的派生指标相关信息
         * @type {{}}
         */
        derObj: {indicatrixId:'',indicatrixName:'',res:{}},
        gindicatrixId: null,
        gindicatrixName: null,
        ginduuid: null,
        //聚合方式页显示
        groupDialogVisible: false,
        isOrgManager: sessionStorage.getItem('isOrgManager'),
        isInManager: sessionStorage.getItem('isInManager'),
        analysisRegionId:this.nowAnalysisRegionId
    }
  },
  mounted() {
    this.initData()
    this.initIndicatrixZtree()
  },
  created() {

  },
  methods: {
    inTreeCreate(inTree){
        var that = this
        this.inTree = inTree
        this.inTree.expandAll(true)
        fuzzySearch(this.inTree,'#search',null,false)

        var node = this.inTree.getNodes() //可以获取所有的父节点
        var nodes = this.inTree.transformToArray(node) //获取树所有节点
        for(var i = 0;i < nodes.length; i++){
            if(nodes[i].indicatrixType == "2" || nodes[i].indicatrixType == "4" || nodes[i].indicatrixType == "3"){
                this.inTree.hideNode(nodes[i])
            }
        }
        if(this.inMeasureUuid != null && this.inMeasureUuid != "") {//判断该id是否为空 如果为空则是新增  反之编辑
            var urlVal = this.contextUrl + "/InMeasure/validationRel"
            $.post(urlVal,{list:this.editor.getValue(),inMeasureId:""},function(res) {
                that.getDimRelIn(res)
            },"json")
        }
    },
    /**
     * 初始化数据
     */
    initData() {
        if(this.inMeasureUuid == undefined) {//判断该id是否为空 如果为空则是新增  反之编辑
            //$("#folderName").attr("value",decodeURI(this.param.treeName))
        }
        else{
            var inMeasureUuid = decodeURI(this.inMeasureUuid)
            this.antiDisplayIndicatrixData(inMeasureUuid)
        }
        this.editor = CodeMirror.fromTextArea(this.$refs.code, {
            lineNumbers: true,     // 显示行数
            indentUnit: 4,         // 缩进单位为4
            styleActiveLine: true, // 当前行背景高亮
            matchBrackets: true,   // 括号匹配
            mode: 'htmlmixed',     // HMTL混合模式
            lineWrapping: true    // 自动换行
        })
        var that = this
        this.editor.on("change",function(instance,changeObj) {
            that.codeMirrorValueEdit(instance,changeObj)
        })
    },
    /**
     * 初始化指标树
     */
     initIndicatrixZtree() {

        var urlOne = this.contextUrl + "/InFolder/getIndicatrixTree"
        var that = this
        $.post(urlOne,{},function(res) {
            var zNodes = res
            var setting = {
                check: {
                    enable: false,
                    chkboxType: {"Y":"s", "N":"ps"},
                    drag: {
                        autoExpandTrigger: true,
                        prev: true,
                        inner: true,
                        next: true
                    },
                },
                data : {
                    key:{
                        name:"name"
                    },
                    simpleData : {
                        enable : true,
                        idKey:"id",
                        pIdKey:"pid"
                    }
                },
                async: {
                    enable: false
                },
                callback : {
                    beforeDrag: that.beforeDrag,
                    beforeDrop: that.beforeDrop,
                    onDrop: that.onDrop,
                    onAsyncSuccess: that.onAsyncSuccess,
                    onAsyncError: that.onAsyncError,
                    beforeAsync: that.beforeAsync
                },
                view: {
                    selectedMulti: false,
                    fontCss: that.getFontCss
                },
                edit: {
                    enable: true,
                    showRemoveBtn: false,
                    showRenameBtn: false
                }
            }
            //初始化树
            that.inTreeSetting = setting
            that.inTreeNodes = zNodes
        },"json")
    },

    /**
     * 树单击事件
     * @param e 事件
     * @param treeId 树编号
     * @param treeNode 点击节点
     */
    onclick(e, treeId, treeNode) {
        this.inTree.expandNode(treeNode)
    },
    /**
     * 保存指标
     */
    saveDimension() {
        if(this.inMeasureUuid == undefined || this.inMeasureUuid === "") {//判断该id是否为空 如果为空则是新增  反之编辑
            this.addIn()
        }
        else  {
            this.editIn()
        }
    },

    /**
     * 保存指标
     */
    addIn() {
    	if(!this.verIsNoNull()){
            return
        }
        var uuid = this.getuuid()
        var measureAlias = $("#inName").val()
        var inName = $("#inName").val()
        var reg = new RegExp("^[A-Za-z\u4e00-\u9fa5]+$")
        if(!reg.test(inName)){
        	this.$message("请输入合法名称")
        	return
        }
        var data = {
            inMeasureUuid: uuid,
            measureName: inName,
            measureType: decodeURI(this.type),
            inFolderUuid: this.treeIds,
            measureMemo: $("#inMemo").val(),
            measureGroup: '',
            measureFormula: this.editor.getValue(),
            tableUuid: '',
            isDelete: 0,
            createTime: "",
            updateTime: "",
            createPersonUuid: "",
            createPersonName: "",
            measurePath: this.treePath,
            measureAlias:inName,
            pbScopeUuid:this.pbScopeUuid
        }
        var urlVer = this.contextUrl + "/InMeasure/verMeasureAlias"
        var that = this
        if(this.addType == 1){
            $.post(urlVer,{measureAlias:measureAlias},function(res) {
                if(res.state == true){
                    var url = that.contextUrl + "/InMeasure/insertDeriveIn"
                    $.post(url,{inMeasurem:JSON.stringify(data)},function(res) {
                        if(res.state == true) {
                            var info = "新增了派生指标:'{0}'".format(inName)
                            that.addOperLogByParam(that.log_module,that.log_add,that.log_info)
                            that.$emit('loadInMeasueData',2, that.analysisRegionId,uuid,true)
                        }
                        that.closeDialog()
                    },"json")
                }
                else{
                    that.$message(res.message)
                    return
                }
            },"json")
        }
        else{
            var url = that.contextUrl + "/InMeasure/insertDeriveIn"
            $.post(url,{inMeasurem:JSON.stringify(data)},function(res) {
                if(res.state == true) {
                    if(that.addType == 2){
                        var info = "新增了临时指标:'{0}'".format(inName)
                        that.addOperLogByParam(that.log_module,that.log_add,that.log_info)
                        that.$message(res.message)
                        that.$emit('loadInMeasueData',2, that.analysisRegionId,uuid,true)
                    }
                }
                that.closeDialog()
            },"json")
        }
    },
    /**
     * 验证必要信息是否为空
     * @returns {boolean}
     */
    verIsNoNull() {
        var inName = $("#inName").val()
        var inCode = this.editor.getValue()
        var inMemo = $("#inMemo").val()
        if(inName == ""|| inName == null || inName == undefined){
            this.$message("请输入指标名称。")
            return false
        }
        if(inName.length > 50){
            this.$message("指标名称不能大于50！")
            return false
        }
        if(this.addType == 1 && this.treeIds == "" && this.inMeasureUuid == undefined){
            this.$message("请选择分类！")
            return false
        }
        if(inCode == "" || inCode == null || inCode == undefined){
            this.$message("请输入派生公式！")
            return false
        }
        if(inMemo.length > 2000){
            this.$message("指标说明不能大于2000！")
            return false
        }
        return true
    },
    /**
     * 编辑派生指标
     */
    editIn() {
        var that = this
        if(!that.verIsNoNull()){
            return
        }
        var measureAlias = $("#inName").val()
        if(measureAlias != this.editData.measureAlias){
            var urlVer = that.contextUrl + "/InMeasure/verMeasureAlias"
            $.post(urlVer,{measureAlias:measureAlias},function(res) {
                if (res.state == true) {
                    that.update()
                }
                else{
                    that.$message(res.message)
                    return
                }
            },"json")
        }
        else{
            that.update()
        }
    },

    /**
     * 修改派生指标
     */
    update() {
        this.editData.measureName = $("#inName").val()
        this.editData.measureMemo = $("#inMemo").val()
        this.editData.measureAlias = $("#inName").val()
        this.editData.measureFormula = this.editor.getValue()
        this.editData.measurePath = this.treePath
        //this.editData.createTime = new Date(this.editData.createTime)
        //this.editData.updateTime =new Date(this.editData.updateTime)
        if(this.treeIds != ""){
            this.editData.inFolderUuid = this.treeIds
            this.editData.pbScopeUuid = this.pbScopeUuid
            this.editData.measurePath = this.treePath
        }
        var inName = $("#inName").val()
        var reg = new RegExp("^[A-Za-z\u4e00-\u9fa5]+$")
        if(!reg.test(inName)){
        	this.$message("请输入合法名称")
        	return
        }
        var url = this.contextUrl + "/InMeasure/updateDeriveIn"
        var that = this
        $.post(url,{inMeasure:JSON.stringify(this.editData)},function(res) {
            if(res.state == true)
            {
                if(that.addType == 2){
                    var info = "编辑了临时指标:'{0}'".format($("#inName").val())
                    that.addOperLogByParam(that.log_module,that.log_add,that.log_info)
                    var type =decodeURI(that.type)
                    //将新修改的指标返显到分析区。
                    var flag = "modify"
                    var supDimIdList;
                    that.$emit('delAnalysisListDownIn',that.parentUuid, that.analysisRegionId,that.inMeasureUuid,type,"true","",flag,val => {supDimIdList = val})
                    that.$emit('loadInMeasueData',2, that.analysisRegionId,that.inMeasureUuid,true,supDimIdList)
                }
                else{

                }
                that.closeDialog()
            }
            else{
                that.$message(res.message)
            }
        },"json")
    },

    /**
     * 编辑指时指标的反显
     */
    antiDisplayIndicatrixData(id) {
        var that = this
        var url = ""
        if(this.addType == 2){
            url = this.contextUrl + "/InMeasure/selectTemDeriveIn"
        }
        else{
            url = this.contextUrl + "/InMeasure/selectDeriveIn"
        }
        $.post(url,{inMeasureUuid:id},function(res) {
            that.form = res
            that.editData = res
            that.treePath = that.editData.measurePath
            $("#inName").attr("value",res.measureName)
            $("#folderName").attr("value",res.folderName)
            $("#inMemo").text(res.measureMemo)
            that.setValue2CM(that.editor,res.measureFormula)
        },"json")
    },

    //将一整段文字加载到codemirror中 如果其中包含指标 指标就以块状显示
    setValue2CM(editor, cmcontent){
        var i = 0
        var buffer = ""
        //当flag为0 buffer中的值是普通字符  flag 为1 buffer中的值是参数ID
        var flag = 0
        while(i < cmcontent.length){
            if(cmcontent[i] == "["){
                i = i+1
                this.appendValue2CM(this.editor, buffer, flag)
                buffer = ""
                flag = 1
            }else if(cmcontent[i] == "]"){
                i = i+1
                this.appendValue2CM(this.editor, buffer, flag)
                buffer = ""
                flag = 0
            }else{
                buffer += cmcontent[i++]
            }
        }
        this.appendValue2CM(this.editor, buffer, 0)
    },

    /**
     * 将派生指标的值写入到codeMirror中
     * @param editor 控件
     * @param value 从派生指标公式写出来的值
     * @param mark 类型  1代表是[]中间的字符  0代表普通字符 直接追加 不做任何处理
     */
    appendValue2CM(editor, value, mark){
        var lastCursor = this.editor.getCursor({line: this.editor.lineCount(), ch: 99999})
        if(mark==1){
            this.editor.replaceRange("["+value+"]", lastCursor, lastCursor)
            var measureName = ""
            if(value.indexOf("distinct") > -1){
            	value = value.replace("distinct ","")
            }
            var inUuid =  this.getCharBetweenString(value)
            var that = this
            $.ajax({
                url:this.contextUrl + "/InMeasure/selectDeriveIn",
                async:false,
                data: {inMeasureUuid: inUuid},
                type: "post",
                dataType: "json",
                success: function(res){
                    measureName = res.measureName
                }
            })
            if(measureName==undefined){
                //如果替换失败 则不替换
                this.editor.replaceRange(value, lastCursor, lastCursor)
            }else{
                this.listInId.push(inUuid)
                var group = value.replace(inUuid,"").replace("(","").replace(")","")
                var groupName = that.updateGroupDisplay(group,measureName)
                var dom = $("<span class='selected' id='[" + value + "]'>"+groupName+"</span>").get(0)
                var endCursor = this.editor.getCursor({line: this.editor.lineCount(), ch: 99999})
                this.editor.markText(lastCursor, endCursor,{
                    replacedWith: dom
                    ,className: "selected"
                })
            }
        }else{
            this.editor.replaceRange(value, lastCursor, lastCursor)
        }
    },
    /**
     * 关闭窗体
     */
    closeDialog() {
        this.$emit('closeAddderiveinDialog')
    },

    /**
     * 添加计算公式
     * @param indicatrixId 指标编号
     * @param indicatrixName 指标名称
     */
    addCalculation(indicatrixId,indicatrixName) {
        var that = this
        var url = this.contextUrl + "/InMeasure/validationRel"
        $.post(url,{list:this.editor.getValue(),inMeasureId:indicatrixId},function(res) {
            that.groupDialogVisible = true
            that.derObj.indicatrixId = indicatrixId
            that.derObj.indicatrixName = indicatrixName
            that.derObj.res = res
            }
        ,"json")
    },

    /**
     * 添加聚合方式
     * @param group 聚合方式
     */
    addGroup(group) {
        var indicatrixName = this.derObj.indicatrixName
        var indicatrixId = this.derObj.indicatrixId
        var value = "[" + group + "(" + indicatrixId + ")]"
        if(group == "distinct"){
        	value = "[" + "count " + "(" + group +" "+ indicatrixId + ")]"
        }
        var groupName = this.updateGroupDisplay(group,indicatrixName)
        var res = this.derObj.res
        var dom = $("<span class ='selected' id = '" + indicatrixId + "'>" + groupName + "</span>").get(0)
        var beforecursor = this.editor.getCursor()
        var endCursor = {ch: beforecursor.ch + value.length, line:beforecursor.line, sticky:null}
        this.editor.replaceRange(value, beforecursor, beforecursor)
        this.editor.markText(beforecursor,endCursor,{
            replacedWith: dom,
            className: "selected"
        })
        this.listInId.push(indicatrixId)
        this.getDimRelIn(res)
    },

    updateGroup(aggType,indicatrixId,indicatrixName,induuid){
        var indicatrixIdStr = "["+aggType+"{" + indicatrixId + "}"+induuid+"^"+indicatrixName+"]"
        var bcursor = this.editor.getCursor()
        this.editor.replaceRange(indicatrixIdStr, bcursor, bcursor)
        var searchParam = /\[(.+?)\]/g
        var paramCursor = this.editor.getSearchCursor(searchParam)
        while(true){
            var widget = paramCursor.findNext()
            if(widget){
                this.$message(widget[0])
                var guuidReg = /\}(.+?)\]/
                var guuid = widget[0].match(guuidReg)[1]
                var dom = $("<div class='tag-select tag-info' title='"+indicatrixName+"'><span>"+aggType+"("+indicatrixName+")</span><i class='icon-down' onclick='addDeriveIn.inTriangle(\""+indicatrixId+"\",\""+indicatrixName+"\",\""+guuid+"\")'></i></div>").get(0)
                this.editor.markText(paramCursor.from(),paramCursor.to(),{replacedWith: dom,className: "paramBlock1"})
            } else {
                break
            }
        }
    },

    updateGroup1(aggType) {
        var indicatrixId = this.gindicatrixId
        var indicatrixName = this.gindicatrixName
        var bline = gbline
        var bch = gbch
        //定义原始值
        var induuid = this.getuuid()
        var value = "[count" + "{" + indicatrixId +"}"+induuid+"]"
        //定义开始字符
        //
        // var bcursor
        // if(bline==null||bch==null){
        //     bcursor = this.editor.getCursor()
        // } else {
        //     bcursor = {"line":bline,"ch":bch,"sticky":null}
        // }
        // // //定义替换结束
        // var cursor = {"line":bcursor.line,"ch":bcursor.ch+indicatrixId.length,"sticky":null}
        // //定义新替换结束
        // var acursor = {"line":bcursor.line,"ch":bcursor.ch+value.length,"sticky":null}
        //修改文字
        var bcursor = this.editor.getCursor()
        this.editor.replaceRange(value, bcursor, bcursor)
        var dom = $("<div class='tag-select tag-info' title='"+indicatrixName+"'><span>"+aggType+"("+indicatrixName+")</span><i class='icon-down' onclick='addDeriveIn.inTriangle(\""+indicatrixId+"\",\""+indicatrixName+"\",\""+induuid+"\")'></i></div>").get(0)
        //修改样式
        this.editor.markText(bcursor,cursor,{
            replacedWith: dom,
            className: "selected"
        })

    },

    replaceWidget(indicatrixId,indicatrixName,induuid){
        var searchParam = /\[(.+?)\]/g
        var paramCursor = this.editor.getSearchCursor(searchParam)
        while(true){
            var widget = paramCursor.findNext()
            if(widget){
                this.$message(widget)
                var dom = "<div>sss</div>"
                this.editor.markText(paramCursor.from(),paramCursor.to(),{replacedWith: dom,className: "paramBlock1"})
            } else {
                break
            }
        }
    },

    /**
     * 获取所有与当前计算指标有关联维度的指标
     */
    getDimRelIn(res) {
        var node = this.inTree.getNodes()
        var nodes = this.inTree.transformToArray(node) //获取树所有节点
        if(res.length == 0){//如果返回的数组维0则证明该指标没有关联任何维度  隐藏全部指标
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].type == "indicatrix"){
                    this.inTree.hideNode(nodes[i])
                }
            }
        }
        for(var i = 0; i < nodes.length; i++){
            var result = res.indexOf(nodes[i].id)
            if(result == -1){
                if(nodes[i].type == "indicatrix"){
                    this.inTree.hideNode(nodes[i])
                }

            }
        }
    },
    /**
     * 追加文本
     * @param calculation 计算方式
     */
    appendText(calculation) {
        this.editor.replaceSelection(calculation)
    },

    /**
     * 拖拽前事件
     * @param treeId 拖拽的树节点编号
     * @param treeNodes 拖拽的树节点
     * @returns {boolean} 是否成功
     */
    beforeDrag(treeId, treeNodes) {
        if(treeNodes[0].type == "folder"){
            return false
        }
        for (var i=0,l=treeNodes.length; i<l; i++) {
            if (treeNodes[i].drag === false) {
                return false
            }
        }
        return true
    },

    /**
     * 用于捕获节点拖拽操作结束之前的事件回调函数，并且根据返回值确定是否允许此拖拽操作
     * @param treeId 拖拽的树节点编号
     * @param treeNodes 拖拽的树节点
     * @param targetNode 选中节点
     * @param moveType 类型
     * @returns {boolean} 返回是否允许拖拽
     */
    beforeDrop(treeId, treeNodes, targetNode, moveType) {
        return false
    },

    /**
     * 拖拽结束事件  确定位置是否可以放下
     * @param event 事件
     * @param treeId 树编号
     * @param treeNodes 树节点
     * @param targetNode 选中节点
     * @param moveType 移动类型
     */
    onDrop(event, treeId, treeNodes, targetNode,moveType) {
        var indicatrixId = treeNodes[0].id
        var indicatrixName = treeNodes[0].name
        var inType = treeNodes[0]
        if(this.calculationPosition("gongShi")){
            this.addCalculation(indicatrixId,indicatrixName,inType)
        }

    },

    /**
     * 计算树拖拽位置是否是所传ID
     * @param id 要验证的控件编号
     * @returns {boolean} 是否在区域内
     */
    calculationPosition(id) {
        var left = $("#"+id).offset().left //获取控件左侧位置
        var top = $("#"+id).offset().top   //获取控件上方位置
        var rowDimWight=$("#"+id).width()    //获取控件宽度
        var rowDimHEIGHT=$("#"+id).height()  //获取控件高度
        var right = left + rowDimWight       //获取控件右侧宽度
        var down=top+rowDimHEIGHT            //获取控件底下距离
        if(event.clientX>left&&event.clientX<right) //鼠标放开之后判断当前鼠标所在位置是否大于控件左侧并且小于控件右侧
        {
            if(event.clientY>top && event.clientY<down) //判断成功后再次判断鼠标Y轴是否在空间内
            {
                return true
            }
        }
        return false
    },
    /**
     * 修改节点颜色
     * @param treeId 树节点编号
     * @param treeNode 树节点
     * @returns {*}
     */
    getFontCss(treeId, treeNode) {
        return (!!treeNode.highlight) ? {color:"#FF8000", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"}
    },

    /**
     * codeMirror值改变事件
     * @param instance
     * @param changeObj
     */
    codeMirrorValueEdit(instance,changeObj) {
        var that = this
        $.each(this.listInId,function(num,value) {
            if(value == null){
                return
            }
            var text = that.editor.getValue()
            if(text.indexOf(value) == -1){
                //判断删除的内容是否在列表里，若在列表里则删除，然后从新验证
                delete that.listInId[num]
                var url = that.contextUrl + "/InMeasure/validationRelOne"
                $.post(url,{list:that.editor.getValue()},function(res) {
                    that.showTreeNode(res)
                },"json")
            }
        })
    },

    /**
     * 显示树节点
     * @param res 要显示的编号
     */
    showTreeNode(res) {
        var node = this.inTree.getNodes()
        var nodes = this.inTree.transformToArray(node) //获取树所有节点
        if(res.length == 0){//如果返回的数组维0则证明该指标没有关联任何维度  隐藏全部指标
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].type == "indicatrix"){
                    this.inTree.showNode(nodes[i])
                }
            }
        }
        for(var i = 0; i < nodes.length; i++){
            var result = res.indexOf(nodes[i].id)
            if(result == 0){
                if(nodes[i].type == "indicatrix"){
                    this.inTree.showNode(nodes[i])
                }

            }
        }
    },

    /**
     * 设置文件夹的路径以及id和名称
     */
    setFolderIdAndName(treeId, treeName, path, pathName,pbScopeUuids,auditorOrauditorgans) {
        this.form.folderName = pathName
        this.treeIds = treeId
        this.pbScopeUuid = pbScopeUuids
        this.treePath = path
        this.auditorOrauditorgan = auditorOrauditorgans
    },


    /**
     * 指标三角号点击事件
     * @param parentId 父级编号
     * @param inId 指标编号
     * @param analysisRegionId 分析区编号
     */
    inTriangle(indicatrixId,indicatrixName,induuid) {
        this.gindicatrixId = indicatrixId
        this.gindicatrixName = indicatrixName
        this.ginduuid = induuid
        event.stopPropagation()
        this.showMenu(event.clientX, event.clientY, "group")
    },

    /**
     * 根据点击位置显示菜单
     * @param x X轴
     * @param y Y轴
     * @param elementId 要显示的div编号
     */
    showMenu(x, y, elementId) {
        var that = this
        $("#" + elementId).show()
        y += document.body.scrollTop
        x += document.body.scrollLeft
        $("#" + elementId).css({"top": y + "px", "left": x + "px", "visibility": "visible"})
        $("body").bind("mousedown", function() {
            that.onBodyMouseDownHideMenu(event, elementId)
        })
    },
    /**
     * 更改聚合显示的文字
     * @param group 聚合方式
     * @param name 指标名称
     */
    updateGroupDisplay(group,name) {
        if(group == "sum"){
            return "合计(" + name + ")"
        }
        if(group == "count"){
            return "计数(" + name + ")"
        }
        if(group == "max"){
            return "最大值(" + name + ")"
        }
        if(group == "min"){
            return "最小值(" + name + ")"
        }
        if(group == "avg"){
            return "平均值(" + name + ")"
        }
        if(group == "distinct"){
            return "差异计数(" + name + ")"
        }
        return name
    }
  }
}
</script>
<style scoped>
    >>>.selected{
        background-color: #3d80c4;
        padding: 3px;
        color: #FFF;
        border: 1px solid #FFF;
    }
    >>>.left-tree{
        width:200px;
        padding-top:30px;
    }
</style>

