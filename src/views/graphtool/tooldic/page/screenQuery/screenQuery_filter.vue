<template>
    <div style="padding: 20px 20px 0;height: 600px;">
        <el-row>
            <el-col :span="8">
                <label>筛选字段&nbsp;</label>
                <el-select v-model="select_colms" filterable @change="setSelectColms">
                    <el-option v-for="selectCol in selectColms" :key="selectCol.newColumnName" :label="selectCol.newColumnName" :value="selectCol.newColumnName">{{ selectCol.displayName }}</el-option>
                </el-select>
            </el-col>
            <el-col :span="8">
                <label>条件&nbsp;</label>
                <el-select v-model="select_cz" @change="selectCzChange">
                    <el-option v-for="selectCzObj in selectCzArr" :key="selectCzObj.value" :value="selectCzObj.value" :label="selectCzObj.name">{{ selectCzObj.name }}</el-option>
                </el-select>
            </el-col>
            <el-col v-if="showMoreVal" :span="8">
                <span style="color:red;line-height: 36px;">多个值请用英文逗号（“,”）隔开</span>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <label>筛选对象&nbsp;</label>
                <el-select v-model="compareObj" :disabled="compareObjDisabled" @change="compareObjChange">
                    <el-option v-for="compare in compareArr" :key="compare.value" :value="compare.value" :label="compare.name">{{ compare.name }}</el-option>
                </el-select>
            </el-col>
            <el-col :span="8">
                <el-input v-if="showConnValue" v-model="conn_value" style="width: 83%;"/>
                <el-select v-model="compareColumnSel" v-if="!showConnValue" filterable @change="setCompareColumnSel" style="width: 83%;">
                    <el-option v-for="compareCol in compareColumnArr" :key="compareCol.newColumnName" :label="compareCol.newColumnName" :value="compareCol.newColumnName">{{ compareCol.displayName }}</el-option>
                </el-select>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                <el-checkbox v-model="blankSpace">&nbsp;是否去除数据中的空格</el-checkbox>
            </el-col>
            <el-col :span="10">
                <el-checkbox v-model="quotes" :disabled="quotesDisabled">&nbsp;是否带引号（<span style="color:red;">筛选值在比较数值大小时不能带引号</span>）&nbsp;</el-checkbox>
            </el-col>
            <el-col :span="6">
                <span>[&nbsp;</span>
                <el-radio v-model="connType" label="and">与</el-radio>
                <el-radio v-model="connType" label="or">或</el-radio>
                <span>&nbsp;]</span>
            </el-col>
        </el-row>
        <el-row>
            <div style="height: 400px;">
                <el-col :span="16">
                    <div style="border: 1px solid gray;height: 400px;">
                        <ul ref="filterZtree" class="ztree"/>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="button-cz">
                        <el-tooltip content="新增筛选条件" placement="right">
                            <el-button type="primary" @click="filter_ztree('add')" style="margin-top: 80px;">新增条件</el-button>
                        </el-tooltip>
                    </div>
                    <div class="button-cz">
                        <el-tooltip content="对选中的单个非合并条件进行修改" placement="right">
                            <el-button type="primary" @click="filter_ztree('edit')" style="margin-top: 8px;">修改条件</el-button>
                        </el-tooltip>
                    </div>
                    <div class="button-cz">
                        <el-tooltip content="对选中的条件进行删除，支持批量删除（按住Ctrl键多选）" placement="right">
                            <el-button type="primary" @click="filter_ztree('del')" style="margin-top: 8px;">删除条件</el-button>
                        </el-tooltip>
                    </div>
                    <div class="button-cz">
                        <el-tooltip content="对选中的多个非合并条件用括号进行合并（按住Ctrl键多选）" placement="right">
                            <el-button type="primary" @click="filter_ztree('addbrack')" style="margin-top: 8px;">合并条件</el-button>
                        </el-tooltip>
                    </div>
                    <div class="button-cz">
                        <el-tooltip content="对选中的单个合并条件进行拆分" placement="right">
                            <el-button type="primary" @click="filter_ztree('delbrack')" style="margin-top: 8px;">拆分条件</el-button>
                        </el-tooltip>
                    </div>
                </el-col>
            </div>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: 'FilterSet',
        data() {
            return {
                allColumnArr: [],
                zTreeObj_Filter: null,
                connType: 'and',
                quotes: true,
                quotesDisabled: true,
                blankSpace: false,
                showConnValue: true,
                selectColms: [],
                select_colms: '',
                select_cz: '',
                selectCzArr: [{ value: '=', name: '等于' },
                    { value: '!=', name: '不等于' },
                    { value: '>', name: '大于' },
                    { value: '>=', name: '大于等于' },
                    { value: '<', name: '小于' },
                    { value: '<=', name: '小于等于' },
                    { value: 'like_star', name: '开头是' },
                    { value: 'like_end', name: '结尾是' },
                    { value: 'like_all', name: '包含' },
                    { value: 'not_like_all', name: '不包含' },
                    { value: 'in', name: '包含多个值' }],
                compareObj: '',
                compareArr: [{ value: 'value', name: '值' }, { value: 'column', name: '字段' }],
                compareObjDisabled: false,
                compareColumnSel: '',
                compareColumnArr: [],
                conn_value: '',
                showMoreVal: false
            }
        },
        props:['columnInfoArr','nodes'],
        mounted() {
            this.initSetting()
        },
        methods: {
            initSetting(){
                const settingFilter = this.initZtreeSetting()
                this.zTreeObj_Filter = $.fn.zTree.init($(this.$refs.filterZtree), settingFilter, this.nodes);
                Array.from(this.columnInfoArr, item => {
                    const newColumnName = item.newColumnName
                    const displayName = `${newColumnName}(${item.columnType})`
                    this.selectColms.push({ newColumnName, displayName })
                    this.compareColumnArr.push({ newColumnName, displayName })
                    this.allColumnArr.push(newColumnName)
                })
            },
            setSelectColms(val) {
                this.select_colms = val
            },
            setCompareColumnSel(val) {
                this.compareColumnSel = val
            },
            initZtreeSetting() {
                const vueObj = this
                return {
                    view: {
                        selectedMulti: true, // 可以多选
                        showLine: false
                    },
                    data: {
                        simpleData: {// 简单数据模式
                            enable: true,
                            idKey: 'id',
                            pIdKey: 'pId',
                            rootPId: null
                        }
                    },
                    edit: {
                        enable: true,
                        drag: {
                            isCopy: false,
                            inner: false,
                            prev: true,
                            next: true
                        },
                        showRemoveBtn: false,
                        showRenameBtn: false
                    },
                    callback: {
                        beforeDrag: function(treeId, treeNodes) {
                            var rootNode = true
                            for (var i = 0; i < treeNodes.length; i++) {
                                if (treeNodes[i].pId != null && treeNodes[i].pId !== '' && typeof treeNodes[i].pId !== 'undefined') { // 是合并条件的子条件
                                    rootNode = false
                                    break
                                }
                            }
                            return rootNode
                        },
                        beforeDrop: function(treeId, treeNodes, targetNode, moveType) { // 只允许同级之间移动
                            var isSameLevel = true
                            var targetLevel = targetNode.level
                            for (var i = 0; i < treeNodes.length; i++) {
                                if (treeNodes[i].level !== targetLevel) { // 非同级移动
                                    isSameLevel = false
                                    break
                                }
                            }
                            return isSameLevel
                        },
                        onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
                            // 先对选择的节点进行排序
                            var nodes = vueObj.zTreeObj_Filter.getNodes()
                            for (var i = 0; i < nodes.length; i++) {
                                var conn_type = nodes[i].realInfo.filter_conn_type
                                if (i === 0) {
                                    if (nodes[i].realInfo.showFilterConnType) {
                                        nodes[i].realInfo.showFilterConnType = false
                                        nodes[i].name = nodes[i].name.substring(conn_type.length + 1, nodes[i].name.length)
                                        vueObj.zTreeObj_Filter.updateNode(nodes[i])
                                    }
                                } else {
                                    if (!nodes[i].realInfo.showFilterConnType) {
                                        nodes[i].realInfo.showFilterConnType = true
                                        nodes[i].name = conn_type + ' ' + nodes[i].name
                                        vueObj.zTreeObj_Filter.updateNode(nodes[i])
                                    }
                                }
                                vueObj.updateChildrenNode(nodes[i], nodes[i].realInfo.showFilterConnType)
                            }
                        },
                        onClick: function(event, treeId, treeNode) {
                            if (treeNode.realInfo) {
                                vueObj.select_colms = treeNode.realInfo.select_colms// 反显列
                                vueObj.select_cz = treeNode.realInfo.select_cz
                                vueObj.compareObj = typeof treeNode.realInfo.compareObj === 'undefined' ? 'value' : treeNode.realInfo.compareObj
                                vueObj.ompareColumnSel = treeNode.realInfo.compareColumnSel// 反显筛选对象
                                vueObj.conn_value = treeNode.realInfo.conn_value// 反显值
                                vueObj.connType = treeNode.realInfo.filter_conn_type
                                vueObj.quotes = treeNode.realInfo.quotes
                                vueObj.blankSpace = treeNode.realInfo.blank_space
                            }
                        }
                    }
                }
            },
            selectCzChange(val) {
                this.select_cz = val
                switch (val) {
                    case 'in':
                        this.showMoreVal = true
                        this.quotes = true
                        this.quotesDisabled = true
                        this.compareObj = 'value'
                        this.compareObjDisabled = true
                        this.showConnValue = true
                        break
                    case 'like_star':
                    case 'like_end':
                    case 'like_all':
                    case 'not_like_all':
                        this.showMoreVal = false
                        this.quotes = true
                        this.quotesDisabled = true
                        this.compareObj = 'value'
                        this.compareObjDisabled = true
                        this.showConnValue = true
                        break
                    case '=':
                    case '!=':
                        this.showMoreVal = false
                        this.compareObjDisabled = false
                        if (this.compareObj === 'value') {
                            this.quotes = true
                            this.quotesDisabled = false
                        } else {
                            this.quotes = false
                            this.quotesDisabled = true
                        }
                        break
                    case '>':
                    case '>=':
                    case '<':
                    case '<=':
                        this.showMoreVal = false
                        this.quotes = false
                        if (this.compareObj === 'value') {
                            this.quotesDisabled = false
                        } else {
                            this.quotesDisabled = true
                        }
                        this.compareObjDisabled = false
                        break
                }
            },
            compareObjChange(val) {
                this.compareObj = val
                if (val === 'value') {
                    this.showConnValue = true
                    this.selectCzChange(this.select_cz)
                } else {
                    this.showConnValue = false
                    this.compareColumnSel = ''
                    this.quotes = false
                    this.quotesDisabled = true
                }
            },
            /**
             * 	保存setting
             */
            saveSetting() {
                let whereObj = {
                    "whereStr" : "",
                    "hasWhere" : true,
                    "columnArr" : this.allColumnArr
                };
                let curNodes = this.zTreeObj_Filter.getNodes()
                if(curNodes && curNodes.length > 0){
                    Array.from(curNodes, item => whereObj.whereStr += " " + item.name)
                }
                whereObj.whereStr = " WHERE " + whereObj.whereStr
                whereObj.setting = curNodes
                return whereObj
            },
            // 页面输入项的校验(或空配置校验)
            verifySetting() {
                var nodes = this.zTreeObj_Filter.getNodes()
                if (typeof nodes === 'undefined' || (typeof nodes !== 'undefined' && nodes.length === 0)) {
                    this.$message({'type':'warning','message':'未设置筛选条件'})
                    return false
                }
                return true
            },
            /**
             * 	过滤树节点操作
             * @param type 操作类型（新增条件、修改条件、删除条件）
             */
            filter_ztree(type) {
                const select_colms = this.select_colms// 字段
                const select_cz = this.select_cz// 操作类型
                const conn_value = this.conn_value// 值
                const filter_conn_type = this.connType
                const selectCzObj = this.selectCzArr.find(item => item.value === select_cz)
                let select_name = ''
                const quotes = this.quotes// 是否带引号
                const blank_space = this.blankSpace// 是否去除空格
                let nodesAll = this.zTreeObj_Filter.getNodes()// 如果为第一个节点 条件不加 and或者or
                const compareObj = this.compareObj// 筛选对象
                const compareColumnSel = this.compareColumnSel// 筛选对象的列名称
                if (typeof nodesAll === 'undefined') {
                    nodesAll = []
                }
                let showFilterConnType = false
                let sele_nodes = this.zTreeObj_Filter.getSelectedNodes()
                let node = null
                let $this = this
                switch (type) {
                    case 'add':
                        select_name = selectCzObj.name
                        // 获取左侧树节点加载右侧树节点  这里只操作一张表的字段
                        if (select_colms === '') {
                            this.$message({'type':'warning','message':'请选择筛选字段'})
                            return
                        }
                        if (select_cz === '') {
                            this.$message({'type':'warning','message':'请选择筛选条件'})
                            return
                        }
                        if (select_cz !== '=' && conn_value === '' && compareObj === 'value') {
                            this.$message({'type':'warning','message':`${select_name}条件的筛选值不能为空`})
                            return
                        }
                        if (compareObj === 'column' && $.trim(compareColumnSel) === '') {
                            this.$message({'type':'warning','message':`${select_name}条件的筛选值不能为空`})
                            return
                        }
                        if (nodesAll.length > 0) {
                            showFilterConnType = true
                        }
                        node = this.switch_cz_f(select_cz, select_colms, conn_value, filter_conn_type, showFilterConnType, quotes, blank_space, compareObj, compareColumnSel)
                        this.zTreeObj_Filter.addNodes(null, node)
                        break
                    case 'edit':
                        select_name = selectCzObj.name
                        if (select_colms === '') {
                            this.$message({'type':'warning','message':'请选择筛选字段'})
                            return
                        }
                        if (select_cz === '') {
                            this.$message({'type':'warning','message':'请选择筛选条件'})
                            return
                        }
                        if (select_cz !== '=' && conn_value === '' && compareObj === 'value') {
                            this.$message({'type':'warning','message':`${select_name}条件的筛选值不能为空`})
                            return
                        }
                        if (compareObj === 'column' && $.trim(compareColumnSel) === '') {
                            this.$message({'type':'warning','message':`${select_name}条件的筛选值不能为空`})
                            return
                        }
                        if (sele_nodes.length > 1) {
                            this.$message({'type':'warning','message':'只能修改一个过滤条件'})
                            return
                        }
                        if (sele_nodes[0].children && sele_nodes[0].children.length !== 0) {
                            this.$message({'type':'warning','message':'不能修改合并条件'})
                            return
                        }
                        if (sele_nodes.length !== 1) {
                            this.$message({'type':'warning','message':'请选择一个待修改的筛选条件'})
                            return
                        }
                        showFilterConnType = !!((sele_nodes[0].realInfo && sele_nodes[0].realInfo.showFilterConnType))
                        node = this.switch_cz_f(select_cz, select_colms, conn_value, filter_conn_type, showFilterConnType, quotes, blank_space, compareObj, compareColumnSel)
                        sele_nodes[0].name = node.name
                        sele_nodes[0].realInfo = node.realInfo
                        this.zTreeObj_Filter.updateNode(sele_nodes[0])
                        if (sele_nodes[0].pId != null && typeof sele_nodes[0].pId !== 'undefined') {
                            var parentNodes = this.zTreeObj_Filter.getNodesByParam('id', sele_nodes[0].pId, null)
                            if (parentNodes && parentNodes.length > 0) {
                                var curChildrenNodes = parentNodes[0].children
                                var curName = ''
                                $(parentNodes[0].children).each(function(i) {
                                    curName += ' ' + this.name
                                })
                                parentNodes[0].name = curName
                                this.zTreeObj_Filter.updateNode(parentNodes[0])
                            }
                        }
                        break
                    case 'del':
                        if (sele_nodes.length === 0) {
                            this.$message({'type':'warning','message':'请选择待删除的筛选条件'})
                            return
                        }
                        var isChildNode = false
                        $(sele_nodes).each(function(index) {
                            if (this.pId != null && typeof this.pId !== 'undefined') {
                                isChildNode = true
                            }
                        })
                        if (isChildNode) {
                            this.$message({'type':'warning','message':'合并条件的子条件不可删除'})
                            return
                        }
                        Array.from(sele_nodes,item => this.zTreeObj_Filter.removeNode(item))
                        if (nodesAll && nodesAll.length > 0) { // 变更第一个条件的连接条件
                            var filter_conn_type_ = ''
                            if (nodesAll[0].realInfo && nodesAll[0].realInfo.showFilterConnType) { // 如果第一个条件显示了连接条件，则应隐藏
                                filter_conn_type_ = nodesAll[0].realInfo.filter_conn_type
                                nodesAll[0].name = nodesAll[0].name.replace(filter_conn_type_ + ' ', '')// 去掉连接条件（只替换第一次出现的位置，不能全替换）
                                nodesAll[0].realInfo.showFilterConnType = false
                                this.zTreeObj_Filter.updateNode(nodesAll[0])
                                var childrenNodes = nodesAll[0].children// 找子节点
                                if (typeof childrenNodes !== 'undefined' && childrenNodes.length > 0) {
                                    filter_conn_type_ = childrenNodes[0].realInfo.filter_conn_type
                                    childrenNodes[0].name = childrenNodes[0].name.replace(filter_conn_type_ + ' ', '')// 去掉连接条件（只替换第一次出现的位置，不能全替换）
                                    childrenNodes[0].realInfo.showFilterConnType = false
                                    this.zTreeObj_Filter.updateNode(childrenNodes[0])
                                }
                            }
                        }
                        break
                    case 'addbrack':
                        var sumName = ''
                        if (sele_nodes.length > 0 && sele_nodes[0].pId != null) {
                            this.$message({'type':'warning','message':'该条件不能被合并'})
                            return
                        }
                        if (sele_nodes.length < 2) {
                            this.$message({'type':'warning','message':'请至少选择两个条件'})
                            return
                        }
                        sele_nodes = this.sortNode(sele_nodes)// 对选择的节点按照节点显示顺序进行排序
                        var firstNode = false// 所选合并条件中是否包含第一个不带关联关系的连接条件
                        if (sele_nodes[0].realInfo.showFilterConnType) { // 如果显示连接条件
                            sumName = sele_nodes[0].realInfo.filter_conn_type + ' ('
                        } else {
                            sumName = '('
                        }
                        var ind = sele_nodes[0].getIndex()// 第一个合并条件所在位置

                        $(sele_nodes).each(function(index) {
                            if (index === 0) {
                                if (this.realInfo.showFilterConnType) { // 如果显示连接条件
                                    sumName += this.name.split(this.realInfo.filter_conn_type + ' ')[1]
                                } else {
                                    sumName += this.name
                                    firstNode = true
                                }
                            } else {
                                sumName += ' ' + this.name
                            }
                            $this.zTreeObj_Filter.removeNode(this)
                        })
                        sumName += ')'
                        node = {
                            id: new UUIDGenerator().id,
                            name: sumName,
                            children: sele_nodes,
                            realInfo: {// 继承第一个合并条件的部分属性值
                                filter_conn_type: sele_nodes[0].realInfo.filter_conn_type,
                                showFilterConnType: sele_nodes[0].realInfo.showFilterConnType
                            }
                        }
                        if (firstNode) {
                            this.zTreeObj_Filter.addNodes(null, 0, node)
                        } else {
                            this.zTreeObj_Filter.addNodes(null, ind, node)
                        }
                        break
                    case 'delbrack':
                        if (sele_nodes.length > 1) {
                            this.$message({'type':'warning','message':'只能拆分一个条件'})
                            return
                        }
                        const childrens = sele_nodes[0]['children']
                        if (typeof childrens === 'undefined' || childrens.length === 0) {
                            this.$message({'type':'warning','message':'该条件不是合并条件，不能被拆分'})
                            return
                        }else{

                            Array.from(childrens, item => {// 将子节点上移成为父级节点同级节点
                                if (item.realInfo.showFilterConnType) { // 如果显示连接条件
                                    this.zTreeObj_Filter.addNodes(null, item)
                                } else {
                                    this.zTreeObj_Filter.addNodes(null, 0, item)
                                }
                            })
                            this.zTreeObj_Filter.removeNode(sele_nodes[0]) // 删除当前节点
                        }
                        break
                }
            },
            /**
             * 对选择的节点按照节点显示顺序进行排序（直接选择排序）
             * @param nodeArr 待排序的节点
             * */
            sortNode(nodeArr) {
                var index = 0
                for (var i = 1; i < nodeArr.length; i++) { // 第一层是控制循环的次数
                    index = 0// 每次进入循环需使用数组的第一个值进行比较
                    for (var j = 0; j <= nodeArr.length - i; j++) { // 第二次循环是每次循环需比较的次数
                        if (parseInt(nodeArr[j].getIndex()) > parseInt(nodeArr[index].getIndex())) {
                            index = j
                        }
                    }
                    var tempObj = nodeArr[nodeArr.length - i]// 将此次要交换的值存储到临时变量中（较小的值）
                    nodeArr[nodeArr.length - i] = nodeArr[index]// 将较大的值存储到之前存储较小值的位置
                    nodeArr[index] = tempObj// 将较小的值存储在原来存储较大值的位置
                }
                return nodeArr
            },

            /**
             *  递归更新当前节点的子孙节点中第一个的条件的关联字符的显示情况
             *  @param curNode 当前节点对象
             *  @param showFilterConnType 是否需要显示连接条件
             * */
            updateChildrenNode(curNode, showFilterConnType) {
                var children = curNode.children
                if (children && children.length > 0) {
                    children = sortNode(children)// 先排个序
                    var conn_type = children[0].realInfo.filter_conn_type
                    if (children[0].realInfo.showFilterConnType && !showFilterConnType) {
                        children[0].realInfo.showFilterConnType = false
                        children[0].name = children[0].name.substring(conn_type.length + 1, children[0].name.length)
                        this.zTreeObj_Filter.updateNode(children[0])
                    }
                    if (!children[0].realInfo.showFilterConnType && showFilterConnType) {
                        children[0].realInfo.showFilterConnType = true
                        children[0].name = conn_type + ' ' + children[0].name
                        this.zTreeObj_Filter.updateNode(children[0])
                    }
                    this.updateChildrenNode(children[0], showFilterConnType)
                }
            },

            /**
             * 生成条件节点
             * @param select_cz 条件类型
             * @param select_colms 选择的字段
             * @param conn_value 值
             * @param filter_conn_type 与或的类型
             * @param showFilterConnType 是否拼接与或条件（第一个条件不拼接）
             * @param quotes 筛选值是否带引号（数值比较时不能带）
             * @param blank_space 筛选字段是否去除空格
             * @param compareObj 筛选对象
             * @param compareColumnSel 筛选对象的列名称
             **/
            switch_cz_f(select_cz, select_colms, conn_value, filter_conn_type, showFilterConnType, quotes, blank_space, compareObj, compareColumnSel) {
                let node = {}
                let newSelect_colms = select_colms
                if (blank_space) {
                    newSelect_colms = `TRIM(${newSelect_colms})`
                }
                let nameStr = newSelect_colms
                if (showFilterConnType) {
                    nameStr = `${filter_conn_type} ${newSelect_colms}`
                }
                if (compareObj === 'value' || typeof compareObj === 'undefined') {
                    switch (select_cz) {
                        case 'like_star':
                            node.name = `${nameStr} like '${conn_value}%'`
                            break
                        case 'like_end':
                            node.name = `${nameStr} like '%${conn_value}'`
                            break
                        case 'like_all':
                            node.name = `${nameStr} like '%${conn_value}%'`
                            break
                        case 'not_like_all':
                            node.name = `${nameStr} not like '%${conn_value}%'`
                            break
                        case 'in':
                            let arrVal = conn_value.split(',')
                            let str1 = ''
                            Array.from(arrVal,item => {
                                str1 = str1 === '' ? `'${item}'` : `${str1},'${item}'`
                            })
                            node.name = `${nameStr} in (${str1})`
                            break
                        case '=':
                        case '!=':
                        case '>':
                        case '>=':
                        case '<':
                        case '<=':
                            if (quotes) { // 值带引号
                                node.name = `${nameStr} ${select_cz} '${conn_value}'`
                            } else {
                                node.name = `${nameStr} ${select_cz} ${conn_value}`
                            }
                            break
                    }
                    if (conn_value === '') {
                        let str = `(${newSelect_colms} = '' or ${newSelect_colms} is null)`
                        if (showFilterConnType) {
                            str = `${filter_conn_type} ${str}`
                        }
                        node.name = str
                    }
                } else {
                    node.name = `${nameStr} ${select_cz} ${compareColumnSel}`
                }
                node.id = new UUIDGenerator().id
                node.realInfo = {
                    select_colms: select_colms,
                    select_cz: select_cz,
                    conn_value: conn_value,
                    filter_conn_type: filter_conn_type,
                    showFilterConnType: showFilterConnType,
                    quotes: quotes,
                    blank_space: blank_space,
                    compareObj: compareObj,
                    compareColumnSel: compareColumnSel
                }
                return node
            }
        }
    }

</script>
<style scoped type="text/css">
    >>> .el-row {
        margin: 10px 0;
    }
    .el-col>label {
        padding-right: 10px;
    }
    .button-cz {
        margin-left: 20px;
    }
    >>> .ztree>li>a.curSelectedNode{
        background-color: #edf6ff;
    }
</style>
