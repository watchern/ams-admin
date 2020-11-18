<template>
  <div>
    <ul id="myTab" class="nav nav-tabs">
      <li>
        <a href="#basic" data-toggle="tab">基本信息</a>
      </li>
      <li class="active">
        <a href="#conditionSet" data-toggle="tab">条件设置</a>
      </li>
      <li v-if="jspType !== 'barChart' && jspType !== 'comparison'">
        <a href="#column" data-toggle="tab">输出字段设置</a>
      </li>
    </ul>
    <div id="myTabContent" class="tab-content">
      <div id="basic" class="tab-pane fade">
        <Basic ref="basicVue" />
      </div>
      <div id="conditionSet" class="tab-pane fade in active">
        <FilterSet v-if="jspType === 'filter'" />
        <ColumnSortSet v-if="jspType === 'sort'" />
        <DataSampleDrawnSet v-if="jspType === 'sample'" />
        <HierarchyDataSet v-if="jspType === 'layering'" />
        <DistinctColumnSet v-if="jspType === 'delRepeat'" />
        <FrequencyAnalysisSet v-if="jspType === 'comparison'" />
        <TranscodeSet v-if="jspType === 'change'" />
        <!--<c:when test="${jsp_type == 'customizeChart'}">-->
        <!--<%@ include file="../chart_analysis/chartAnalysisSelor.jsp" %>-->
        <!--</c:when>-->
        <!--<c:when test="${jsp_type == 'union'}">-->
        <!--<%@ include file="UnionData.jsp" %>-->
        <!--</c:when>-->
        <!--<c:when test="${jsp_type == 'barChart'}">-->
        <!--<%@ include file="../chart_analysis/chartAnalysisSelor.jsp" %>-->
        <!--</c:when>-->
        <!--</c:choose>-->
      </div>
      <div id="column" class="tab-pane fade">
        <OutputColumn v-if="jspType !== 'barChart' && jspType !== 'comparison'" ref="outputColumn" :graph="graph" :is_filter_column="is_filter_column" />
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
// import HierarchyDataSet from '@/views/graphtool/tooldic/page/nodeSetting/conditionSet/hierarchyData.vue';

var jspType = getParams().jspType
export default {
  name: 'NodeSettingIndex',
  components: { Basic, OutputColumn, FilterSet, ColumnSortSet, DataSampleDrawnSet, HierarchyDataSet, DistinctColumnSet, FrequencyAnalysisSet, TranscodeSet },
  data() {
    return {
      jspType: jspType,
      graph: parent.graph,
      is_filter_column: [],
      columnsInfoPre: []// 前置节点的输出列信息集合（只用于有且只有一个前置节点的节点）
    }
  }
}
</script>

<style scoped>

</style>
