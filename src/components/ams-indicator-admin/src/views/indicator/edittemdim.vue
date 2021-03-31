<template>
<el-container>
    <el-aside>
        <ul id="colName"></ul>
    </el-aside>
    <el-container>
        <el-main>
            <el-form>
                <el-form-item label="维度名称">
                    <el-input id="dimName" v-model="form.dimName"></el-input>
                </el-form-item>
                <el-form-item label="SQL">
                    <textarea id="code" name="code" v-model="form.code"></textarea>
                </el-form-item>
                <el-form-item label="维度说明">
                    <el-input type="textarea" id="dimMemo" v-model="form.dimMemo"></el-input>
                </el-form-item>
            </el-form>
        </el-main>
        <el-footer>
            <div style="float: right">
                <el-button type="primary" @click="seeSqlData">查看结果</el-button>
                <el-button type="primary" @click="saveTemDim">保存</el-button>
                <el-button type="primary" @click="closeDialog">取消</el-button>
            </div>
        </el-footer>
    </el-container>
  <el-dialog append-to-body title="查看数据" v-if="seeSqlDataDialog" :visible.sync="seeSqlDataDialog" :close-on-click-modal="false">
    <seeSqlData :seeDataSql="seeDataSql"/>
  </el-dialog>
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

export default {
  name: 'edittemdim',
  props: ['nowAnalysisRegionId','nowDimAnalysisRegionId','dimId','dimDivId','analysisList','addTempDimAnalysisRegionId'],
  components: {
    seeSqlData: resolve => require(["../../views/indicator/seesqldata.vue"], resolve),
  },
  data() {
    return {
      /**
       * CodeMirror对象
       * @type {null}
       */
      editor: null,
      /**
       * 修改时存储临时指标对象
       */
      editData: {},
      form: {
          dimName: '',
          code: '',
          dimMemo: ''
      },
      dimList: [],
      seeSqlDataDialog:false,
      seeDataSql:''
    }
  },
  mounted() {
    this.initData()
  },
  created() {

  },
  methods: {
    /**
     * 初始化数据
     */
    initData() {
        var that = this
        $("#colName").html("")
        this.dimList = JSON.parse(sessionStorage.getItem("resultObj"))
        $.each(this.dimList,function (num,value) {
            var li = $("<li id='" + value.inDimensionUuid + "'>" + value.dimensionName + "</li>")
            for (var i = 0; i < li.length; i++) {
                li[i].onclick  = that.setStyle
                li[i].ondragstart = that.ulDragStart
                li[i].draggable = true
                li[i].ondragend = that.ulDragEnd
            }
            $("#colName").append(li)
        })
        this.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,     // 显示行数
            indentUnit: 4,         // 缩进单位为4
            styleActiveLine: true, // 当前行背景高亮
            matchBrackets: true,   // 括号匹配
            mode: 'htmlmixed',     // HMTL混合模式
            lineWrapping: true    // 自动换行
        })
        if(this.dimId != null){
            var temDimObj = JSON.parse(sessionStorage.getItem("temDimObj"))
            this.editData = temDimObj
            $("#dimName").attr("value",temDimObj.dimensionName)
            $("#dimMemo").text(temDimObj.dimMemo)
            this.setValue2CM(this.editor,temDimObj.columnName)
        }
    },

    //将一整段文字加载到codemirror中 如果其中包含维度名   就以块状显示
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
        var that = this
        var lastCursor = this.editor.getCursor({line: this.editor.lineCount(), ch: 99999})
        if(mark==1){
            this.editor.replaceRange("["+value+"]", lastCursor, lastCursor)
            // var dimName = ""
            // $.ajax({url:this.contextUrl + "/InDimension/selectByPrimaryKey",
            //     async:false,
            //     data: {inDimensionUuid: value},
            //     type: "post",
            //     dataType: "json",
            //     success: function(res){
            //         dimName = res.dimensionName
            //     }
            // })
            var dimName;
            $.each(this.dimList,function (num,obj) {
                if(value == obj.inDimensionUuid){
                    dimName = obj.dimensionName;
                }
            });
            if(dimName == undefined){
                //如果替换失败 则不替换
                that.editor.replaceRange(value, lastCursor, lastCursor)
            }else{
                var dom = $("<span class='selected' id='[" + value + "]'>"+dimName+"</span>").get(0)
                var endCursor = that.editor.getCursor({line: that.editor.lineCount(), ch: 99999})
                that.editor.markText(lastCursor, endCursor,{
                    replacedWith: dom
                    ,className: "selected"
                })
            }
        }else{
            that.editor.replaceRange(value, lastCursor, lastCursor)
        }
    },
    /**
     * 设置li选中样式并获取ID和名称
     */
    setStyle() {
        $("#colName li").removeClass()
        $(this).addClass("selected")
    },

    /**
     * ul列表拖拽开始事件
     */
    ulDragStart() {

    },

    /**
     * ul列表拖拽结束事件
     */
    ulDragEnd(event) {
        var dimId = event.target.id
        var dimName = event.target.textContent
        this.addStyle(dimId,dimName)
    },

    /**
     * 添加样式
     * @param dimId 维度编号
     * @param dimName 维度名称
     */
    addStyle(dimId,dimName) {
        dimId = "[" + dimId + "]"
        var dom = $("<span class ='selected' id ='" + dimId + "'>" + dimName + "</span>").get(0)
        var beforecursor = this.editor.getCursor()
        var endCursor = {ch: beforecursor.ch + dimId.length, line:beforecursor.line, sticky:null}
        this.editor.replaceRange(dimId, beforecursor, beforecursor)
        this.editor.markText(beforecursor,endCursor,{
            replacedWith: dom,
            className: "selected"
        })
    },
    /**
     * 关闭窗体
     */
    closeDialog() {
        this.$emit('closeEdittemdimDialog')
    },

    /**
     * 查看数据
     */
    seeSqlData() {
      let that = this
      var name = this.form.dimName
      var sql = this.editor.getValue()
      var uuid = this.getuuid()
      var data = {
          dimensionName:this.form.dimName,
          columnName:sql,
          dimMemo:this.form.dimMemo,
          filterType:'',
          values:[],
          id:uuid,
          custom:this.form.dimName,
          filter:'',
          filterJson:'',
          yesNolevel:false,
          level:0,
          yesNoTem:true,
          dimAnalysisRegionId:this.nowDimAnalysisRegionId,
          analysisRegionId:this.nowAnalysisRegionId
      }
      var objInList
      var objDimList = []
      objDimList.push(data)
      $.each(this.analysisList, function (num, value) {
          if (value == null) {
              return
          }
          if(value.id == that.addTempDimAnalysisRegionId){
              objInList = value.objInList
          }
      })
      var url = this.contextUrl + "/indicatrixAnalysis/getColData"
      $.post(url,{inMeasures:JSON.stringify(objInList),listDim:JSON.stringify(objDimList),dimId:uuid,columnName:name},function (res) {
        if(res.isError){
          that.$message({type:'info',message:res.message})
          return
        }
        that.seeDataSql = res.sql
        that.seeSqlDataDialog = true
      },"json")
    },

    /**
     * 保存临时维度
     */
    saveTemDim() {
        var name = $("#dimName").val()
        var dimMemo = $("#dimMemo").val()
        var sql = this.editor.getValue()
        if(!this.ver(name,dimMemo,sql)){
            return
        }
        var result = this.$emit('verTemDimName',this.nowAnalysisRegionId,name)
        var inDimList = this.$emit('getInDimList')
        if(this.editData == null){//如果为空证明是新增
            if(!result){
                this.$message("名称重复！")
                return
            }
            for(var i = 0;i<inDimList.length;i++){
            	if(name == inDimList[i]){
            		this.$message("名称重复！")
            		return
            	}
            }
            //window.parent.indicatrixAnalysis.clearInDimList()
        }
        else{
            if(name != this.editData.dimensionName){
                if(!result){
                    this.$message("名称重复！")
                    return
                }
            }
        }
        if(this.dimId != null){//编辑
            this.update(name,dimMemo,sql)
        }
        else{
            this.save(name,dimMemo,sql)
        }
        this.closeDialog()
    },

    /**
     * 保存临时维度
     * @param name 维度名称
     * @param dimMemo 维度描述
     * @param sql sql
     */
    save(name,dimMemo,sql) {
        var uuid = this.getuuid()
        var data = {
            dimensionName:name,
            columnName:sql,
            dimMemo:dimMemo,
            filterType:'',
            values:[],
            id:uuid,
            custom:'',
            filter:'',
            filterJson:'',
            yesNolevel:false,
            level:0,
            yesNoTem:true,
            dimAnalysisRegionId:this.nowDimAnalysisRegionId,
            analysisRegionId:this.nowAnalysisRegionId
        }
        this.$emit('initTemDimToFrom',data)
    },

    /**
     * 保存临时维度
     * @param name 维度名称
     * @param dimMemo 维度描述
     * @param sql sql
     */
    update(name,dimMemo,sql) {
        this.editData.dimensionName = name
        this.editData.dimMemo = dimMemo
        this.editData.columnName = sql
        var analysisRegionId = this.editData.analysisRegionId
        var dimId = this.editData.id
        this.$emit('delTemDim',analysisRegionId,dimId,this.dimDivId,"true")//先删除
        this.$emit('initTemDimToFrom',this.editData)//在初始化进去
    },

    /**
     * 验证基本信息
     * @param name 维度名称
     * @param dimMemo 维度说明
     */
    ver(name,dimMemo,sql) {
        if(name.length == 0){
            this.$message("名称不能为空！")
            return false
        }
        if(name.length > 50){
            this.$message("名称不能大于50个字符！")
            return false
        }
        if(sql.length == 0){
            this.$message("sql不能为空！")
            return false
        }
        if(dimMemo.length>2000){
            this.$message("说明不能大于2000个字符！")
            return false
        }
        return true
    }
  }
}
</script>
<style scoped>
>>>label {
        display: inline-block;
        width: 100px;
        text-align: right;
    }
>>>.selected{
        background-color: #3d80c4;
        padding: 3px;
        color: #FFF;
        border: 1px solid #FFF;
    }
>>>ul li{
        list-style: none;
    }
</style>


