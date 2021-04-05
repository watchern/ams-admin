<template>
    <div class="tree-list-container" v-loading="pageLoading">
        <div class="filter-container">
            <QueryField ref="queryfield" :form-data="queryFields" @submit="getGraphList" />
        </div>
        <el-row>
            <el-col align="right">
                <el-button v-if="type === 'privateGraphType' || type === 'personScreenGraphType'" type="primary" class="oper-btn add" @click="add"/>
                <el-button v-if="type !== 'shareToGraphType'" type="primary" class="oper-btn edit" @click="edit" :disabled="editGraphBtn"/>
                <el-button v-if="showDelBtn" type="primary" class="oper-btn delete" @click="deleteGraph" :disabled="deleteGraphBtn"/>
                <el-button v-if="type === 'privateGraphType'" type="primary" class="oper-btn share-1" @click="personTreeDialogVisible = true" :disabled="shareGraphBtn"/>
                <el-button v-if="type === 'shareToGraphType'" type="primary" class="oper-btn cancelshare"@click="cancelShare" :disabled="cancelShareGraphBtn"/>
                <el-button v-if="type === 'personScreenGraphType'" type="primary" class="oper-btn publish" @click="publicGraph" :disabled="publicGraphBtn"/>
                <el-button v-if="type === 'screenGraphType'" type="primary" class="oper-btn publish-1" @click="cancelPublic" :disabled="cancelPublicGraphBtn"/>
                <el-button v-if="type.toLowerCase().indexOf('screengraphtype') > -1" type="primary" class="oper-btn start" @click="run" :disabled="runGraphBtn"/>
            </el-col>
        </el-row>
        <el-table key="graphTable" ref="graphListTable" v-loading="listLoading" height="500" :data="dataList" border fit highlight-current-row
                  @select="listSelectChange" @select-all="listSelectChange">
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
            <el-table-column v-if="type === 'shareToGraphType'" label="接收人" prop="sharedPersonName" />
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getGraphList" />
        <el-dialog v-if="initPreviewGraph" :destroy-on-close="true" :append-to-body="true" :visible.sync="initPreviewGraph" title="查看图形">
            <PreviewGraph :graph-uuid="graphUuid" style="height: 65vh;overflow: auto" />
            <div slot="footer">
                <el-button type="primary" @click="initPreviewGraph=false">关闭</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="personTreeDialogVisible" title="请选择分享人员" :visible.sync="personTreeDialogVisible" :close-on-press-escape="false" :close-on-click-modal="false" width="800px">
            <PersonTree ref="personTree" />
            <div slot="footer" class="dialog-footer">
                <el-button @click="personTreeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="shareGraph">保存</el-button>
            </div>
        </el-dialog>
        <el-dialog v-if="sharedPersonDialogVisible" title="选择人员" :visible.sync="sharedPersonDialogVisible" :close-on-press-escape="false" :close-on-click-modal="false" width="600px">
            <el-table key="sharedPersonTable" ref="sharedPersonListTable" v-loading="personListLoading" height="400" :data="personDataList" border fit highlight-current-row>
                <el-table-column type="selection" width="55" />
                <el-table-column label="被分享人名称" align="center" prop="sharedPersonName"/>
                <el-table-column label="被分享时间" align="center" prop="sharedTime" :formatter="dateFormatter" />
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="sharedPersonDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="cancelShareGraphBack">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import QueryField from '@/components/public/query-field/index'
    import Pagination from '@/components/Pagination/index'
    import PreviewGraph from '@/views/graphtool/previewGraph'
    import PersonTree from '@/components/publicpersontree/index'
    import { getGrapgListByType, deleteGraphInfoById, shareGraph, cancelShareGraph, searchGraphNodes, selectSharedPerson, publicGraph, cancelPublicGraph } from '@/api/graphtool/apiJs/graphList'
    export default {
        name: 'GraphListTable',
        components: { QueryField, Pagination, PreviewGraph, PersonTree },
        data() {
            return {
                listLoading: true,
                pageLoading:false,
                personListLoading:true,
                type: 'privateGraphType', // 默认加载个人图形
                queryFields: [
                    { label: '图形名称', name: 'graphName', type: 'fuzzyText', value: '' },
                    { label: '执行状态', name: 'executeStatus', type: 'select', default: '-1',
                data: [{ name: '全部执行', value: 1 }, { name: '部分执行', value: 2 }, { name: '未执行', value: 3 }] }],
                pageQuery: {
                    condition: null,
                    pageNo: 1,
                    pageSize: 20
                },
                total: 0,
                dataList: [],
                personDataList:[],
                initPreviewGraph: false,
                graphUuid: '',
                showDelBtn: true,
                detailGraphBtn:true,
                editGraphBtn:true,
                deleteGraphBtn:true,
                shareGraphBtn:true,
                cancelShareGraphBtn:true,
                runGraphBtn:true,
                publicGraphBtn:true,
                cancelPublicGraphBtn:true,
                personTreeDialogVisible:false,
                sharedPersonDialogVisible:false
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
                }).catch( () => {
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
                    this.publicGraphBtn = true
                    this.cancelPublicGraphBtn = true
                }else{
                    if (selection.length === 1) {
                        this.editGraphBtn = false
                        this.cancelShareGraphBtn = false
                        this.runGraphBtn = false
                    }
                    this.deleteGraphBtn = false
                    this.shareGraphBtn = false
                    this.publicGraphBtn = false
                    this.cancelPublicGraphBtn = false
                }
            },
            detail(graphUuid) {
                this.graphUuid = graphUuid
                this.initPreviewGraph = true
            },
            add() {
                let currentNode = this.$parent.$parent.$refs.graphTree.$refs.tree.getCurrentNode()
                let openGraphType = 1;//默认打开的是个人图形
                switch (currentNode.id) {
                    case "personScreenGraph"://个人场景查询图形
                        openGraphType = 2
                        break;
                    case "screenGraph"://场景查询图形
                        openGraphType = 3
                        break;
                }
                this.$store.commit('aceState/setRightFooterTags', {
                    type: 'active',
                    val: {
                        name: '新增图形',
                        path: `/graphtool/tooldic?openGraphType=${openGraphType}&openType=2`
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
                this.$confirm(this.$t('confirm.delete'), this.$t('confirm.title'),{
                    confirmButtonText: this.$t('confirm.okBtn'),
                    cancelButtonText: this.$t('confirm.cancelBtn'),
                    type: 'warning'
                }).then(() => {
                    this.pageLoading = true
                    let obj = this.getUuidsANdNames(selectObj)
                    deleteGraphInfoById(obj.graphUuids).then(response => {
                        this.pageLoading = false
                        this.$notify({
                            title: this.$t('message.title'),
                            message: this.$t('message.delete.success'),
                            type: 'success',
                            duration: 2000,
                            position: 'bottom-right'
                        })
                        this.listSelectChange([])
                        this.getGraphList()
                        // 刷新图形树
                        this.$emit('refreshGraphTree')
                    }).catch( () => {
                        this.pageLoading = false
                        this.$message.error(this.$t('message.delete.fail'))
                    })
                }).catch( () => {})
            },
            share() {
                this.personTreeDialogVisible = true
            },
            shareGraph(){
                const personArr = this.$refs.personTree.getSelectValue()
                let personUuids = []
                let personNames = []
                if(personArr.length === 0){
                    this.$refs.personTree.$message({'type':'warning','message':'请选择人员'})
                }else{
                    Array.from(personArr, item => {
                        personUuids.push(item.personuuid)
                        personNames.push(item.cnname)
                    })
                }
                let curPersonUuid = this.$store.getters.personuuid
                let personObj = { personUuids: personUuids.join(","), personNames: personNames.join("、") }
                if (personObj.personUuids.indexOf(curPersonUuid) > -1) {
                    this.$message({ type: 'warning', message: '不可将个人图形分享给自己' })
                } else {
                    this.pageLoading = true
                    let selectObj = this.$refs.graphListTable.selection
                    let graphObj = this.getUuidsANdNames(selectObj)// 获取选择的图形信息
                    this.personTreeDialogVisible = false
                    shareGraph({ ...graphObj, ...personObj }).then(response => {
                        this.pageLoading = false
                        this.$notify({
                            title: this.$t('message.title'),
                            message: this.$t('图形分享成功'),
                            type: 'success',
                            duration: 2000,
                            position: 'bottom-right'
                        })
                        // 刷新图形树（主要刷新我的分析图形节点数据）
                        this.$emit('refreshGraphTree')
                    }).catch( () => {
                        this.pageLoading = false
                    })
                }
            },
            cancelShare() {
                this.$confirm(this.$t('确认取消分享？'), this.$t('提示'),{
                    confirmButtonText: this.$t('confirm.okBtn'),
                    cancelButtonText: this.$t('confirm.cancelBtn'),
                    type: 'warning'
                }).then(() => {
                    let selectObj = this.$refs.graphListTable.selection
                    this.sharedPersonDialogVisible = true
                    this.$nextTick( () => {
                        selectSharedPerson(selectObj[0].graphUuid).then( response => {
                            this.personDataList = response.data
                            this.personListLoading = false
                        }).catch( () => {
                            this.personListLoading = false
                        })
                    })
                }).catch( () => {})
            },
            cancelShareGraphBack(){
                let selection = this.$refs.sharedPersonListTable.selection
                if(selection.length === 0){
                    this.$message({'type':'warning','message':'请选择人员'})
                }else{
                    this.sharedPersonDialogVisible = false
                    this.pageLoading = true
                    let selectObj = this.$refs.graphListTable.selection
                    let graphObj = { graphUuid: selectObj[0].graphUuid, graphName: selectObj[0].graphName }
                    let personUuids = []
                    let personNames = []
                    Array.from(selection, item => {
                        personUuids.push(item.sharedPersonUuid)
                        personNames.push(item.sharedPersonName)
                    })
                    let personObj = { personUuids: personUuids.join(","), personNames: personNames.join("、")}
                    cancelShareGraph({ ...graphObj, ...personObj }).then(response => {
                        this.pageLoading = false
                        this.$notify({
                            title: this.$t('message.title'),
                            message: this.$t('取消分享成功'),
                            type: 'success',
                            duration: 2000,
                            position: 'bottom-right'
                        })
                        this.listSelectChange([])
                        this.getGraphList()
                        // 刷新图形树（主要刷新我的分析图形节点数据）
                        this.$emit('refreshGraphTree')
                    }).catch( () => {
                        this.pageLoading = false
                    })
                }
            },
            run() {
                this.pageLoading = true
                let selectObj = this.$refs.graphListTable.selection
                let graphUuid = selectObj[0].graphUuid
                let graphName = selectObj[0].graphName
                //查询该场景查询下的数据节点数量
                searchGraphNodes({"graphUuid":graphUuid,"graphName":graphName}).then( response => {
                    this.pageLoading = false
                    if(response.data == null){
                        this.$message.error("获取图形节点信息时出错")
                    }else {
                        if (response.data.isError) {
                            this.$message.error("获取图形节点信息时出错")
                        } else {
                            let nodeList = response.data.nodeList;
                            if (nodeList.length === 0) {
                                this.$message({"type": "warning", "message": "您选择的场景查询图形暂无数据节点"})
                            } else {
                                this.$parent.$parent.screenParam.graphUuid = graphUuid
                                this.$parent.$parent.screenParam.graphName = graphName
                                this.$parent.$parent.screenParam.publicType = selectObj[0].publicType
                                this.$parent.$parent.screenParam.nodeData = nodeList[0].extMap.nodeData
                                this.$parent.$parent.screenParam.screenQueryNodeArr = nodeList;
                                this.$parent.$parent.rightType = "runGraph"
                            }
                        }
                    }
                }).catch( () =>{
                    this.pageLoading = false
                })
            },
            publicGraph(){
                let selectObj = this.$refs.graphListTable.selection
                this.$confirm(this.$t('确定发布为公共场景查询图形？'), this.$t('confirm.title'),{
                    confirmButtonText: this.$t('confirm.okBtn'),
                    cancelButtonText: this.$t('confirm.cancelBtn'),
                    type: 'warning'
                }).then(() => {
                    this.pageLoading = true
                    let obj = this.getUuidsANdNames(selectObj)
                    publicGraph(obj.graphUuids).then(response => {
                        this.pageLoading = false
                        this.$notify({
                            title: this.$t('message.title'),
                            message: this.$t('发布成功'),
                            type: 'success',
                            duration: 2000,
                            position: 'bottom-right'
                        })
                        this.listSelectChange([])
                        this.getGraphList()
                        // 刷新图形树
                        this.$emit('refreshGraphTree')
                    }).catch( () => {
                        this.pageLoading = false
                        this.$message.error(this.$t('发布失败'))
                    })
                }).catch( () => {})
            },
            cancelPublic(){
                let selectObj = this.$refs.graphListTable.selection
                this.$confirm(this.$t('确定取消已发布的公共场景查询图形？'), this.$t('confirm.title'),{
                    confirmButtonText: this.$t('confirm.okBtn'),
                    cancelButtonText: this.$t('confirm.cancelBtn'),
                    type: 'warning'
                }).then(() => {
                    this.pageLoading = true
                    let obj = this.getUuidsANdNames(selectObj)
                    cancelPublicGraph(obj.graphUuids).then(response => {
                        this.pageLoading = false
                        this.$notify({
                            title: this.$t('message.title'),
                            message: this.$t('取消发布成功'),
                            type: 'success',
                            duration: 2000,
                            position: 'bottom-right'
                        })
                        this.listSelectChange([])
                        this.getGraphList()
                        // 刷新图形树
                        this.$emit('refreshGraphTree')
                    }).catch( () => {
                        this.pageLoading = false
                        this.$message.error(this.$t('取消发布失败'))
                    })
                }).catch( () => {})
            },
            /**
             * 根据选中的列表数据获取图形UUID和名称串
             * @param selectObj 列表数据
             * @return
             */
            getUuidsANdNames(selectObj){
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
            graphTypeFormatter() {
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
                return str
            },
            stasusFormatter(row) {
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
            dateFormatter(row) {
                let datetime = row.createTime
                if(this.sharedPersonDialogVisible){
                    datetime = row.sharedTime
                }
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
