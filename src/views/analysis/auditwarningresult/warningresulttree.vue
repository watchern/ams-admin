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
    >
      <span class="custom-tree-node" slot-scope="{ data }">
        <span> <i :class="data.icon"></i>{{ data.name }} </span>
        <span>
          <el-button
            v-if="data.isDelete == 1"
            type="text"
            size="mini"
            class="tree-line-btn"
            @click="remove(data.id)"
          >
            <svg-icon icon-class="icon-delete-1" />
          </el-button>
        </span>
      </span>
    </el-tree>
  </div>
</template>
<script>
import { findWarningTree } from "@/api/analysis/auditwarningresult";
import { deleteRunTaskFalse } from "@/api/analysis/auditmodelresult";
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
      if (data.pid != "NULL") {
        this.$emit("clickChangeTable", data.id);
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
        var jsonTreeNode = resp.data;
        for (var i = 0; i < jsonTreeNode.length; i++) {
          jsonTreeNode[i].icon = "el-icon-bell";
          if (jsonTreeNode[i].children.length > 0) {
            for (var j = 0; j < jsonTreeNode[i].children.length; j++) {
              jsonTreeNode[i].children[j].icon = "el-icon-s-order";
              jsonTreeNode[i].children[j].isDelete = 1;
            }
          }
        }
        this.data = jsonTreeNode;
      });
    },
    remove(data) {
      this.openIsDelete(data)
    },
    openIsDelete(data) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteRunTaskFalse(data).then((resp) => {
            if (resp.data == true) {
              // this.initTreeData();
              for(var i = 0;i<this.data.length;i++){
                var children = this.data[i].children
                if(children.length>0){
                  for(var j = 0;j<children.length;j++){
                    if(data==children[j].id){
                      children.splice(j,1)
                    }
                  }
                }
              }
               this.$emit('getLikeList')
              this.$message({
                type: "success",
                message: "删除成功!",
              });
            }else{
              this.$message({ type: 'info', message: '删除失败!' })
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>
