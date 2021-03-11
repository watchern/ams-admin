<template>
    <el-container style="width: 100%;height: 600px;overflow-y: auto" v-loading="initLoading">
        <el-col :span="6" style="border-color: #DCDFE6;border-style:solid;border-width: 0 1px 1px 1px;">
            <el-collapse v-model="activeName" accordion >
                <el-collapse-item name="columnZtreeList">
                    <template slot="title">
                        <span style="padding-left: 10px;">字段列表</span>
                    </template>
                    <el-input v-model="searchColumnContent" placeholder="搜索关键字"/>
                    <ul id="columnZtree" class="ztree" style="height:436px;margin: 10px 0;" />
                </el-collapse-item>
                <el-collapse-item name="funZtreeList">
                    <template slot="title">
                        <span style="padding-left: 10px;">函数列表</span>
                    </template>
                    <el-input v-model="searchFunContent" placeholder="搜索关键字"/>
                    <ul id="funZtree" class="ztree" style="height:436px;margin: 10px 0;" />
                </el-collapse-item>
            </el-collapse>
        </el-col>
        <el-col :span="18" style="border:1px solid #DCDFE6;padding: 0 10px;">
            <el-row>
                <el-divider>字段信息</el-divider>
            </el-row>
            <el-row style="padding: 3px 0;">
                <el-row>
                    <el-col :span="3"><label class="labelClass">输出字段</label></el-col>
                    <el-col :span="9">
                        <el-input v-model="outputColumnName" style="width: 100%;"></el-input>
                    </el-col>
                    <el-col :span="3"><label class="labelClass">字段类型</label></el-col>
                    <el-col :span="9">
                        <el-select v-model="columnType" style="width: 100%;">
                            <el-option v-for="cType in columnTypeArr" :key="cType.val" :label="cType.name" :value="cType.val">{{cType.name}}</el-option>
                        </el-select>
                    </el-col>
                </el-row>
            </el-row>
            <el-row>
                <el-divider>函数公式</el-divider>
            </el-row>
            <el-row>
                <el-input ref="customizeColumnInp" type="textarea" resize="none" :autosize="{ minRows: 15, maxRows: 15}" style="font-size: 18px;" v-model="customizeColumnVal"></el-input>
            </el-row>
            <el-row>
                <el-tag style="height: 35px;line-height: 35px;"><div v-for="sign in signArr" class="signSpan" @click="inputSign(sign.value)">{{sign.name}}</div></el-tag>
            </el-row>
        </el-col>
    </el-container>
</template>

