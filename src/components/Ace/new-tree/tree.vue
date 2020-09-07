<template>
  <div class="tree">
    <el-tree
      :data="treeData"
      :props="defaultProps"
      @node-click="handleNodeClick"
      icon-class="el-icon-folder"
    >
      <span
        class="custom-tree-node tree-slot-wrap flex a-center w100 j-between flex-row"
        slot-scope="{ node, data }"
      >
        <span class="label-name">{{ node.label }}</span>
        <span class="inline-block label-icons" v-if="data.isBtn ===undefined?true:data.isBtn">
          <span class="icon-box">
            <i class="el-icon-edit"></i>
          </span>
          <span class="icon-box">
            <i class="el-icon-share"></i>
          </span>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
export default {
  props: {
    treeData: [Array]
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  methods: {
    handleNodeClick(data) {
      this.$emit("node-click",data)
      console.log(data);
    }
  }
};
</script>

<style lang="scss" scoped>
.tree {
  .tree-slot-wrap {
    height: 34px;
    line-height: 34px;
    font-size: 14px;
    background: transparent !important;
    position: relative;
    .label-name {
      max-width: 168px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
    }
    .label-icons {
      position: absolute;
      right: 20px;
      .icon-box {
        display: inline-block;
        width: 16px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        font-size: 8px;
        background: #8f9cb1;
        margin-left: 7px;
        color: white;
        border-radius: 3px;
      }
    }
  }

  >>> .el-tree-node {
    line-height: 34px;
    padding: 2px 0px 2px 20px;
    border-radius: 4px;
  }
  >>> .el-tree-node:hover {
    background: #f7f7f7;
    border-radius: 8px;
  }
  >>> .el-tree-node__content {
    height: 34px;
    background: transparent;
  }
  >>> .el-tree-node.is-current .tree-slot-wrap .label-name {
    color: #db1e2c;
  }
  >>> .el-tree-node__expand-icon.el-icon-folder {
    color: #db1e2c;
    font-size: 16px;
  }
  >>> .el-tree-node.is-current.is-expanded .tree-slot-wrap .label-name {
    color: #3f444d;
  }
  >>> .el-tree-node__expand-icon.expanded {
    transform: rotate(0deg);
  }

  >>> .el-tree-node__content:hover {
    background: transparent;
  }
}
</style>
