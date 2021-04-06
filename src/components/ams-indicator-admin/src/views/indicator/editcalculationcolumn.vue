
<template>
    <el-container>
        <el-aside>
            <ul id="colName"></ul>
        </el-aside>
        <el-container>
            <el-main>
                <el-form>
                    <el-form-item label="名称">
                        <el-input id="columnAlias" v-model="form.columnAlias"></el-input>
                    </el-form-item>
                    <el-form-item label="表名">
                        <el-input id="tableName" v-model="form.tableName" readonly="readonly"></el-input>
                    </el-form-item>
                    <el-form-item label="维度计算">
                        <textarea id="code" name="code" v-model="form.code"></textarea>
                    </el-form-item>
                </el-form>
            </el-main>
            <el-footer>
                <div style="float: right">
                    <el-button type="primary" @click="seeSqlData">查看结果</el-button>
                    <el-button type="primary" @click="saveCalculationCol">保存</el-button>
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
  name: 'editCalculationcolumn',
  props: ['tableId','tableName','calculationColId','rawTableName'],
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
          columnAlias: '',
          code: '',
          tableName: ''
      },
      colList: [],
      seeSqlDataDialog:false,
      seeDataSql:''
    }
  },
  mounted() {
    this.initData();
    this.getTableColumn(this.tableId);
  },
  created() {

  },
  methods: {

    /**
     * 初始化数据
     */
    initData() {
        if(this.calculationColId == undefined) {//判断该id是否为空 如果为空则是新增  反之编辑
            $("#tableName").attr("value",decodeURI(this.tableName));
        }
        else{
            this.antiDisplayCalcuationCol(this.calculationColId);
            $("#tableName").attr("value",decodeURI(this.tableName));
        }
        this.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,     // 显示行数
            indentUnit: 4,         // 缩进单位为4
            styleActiveLine: true, // 当前行背景高亮
            matchBrackets: true,   // 括号匹配
            mode: 'htmlmixed',     // HMTL混合模式
            lineWrapping: true    // 自动换行
        });
    },

    /**
     * 获取表所有列名
     */
    getTableColumn(tableId) {
      var that = this;
      $("#colName").html("");

      // 解决HTTP400错误
      request({
        baseURL: this.dataContextUrl,
        url: '/tableMeta/getCols',
        method: 'post',
        params: { tableMetaUuid: tableId,isEnclose:"-1" }
      }).then(res => {
        $.each(res.data,function (number,value) {
          that.colList.push(value.colName);
          var li = $("<li id='" + value.colMetaUuid + " '>" + value.colName + "</li>");
          for (var i = 0; i < li.length; i++) {
            li[i].onclick  = that.setStyle;
            li[i].ondragstart = that.ulDragStart;
            li[i].draggable = true;
            li[i].ondragend = that.ulDragEnd;
          }
          $("#colName").append(li);
        })
      })

      // var url = this.dataContextUrl + '/tableMeta/getCols'
      // $.post(url, { tableMetaUuid: tableId }, function (res) {
      //   $.each(res.data,function (number,value) {
      //     that.colList.push(value.colName);
      //     var li = $("<li id='" + value.colMetaUuid + " '>" + value.colName + "</li>");
      //     for (var i = 0; i < li.length; i++) {
      //       li[i].onclick  = that.setStyle;
      //       li[i].ondragstart = that.ulDragStart;
      //       li[i].draggable = true;
      //       li[i].ondragend = that.ulDragEnd;
      //     }
      //     $("#colName").append(li);
      //   })
      // },"json")
    },

    /**
     * 设置li选中样式并获取ID和名称
     */
    setStyle(event) {
        $("#colName li").removeClass();
        $(event.target).addClass("selected");
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
        var columnId = event.target.id;
        var columnName = event.target.textContent;
        this.editor.replaceSelection(columnName);
    },

    /**
     * 保存计算列
     */
    saveCalculationCol() {
        if(this.calculationColId == undefined) {//判断该id是否为空 如果为空则是新增  反之编辑
            this.save();
        }
        else{
            this.update();
        }
    },

    /**
     * 保存
     */
    save() {
        var that = this;
        var columnAliasName = $("#columnAlias").val();
        if(!that.verEml()){
            return;
        }
        var tableId = this.tableId;
        var data = {
            inCalculationColumnUuid:this.getuuid(),
            calculationColumnTableid:tableId,
            calculationColumnSql:this.editor.getValue(),
            createTime:'',
            updateTime:'',
            createPersonUuid:'',
            createPersonName:'',
            belongOrg:'',
            belongType:'',
            calculationColumnName:columnAliasName
        };
        var url = this.contextUrl + "/InCalculationColumn/insertSelective";
        $.post(url,{inCalculationColumn:JSON.stringify(data)},function (res) {
            if(res.state == false){
                that.$message(res.message);
                return;
            }
            that.$emit('getAllColumn',tableId)
            that.closeDialog();
        },"json")
    },

    /**
     * 修改
     */
    update() {
        var that = this;
        if(!that.verEml()){
            return;
        }
        var tableId = this.tableId;
        this.editData.calculationColumnName = $("#columnAlias").val();
        this.editData.calculationColumnSql = that.editor.getValue();
        /*this.editData.createTime = new Date(this.editData.createTime);
        this.editData.updateTime =new Date(this.editData.updateTime);*/
        this.editData.createTime = "";
        this.editData.updateTime = "";
        var url  = this.contextUrl + "/InCalculationColumn/updateByPrimaryKeySelective";
        $.post(url,{inCalculationColumn:JSON.stringify(this.editData)},function (res) {
            if(res.state == false){
                that.$message(res.message);
                return;
            }
            that.$emit('getAllColumn',tableId)
            that.closeDialog();
        },"json")
        },

    /**
     * 验证必要信息
     */
    verEml() {
        var columnAliasName = $("#columnAlias").val();
        var sql = this.editor.getValue();
        if(columnAliasName == ""){
            this.$message("名称不能为空！");
            return false;
        }
        if(columnAliasName.length > 50){
            this.$message("名称不能大于50个字符！");
            return false;
        }
        if(sql == ""){
            this.$message("公式不能为空！");
            return false;
        }
        return true;
    },
    /**
     * 返现计算列数据
     * @param calcuationColId 计算列编号
     */
    antiDisplayCalcuationCol(calcuationColId) {
        var that = this;
        var url = this.contextUrl + "/InCalculationColumn/selectByPrimaryKey";
        $.post(url,{inCalculationColumnUuid:calcuationColId},function (res) {
            that.editData = res;
            $("#columnAlias").attr("value",res.calculationColumnName);
            that.editor.replaceSelection(res.calculationColumnSql);
        },"json")
    },
    /**
     * 关闭当前窗体
     */
    closeDialog() {
        this.$emit('closeCalculationcolumn')
    },

    /**
     * 查看结果
     */
    seeSqlData() {
        var displayCol = '';
        var calCol = this.editor.getValue();
        if(calCol === ''){
          return
        }
        $.each(this.colList,function (num,value) {
            if(calCol.indexOf(value) != -1){
                displayCol+= value + ",";
            }
        });
        var rawTableName = this.rawTableName;
        displayCol = displayCol.substring(0,displayCol.length - 1);
        displayCol += "," + this.editor.getValue() + " as 结果预览";
        var sql = "select {0} from {1}".format(displayCol,rawTableName);
        this.seeDataSql = sql
        this.seeSqlDataDialog = true
    },

    /**
     * 搜索
     */
    searchOnChange() {
        var searchFilters = $("#searchColumn").val();
        var ul = $("#colName").find("li");
        ul.each(function (num) {
            var ulli = $(this);
            var liValue = ulli.text();
            if (!liValue.match(searchFilters)) {
                ulli.hide();
            }
            else {
                ulli.show();
            }
        });
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
        margin：0:auto;
    }
</style>


