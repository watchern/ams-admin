<template>
    <div>
        <el-table
            :data="tableData"
            style="width: 100%">
<!--            <el-table-column-->
<!--                prop="TYPENAME"-->
<!--                label="类型"-->
<!--                width="180">-->
<!--                <template slot-scope="scope">-->
<!--                    {{scope.row.TYPENAME | typeFilter}}-->
<!--                </template>-->
<!--            </el-table-column>-->
            <el-table-column
                prop="TYPENAME"
                label="数据源"
                width="180">
                <template slot-scope="scope">
                    {{scope.row.TABLEDATASOURCE | tableDataSourceFilter}}
                </template>
            </el-table-column>
<!--            <el-table-column-->
<!--                prop="FOLDER"-->
<!--                label="文件夹">-->
<!--            </el-table-column>-->
            <el-table-column
                prop="TABLENAME"
                label="表名">
            </el-table-column>
            <el-table-column
                prop="COLNAMES"
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
        queryByUuid(value1,value2) {
            queryByOperatePermissionApplyUuid({
                operatePermissionApplyUuid: value1,
                isNotShowAll: value2
            })
                .then((res) => {
                    this.tableData = res.data;
                    this.tableData.sort();
                    // for (let i = 0; i < data.length; i++) {
                    //     if (data[i].systemName != undefined && data[i].systemName != null) {
                    //         this.tableData.push({
                    //             typeName: '系统',
                    //             tableDataSource: data[i].tableDataSource,
                    //             folder: data[i].systemName,
                    //             tableName: data[i].tableName,
                    //             colNames: data[i].colNameList.join(",")
                    //         });
                    //     }
                    // }
                    // for (let i = 0; i < data.length; i++) {
                    //     if (data[i].themeName != undefined && data[i].themeName != null) {
                    //         this.tableData.push({
                    //             typeName: '主题',
                    //             tableDataSource: data[i].tableDataSource,
                    //             folder: data[i].themeName,
                    //             tableName: data[i].tableName,
                    //             colNames: data[i].colNameList.join(",")
                    //         });
                    //     }
                    // }
                    // for (let i = 0; i < data.length; i++) {
                    //     if (data[i].layeredName != undefined && data[i].layeredName != null) {
                    //         this.tableData.push({
                    //             typeName: '分层',
                    //             tableDataSource: data[i].tableDataSource,
                    //             folder: data[i].layeredName,
                    //             tableName: data[i].tableName,
                    //             colNames: data[i].colNameList.join(",")
                    //         });
                    //     }
                    // }
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
            // let str = val.substring(1,val.length);
            if (val == 'Postgre'){
                return 'DWS'
            }else if (val == 'Hive'){
                return 'MRS'
            }
        },
        // typeFilter(val){
        //     let str = val.substring(0,1);
        //     if (str == '0'){
        //         return '系统'
        //     }else if (str == '1'){
        //         return '主题'
        //     }else if (str == '2'){
        //         return '分层'
        //     }
        // }
    }
}
</script>

<style scoped>

</style>