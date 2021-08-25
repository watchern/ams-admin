<template>
    <div style="width: 100%;height:auto;padding-left:35px;">
        <el-row style="height:30px;line-height: 30px;color: red;margin: 10px 0;">注：字段的排序顺序是由选择字段时的前后顺序决定</el-row>
        <el-transfer filterable filter-placeholder="请输入搜索内容" v-model="columnDataValue" target-order="push" :data="columnData" :titles="['可选字段', '排序字段']" @change="changeSortData" ref="transferSort">
            <span slot-scope="{ option }">
                <el-row v-if="!option.showSort">{{option.label}}</el-row>
                <el-row v-if="option.showSort">
                    <el-col :span="14" ref="sortCol" class="transfer_sortCol" :dataValue="option.key" v-if="option.isTip" :dataKey="option.key" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                        <el-tooltip class="item" effect="dark" :content="option.label" placement="top">
                            <span>{{option.label}}</span>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="14" ref="sortCol" class="transfer_sortCol" :dataValue="option.key" v-if="!option.isTip">{{option.label}}</el-col>
                    <el-col :span="10">
                        <el-radio v-if="option.showSort" v-model="option.sortType" label="ASC">升序</el-radio>
                        <el-radio v-if="option.showSort" v-model="option.sortType" label="DESC">降序</el-radio>
                    </el-col>
                </el-row>
            </span>
        </el-transfer>
    </div>
</template>

<script>
    export default {
        name: 'ColumnSortSet',
        data() {
            return {
                nodeData: null,
                columnData: [],//所有可排序字段信息
                columnDataValue:[]//已选排序字段集合
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                const graph = this.$parent.$parent.$parent.graph
                this.nodeData = graph.nodeData[graph.curCell.id]
                console.log(this.nodeData)
                this.curColumnsInfo = this.$parent.$parent.$parent.columnsInfoPre
                if (this.nodeData.isSet) {// 配置过,字段信息来自本身节点
                    this.curColumnsInfo = this.nodeData.setting.curColumnsInfo
                    this.columnDataValue = this.nodeData.setting.columnDataValue
                    console.log(this.curColumnsInfo)
                    Array.from(this.curColumnsInfo, item => this.columnData.push({ 'pinyin': item.newColumnName, 'label': item.newColumnName, 'key': item.columnName, 'sortType': 'ASC', 'showSort': false}))
                    Array.from(this.columnDataValue, n => {
                        let index = this.columnData.findIndex(item => item.key === n)
                        if (index > -1) {
                            this.columnData[index].showSort = true
                            this.$nextTick(() => {
                                let cWidth = this.$refs.sortCol.$el.clientWidth;
                                let sWidth = this.$refs.sortCol.$el.scrollWidth;
                                if (sWidth > cWidth) { //超过容器宽度
                                    let obj = {...{}, ...this.columnData[index]}
                                    obj.isTip = true
                                    this.columnData.splice(index, 1)
                                    this.columnData.splice(index, 1, obj)
                                }
                            })
                        }
                    })
                }else{
                    Array.from(this.curColumnsInfo, item => this.columnData.push({ 'pinyin': item.newColumnName, 'label': item.newColumnName, 'key': item.columnName, 'sortType': 'ASC', 'showSort': false}))
                }
                this.$nextTick( () => {
                    $(this.$refs.transferSort.$refs.rightPanel.$children[2].$el).sortable().disableSelection()
                })
            },
            changeSortData(value, direction, movedKeys){
                Array.from(movedKeys, n => {
                    let index = this.columnData.findIndex(item => item.key === n)
                    if(index > -1){
                        if (direction === 'right') {
                            this.columnData[index].showSort = true
                        } else {
                            this.columnData[index].showSort = false
                        }
                        this.$nextTick( () => {
                            let cWidth = this.$refs.sortCol.$el.clientWidth;
                            let sWidth = this.$refs.sortCol.$el.scrollWidth;
                            if (sWidth > cWidth) { //超过容器宽度
                                let obj = {...{},...this.columnData[index]}
                                obj.isTip = true
                                this.columnData.splice(index,1)
                                this.columnData.splice(index,1,obj)
                            }
                        })
                    }
                })
            },
            saveSetting() {
                let rightData = []
                let columnDataValue = []
                const sortColDom = $(this.$refs.transferSort.$el).find(".transfer_sortCol")
                Array.from(sortColDom, item => {
                    for (let i = 0; i < this.columnData.length; i++) {
                        const sortColumnName = $(item).attr("dataValue")
                        if(this.columnData[i].key === sortColumnName){
                            columnDataValue.push(sortColumnName)
                            rightData.push({ 'column': sortColumnName, 'sortType': this.columnData[i].sortType })
                            break
                        }
                    }
                })
                this.nodeData.setting.columnDataValue = columnDataValue
                this.nodeData.setting.curColumnsInfo = this.curColumnsInfo
                this.nodeData.setting.rightData = rightData
            },
            inputVerify() {
                if (this.columnDataValue.length === 0) {
                    this.$message({ type: 'warning', message: '未选择排序字段' })
                    return false
                }
                return true
            }
        }
    }
</script>
<style scoped type="text/css">
    >>> .el-transfer-panel:nth-child(1){
        width: 300px;
        height: 500px;
    }
    >>> .el-transfer-panel:nth-child(3){
        width: 400px;
        height: 500px;
    }
    >>> .el-checkbox{
        margin-right: 15px;
    }
    >>> .el-transfer-panel__list.is-filterable{
        height: 395px;
    }
</style>
