<template>
    <div class="page-container">
        <div class="filter-container">
            <QueryField ref="queryfield" :form-data="queryFields" @submit="getGraphList" />
        </div>
        <el-table :key="tableKey" ref="graphListTable" v-loading="listLoading" height="500" :data="dataList" border fit highlight-current-row>
            <el-table-column type="selection" width="55" />
            <el-table-column label="图形名称" align="left" prop="graphName" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <el-link @click.native.prevent="detail(scope.row.graphUuid)" type="primary">
                        {{scope.row.graphName}}
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column label="图形类型" align="center" prop="graphType" :formatter="graphTypeFormatter" />
            <el-table-column label="创建人" align="center" prop="createUserName" />
            <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" />
            <el-table-column label="修改人" align="center" prop="updateUserName" />
            <el-table-column label="修改时间" align="center" prop="updateTime" :formatter="dateFormatter" />
            <el-table-column label="执行状态" align="center" prop="executeStatus" :formatter="stasusFormatter" />
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getGraphList" />
        <el-dialog v-if="initPreviewGraph" :destroy-on-close="true" :append-to-body="true" :visible.sync="initPreviewGraph" title="图形详情信息" width="600px">
            <PreviewGraph :graph-uuid="graphUuid" />
            <div slot="footer">
                <el-button type="primary" @click="initPreviewGraph=false">关闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import QueryField from '@/components/Ace/query-field/index'
    import Pagination from '@/components/Pagination/index'
    import { getExportGrapgListByType } from '@/api/graphtool/apiJs/graphList'
    import PreviewGraph from '@/views/graphtool/previewGraph'
    export default {
        name: 'GraphListExport',
        components: { QueryField, Pagination, PreviewGraph },
        props:['openType'],//查询图形的列表所属的数据源，默认为权限库
        data() {
            return {
                tableKey: 'graphTable',
                listLoading: true,
                queryFields: [
                    { label: '图形名称', name: 'graphName', type: 'fuzzyText', value: '' },
                    { label: '执行状态', name: 'executeStatus', type: 'select', default: '-1',
                        data: [{ name: '全部执行', value: 1 }, { name: '部分执行', value: 2 }, { name: '未执行', value: 3 }] }
                ],
                pageQuery: {
                    condition: null,
                    pageNo: 1,
                    pageSize: 20
                },
                total: 0,
                dataList: null,
                initPreviewGraph: false,
                graphUuid: '',
            }
        },
        mounted() {
            this.getGraphList()
        },
        methods: {
            getGraphList(queryParam) {
                this.listLoading = true
                if (queryParam) {
                    this.pageQuery.condition = queryParam
                }
                getExportGrapgListByType(this.pageQuery,{openType:this.openType}).then(resp => {
                    this.total = resp.data.total
                    this.dataList = resp.data.records
                    this.listLoading = false
                })
            },
            detail(graphUuid) {
                this.graphUuid = graphUuid
                this.initPreviewGraph = true
            },
            getChooseGraphs(){
                let isError = false
                let message = ''
                let selectObj = this.$refs.graphListTable.selection
                if (selectObj.length === 0) {
                    isError = true;
                    message = '请至少选择一个图形'
                    return {isError,message}
                } else {
                    let graphObj = this.getUuidsANdNames(selectObj)
                    return {isError,message,graphObj}
                }
            },
            getChooseGraph(){
                let isError = false
                let message = ''
                let selectObj = this.$refs.graphListTable.selection
                if (selectObj.length !== 1) {
                    isError = true;
                    message = '请至少选择一个图形'
                    return {isError,message}
                } else {
                    return {isError,message, ...selectObj[0]}
                }
            },
            /**
             * 根据选中的列表数据获取图形UUID和名称串
             * @param selectObj 列表数据
             * @return
             */
            getUuidsANdNames(selectObj) {
                let graphUuids = ''; let graphNames = ''
                for (let i = 0; i < selectObj.length; i++) {
                    let curUuid = selectObj[i].graphUuid
                    let curName = selectObj[i].graphName
                    if (graphUuids === '') {
                        graphUuids = curUuid
                        graphNames = curName
                    } else {
                        graphUuids = `${graphUuids},${curUuid}`
                        graphNames = `${graphNames}、${curName}`
                    }
                }
                return { graphUuids, graphNames }
            },
            graphTypeFormatter(row, column) {
                let str = ''
                if(row.graphType === 1){
                    str = '个人图形'
                }else if(row.graphType === 3){
                    if(row.publicType === 1){
                        str = '场景查询图形'
                    }else{
                        str = '个人场景查询图形'
                    }
                }
                return str
            },
            stasusFormatter(row, column) {
                let executeStatus = row.executeStatus
                let str = ''
                switch (executeStatus) {
                    case 1:
                        str = '全部执行'
                        break
                    case 2:
                        str = '部分执行'
                        break
                    case 3:
                        str = '未执行'
                        break
                }
                return str
            },
            dateFormatter(row, column) {
                let datetime = row.createTime
                let timeStr = ''
                if (datetime && datetime.trim().length > 0) {
                    let dateMat = new Date(datetime)
                    let year = dateMat.getFullYear()
                    let month = this.convertData(dateMat.getMonth() + 1)
                    let day = this.convertData(dateMat.getDate())
                    let hh = this.convertData(dateMat.getHours())
                    let mm = this.convertData(dateMat.getMinutes())
                    let ss = this.convertData(dateMat.getSeconds())
                    timeStr = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
                }
                return timeStr
            },
            convertData(str){
                if(str < 10){
                    str = `0${str}`
                }
                return str
            }
        }
    }
</script>
