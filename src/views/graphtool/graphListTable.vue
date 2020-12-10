<template>
    <div class="tree-list-container">
        <div class="filter-container">
            <QueryField ref="queryfield" :form-data="queryFields" @submit="getGraphList" />
        </div>
        <el-row>
            <el-col align="right">
                <el-button v-if="type === 'privateGraphType' || type === 'personScreenGraphType'" type="primary" class="oper-btn add" @click="add"/>
                <el-button v-if="type !== 'shareToGraphType'" type="primary" class="oper-btn edit" @click="edit" :disabled="editGraphBtn"/>
                <el-button v-if="showDelBtn" type="primary" class="oper-btn delete" @click="deleteGraph" :disabled="deleteGraphBtn"/>
                <el-button v-if="type === 'privateGraphType'" type="primary" class="oper-btn share" @click="share" :disabled="shareGraphBtn"/>
                <el-button v-if="type === 'shareToGraphType'" type="primary" class="oper-btn cancelshare" @click="cancelShare" :disabled="cancelShareGraphBtn"/>
                <el-button v-if="type.toLowerCase().indexOf('screengraphtype') > -1" type="primary" class="oper-btn start" @click="run" :disabled="runGraphBtn"/>
            <!--<el-dropdown v-if="type !== 'sharedGraphType'" placement="bottom" trigger="click" style="margin-left: 10px;">-->
                <!--<el-button type="primary" class="oper-btn more" />-->
                <!--<el-dropdown-menu slot="dropdown">-->
                    <!--<el-dropdown-item v-if="type === 'privateGraphType'" @click.native="share">分享</el-dropdown-item>-->
                    <!--<el-dropdown-item v-if="type === 'shareToGraphType'" @click.native="cancelShare">取消分享</el-dropdown-item>-->
                    <!--<el-dropdown-item v-if="type.toLowerCase().indexOf('screengraphtype') > -1" @click.native="run">运行</el-dropdown-item>-->
                <!--</el-dropdown-menu>-->
            <!--</el-dropdown>-->
            </el-col>
        </el-row>
        <el-table :key="tableKey" ref="graphListTable" v-loading="listLoading" height="500" :data="dataList" border fit highlight-current-row
                  @select="listSelectChange" @select-all="listSelectChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="图形名称" align="left" prop="graphName">
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
            <el-table-column v-if="type === 'shareToGraphType'" label="接收人" prop="sharedPersonName" />
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getGraphList" />
        <el-dialog v-if="initPreviewGraph" :destroy-on-close="true" :append-to-body="true" :visible.sync="initPreviewGraph" title="查看图形" width="600px">
            <PreviewGraph :graph-uuid="graphUuid" />
            <div slot="footer">
                <el-button @click="initPreviewGraph=false">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import QueryField from '@/components/Ace/query-field/index'
    import Pagination from '@/components/Pagination/index'
    import { getGrapgListByType, deleteGraphInfoById, shareGraph, cancelShareGraph } from '@/api/graphtool/graphList'
    import PreviewGraph from '@/views/graphtool/previewGraph'
    export default {
        name: 'GraphListTable',
        components: { QueryField, Pagination, PreviewGraph },
        data() {
            return {
                tableKey: 'graphTable',
                listLoading: true,
                type: 'privateGraphType', // 默认加载个人图形
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
                showDelBtn: true,
                detailGraphBtn:true,
                editGraphBtn:true,
                deleteGraphBtn:true,
                shareGraphBtn:true,
                cancelShareGraphBtn:true,
                runGraphBtn:true,
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
                getGrapgListByType(this.pageQuery, { type: this.type }).then(resp => {
                    this.total = resp.data.total
                    this.dataList = resp.data.records
                    this.listLoading = false
                })
            },
            listSelectChange(selection){
                if(selection.length === 0){
                    this.editGraphBtn = true
                    this.cancelShareGraphBtn = true
                    this.runGraphBtn = true
                    this.deleteGraphBtn = true
                    this.shareGraphBtn = true
                }
                if (selection.length === 1) {
                    this.editGraphBtn = false
                    this.cancelShareGraphBtn = false
                    this.runGraphBtn = false
                }
                if(selection.length > 0){
                    this.deleteGraphBtn = false
                    this.shareGraphBtn = false
                }
            },
            detail(graphUuid) {
                this.graphUuid = graphUuid
                this.initPreviewGraph = true
            },
            add() {
                this.$store.commit('aceState/setRightFooterTags', {
                    type: 'active',
                    val: {
                        name: '新增图形',
                        path: '/graphtool/tooldic?openGraphType=1&openType=2'
                    }
                })
            },
            edit() {
                let selectObj = this.$refs.graphListTable.selection
                let graphType = selectObj[0].graphType
                let publicType = selectObj[0].publicType
                let urlParamStr = ''
                if (graphType === 3) { // 场景查询图形
                    urlParamStr = '?graphUuid=' + selectObj[0].graphUuid + '&openType=2'
                    if(publicType === 1){//公共场景查询图形
                        urlParamStr += '&openGraphType=3'
                    }else{//个人场景查询图形
                        urlParamStr += '&openGraphType=2'
                    }
                } else { // 个人图形、他人分享图形
                    urlParamStr = "?graphUuid=" + selectObj[0].graphUuid + "&openGraphType=1&openType=2";
                }
                this.$store.commit('aceState/setRightFooterTags', {
                    type: 'active',
                    val: {
                        name: selectObj[0].graphName,
                        path: `/graphtool/tooldic${urlParamStr}`
                    }
                })
            },
            deleteGraph() {
                let selectObj = this.$refs.graphListTable.selection
                this.$confirm('确定删除图形?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    let obj = this.getUuidsANdNames(selectObj)
                    deleteGraphInfoById(obj).then(response => {
                        this.$message({ type: 'success', message: '删除成功!' })
                        this.listSelectChange([])
                        this.getGraphList()
                        // 刷新图形树
                        this.$emit('refreshGraphTree')
                    })
                })
            },
            share() {
                let selectObj = this.$refs.graphListTable.selection
                let curPersonUuid = this.$store.getters.personuuid
                let personObj = { personUuids: '2c91808573e740e001744d54e2800005', personNames: '张闯1' }// 模拟选择的人员结果信息，待集成方法
                if (personObj.personUuids.indexOf(curPersonUuid) > -1) {
                    this.$message({ type: 'warning', message: '不可将个人图形分享给自己' })
                } else {
                    let graphObj = this.getUuidsANdNames(selectObj)// 获取选择的图形信息
                    shareGraph({ ...graphObj, ...personObj }).then(response => {
                        this.$message({ type: 'success', message: '图形分享成功' })
                        // 刷新图形树（主要刷新我的分析图形节点数据）
                        this.$emit('refreshGraphTree')
                    })
                }
            },
            cancelShare() {
                let selectObj = this.$refs.graphListTable.selection
                let graphObj = { graphUuid: selectObj[0].graphUuid, graphName: selectObj[0].graphName }
                let personObj = { personUuids: '2c91808573e740e001744d54e2800005', personNames: '张闯1' }// 模拟选择的人员结果信息，待集成方法
                cancelShareGraph({ ...graphObj, ...personObj }).then(response => {
                    this.$message({ type: 'success', message: '成功取消已分享图形' })
                    this.listSelectChange([])
                    this.getGraphList()
                    // 刷新图形树（主要刷新我的分析图形节点数据）
                    this.$emit('refreshGraphTree')
                })
            },
            run() {
                this.$message({ type: 'info', message: '等待模块集成' })
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
                switch (this.type) {
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
                // let graphType = row.graphType;
                // let publicType = row.publicType;
                // switch (graphType) {
                //     case 1:
                //         str = "个人图形";
                //         break;
                //     case 3:
                //         if(publicType === 1){
                //            str = "场景查询";
                //         }else{
                //             str = "个人场景查询";
                //         }
                //         break;
                // }
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
