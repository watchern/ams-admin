<template>
    <div>
        <ul id="myTab" class="nav nav-tabs">
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
                <Basic />
            </div>
            <div id="filter_jsp" class="tab-pane fade in active">
                <div id="col10" class="col-sm-12" style="position: relative;background-color: #fff">
                    <div id="myDiagramDiv" class="col-sm-9" style="border: solid 1px #F3F3F3;height:100%;"></div>
                    <img id="fd" width="15" height="15" title="画布放大" src="../images/fangda.png" style="z-index:9999;position: absolute;top: 12px;" @click="amplify">
                    <img id="sx" width="15" height="15" title="画布缩小" src="../images/fangda.png" style="z-index:9999;position: absolute;right: 10px;top: 12px;display: none;" @click="reduce">
                    <div id="joins" class="col-sm-3" style="padding: 0px 4px; height: 35%;">
                        <div class="tstext"><span style="font-weight: 800">表连接</span>（显示多个表间的关联关系）</div>
                        <div id="form" style="background: #F7F7F7;border: 1px solid #F3F3F3;height:90%;overflow-y:auto">
                            <div class="form-group" id="join" style="display: none;">
                                <div class="col-sm-12">
                                    <input name="MainTable" type="text" class="form-control" v-model="mainTableName" id="MainTable" disabled="disabled"/>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-6 control-label">关联关系：</label>
                                    <div class="col-sm-6">
                                        <select v-model="joinType" style="width:100%" @change="changeType">
                                            <option value="LEFT JOIN">左连接</option>
                                            <option value="RIGHT JOIN">右连接</option>
                                            <option value="INNER JOIN">内连接</option>
                                            <option value="FULL JOIN">外连接</option>
                                            </select>
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
                    <div id="tips" class="col-sm-3" style="margin:15px 0;">
                        <div class="tstext"><span style="font-weight: 800">名词解释</span></div>
                        <div id="description" style="background: #F7F7F7;overflow-y:auto;height:90%;padding:5px;">
                            <p style="display:none;text-indent: 2em;">左连接：选取关联字段将两张表进行关联，左表的所有数据均显示，右表的数据只显示关联字段值相等的数据，若右表关联结果无数据则补空显示（例：详见右上角【帮助】）</p>
                            <p style="display:none;text-indent: 2em;">右连接：选取关联字段将两张表进行关联，右表的所有数据均显示，左表的数据只显示关联字段值相等的数据，若左表关联结果无数据则补空显示（例：详见右上角【帮助】）</p>
                            <p style="display:none;text-indent: 2em;">内连接：选取关联字段将两张表进行关联，仅显示两张表中关联字段值相等的数据（例：详见右上角【帮助】）</p>
                            <p style="display:none;text-indent: 2em;">外连接：选取关联字段将两张表进行关联，显示出左表和右表关联后的所有数据，但去除重复数据，两表中若无关联数据则补空显示（例：详见右上角【帮助】）</p>
                        </div>
                    </div>
                    <div id="tjHidden" class="col-sm-3" style="margin-top:10px;">
                        <div class="tstext"><span style="font-weight: 800">连接条件</span>（只显示左侧选中线的连接条件）</div>
                        <div id="linkDiv" class="col-sm-12" style="background: #F7F7F7;overflow:auto">
                            <div id="join2" class="form-group" style="display:none;">
                                <div class="col-sm-12">
                                    <input id="MainPort" name="MainPort" type="text" class="form-control" disabled="disabled"/>
                                </div>
                            </div>
                            <div id="select" class="form-group" style="display:none;">
                                <div class="col-sm-8">
                                    <select id="comper" @change="changeCopare">
                                        <option value="=">等于</option>
                                        <option value="!=">不等于</option>
                                        <option value="&gt;">大于</option>
                                        <option value="&gt;=">大于等于</option>
                                        <option value="&lt;">小于</option>
                                        <option value="&lt;=">小于等于</option>
                                    </select>
                                </div>
                            </div>
                            <div id="join1" class="form-group" style="display:none;">
                                <div class="col-sm-12">
                                    <input id="toPort" name="toPort" type="text" class="form-control" disabled="disabled"/>
                                    <input id="from" name="from" type="hidden" class="form-control">
                                    <input id="to" name="to" type="hidden" class="form-control">
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
                    <table id="column_config" class="table table-bordered">
                        <thead>
                        <tr>
                            <th width="30%">上一节点名称</th>
                            <th width="25%">字段名称</th>
                            <th width="30%">输出字段名称</th>
                            <th width="15%">是否为输出字段
                                <input id="sel_all" type="checkbox" class="form-control"/>
                            </th>
                        </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Basic from '@/views/graphtool/tooldic/page/nodeSetting/basic.vue'
    import * as relationJs from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/relation/js/relation'
    export default {
        name: 'RelationSet',
        components:{ Basic },
        data(){
            return{
                graph: parent.graph,
                columnsInfoPre: [], // 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
                layeX: -1,
                layeY: -1,
                joinShow:false,
                mainTableName:'',
                joinType:'INNER JOIN',
                slaverTableName:''
            }
        },
        mounted(){
            this.init();
        },
        methods:{
            init(){
                $('#myTabContent').css({ 'overflow-y': 'auto', 'height': function() {
                    return ($(document).height() - 50) + 'px'
                } })
                let diagramDiv = document.getElementById('myDiagramDiv')
                diagramDiv.onmousemove = function(event) {
                    this.layeX = event.layerX
                    this.layeY = event.layerY
                }
                $('#col10').height($(document).height() - $('#myTab').height() - 15)
                $('#linkDiv').height($(document).height() * 0.25)
                $('#tips').height($(document).height() * 0.15)
                $('#fd').css({ 'right': function() {
                    return ($('#tips').width() + 30) + 'px'
                } })
                relationJs.sendVueObj(this);
                relationJs.init();
            },
            changeType() {
                relationJs.changeType()
            },
            amplify(){
                relationJs.amplify()
            },
            reduce(){
                relationJs.reduce()
            },
            changeCopare(){
                relationJs.changeCopare()
            }
        }
    }

    function saveNodeInfo() {
        return relationJs.saveNodeInfo()
    }

    // 页面输入项的校验(或空配置校验)
    function inputVerify() {
        return true		// 只是为了全局校验，此节点配置不用单独校验
    }

    $('#sel_all').click(function() {
        if ($(this).prop('checked')) {
            $('.ckbox').addClass('checked')
        } else {
            $('.ckbox').removeClass('checked')
        }
    })
</script>

<style scoped>

</style>
