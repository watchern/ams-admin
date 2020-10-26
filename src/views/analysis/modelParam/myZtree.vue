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
import { initParamTree, paramTreeSearch,initIcon } from "@/api/analysis/auditParam";
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
#tableSearchImg,
#paramSearchImg,
#funSearchImg {
  width: 20px;
  height: 20px;
  position: relative;
  bottom: -25px;
  right: 10px;
  float: right;
  cursor: pointer;
}
.CodeMirror-hint-table {
  color: #af0000 !important;
  font-size: 15pt;
}
.CodeMirror-hint-table:before {
  content: " ";
  width: 30px;
  height: 20px;
  background-image: url("/lib/codemirror/img/ic-table.png");
}
.menuDemo {
  position: absolute;
  display: none;
  top: 0;
  text-align: left;
  padding: 2px;
}
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
.iconImg {
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
}
.iconText {
  font-size: 14px;
  cursor: pointer;
}
#sql {
  width: 100%;
  height: 320px;
}
.table-view {
  overflow-x: auto;
}
#vertical {
  position: absolute;
  top: 0;
  left: 17.3%;
  height: 114vh;
  width: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: w-resize;
}
#horizontal {
  position: absolute;
  top: 50%;
  /* width: 100vh; */
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: #c0c5d4;
  cursor: s-resize;
}
.errorHighlight {
  background-color: #f99999;
}
.successHighlight {
  background-color: transparent !important;
}
.CodeMirror-hints {
  z-index: 1000;
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

