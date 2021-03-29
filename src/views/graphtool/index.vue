<template>
    <div class="app-container">
        <el-container>
            <el-aside class="tree-side">
                <GraphTree ref="graphTree" @refreshGraphList="refreshGraphList" />
            </el-aside>
            <GraphListTable v-show="rightType === 'graphList'" ref="graphListTable" @refreshGraphTree="refreshGraphTree" />
            <screenQueryList v-if="rightType === 'runGraph'" ref="screenQueryList" :screenParam="screenParam"/>
        </el-container>
    </div>
</template>

<script>
    import GraphTree from '@/views/graphtool/graphTree.vue'
    import GraphListTable from '@/views/graphtool/graphListTable.vue'
    import screenQueryList from '@/views/graphtool/tooldic/page/screenQuery/screenQueryList.vue'
    export default {
        components: { GraphTree, GraphListTable, screenQueryList },
        data() {
            return {
                defaultNodeKey: 'privateGraph',
                rightType:"graphList",
                screenParam:{
                    "graphUuid":'',
                    "graphName":'',
                    "nodeData":null,
                    "publicType":1,//默认是个人场景查询
                    "screenQueryNodeArr":[],
                    "treeNodeData":null
                }
            }
        },
        methods: {
            refreshGraphList(node) { // 根据点击的图形树节点刷新列表数据
                this.screenParam.treeNodeData = node
                this.rightType = "graphList"
                // 处理列表界面的删除按钮是否显示
                if (node.type === 'screenGraphType') { // 场景查询图形
                    let curRoles = this.$store.getters.roles
                    let screenManager = 'screenManager'// 模拟场景查询管理员角色
                    if (curRoles && curRoles.includes(screenManager)) {
                        this.$refs.graphListTable.showDelBtn = true
                    } else {
                        this.$refs.graphListTable.showDelBtn = false
                    }
                } else if (node.type === 'privateGraphType' || node.type === 'personScreenGraphType') { // 个人场景查询图形、个人图形
                    this.$refs.graphListTable.showDelBtn = true
                } else {
                    this.$refs.graphListTable.showDelBtn = false
                }
                this.$refs.graphTree.defaultNodeKey = node.id
                this.$refs.graphListTable.type = node.type
                this.$refs.graphListTable.listSelectChange([])
                this.$refs.graphListTable.getGraphList()
            },
            refreshGraphTree() { // 操作列表数据后刷新图形树
                this.$refs.graphTree.initGraphTree()
            }
        }
    }
</script>
