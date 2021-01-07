
<template>
    <el-container>
        <el-main>
            <table class="table table-striped" id="gridTableDim"></table>
            <div id="paggerDim">
            </div>
        </el-main>
        <el-footer>
            <div style="float: right">
                <el-button type="primary" @click="saveRelDim">保存</el-button>
                <el-button type="primary" @click="closeDialog">取消</el-button>
            </div>
        </el-footer>
    </el-container>
</template>
<script>
import request from '@/utils/request'
import $ from 'jquery'
import { Loading } from 'element-ui'
export default {
  name: 'addDimension',
  props: ['tableId','tableName','columnId','columnName','dimUUID'],
  components: {
          
	},
  data() {
    return {
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
    getAllDimension() {
        let loadingInstance = Loading.service({ fullscreen: true })
        var win_h = $(window).height()/3.5;
        var colModel = [
            {name:'inDimensionUuid',hidden: true},
            {name:'dimensionName',lable:'维度名称',align:'center',width:"160px"},
            {name:'columnName',lable:'关联列',align:'center',width:"230px"},
            {name:'tableName',lable:'来源表',align:'center',width:"230px"},
            {name:'dimensionMemo',lable:'维度说明',align:'center',width:"290px"},
            {name:'dimensionTemporary',hidden:true}
        ];
        var colNames = ['主键','维度名称','关联列','来源表','维度说明','类型'];
        var tableName = decodeURI(param.tableName);
        var url = contextUrl + "/InDimension/getYesRelDimension";
        $.post(url,{tableName:tableName},function (res) {
            var setting =
                {
                    tableId:"gridTableDim",
                    params:{tableName:tableName},
                    queryFormId:"query",
                    pageId:"paggerDim",
                    rownumbers: false,//序号
                    multiselect: true,//多选框
                    multiboxonly:true,
                    colModel: colModel,
                    colNames:colNames,
                    width:'100%',
                    height:win_h,
                    caption:'维度列表',
                    onCellSelect:onCellSelect,
                    beforeSelectRow:beforeSelectRow
                };
            $("#gridTableDim").jqGrid(setting);
            for(var i = 0;i<res.length; i ++){
                $("#gridTableDim").jqGrid("addRowData",i+1,res[i]);
            }
            loadingInstance.close()
        },"json");
    },
    saveRelDim() {
        if(dimId == ""){
            layer.msg("请选择要关联的维度。");
            return;
        }
        var verUrl = contextUrl + "/InDimension/verDimRel";
        $.post(verUrl,{dimId:dimId,tableId:param.tableId},function (res) {
            if(res == true){
                layer.msg("该表与当前维度已经有关联列，不允许重复添加，每张表关联列只允许关联一次");
                return;
            }
            else{
                var url = contextUrl + "/InDimension/relHaveDim";
                var data = {
                    inDimColumnUuid : '',
                    inDimensionUuid : dimId,
                    tableUuid : decodeURI(param.tableId),
                    columnUuid : decodeURI(param.columnId)
                };
                $.post(url,{inDimColumn:JSON.stringify(data)},function (res) {
                    if(res == true){
                        window.parent.nativeIndicatrixDesignOne.getAllDimension(decodeURI(param.tableId));
                        var tableName = decodeURI(param.dmTableName);
                        var columnName = decodeURI(param.columnName);
                        var info = "对'{0}'维度关联了'{1}'表里的'{2}'列".format(dimName,tableName,columnName);
                        addOperLogByParam(module,edit,info);
                        close();
                    }
                    else{
                        layer.msg(res);
                    }
                },"json")
            }
        },"json")
    }
  }
}
</script>