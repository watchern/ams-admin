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
                <Basic ref="basicVueRef"/>
            </div>
            <div id="conditionSet" class="tab-pane fade in active">
                <FilterSet ref="conditionSet" v-if="optType === 'filter'" />
                <ColumnSortSet ref="conditionSet" v-if="optType === 'sort'" />
                <DataSampleDrawnSet ref="conditionSet" v-if="optType === 'sample'" />
                <HierarchyDataSet ref="conditionSet" v-if="optType === 'layering'" />
                <DistinctColumnSet ref="conditionSet" v-if="optType === 'delRepeat'" />
                <FrequencyAnalysisSet ref="conditionSet" v-if="optType === 'comparison'" />
                <TranscodeSet ref="conditionSet" v-if="optType === 'change'" />
                <UnionDataSet ref="conditionSet" v-if="optType === 'union'" />
            </div>
            <div id="column" class="tab-pane fade">
                <OutputColumn ref="outputColumnVueRef" v-if="optType !== 'barChart' && optType !== 'comparison'" :graph="graph" :is_filter_column="is_filter_column" />
            </div>
        </div>
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
    import UnionDataSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/unionData.vue';
    export default {
        name: 'NodeSetting',
        components: { Basic, OutputColumn, FilterSet, ColumnSortSet, DataSampleDrawnSet, HierarchyDataSet, DistinctColumnSet, FrequencyAnalysisSet, TranscodeSet, UnionDataSet },
        data() {
            return {
                is_filter_column: [],
                columnsInfoPre: []// 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
            }
        },
        mounted(){
            // window.saveGraphNodeSetting = this.saveGraphNodeSetting
        },
        props:["optType","graph"],
        methods:{
            saveGraphNodeSetting(){//保存节点配置
                this.$refs.outputColumnVueRef.get_column()
                this.$refs.basicVueRef.save_base()
                this.$refs.conditionSet.saveSetting()
                this.graph.nodeData[this.graph.curCell.id].isSet = true
            }
        }
    }
</script>
