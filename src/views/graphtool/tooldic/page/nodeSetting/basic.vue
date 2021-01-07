<template>
    <div>
        <el-form>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="节点名称" prop="graphName">
                        <el-input v-model="node_name" style="width: 90%;"/>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="执行状态" prop="graphName">
                        <el-input v-model="nodeExcuteStatus" style="width: 90%;" :disabled="statusDisabled"/>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-form-item label="节点备注" prop="graphName">
                    <el-input type="textarea" style="width: 95%;" :autosize="{ minRows: 3, maxRows: 5}" placeholder="请输入内容" v-model="nodeDescription"></el-input>
                </el-form-item>
            </el-row>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: 'BasicSetting',
        mounted() {
            this.init()
            // window.basicInfoVerify = this.basicInfoVerify
        },
        data(){
            return{
                nodeData:null,
                node_name:'',
                nodeExcuteStatus:'',
                statusDisabled:true,
                nodeDescription:''
            }
        },
        methods: {
            init() {
                /**
                 * 获取前置节点输出列信息
                 * 前提是前置节点一定存在
                 * 获得上移节点字段列已经选择的信息字段
                 */
                let graph = this.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                let columnsInfoPre = this.$parent.columnsInfoPre
                var parentIds = this.nodeData.parentIds
                if (parentIds.length > 0) {
                    for (let i = 0; i < parentIds.length; i++) {
                        var parent_node = graph.nodeData[parentIds[i]] // one parent
                        var resourceTableName = '"' + parent_node.nodeInfo.nodeName + '"'
                        if (parent_node && parent_node.nodeInfo.optType === 'newNullNode' && !parent_node.isSet) {		// 如果前置节点为结果表且该结果表未配置
                            var pre_parentIds = parent_node.parentIds
                            if (pre_parentIds && pre_parentIds.length > 0) {
                                parent_node = graph.nodeData[pre_parentIds[0]]
                                resourceTableName = '"' + parent_node.nodeInfo.nodeName + '"_' + resourceTableName
                            }
                        }
                        var filter_columnsInfoPre = JSON.parse(JSON.stringify(parent_node.columnsInfo))// 这时上级节点一定是已经配置完成
                        for (let j = 0; j < filter_columnsInfoPre.length; j++) {
                            if (filter_columnsInfoPre[j].isOutputColumn) {
                                filter_columnsInfoPre[j].rtn = resourceTableName
                                filter_columnsInfoPre[j].nodeId = parent_node.nodeInfo.nodeId
                                filter_columnsInfoPre[j].nullNodeId = parentIds[i]
                                columnsInfoPre.push(filter_columnsInfoPre[j])
                            }
                        }
                    }
                }
                this.init_basic()
            },
            // saveData() {
            //     if ($('#isSaveData').is(':checked')) {
            //         $('.dataTableNameDiv').css("visibility","visible")
            //         var dataTableName = $('#dataTableName').val()
            //         if (dataTableName === '') {
            //             $('#dataTableName').val(this.nodeInfo.nodeName + '结果表')
            //         }
            //     } else {
            //         $('.dataTableNameDiv').css("visibility","hidden")
            //         $('#isSaveDataTitle').hide()
            //     }
            // },
            init_basic: function() {
                this.node_name = this.nodeData.nodeInfo.nodeName
                // $('.dataTableNameDiv').css("visibility","hidden")
                // if (this.nodeInfo.isCreateTable && this.nodeInfo.isCreateTable === 1) {
                //     $('#isSaveData').attr('checked', 'checked')
                //     $('#dataTableName').val(this.nodeInfo.userTableName)
                //     $('.dataTableNameDiv').css("visibility","visible")
                // } else {
                //     $('#isCreateTable').icheck('unchecked')
                // }
                this.nodeExcuteStatus = this.conversion(this.nodeData.nodeInfo.nodeExcuteStatus)
                this.nodeDescription = typeof this.nodeData.nodeInfo.nodeDescription === 'undefined' ? '' : this.nodeData.nodeInfo.nodeDescription
            },
            save_base: function() {
                // if ($('#isSaveData').is(':checked')) {
                //     this.nodeInfo.isCreateTable = 1
                //     this.nodeInfo.userTableName = $('#dataTableName').val()
                // } else {
                //     this.nodeInfo.isCreateTable = 0
                // }
                this.nodeData.nodeInfo.nodeName = this.node_name
                this.nodeData.nodeInfo.nodeDescription = this.nodeDescription
            },
            conversion: function(exe_type) {
                if (typeof exe_type === 'undefined') {
                    return '未执行'
                } else {
                    var text = ''
                    switch (exe_type) {
                        case 1:
                            text = '未执行'
                            break
                        case 2:
                            text = '执行中'
                            break
                        case 3:
                            text = '执行成功'
                            break
                        case 4:
                            text = '执行失败'
                            break
                    }
                    return text
                }
            },
            basicInfoVerify() {
                let node_name = this.node_name
                // var isSaveData = $('#isSaveData').prop('checked')
                // var dataTableName = $('#dataTableName').val()
                // var nameContainArr = ['`', '~', '!', '@', '%', '^', '&', '*', '(', ')', '）', '+', '/', '-']
                if (node_name === '') {
                    this.$message({ type: 'warning', message: '请输入节点名称' })
                    return false
                }
                // if (isSaveData && dataTableName === '') {
                //     alertMsg('提示', '请输入结果表名称', 'info')
                //     return false
                // }
                // var hasSpecailChar = false
                // var specailChar = ''
                // for (var i = 0; i < nameContainArr.length; i++) {
                //     specailChar = nameContainArr[i]
                //     if (dataTableName.indexOf(specailChar) > 0) {
                //         hasSpecailChar = true
                //         break
                //     }
                // }
                // if (hasSpecailChar) {
                //     alertMsg('提示', "结果表名称不能含有特殊字符“<span style='color: red;font-weight: bold;font-size: 20px;'>" + specailChar + '</span>”', 'info')
                //     return false
                // }
                return true
            }
        }
    }
</script>

<style scoped type="text/css">
    .label1{
        padding: 12px 5px 0 10px !important;
    }
</style>
