<template>
  <div>
    <el-input
      v-model="filterText"
      placeholder="输入关键字进行过滤"
      class="tree-search"
    />
    <el-tree
      :data="data"
      :props="defaultProps"
      @node-click="handleNodeClick"
      :filter-node-method="filterNode"
      ref="tree"
    ></el-tree>
  </div>
</template>
<script>
import { findWarningTree } from "@/api/analysis/auditwarningresult";
export default {
  created() {
    this.initTreeData();
  },
  watch: {
    filterText(val) {
      // 搜索树
      this.$refs.tree.filter(val);
    },
  },
  data() {
    return {
      filterText: null, //树筛选框输入数据
      defaultProps: {
        //组织人员树的默认属性
        children: "children",
        label: "name",
      },
      data: [], //树的数据
    };
  },
  methods: {
    /**
     * 点击树节点时候触发
     */
    handleNodeClick(data) {
        if(data.pid!='NULL'){
            this.$emit("clickChangeTable",data.id);
        }
    },
    /**
     * 过滤树节点方法
     */
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    initTreeData() {
      findWarningTree().then((resp) => {
        this.data = resp.data;
      });
    },
  },
};
</script>
