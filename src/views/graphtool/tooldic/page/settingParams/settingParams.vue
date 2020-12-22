<template>
    <div @mousemove="initEvent" ref="settingParamDiv" style="overflow-y: auto;height: 600px;">
        <ul id="myTab" class="nav nav-tabs">
            <li class="active">
                <a href="#editParam" data-toggle="tab">参数编辑</a>
            </li>
            <li>
                <a href="#setParam" @click="initSetting" data-toggle="tab">参数配置</a>
            </li>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div id="editParam" class="tab-pane fade in active">
                <div ref="leftPart" class="col-sm-2" style="overflow-y: auto;width: 230px;height: 565px;padding:0;">
                    <div id="settingNodeInfo" class="panel-group" style="padding-top: 10px; margin: 0;">
                        <div class="panel panel-default">
                            <div class="panel-heading" style="padding:0;">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" data-parent="#settingNodeInfo" href="#nodeZtree_collapse">节点信息</a>
                                </h4>
                            </div>
                            <div id="nodeZtree_collapse" class="panel-collapse collapse in">
                                <div class="panel-body" style="overflow-x: auto;padding: 0;">
                                    <ul id="nodeZtree" class="ztree" style="max-height:400px;"></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="settingParam" class="panel-group" style="padding-top: 10px; margin: 0;">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" data-parent="#settingParam" href="#paramZtree_collapse">参数</a>
                                </h4>
                            </div>
                            <div id="paramZtree_collapse" class="panel-collapse collapse in">
                                <div class="panel-body" style="overflow-x: auto;">
                                    <ul id="paramZtree" class="ztree"></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="rightPart" class="col-sm-10" style="overflow:hidden;width: calc(100% - 230px);height: 565px;">
                    <textarea id="settingParamsSql" ref="settingParamsSql" style="width: 100%;height: 565px;"></textarea>
                    <div id="operators" style="height:270px;width:100%;padding:15px 0 0 30px;">
                        <div style="width: 260px;float: left;">
                            <button type="button" class="btn btn-primary" title="小于" value="<" @click="operatorsFun('<')">&lt;</button>
                            <button type="button" class="btn btn-primary" title="大于" value=">" @click="operatorsFun('>')">&gt;</button>
                            <button type="button" class="btn btn-primary" title="等于" value="=" @click="operatorsFun('=')">=</button>
                            <button type="button" class="btn btn-primary" title="小于等于" value="<=" @click="operatorsFun('<=')">&lt;=</button>
                            <button type="button" class="btn btn-primary" title="大于等于" value=">=" @click="operatorsFun('>=')">&gt;=</button><br><br>
                            <button type="button" class="btn btn-primary" title="不等于" value="!=" @click="operatorsFun('!=')">!=</button>
                            <button type="button" class="btn btn-primary" title="与" value="and" @click="operatorsFun('and')">and</button>
                            <button type="button" class="btn btn-primary" title="或" value="or" @click="operatorsFun('or')">or</button>
                            <button type="button" class="btn btn-primary" title="空值" value="is null" @click="operatorsFun('is null')">is null</button><br><br>
                            <!--<button type="button" class="btn btn-primary" title="逗号" value="," @click="operatorsFun(',')">,</button>-->
                            <button type="button" class="btn btn-primary" title="模糊匹配" value="like" @click="operatorsFun('like')">like</button>
                            <button type="button" class="btn btn-primary" title="包含" value="in" @click="operatorsFun('in')">in</button>
                            <button type="button" class="btn btn-primary" title="左括号" value="(" @click="operatorsFun('(')">(</button>
                            <button type="button" class="btn btn-primary" title="右括号" value=")" @click="operatorsFun(')')">)</button>
                            <button type="button" class="btn btn-primary" title="空字符串" value="''" @click="operatorsFun('\'\'')">'&nbsp;&nbsp;'</button><br><br>
                            <button type="button" class="btn btn-primary" title="不为空值" value="is not null" @click="operatorsFun('is not null')">is not null</button>
                            <button type="button" class="btn btn-primary" title="介于…之间" value="between and" @click="operatorsFun('between and')">between and</button>
                        </div>
                        <div style="float: left;width:calc(100% - 260px);height: 100%;">
                            <p>注：1、多值参数一般只应用于【in】条件</p>
                            <p style="text-indent: 2em;">2、【in】条件中的参数不需要编写单引号，非【in】条件的参数需编写单引号，</p>
                            <p style="text-indent: 4em;">例：客户名称='<button class="paramBtn">单值参数X</button>' and 客户号 in(<button class="paramBtn">多值参数Y</button>)</p>
                            <p style="text-indent: 2em;">3、编写含有参数的SQL条件语句同时符合以下条件时，需做特殊处理：</p>
                            <p style="text-indent: 4em;">① 【in】条件语句，括号内不能出现空格，例：客户号 in(<button class="paramBtn">多值参数X</button>)</p>
                            <p style="text-indent: 4em;">② 存在于括号内的语句，条件应与括号之间存在空格，</p>
                            <p style="text-indent: 4em;">例：code='<button class="paramBtn">单值参数X</button>' or ( code='<button class="paramBtn">单值参数Y</button>' and name='<button class="paramBtn">单值参数Z</button>' )</p>
                        </div>
                    </div>
                </div>
            </div>
            <div id="setParam" class="tab-pane fade">
                <div class="col-sm-8" style="margin-left: 16.666%;">
                    <span style="color: red;line-height: 35px;height: 30px;">注：可通过上下拖动行对参数进行排序设置</span>
                    <table id="setParamTable" class="table table-bordered">
                        <thead>
                        <tr>
                            <th align="center">参数名称</th>
                            <th align="center" width="400px">默认值设置</th>
                            <th align="center">参数说明</th>
                        </tr>
                        </thead>
                        <tbody ref="setParamTbody">
                            <tr ref="setParamTr" v-for="(setParamObj,index) in setParamArr" :index="index">
                                <td align="center">{{setParamObj.name}}</td>
                                <td v-if="setParamObj.inputType === 'lineinp'" ref="selectParam">
                                    <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div>
                                </td>
                                <td v-if="setParamObj.inputType === 'textinp'" ref="textParam">
                                    <el-input :title="setParamObj.title" class='paramOption paramTr' v-model="setParamObj.value"></el-input>
                                </td>
                                <td v-if="setParamObj.inputType === 'timeinp'" ref="dataParam">
                                    <div class='input-group date form_date' data-date-format='yyyy-mm-dd' data-link-format='yyyy-mm-dd' :title="setParamObj.title">
                                        <input class='form-control paramOption paramTr' readonly type='text' v-model="setParamObj.value"/>
                                        <span class='input-group-addon' style='width: auto;'>
                                            <span class='glyphicon glyphicon-remove'></span>
                                        </span>
                                    </div>
                                </td>
                                <td v-if="setParamObj.inputType === 'treeinp'" ref="selectTreeParam" >
                                    <div :id="setParamObj.id" :title="setParamObj.title" class='xm-select-demo paramTr'></div>
                                </td>
                                <td>{{setParamObj.description}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    require('@/views/graphtool/tooldic/js/paramCommon.js')
    require('@/components/ams-codemirror/addon/edit/matchbrackets.js')
    require('@/components/ams-codemirror/mode/sql/sql.js')
    require('@/components/ams-codemirror/addon/hint/sql-hint.js')
    require('@/components/ams-codemirror/addon/hint/show-hint.js')
    require('@/components/ams-codemirror/addon/wrap/hardwrap.js')
    import * as settingParams from '@/views/graphtool/tooldic/page/settingParams/js/settingParams'
    export default {
        name: 'SettingParams',
        data(){
            return{
                setParamArr :[],
                paramDivArr:[],// 用来记录参数按钮（因反显时不能全部渲染参数的div元素，因此只能用变量记录）
                isAdd:Object.keys(this.paramsSetting).length === 0,// 此次操作是新增还是修改
                editor:null,//编辑器对象
                cursor:null,//鼠标位置对象
                arr:this.paramsSetting.arr ? this.paramsSetting.arr : [],
                sql:this.paramsSetting.sql ? this.paramsSetting.sql : '',
                mouseX: -1,
                mouseY: -1,
                initTreeSuccess:false//左侧树是否成功加载
            }
        },
        props:["graph","nodeId","paramsSetting"],
        mounted(){
            settingParams.sendSettingVue(this)
            this.initSqlEditor(300)//初始化文本编辑器
            this.initSetting()
            this.$nextTick( () => {
                this.$parent.$parent.initNodeSettingVue = true
            })
        },
        methods:{
            initSqlEditor(heightPx){
                let sqlDom = document.getElementById('settingParamsSql')
                this.editor = settingParams.initSqlEditor(sqlDom,heightPx)
                if (this.arr.length > 0) { // 如果有设置参数
                    // 反显参数的设置
                    this.editor.setValue(this.sql)
                    // 替换参数
                    settingParams.replaceParam(this.paramsSetting)
                }
                settingParams.init(this.nodeId)
            },
            initEvent(event){
                this.mouseX = event.layerX
                this.mouseY = event.layerY
            },
            initSetting(){
                settingParams.initSetting()
            },
            operatorsFun(val){
                // 获取文本域的光标位置
                var cursor = this.editor.getCursor()
                this.editor.replaceRange(val, cursor, cursor)
            },
            getOptMessage(){
                return settingParams.getOptMessage()
            },
            getParamsSetting(){
                return settingParams.getParamsSetting()
            }
        }
    }
</script>
<style scoped src="@/components/ams-codemirror/lib/codemirror.css"></style>
<style scoped src="@/components/ams-codemirror/theme/idea.css"></style>
<style scoped src="@/components/ams-codemirror/addon/hint/show-hint.css"></style>
<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/components/ams-basic/css/accordion.css"></style>
<style scoped src="@/components/ams-basic/css/common.css"></style>
<style scoped type="text/css">
    div#operators button{
        margin-left:5px;
    }
    div#operators p{
        color: red;
        word-wrap: break-word;
    }
    .paramBtn{
        background-color: #C9C5C5;
        padding:3px;
        border: 1px solid #C9C5C5;
        color: #1D7030;
        font-weight: 500;
    }
    td>.form-group{
        margin-bottom: 0;
    }
    .table > tbody > tr > td{
        font-size: 13px;
        color: #4B4B4B;
    }
    .table > thead > tr > th {
        background-color: #5886B2;
        color: #ECF0F5;
    }
</style>
