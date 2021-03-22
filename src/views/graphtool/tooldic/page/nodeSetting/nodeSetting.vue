<template>
    <div style="height: 600px;overflow-y: auto;">
        <el-tabs v-model="activeTabName">
            <el-tab-pane label="基本信息" name="basicInfo">
                <Basic ref="basicVueRef"/>
            </el-tab-pane>
            <el-tab-pane label="条件设置" name="conditionSet">
                <FilterSet v-if="optType === 'filter'" ref="conditionSet" />
                <ColumnSortSet v-if="optType === 'sort'" ref="conditionSet" />
                <DataSampleDrawnSet v-if="optType === 'sample'" ref="conditionSet" />
                <HierarchyDataSet v-if="optType === 'layering'" ref="conditionSet" />
                <DistinctColumnSet v-if="optType === 'delRepeat'" ref="conditionSet" />
                <FrequencyAnalysisSet v-if="optType === 'comparison'" ref="conditionSet" />
                <TranscodeSet v-if="optType === 'change'" ref="conditionSet" />
                <UnionDataSet v-if="optType === 'union'" ref="conditionSet" />
            </el-tab-pane>
            <el-tab-pane label="输出字段设置" name="outPutCol" v-if="optType !== 'comparison'">
                <OutputColumn v-if="optType !== 'barChart' && optType !== 'comparison'" ref="outputColumnVueRef"/>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import Basic from '@/views/graphtool/tooldic/page/nodeSetting/basic.vue'
    import OutputColumn from '@/views/graphtool/tooldic/page/nodeSetting/outputColumn.vue'
    import FilterSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/filter.vue'
    import ColumnSortSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/columnSort.vue'
    import DataSampleDrawnSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/dataSampleDrawn.vue'
    import HierarchyDataSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/hierarchyData.vue'
    import DistinctColumnSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/distinctColumn.vue'
    import FrequencyAnalysisSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/frequencyAnalysis.vue'
    import TranscodeSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/transcode/transcode.vue'
    import UnionDataSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/unionData.vue'
    export default {
        name: 'NodeSetting',
        components: { Basic, OutputColumn, FilterSet, ColumnSortSet, DataSampleDrawnSet, HierarchyDataSet, DistinctColumnSet, FrequencyAnalysisSet, TranscodeSet, UnionDataSet },
        props: ['optType', 'graph'],
        data() {
            return {
                activeTabName:'conditionSet',
                columnsInfoPre: []// 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
            }
        },
        methods: {
            saveGraphNodeSetting() { // 保存节点配置
                this.$refs.outputColumnVueRef.get_column()
                this.$refs.basicVueRef.save_base()
                this.$refs.conditionSet.saveSetting()
                this.graph.nodeData[this.graph.curCell.id].isSet = true
            }
        }
    }
</script>
<!--引入公共CSS样式-->
<style scoped type="text/css">
    >>> .el-tabs__header {
        margin: 0;
    }
</style>
