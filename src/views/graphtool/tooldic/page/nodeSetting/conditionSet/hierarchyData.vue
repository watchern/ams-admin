<template>
    <div style="height:560px;padding-top: 20px;" ref="hierarchyDataDiv" v-loading="layeringLoading" element-loading-text="正在加载字段的区间值，请稍后……">
        <el-row>
            <el-col :span="5">
                <p style="color:red;height:30px;line-height: 30px;">注：分层区间数不能超过五个</p>
            </el-col>
            <el-col :span="7">
                <el-col :span="8" style="text-align: right;">
                    <label style="line-height: 36px;">分层字段：</label>
                </el-col>
                <el-col :span="16">
                    <el-select v-model="hierarchy_column" filterable @change="empty_set">
                        <el-option v-for="colObj in hierarchyColumnArr" :key="colObj.newColumnName" :value="colObj.newColumnName">{{colObj.newColumnName}}</el-option>
                    </el-select>
                </el-col>
            </el-col>
            <el-col :span="12" ref="rangeCol" v-if="!rangeTip" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                <span style="height:30px;line-height: 30px;padding-left: 20px;">{{range}}</span>
            </el-col>
            <el-col :span="12" ref="rangeCol" v-if="rangeTip" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                <el-tooltip class="item" effect="dark" :content="range" placement="bottom">
                    <span style="height:30px;line-height: 30px;padding-left: 20px;">{{range}}</span>
                </el-tooltip>
            </el-col>
        </el-row>
        <el-table :data="items" height="450" style="width: 600px;">
            <el-table-column label="分层区间" width="500" header-align="center" :resizable="false">
                <template slot-scope="scope">
                    <el-col :span="10">
                        <el-input v-model="scope.row.c_col_1" type="number" min="1"/>
                    </el-col>
                    <el-col :span="4">
                        <div style="height: 36px;line-height: 36px;text-align: center;">至</div>
                    </el-col>
                    <el-col :span="10">
                        <el-input v-model="scope.row.c_col_2" type="number" min="1"/>
                    </el-col>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" :resizable="false">
                <template slot-scope="scope">
                    <el-button v-if="scope.$index === 0" type="primary" class="oper-btn add-5" @click="addRows" style="line-height: normal;"/>
                    <el-button v-if="scope.$index !== 0" type="primary" class="oper-btn delete-1" @click="clickDel(scope.$index)" style="line-height: normal;"/>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {getMaxMinColumn} from '@/api/graphtool/apiJs/graphList'
    export default {
        name: 'HierarchyDataSet',
        data() {
            return {
                layeringLoading:true,
                nodeData:null,
                pre_str_column: [],
                dict_map: [],
                keyId: 0,
                items: [{id: this.keyId,c_col_1: '',c_col_2: ''}],
                websocketLayeringId: '',
                loginUserUuid: '',
                hierarchy_column:'',
                hierarchyColumnArr:[],
                range:'',
                rangeTip:false
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                this.loginUserUuid = this.$store.state.user.id
                let graph = this.$parent.$parent.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                let parentIds = this.nodeData.parentIds
                let parent_node = graph.nodeData[parentIds[0]]
                let typeArr = ['INTEGER', 'DECIMAL', 'NUMBER', 'FLOAT', 'REAL', 'DATE', 'TIMESTAMP']
                let columnsInfoPre = this.$parent.$parent.$parent.columnsInfoPre
                if (this.nodeData.isSet) {
                    columnsInfoPre = this.nodeData.setting.columnsInfo
                }
                if (columnsInfoPre.length !== 0) { // 初始化数据源
                    for(let i=0; i<columnsInfoPre.length; i++){
                        if ($.inArray(columnsInfoPre[i].columnType, typeArr) > -1) {
                            this.hierarchyColumnArr.push({newColumnName:columnsInfoPre[i].newColumnName})
                            this.pre_str_column.push(columnsInfoPre[i].newColumnName)
                        }
                    }
                }
                if (this.pre_str_column.length === 0) {
                    this.$message({ type: 'warning', message: '上一节点的表或视图暂无可分层的字段' })
                } else {
                    let isRoleTable = false //上级节点的表是否需要走权限
                    let optType = parent_node.nodeInfo.optType
                    if(optType === "datasource"){//原表
                        isRoleTable = true
                    }
                    if(optType === "newNullNode"){//结果表
                        if(parent_node.nodeInfo.midTableStatus === 2 || parent_node.nodeInfo.resultTableStatus === 2){
                            isRoleTable = true
                        }
                        var pre_parentIds = parent_node.parentIds;
                        if(pre_parentIds && pre_parentIds.length > 0){
                            parent_node = graph.nodeData[pre_parentIds[0]];
                        }
                    }
                    if (parent_node.nodeInfo.resultTableName === '') {
                        this.$message({ type: 'warning', message: '请先执行上一节点' })
                    } else {
                        if (this.nodeData.isSet) {
                            this.layeringLoading = false
                            this.dict_map = this.nodeData.setting.dict_map
                            this.empty_set(this.nodeData.setting.hierarchy_column)// 选择的分层字段
                            this.items = []
                            this.$nextTick(() => {
                                for (let i = 0; i < this.nodeData.setting.hierarchy_map.length; i++) {
                                    let obj = this.nodeData.setting.hierarchy_map[i]
                                    this.keyId = i
                                    this.items.push({
                                        id: i,
                                        c_col_1: obj.c_col_1,
                                        c_col_2: obj.c_col_2
                                    })
                                }
                            })
                        }else{
                            /**
                             * 获得上一节点执行结果的选择字段的最大值和最小值
                             */
                            let dataParam = {
                                'tableName': parent_node.nodeInfo.resultTableName,
                                'openType': graph.openType,
                                'exeColumns': this.pre_str_column.join(','),
                                'isRoleTable':isRoleTable
                            }
                            getMaxMinColumn(dataParam).then( response => {
                                this.layeringLoading = false
                                if (response.data == null){
                                    this.$message.error('获取数据列的区间值失败')
                                }else {
                                    if (response.data.isError) {
                                        this.$message.error(response.data.message)
                                    } else {
                                        this.dict_map = response.data.map_range
                                    }
                                }
                            }).catch( () => {
                                this.layeringLoading = false
                            })
                        }
                    }
                }
            },
            empty_set(sel_column) {
                this.hierarchy_column = sel_column
                this.items = []
                this.keyId = 0
                this.items.push({
                    id: this.keyId,
                    c_col_1: '',
                    c_col_2: ''
                })
                if (sel_column === '') {
                    this.range = ''
                    return
                }
                var max_value = this.dict_map['max_' + sel_column]
                var min_value = this.dict_map['min_' + sel_column]
                if (!isNaN(parseInt(min_value)) && !isNaN(parseInt(max_value))) {
                    this.range = '【最小值：' + min_value + ' ~ 最大值：' + max_value + '】'
                } else {
                    this.range = '【最小值：空  ~  最大值：空】'
                }
                this.$nextTick( () => {
                    let cWidth = this.$refs.rangeCol.$el.clientWidth;
                    let sWidth = this.$refs.rangeCol.$el.scrollWidth;
                    if (sWidth > cWidth) { //超过容器宽度
                        this.rangeTip = true
                    }
                })
            },
            /**
             * 添加行
             */
            addRows() {
                if (this.items.length === 5) {
                    return
                }
                this.keyId = this.keyId + 1
                this.items.push({ id: this.keyId, c_col_1: '', c_col_2: '' })
            },
            /**
             * 删除行
             */
            clickDel(index) {
                this.items.splice(index, 1)
            },
            saveSetting() {
                var obj = {
                    hierarchy_column: this.hierarchy_column,
                    hierarchy_map: [],
                    dict_map: this.dict_map,
                    columnsInfo: this.$parent.$parent.$parent.columnsInfoPre
                }
                for(let i=0; i<this.items.length; i++){
                    let c_col_1 = this.items[i].c_col_1
                    let c_col_2 = this.items[i].c_col_2
                    obj.hierarchy_map.push({ c_col_1,c_col_2 })
                }
                this.nodeData.setting = obj
            },
            inputVerify() {
                let verify = true
                if (this.hierarchy_column === '') {
                    this.$message({ type: 'warning', message: '未选择分层字段' })
                    return false
                }
                let obj = this.items.find( item => item.c_col_1 === '' || item.c_col_2 === '')
                if(typeof obj !== "undefined"){
                    this.$message({ type: 'warning', message: '分层区间的输入值不能为空' })
                    verify = false
                    return false
                }
                return verify
            }
        }
    }

</script>