<script>
    export default {
        name: "customizeColumnSet",
        data(){
            return {
                initLoading: true,
                columnZtree:null,
                funZtree:null,
                columnRootNodeArr:[],
                funRootNodeArr:[],
                rtnArr:[],
                searchColumnContent:'',
                searchFunContent:'',
                activeName:'columnZtreeList',
                customizeColumnVal:'',
                signArr:[{"name":"''","value":"''"},
                    {"name":"||","value":"||"},
                    {"name":"=","value":"="},
                    {"name":"!=","value":"!="},
                    {"name":">","value":">"},
                    {"name":">=","value":">="},
                    {"name":"<","value":"<"},
                    {"name":"<=","value":"<="},
                    {"name":"(","value":"("},
                    {"name":")","value":")"},
                    {"name":"空","value":"IS NULL"},
                    {"name":"非空","value":"IS NOT NULL"},
                    {"name":"匹配","value":"LIKE"},
                    {"name":"介于","value":"BETWEEN AND"},
                    {"name":"包含","value":"IN"}],
                outputColumnName:'',
                specialSignArr:['SELECT ','UPDATE ','DELETE ','ALTER ','DROP ','TRUNCATE ','BEGIN ',' END','FOR LOOP ',' END LOOP'],
                columnType:'VARCHAR2',
                columnTypeArr:[{'name':'字符','val':'VARCHAR2'},{'name':'数值','val':'NUMBER'},{'name':'日期','val':'TIMESTAMP'}],
            }
        },
        props:['columnInfoArr','curColumnInfo','nodeType','nodeDataArray'],
        mounted() {
            this.initData()
        },
        watch: {
            searchColumnContent() {
                this.searchColumnZtree()
            },
            searchFunContent(){
                this.searchFunZtree()
            }
        },
        methods:{
            initData(){
                this.initColumnZtree()
                this.initFunZtree()
                if(typeof this.curColumnInfo !== "undefined" && this.curColumnInfo != null){
                    let columnInfo = this.curColumnInfo.columnInfo
                    this.customizeColumnVal = this.curColumnInfo.curColumnName || this.curColumnInfo.columnName
                    let obj = this.replaceColumnType(columnInfo.columnType.toUpperCase())
                    this.columnType = obj.columnTypeVal
                    this.outputColumnName = this.curColumnInfo.disColumnName || this.curColumnInfo.newColumnName
                }
                this.initLoading = false
            },
            initZtreeSetting(ztreeType){
                let $this = this
                return {
                    data: {
                        key: {
                            checked: 'isChecked',
                            name: 'name',
                            title: 'displayName'
                        },
                        // 设置数据格式
                        simpleData: {
                            enable: true,
                            idKey: 'id',
                            pIdKey: 'pid'
                        }
                    },
                    check: {
                        enable: false,
                        chkStyle: 'radio',
                        radioType: 'all'
                    },
                    view: {
                        selectedMulti: false
                    },
                    edit: {
                        enable: true,
                        showRenameBtn: false,
                        showRemoveBtn: false,
                        drag: { // 禁止拖拽变更树节点
                            autoExpandTrigger: false, // 拖拽时父节点自动展开是否触发 onExpand
                            prev: false,
                            inner: false,
                            next: false
                        }
                    },
                    callback: {
                        beforeDrag: function(treeId, treeNodes){
                            if(ztreeType === 'columnZtree'){
                                if(treeNodes[0].pid == null){
                                    return false
                                }
                            }else{//ztreeType === 'funZtree'
                                if(treeNodes[0].type === 'funFolder'){
                                    return false
                                }
                            }
                            return true
                        },
                        onDrop: function (event, treeId, treeNodes){
                            const dom = $this.$refs.customizeColumnInp.$refs.textarea
                            if(dom === event.target){
                                let cursor = dom.selectionStart
                                let content = ''
                                if(ztreeType === 'columnZtree'){
                                    content = treeNodes[0].displayName
                                }else{//ztreeType === 'funZtree'
                                    content = treeNodes[0].name
                                }
                                if($this.customizeColumnVal.length === 0){
                                    $this.customizeColumnVal = content
                                }else{
                                    $this.replaceContent(dom,cursor,content)
                                }
                            }
                        }
                    }
                }
            },
            initColumnZtree(){
                let idNum = 0
                const columnIconPath = require('@/styles/icons/column.png')
                Array.from(this.columnInfoArr, item => {
                    let exsit = false
                    for(let j=0; j<this.rtnArr.length; j++){
                        if(this.rtnArr[j].rtn === item.rtn){
                            exsit = true
                            break
                        }
                    }
                    if(!exsit){
                        this.rtnArr.push({
                            "rtn":item.rtn,
                            "nodeId":item.nodeId,
                            "nullNodeId":item.nullNodeId
                        })
                        this.columnRootNodeArr.push({
                            "name": item.rtn,
                            "displayName": item.rtn,
                            "isParent": true,
                            "level" : 1,
                            "id": `${idNum}`,
                            "pid" : null,
                            "open": true,
                            "children": []
                        })
                        idNum++
                    }
                    let rootNode = this.columnRootNodeArr.find( node => node.name === item.rtn)
                    if(typeof rootNode !== "undefined"){
                        let nodeName = ''
                        let nodeDisplayName = ''
                        let obj = this.replaceColumnType(item.columnType.toUpperCase())
                        if(this.nodeType === "relation"){
                            let ind = this.nodeDataArray.findIndex( n => n.tableName === item.resourceTableName)
                            if(ind > -1){
                                nodeName = `${this.nodeDataArray[ind].key}.${item.columnName}(${obj.columnTypeName})`
                                nodeDisplayName = `${this.nodeDataArray[ind].key}.${item.columnName}`
                            }
                        }else{
                            nodeName = `${item.columnName}(${obj.columnTypeName})`
                            nodeDisplayName = item.columnName
                        }
                        rootNode.children.push({
                            "name": nodeName,
                            "displayName": nodeDisplayName,
                            "isParent": false,
                            "level" : 2,
                            "id": `${idNum}`,
                            "pid" : rootNode.id,
                            "open": false,
                            "children": [],
                            "icon": columnIconPath
                        })
                        idNum++
                    }
                })
                this.columnZtree = $.fn.zTree.init($("#columnZtree"), this.initZtreeSetting('columnZtree'), this.columnRootNodeArr)
            },
            initFunZtree(){
                this.$ajax.get('lib/jsonFile/oracle_Fun.json').then( response => {
                    if(response.data && response.data.length > 0){
                        const tableIconPath = require('@/styles/icons/function.png')
                        //json文件的数据格式需保持统一，有且只有两层
                        Array.from(response.data, item => {
                            Array.from(item.children, cItem => {
                                //替换第二层节点的图标
                                cItem.icon = tableIconPath
                            })
                        })
                        this.funRootNodeArr = response.data
                        this.funZtree = $.fn.zTree.init($("#funZtree"), this.initZtreeSetting('funZtree'), response.data)
                    }
                }).catch(() => {
                    this.$message.error("函数列表数据加载失败")
                })
            },
            replaceColumnType(cType){
                let obj = {
                    "columnTypeName":'',
                    "columnTypeVal":'',
                }
                switch (cType) {
                    case "VARCHAR":
                    case "VARCHAR2":
                    case "NVARCHAR":
                    case "NVARCHAR2":
                        obj.columnTypeName = '字符'
                        obj.columnTypeVal = 'VARCHAR2'
                        break;
                    case "INTEGER":
                    case "DECIMAL":
                    case "NUMBER":
                    case "FLOAT":
                    case "REAL":
                        obj.columnTypeName = '数值'
                        obj.columnTypeVal = 'NUMBER'
                        break;
                    case "DATE":
                    case "TIMESTAMP":
                    case "TIMESTAMP(6)":
                        obj.columnTypeName = '日期'
                        obj.columnTypeVal = 'TIMESTAMP'
                        break;
                }
                return obj
            },
            inputSign(val){
                if(this.customizeColumnVal === ''){
                    this.customizeColumnVal = val
                }else{
                    this.customizeColumnVal = `${this.customizeColumnVal} ${val}`
                }
            },
            replaceContent(dom,cursor,val){
                let beforeVal = this.customizeColumnVal.substr(0,cursor)
                let afterVal = this.customizeColumnVal.substr(cursor)
                this.customizeColumnVal = `${beforeVal}${val}${afterVal}`
                this.$nextTick( () => {
                    let curPos = cursor + val.length
                    //设置光标位置函数
                    if(dom.setSelectionRange){
                        dom.focus();  // 获取焦点
                        dom.setSelectionRange(curPos,curPos);  // 设置选定区的开始和结束点
                    }else if (dom.createTextRange){
                        let range = dom.createTextRange();  // 创建选定区
                        range.collapse(true);                // 设置为折叠,即光标起点和结束点重叠在一起
                        range.moveEnd('character', curPos);     // 移动结束点
                        range.moveStart('character', curPos);   // 移动开始点
                        range.select();                      // 选定当前区域
                    }
                })
            },
            saveInfo(){
                let returnObj = {
                    "isError": false,
                    "columnInfo":{
                        "columnName":'',
                        "columnType":'',
                        "newColumnName":'',
                        "isOutputColumn":1,
                        "customizeColumn":true
                    }
                }
                if($.trim(this.customizeColumnVal).length === 0){
                    returnObj.isError = true
                    this.$message({'type':'warning','message':'自定义字段的内容不可为空'})
                }
                for(let i=0; i<this.specialSignArr.length; i++) {
                    if(this.customizeColumnVal.toUpperCase().indexOf(this.specialSignArr[i]) > -1){
                        returnObj.isError = true
                        this.$message({'type':'warning','message':'自定义字段的内容不能含有SQL语言的关键字'})
                        break
                    }
                }
                if($.trim(this.outputColumnName).length === 0){
                    returnObj.isError = true
                    this.$message({'type':'warning','message':'输出字段的值不可为空'})
                }
                returnObj.columnInfo.columnName = this.customizeColumnVal
                returnObj.columnInfo.columnType = this.columnType
                returnObj.columnInfo.newColumnName = this.outputColumnName
                return returnObj
            },
            searchColumnZtree(){
                let searchColumnContent = $.trim(this.searchColumnContent)
                const setting = this.initZtreeSetting("columnZtree")
                if(searchColumnContent.length === 0){
                    this.columnZtree = $.fn.zTree.init($("#columnZtree"), setting, this.columnRootNodeArr)
                }else{
                    let curRootNodeArr = []
                    this.columnRootNodeArr.forEach( item => {
                        let childrens = []
                        let rootNode = { ...{},...item}
                        rootNode.children.forEach( cItem => {
                            if(cItem.displayName.indexOf(searchColumnContent) > -1){
                                childrens.push(cItem)
                            }
                        })
                        rootNode.children = childrens
                        curRootNodeArr.push(rootNode)
                    })
                    this.columnZtree = $.fn.zTree.init($("#columnZtree"), setting, curRootNodeArr)
                }
            },
            searchFunZtree(){
                let searchFunContent = $.trim(this.searchFunContent)
                const setting = this.initZtreeSetting("funZtree")
                if(searchFunContent.length === 0){
                    this.funZtree = $.fn.zTree.init($("#funZtree"), setting, this.funRootNodeArr)
                }else{
                    let curRootNodeArr = []
                    this.funRootNodeArr.forEach( item => {
                        let childrens = []
                        let rootNode = { ...{},...item}
                        rootNode.children.forEach( cItem => {
                            if(cItem.name.indexOf(searchFunContent) > -1){
                                childrens.push(cItem)
                            }
                        })
                        rootNode.children = childrens
                        rootNode.open = true
                        curRootNodeArr.push(rootNode)
                    })
                    this.funZtree = $.fn.zTree.init($("#funZtree"), setting, curRootNodeArr)
                }
            }
        }
    }
</script>

<style scoped type="text/css">
    .signSpan {
        line-height: 36px;
        padding: 0 10px;
        cursor: pointer;
        float: left;
    }
    .signSpan:hover {
        color: #FFFFFF;
        background-color: #409EFF;
        box-shadow: 3px 3px 5px #409EFF;
    }
    >>> .ztree>li>ul {
        overflow: auto;
    }
    >>> .el-collapse-item__content{
        padding-bottom: 0;
    }
    .item {
        height: 26px;
        line-height: 26px;
    }
    .item:hover {
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    }
    .labelClass {
        float: right;
        padding-right: 10px;
        line-height: 30px;
    }
</style>
