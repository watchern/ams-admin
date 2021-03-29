<template>
    <div style="width: 100%;height:auto;padding-left:35px;">
        <el-row style="height:30px;line-height: 30px;color: red;margin: 10px 0;">注：字段的排序顺序是由选择字段时的前后顺序决定</el-row>
        <el-transfer filterable filter-placeholder="请输入搜索内容" v-model="columnDataValue" target-order="push" :data="columnData" :titles="['可选字段', '排序字段']" @change="changeSortData">
            <span slot-scope="{ option }">
                <el-row v-if="!option.showSort">{{option.label}}</el-row>
                <el-row v-if="option.showSort">
                    <el-col :span="14" ref="sortCol" v-if="option.isTip" :dataKey="option.key" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
                        <el-tooltip class="item" effect="dark" :content="option.label" placement="top">
                            <span>{{option.label}}</span>
                        </el-tooltip>
                    </el-col>
                    <el-col :span="14" ref="sortCol" v-if="!option.isTip">{{option.label}}</el-col>
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
        name: "screenQuerySort",
        data() {
            return {
                allColumnArr:[],//所有可排序字段集合
                columnData: [],//所有可排序字段信息
                columnDataValue:[]//已选排序字段集合
            }
        },
        props:['columnInfoArr','setting'],
        mounted() {
            this.initSetting()
        },
        methods: {
            initSetting(){
                Array.from(this.columnInfoArr, item => {
                    this.allColumnArr.push(item.newColumnName);
                    this.columnData.push({ 'pinyin': item.newColumnName, 'label': item.newColumnName, 'key': item.newColumnName, 'sortType': 'ASC', 'showSort': false})
                })
                //初始化已排序设置
                if(this.setting.length > 0){
                    this.columnDataValue = this.setting
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
                }
            },
            changeSortData(value, direction, movedKeys){
                Array.from(movedKeys, n => {
                    let index = this.columnData.findIndex(item => item.key === n)
                    if(index > -1){
                        if (direction === 'right') {
                            this.columnData[index].showSort = true
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
                        } else {
                            this.columnData[index].showSort = false
                        }
                    }
                })
            },
            saveSetting() {
                let whereObj = {
                    "whereStr" : "",
                    "hasWhere" : true,
                    "columnArr" : this.allColumnArr,
                    "setting":[]
                };
                Array.from(this.columnDataValue, item => {
                    for (let i = 0; i < this.columnData.length; i++) {
                        if(this.columnData[i].key === item){
                            if(whereObj.whereStr === ""){
                                whereObj.whereStr = item + " " + this.columnData[i].sortType
                            }else{
                                whereObj.whereStr += "," + item + " " + this.columnData[i].sortType
                            }
                            whereObj.setting.push(item)
                            break
                        }
                    }
                })
                if(whereObj.whereStr !== ""){
                    whereObj.whereStr = " ORDER BY " + whereObj.whereStr
                }
                return whereObj
            },
            verifySetting() {
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
