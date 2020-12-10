<template>
  <!-- index.vue是最外层的父页签组件，把firstParentTabCon.vue挂载进来作为第一个页签中的内容 -->
  <div id="accordion1" class="panel-group">
    <div class="panel panel-default">
      <div id="collapse1" class="panel-collapse collapse in">
        <div class="panel-body" style="overflow-x: auto">
           <div id="paramFolderMenu2" class="rightMenu">
        <ul>
          <li onclick="addParam(2)">添加参数</li>
          <li onclick="addFolder(2)">添加分类</li>
        </ul>
      </div>
          <img id="paramSearchImg" @click="paramTreeSearch" />
          <input
            id="paramSearch"
            name="paramSearch"
            type="text"
            class="form-control"
            autocomplete="off"
            placeholder="查询"
          />
          <ul id="paramTree" class="ztree" style="max-height: 400px" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { initParamTree, paramTreeSearch,initIcon } from "@/api/analysis/auditparam";
export default {
  mounted() {
    this.initTree();
  },
  data() {
    return {};
  },
  methods: {
    initTree() {
      initParamTree()
      initIcon()
    },
    paramTreeSearch() {
      paramTreeSearch();
    },
  },
};
</script>
<style>
#paramSearchImg,
.menuDemo ul {
  display: block;
  min-width: 43px;
}
.menuDemo ul li {
  margin: 1px 0;
  padding: 0 5px;
  cursor: pointer;
  list-style: none outside none;
}
#dataShow > pre {
  color: red;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 16px;
  background: none;
  border: none;
}
</style>

