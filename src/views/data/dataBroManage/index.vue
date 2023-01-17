<template>
    <div class="page-container">
        <div class="left_conter">
<!--            左侧树-->
            <LeftTrees ref="tree_left"
                       @details='Details'
            ></LeftTrees>
        </div>
        <div class="right_conter padding10">
            <div style="padding: 0 40px"
                 class="mose">
                <!-- 数据表关联关系 -->
                <ProcessTree :tableMetaUuid="tableMetaUuid"
                             ref="tableLines"></ProcessTree>
            </div>
        </div>
    </div>
</template>

<script>
import LeftTrees from "@/components/loginTree/leftTree.vue";
import ProcessTree from "@/components/directory/processTree.vue";

export default {
    components: {LeftTrees, ProcessTree},
    props: {
        tableMetaUuid: {
            type: String,
            default() {
                return "";
            },
        },
    },
    data() {
        return {}
    },
    computed: {},
    watch: {},
    mounted() {
        // this.details(this.tableMetaUuid);
    },
    created() {
    },
    methods: {
        Details(tableMetaUuid) {
            this.tableMetaUuid = tableMetaUuid
            this.$nextTick(() => {
                this.$refs.tableLines.init(1)//刷新列表 更新关系树
            })
        },
    },
}
</script>

<style scoped>
    .page-container {
        min-width: 1300px;
        display: flex;
        padding: 0px !important;
    }

    .left_conter {
        height: calc(100vh - 130px);
        position: relative;
        width: 280px;
        padding-right: 40px;
    }

    .right_conter {
        min-width: 1500px;
        overflow: auto;
        height: calc(100vh - 150px);
    }

    .mose >>> myDiagramDiv {
        height: 1500px !important;
        border: 1px solid;
    }

    .mose {
        padding: 0 40px;
        position: relative;
    }
</style>