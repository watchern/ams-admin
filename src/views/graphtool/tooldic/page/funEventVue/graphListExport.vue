<template>
    <div class="page-container">
        <div class="filter-container">
            <QueryField ref="queryfield" :form-data="queryFields" @submit="getGraphList" />
        </div>
        <el-table :key="tableKey" ref="graphListTable" v-loading="listLoading" height="500" :data="dataList" border fit highlight-current-row>
            <el-table-column type="selection" width="55" />
            <el-table-column label="图形名称" align="center" prop="graphName" />
            <el-table-column label="图形类型" align="center" prop="graphType" :formatter="graphTypeFormatter" />
            <el-table-column label="创建人" prop="createUserName" />
            <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" />
            <el-table-column label="修改人" prop="updateUserName" />
            <el-table-column label="修改时间" prop="updateTime" :formatter="dateFormatter" />
            <el-table-column label="执行状态" prop="executeStatus" :formatter="stasusFormatter" />
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getGraphList" />
        <el-dialog v-if="initPreviewGraph" :destroy-on-close="true" :append-to-body="true" :visible.sync="initPreviewGraph" title="图形详情信息" width="80%">
            <PreviewGraph :graph-uuid="graphUuid" />
            <div slot="footer">
                <el-button @click="initPreviewGraph=false">关闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import QueryField from '@/components/Ace/query-field/index'
    import Pagination from '@/components/Pagination/index'
    import { getExportGrapgListByType } from '@/api/graphtool/graphList'
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
                        data: [{ name: '请选择', value: -1 }, { name: '全部执行', value: 1 }, { name: '部分执行', value: 2 }, { name: '未执行', value: 3 }] }
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
            detail() {
                let selectObj = this.$refs.graphListTable.selection
                if (selectObj.length !== 1) {
                    this.$message({ type: 'info', message: '请选择一个图形!' })
                } else {
                    this.graphUuid = selectObj[0].graphUuid
                    this.initPreviewGraph = true
                }
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
                switch (row.graphType) {
                    case 'screenGraphType':
                        str = '场景查询图形'
                        break
                    case 'personScreenGraphType':
                        str = '个人场景查询图形'
                        break
                    case 'privateGraphType':
                        str = '个人图形'
                        break
                    case 'sharedGraphType':
                        str = '他人分享图形'
                        break
                    case 'shareToGraphType':
                        str = '我的分享图形'
                        break
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
                    let month = dateMat.getMonth() + 1
                    let day = dateMat.getDate()
                    let hh = dateMat.getHours()
                    let mm = dateMat.getMinutes()
                    let ss = dateMat.getSeconds()
                    timeStr = year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss
                }
                return timeStr
            }
        }
    }
</script>
