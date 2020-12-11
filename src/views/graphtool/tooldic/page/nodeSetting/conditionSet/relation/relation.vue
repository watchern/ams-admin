<template>
    <div style="height: 600px;">
        <ul ref="myTab" class="nav nav-tabs">
            <li>
                <a href="#basic" data-toggle="tab">基本信息</a>
            </li>
            <li class="active">
                <a href="#filter_jsp" data-toggle="tab">条件设置</a>
            </li>
            <li>
                <a href="#column" data-toggle="tab">输出字段设置</a>
            </li>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div id="basic" class="tab-pane fade">
                <Basic ref="basicVueRef"/>
            </div>
            <div id="filter_jsp" class="tab-pane fade in active">
                <div id="col10" class="col-sm-12" style="position: relative;background-color: #fff">
                    <div id="myDiagramDiv" ref="myDiagramDiv" class="col-sm-9" style="width:calc(100% - 245px);border: solid 1px #F3F3F3;height:600px;" @mouseover="myDiagramMousemove"></div>
                    <img v-if="showRight" width="15" height="15" title="画布放大" src="../images/fangda.png" style="z-index:9999;position: relative;top: 10px;right:30px;" @click="amplify">
                    <img v-if="!showRight" width="15" height="15" title="画布缩小" src="../images/fangda.png" style="z-index:9999;position: relative;right: 0;top: 10px;" @click="reduce">
                    <div v-if="showRight" style="width: 245px;float: right;">
                        <div style="padding: 0px 4px; height: 120px;">
                            <div class="tstext"><span style="font-weight: 800">表连接</span>（显示多个表间的关联关系）</div>
                            <div id="form" style="background: #F7F7F7;border: 1px solid #F3F3F3;height:90%;overflow-y:auto">
                                <div class="form-group" v-if="showTableJoin">
                                    <div class="col-sm-12">
                                        <input name="MainTable" type="text" class="form-control" v-model="mainTableName" id="MainTable" disabled="disabled"/>
                                    </div>
                                    <div class="form-group">
                                        <label class="col-sm-6 control-label">关联关系：</label>
                                        <div class="col-sm-6">
                                            <el-select v-model="joinType" @change="changeType">
                                                <el-option v-for="joinTypeObj in joinTypeArr" :value="joinTypeObj.value" :label="joinTypeObj.name">{{joinTypeObj.name}}</el-option>
                                            </el-select>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="col-sm-12">
                                            <input type="text" class="form-control" v-model="slaverTableName" disabled="disabled"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:15px;height: 300px;overflow-y: auto;">
                            <div class="tstext"><span style="font-weight: 800">名词解释</span></div>
                            <div v-show="showDescription" style="background: #F7F7F7;overflow-y:auto;height:90%;padding:5px;">
                                <p ref="descriptionP" style="text-indent: 2em;">左连接：选取关联字段将两张表进行关联，左表的所有数据均显示，右表的数据只显示关联字段值相等的数据，若右表关联结果无数据则补空显示（例：详见右上角【帮助】）</p>
                                <p ref="descriptionP" style="text-indent: 2em;">右连接：选取关联字段将两张表进行关联，右表的所有数据均显示，左表的数据只显示关联字段值相等的数据，若左表关联结果无数据则补空显示（例：详见右上角【帮助】）</p>
                                <p ref="descriptionP" style="text-indent: 2em;">内连接：选取关联字段将两张表进行关联，仅显示两张表中关联字段值相等的数据（例：详见右上角【帮助】）</p>
                                <p ref="descriptionP" style="text-indent: 2em;">外连接：选取关联字段将两张表进行关联，显示出左表和右表关联后的所有数据，但去除重复数据，两表中若无关联数据则补空显示（例：详见右上角【帮助】）</p>
                            </div>
                        </div>
                        <div style="height: 140px;">
                            <div class="tstext"><span style="font-weight: 800">连接条件</span>（只显示左侧选中线的连接条件）</div>
                            <div class="col-sm-12" style="background: #F7F7F7;overflow:auto;height: 110px;">
                                <div v-if="showJoinArea" class="form-group">
                                    <div class="col-sm-12">
                                        <input v-model="mainPort" type="text" class="form-control" disabled="disabled"/>
                                    </div>
                                </div>
                                <div v-if="showJoinArea" class="form-group">
                                    <div class="col-sm-8">
                                        <el-select v-model="comper" @change="changeCopare">
                                            <el-option v-for="obj in comperArr" :value="obj.value" :label="obj.name">{{obj.name}}</el-option>
                                        </el-select>
                                    </div>
                                </div>
                                <div v-if="showJoinArea" class="form-group">
                                    <div class="col-sm-12">
                                        <input v-model="toPort" type="text" class="form-control" disabled="disabled"/>
                                        <input v-model="from" type="hidden" class="form-control">
                                        <input v-model="to" type="hidden" class="form-control">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="sql" class="col-sm-12" style="display:none;background: #F7F7F7;height: 40%;overflow:auto"></div>
            </div>
            <div id="column" class="tab-pane fade">
                <div style="width: 98%;margin: 4px 1%">
                    <div style="color: red;">
                        <p>注：（1）如果修改了【输出字段名称】且存在已配置过或执行过的后续节点，则后续节点关于该字段的配置信息会失效</p>
                        <p style="text-indent: 2em">（2）如果继续使用后续节点，则需重新配置和执行相关节点</p>
                        <p style="text-indent: 2em">（3）如果修改了【输出字段名称】后并执行了当前节点，则后续节点的执行结果会发生变化</p>
                        <p style="text-indent: 2em">（4）支持通过拖拽更改输出字段的顺序，同时在结果集中同步展示</p>
                    </div>
                    <div id="outPutTable"style="height: 500px;overflow-y: auto;">
                        <table id="column_config" class="table table-bordered">
                            <thead>
                            <tr>
                                <th width="5%" style="text-align: center">序号</th>
                                <th width="30%" style="text-align: center">上一节点名称</th>
                                <th width="25%" style="text-align: center">字段名称</th>
                                <th width="25%" style="text-align: center">输出字段名称</th>
                                <th width="15%" style="text-align: center">是否为输出字段
                                    <el-checkbox v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <tbody ref="outputTbody">
                            <tr v-for="(item,index) in items" ref="colTr" :data-index="index">
                                <td align="center">{{index+1}}</td>
                                <td>{{item.rtn}}</td>
                                <td>{{item.columnName}}</td>
                                <td>
                                    <input v-model="item.disColumnName" type="text"  class="form-control newColumn" @blur="vilidata_simple(index)"/>
                                </td>
                                <td class="text-center">
                                    <el-checkbox v-model="item.checked" :name="item.attrColumnName" :key="item.id" @change="checkBoxChange(index)"></el-checkbox>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Basic from '@/views/graphtool/tooldic/page/nodeSetting/basic.vue'
    import * as relationJs from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/relation/js/relation'
    export default {
        name: 'RelationSetting',
        components:{ Basic },
        data(){
            return{
                columnsInfoPre: [], // 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
                layeX: -1,
                layeY: -1,
                joinShow:false,
                mainTableName:'',
                slaverTableName:'',
                items:[],
                checkAll:false,
                toPort:'',
                from:'',
                to:'',
                showJoinArea:false,//是否显示数据表关联条件
                comper:'=',
                comperArr:[{value:"=",name:"等于"},
                    {value:"!=",name:"不等于"},
                    {value:">",name:"大于"},
                    {value:">=",name:"大于等于"},
                    {value:"<",name:"小于"},
                    {value:"<=",name:"小于等于"}],
                mainPort:'',
                showDescription:true,
                showRight:true,
                showTableJoin:false,
                joinType:'INNER JOIN',
                joinTypeArr:[{value:"LEFT JOIN",name:"左连接"},
                        {value:"RIGHT JOIN",name:"右连接"},
                        {value:"INNER JOIN",name:"内连接"},
                        {value:"FULL JOIN",name:"外连接"}]
            }
        },
        props:["graph"],
        mounted(){
            this.init();
        },
        methods:{
            init(){
                relationJs.sendVueObj(this);
                relationJs.init();
                $(this.$refs.outputTbody).sortable().disableSelection()
            },
            myDiagramMousemove(event){
                this.layeX = event.layerX
                this.layeY = event.layerY
            },
            saveNodeInfo(){
                return relationJs.saveNodeInfo()
            },
            changeType(val) {
                this.joinType = val
                relationJs.changeType()
            },
            amplify(){
                relationJs.amplify()
            },
            reduce(){
                relationJs.reduce()
            },
            changeCopare(val){
                this.comper = val
                relationJs.changeCopare(val)
            },
            handleCheckAllChange(checked){
                Array.from(this.items, (n) => n.checked = checked)
            },
            checkBoxChange(index){
                var chk = 0
                for(let i=0; i<this.items.length; i++){
                    if(this.items[i].checked){
                        chk++
                    }
                }
                if (this.items.length === chk) { // 全选
                    this.checkAll = true
                } else { // 不全选
                    this.checkAll = false
                }
            },
            vilidata_simple(index){
                let vili_column = []
                let verify = true
                let message = ''
                let checkedNum = 0
                if(typeof index !== "undefined"){//失焦时校验输出列是否重复
                    let curDisColumnName = this.items[index].disColumnName
                    for(let i=0; i<this.items.length; i++){
                        if(this.items[i].checked){
                            if(index !== i){
                                if(curDisColumnName === this.items[i].disColumnName){
                                    verify = false
                                    message = `第${index+1}行与第${i+1}行的输出字段重复！请修改`
                                    break
                                }
                            }
                            checkedNum++
                        }
                    }
                }else{//保存配置时校验输出列是否重复
                    for(let i=0; i<this.items.length; i++){
                        if(this.items[i].checked){
                            let disColumnName = this.items[i].disColumnName
                            let curIndex = vili_column.findIndex(item => item === disColumnName)
                            if(curIndex > 0){
                                verify = false
                                message = `第${curIndex+1}行与第${i+1}行的输出字段重复！请修改`
                            }
                            checkedNum++
                        }
                        vili_column.push(this.items[i].disColumnName)
                    }
                }
                if(checkedNum === 0){
                    this.$message({ type: 'info', message: '请选择输出字段' })
                    verify = false
                }else{
                    if (!verify) {
                        this.$message({ type: 'info', message: message })
                    }
                }
                return verify
            },
            inputVerify() {
                return true		// 只是为了全局校验，此节点配置不用单独校验
            }
        }
    }
</script>

<style scoped type="text/css">
    .column-has-error{
        border: 1px solid red;
    }
    .tstext{
        padding-left: 5px;
    }
</style>
