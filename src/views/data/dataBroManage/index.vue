<template>
  <div class="page-container">
    <div class="left_conter">
      <!-- 左侧树 -->
      <LeftTrees ref="tree_left" @details="Details"></LeftTrees>
    </div>
    <div class="right_conter padding10">
      <div class="mose">
        <!-- 数据表关联关系 -->
        <ProcessTree
          :tableMetaUuid="tableMetaUuid"
          ref="tableLines"
        ></ProcessTree>
      </div>
    </div>
  </div>
</template>

<script>
import LeftTrees from "@/components/loginTree/leftTree.vue";
import ProcessTree from "@/components/directory/processTree.vue";

export default {
    components: { LeftTrees, ProcessTree },
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
        display: flex;
        padding: 0px !important;
    }

    .left_conter {
        height: calc(100vh - 123px);
        width: 20%;
        position: relative;
        padding-right: 20px;
    }

    .left_conter >>> .conter_vh {
        height: calc(100% - 143px) !important;
    }

    .right_conter {
        overflow: auto;
        /*min-width: calc(100vw - 380px);*/
        width: calc(100vw - 150px);
        height: calc(100vh - 150px);
    }

    .mose {
        padding: 0 30px;
        position: relative;
    }

    .mose ::v-deep #myDiagramDiv {
      width: 100%;
      height: calc(100vh - 150px);
      border: 1px solid;
    }
</style>