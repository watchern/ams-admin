<template>
    <div style="height: 600px;">
        <ul ref="myTab" class="nav nav-tabs">
            <li>
                <a href="#basic" data-toggle="tab">基本信息</a>
            </li>
            <li class="active">
                <a href="#conditionSet" data-toggle="tab">条件设置</a>
            </li>
            <li v-if="optType !== 'barChart' && optType !== 'comparison'">
                <a href="#column" data-toggle="tab">输出字段设置</a>
            </li>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div id="basic" class="tab-pane fade">
                <Basic ref="basicVueRef" />
            </div>
            <div id="conditionSet" class="tab-pane fade in active">
                <FilterSet v-if="optType === 'filter'" ref="conditionSet" />
                <ColumnSortSet v-if="optType === 'sort'" ref="conditionSet" />
                <DataSampleDrawnSet v-if="optType === 'sample'" ref="conditionSet" />
                <HierarchyDataSet v-if="optType === 'layering'" ref="conditionSet" />
                <DistinctColumnSet v-if="optType === 'delRepeat'" ref="conditionSet" />
                <FrequencyAnalysisSet v-if="optType === 'comparison'" ref="conditionSet" />
                <TranscodeSet v-if="optType === 'change'" ref="conditionSet" />
                <UnionDataSet v-if="optType === 'union'" ref="conditionSet" />
            </div>
            <div id="column" class="tab-pane fade">
                <OutputColumn v-if="optType !== 'barChart' && optType !== 'comparison'" ref="outputColumnVueRef" :graph="graph" :is_filter_column="is_filter_column" />
            </div>
        </div>
    </div>
</template>

<script>
    import {removeJcCssfile,addJsFile} from "@/api/analysis/common"
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
                is_filter_column: [],
                columnsInfoPre: []// 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
            }
        },
        created(){
            addJsFile('/lib/bootstrap/js/bootstrap.min.js','bootstrap.min')
        },
        beforeDestroy() {
            removeJcCssfile("bootstrap.min.js","js")
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
<style scoped src="@/components/ams-bootstrap/css/bootstrap.css"></style>
<style scoped src="@/components/ams-basic/css/common.css"></style>
