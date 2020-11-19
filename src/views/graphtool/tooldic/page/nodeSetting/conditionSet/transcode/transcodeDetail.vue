<template>
    <div id="content">
        <form class="layui-form">
            <div class="layui-form-item">
                <label class="layui-form-label">规则名称</label>
                <div class="layui-input-block return-val">{{formData.ruleName}}</div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">规则描述</label>
                <div class="layui-input-block return-val">{{formData.ruleDesc}}</div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">转码方式</label>
                <div class="layui-input-block return-val">{{formData.ruleType}}</div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">转码规则</label>
                <div class="layui-input-block sql_component return-val" v-if="isSql" id="sqlContent">{{formData.sqlContent}}</div>
                <div class="layui-input-block sql_component" v-if="isSql">
                    <div class="layui-input-block"></div>
                    <span>真实值</span>
                    <span id="realVal" class="return-val">{{formData.sceneName}}</span>
                    &nbsp;&nbsp;
                    <span>转码值</span>
                    <span id="displayVal" class="return-val">{{formData.sceneCode}}</span>
                </div>
                <div class="layui-input-block hand_component" v-if="!isSql">
                    <div class="hand_component_table">
                        <table id="list_value">
                            <tr style="color: #fff;background-color:#367DC3">
                                <td width="47%">真实值</td>
                                <td width="47%">转码值</td>
                            </tr>
                            <tr v-for="obj in listValue">
                                <td>{{obj.codeValue}}</td>
                                <td>{{obj.transValue}}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import {selectById} from '@/api/data/transCode'
    var id = getParams().id;
    export default {
        name: "transcodeDetail",
        data(){
           return {
               formData:{
                   ruleName:'',
                   ruleDesc:'',
                   ruleType:'',
                   sqlContent:'',
                   sceneName:'',
                   sceneCode:''
               },
               listValue:[],
               isSql:false
           }
        },
        mounted(){
            this.init();
        },
        methods:{
            init(){
                let $this = this;
                selectById(id).then(res => {
                    $this.formData = {...$this.formData, ...res.data}
                    $this.listValue = res.data.transColRels
                    if ($this.formData.ruleType === 1) {
                        $this.formData.ruleType = 'SQL语句'
                        $this.isSql = true
                    } else {
                        $this.formData.ruleType = '手动添加'
                        $this.isSql = false
                    }
                })
            }
        }
    }
    // $.post(contextPath +"/checkSource/getTranscodeInfo",{"id" : id},function(e){
    //     $("#transcodeName").text(e.transcodeName);
    //     $("#transcodeDesc").text(e.transcodeDesc);
    //     var listValue = e.tranListValue;
    //     if(e.transcodeType != null && e.transcodeType != ""){
    //         if(e.transcodeType == 1){
    //             $(".sql_component").show();
    //             $(".hand_component").hide();
    //             $("#sqlContent").text(e.sqlContent);
    //             $("#transType").text("SQL语句");
    //             if(listValue.length > 0){
    //                 var lv = listValue[0];
    //                 $("#realVal").text(lv.codeValue);
    //                 $("#displayVal").text(lv.transValue);
    //             }
    //         }else{
    //             $(".sql_component").hide();
    //             $(".hand_component").show();
    //             $("#transType").text("手动添加");
    //             if(listValue.length > 0){
    //                 $(".codeValue:eq(0)").text(listValue[0].codeValue);
    //                 $(".transValue:eq(0)").text(listValue[0].transValue);
    //                 if(listValue.length > 1){
    //                     listValue.splice(0,1);
    //                     for(var j=0;j<listValue.length;j++){
    //                         var html = "<tr><td class='codeValue'>" + listValue[j].codeValue + "</td>";
    //                         html += "<td class='transValue'>" + listValue[j].transValue + "</td>"
    //                         $(".hand_component_table").find("table").append(html);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },"json");
</script>

<style type="text/css">
    .layui-form-label {
        width: 20%;
    }
    .layui-input-block{
        margin-left:20% !important;
    }
    .layui-input,.layui-textarea {
        width: 80% !important;
    }
    .hand_component_table {
        width: 100%;
        align-content: center;
    }
    .hand_component_table table{
        width: 90%;
    }
    .hand_component_table table tbody{
        display: block;
        height: 180px;
        overflow-y: auto;
    }
    .hand_component_table table td{
        border: 1px solid #DBDFE9;
        text-align: center;
        padding: 2px 2px 2px 2px;
    }

    .hand_component_table Input
    {
        BACKGROUND-COLOR: transparent;
        BORDER: #ffffff 1px solid;
        COLOR: #000;
        HEIGHT: 18px;
        font-size: 9pt;
        width:80%;
    }
    img {
        width: 20px;
    }
    .sql_component select {
        display: block;
    }
    form{
        background: none;
    }
    #content{
        margin-left:5%;
    }
    .sql_component span{
        display:inline;
        padding-top:20px;
    }
    #realVal,#displayVal{
        width:20%;
        height:30px;
        line-height: 30px;
        font-size: 16px;
        display:inline;
        margin-top:20px;
    }

    .layui-form .layui-form-item .return-val {
        padding: 9px 15px;
        background: #FFF;
    }
</style>
