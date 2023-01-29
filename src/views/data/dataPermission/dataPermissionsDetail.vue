<template>
    <div>
        <el-table
            :data="tableData"
            style="width: 100%">
            <el-table-column
                prop="typeName"
                label="类型"
                width="180">
            </el-table-column>
            <el-table-column
                prop="tableDataSource"
                label="数据源"
                width="180">
                <template slot-scope="scope">
                    {{scope.row.tableDataSource | tableDataSourceFilter}}
                </template>
            </el-table-column>
            <el-table-column
                prop="folder"
                label="文件夹">
            </el-table-column>
            <el-table-column
                prop="tableName"
                label="表名">
            </el-table-column>
            <el-table-column
                prop="colNames"
                label="字段名">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>

import {
    updateForFinishHandle,
    updateForBackApplicationHandle,
    queryByOperatePermissionApplyUuid
} from "@/api/data/dataPermission";

export default {
    name: "dataPermissionsDetail",
    data() {
        return {
            tableData: []
        }
    },
    mounted() {
        this.$emit("fromSon");
    },
    methods: {
        queryByUuid(value) {
            queryByOperatePermissionApplyUuid(value)
                .then((res) => {
                    let data = res.data;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].systemName != undefined && data[i].systemName != null) {
                            this.tableData.push({
                                typeName: '系统',
                                tableDataSource: data[i].tableDataSource,
                                folder: data[i].systemName,
                                tableName: data[i].tableName,
                                colNames: data[i].colNameList.join(",")
                            });
                        }
                    }
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].themeName != undefined && data[i].themeName != null) {
                            this.tableData.push({
                                typeName: '主题',
                                tableDataSource: data[i].tableDataSource,
                                folder: data[i].themeName,
                                tableName: data[i].tableName,
                                colNames: data[i].colNameList.join(",")
                            });
                        }
                    }
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].layeredName != undefined && data[i].layeredName != null) {
                            this.tableData.push({
                                typeName: '分层',
                                tableDataSource: data[i].tableDataSource,
                                folder: data[i].layeredName,
                                tableName: data[i].tableName,
                                colNames: data[i].colNameList.join(",")
                            });
                        }
                    }
                })
        },
        //更新对应业务状态方法 可以加入自己的style
        updateApplyStatus(value) {
            var operatePermissionApply = {
                operatePermissionApplyUuid: value
            }
            updateForFinishHandle(operatePermissionApply);
        },
        updateApplyStatusBecauseBackApplication(value) {
            //以后可能会出现扩展 这边先自己拼装一个 实体类 传到后台
            var operatePermissionApply = {
                operatePermissionApplyUuid: value
            }
            updateForBackApplicationHandle(operatePermissionApply)
        }
    },
    filters:{
        tableDataSourceFilter(val){
            if (val == 'Postgre'){
                return 'DWS'
            }else if (val == 'Hive'){
                return 'MRS'
            }
        }
    }
}
</script>

<style scoped>

</style>