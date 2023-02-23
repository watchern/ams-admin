<!-- 标签选择组件 -->
<template>
  <div>
    <el-dialog v-bind="$attrs"
               v-on="$listeners"
               width="80%"
               top="5vh"
               @opened="onOpen"
               @close="onClose">
      <div>
        <div class="flex"
             style="overflow: hidden;">
          <div class="padding10"
               style="width: 30%;">
            <el-tree style="height: calc(70vh);overflow-y: auto;"
                     :data="labelTreeData"
                     :props="labelDefaultProps"
                     @node-click="handleLabelNodeClick"
                     :default-expanded-keys="defaultExpandKeys"
                     node-key="labelLibraryId"
                     :expand-on-click-node="false"
                     :highlight-current="true"
                     ref="labelTree">
              <span class="custom-label-tree-node"
                    slot-scope="{ node, data }">
                <div v-if="data.childrenList.length>0">
                  <i :class="[ node.expanded ? 'el-icon-folder' : 'el-icon-folder-opened', ]"></i>
                  <span v-if="node.label.trim().length < 9">{{ node.label }}</span>
                  <el-tooltip placement="top"
                              v-else>
                    <div slot="content">{{ node.label }}</div>
                    <span>{{ node.label }}</span>
                  </el-tooltip>
                </div>
                <div v-else>
                  <i class="el-icon-folder"></i>
                  <span v-if="node.label.trim().length<9">{{ node.label }}</span>
                  <el-tooltip placement="top"
                              v-else>
                    <div slot="content">{{ node.label }}</div>
                    <span>{{ node.label }}</span>
                  </el-tooltip>
                </div>
              </span>
            </el-tree>
          </div>
          <div class="padding10"
               style="width: 70%;">
            <el-input placeholder="请输入标签名称"
                      style="width: 320px;"
                      clearable></el-input>
            <el-table ref="labelTable"
                      :data="labelData"
                      style="width: 100%;"
                      height="calc(55vh)"
                      row-key="labelLibraryId"
                      @selection-change="handleSelectLabel">
              <el-table-column type="selection"
                               width="50"
                               align="center"
                               :reserve-selection="true"></el-table-column>
              <el-table-column label="序号"
                               type="index"
                               width="50"
                               align="center"></el-table-column>
              <el-table-column prop="labelLibraryName"
                               label="标签名称"
                               show-overflow-tooltip></el-table-column>
              <el-table-column prop="labelLibraryNamePath"
                               label="标签路径"
                               show-overflow-tooltip></el-table-column>
              <el-table-column prop="labelLibraryInfo"
                               label="备注"
                               show-overflow-tooltip></el-table-column>
              <el-table-column prop="labelStatus"
                               label="标签状态"
                               width="100">
                <template slot-scope="scope">
                  <div v-if="scope.row.labelStatus === '2'">
                    <span style="display: flex; ">
                      <i class="dotClass"
                         style="background-color: springgreen;width: 10px;height: 10px;border-radius: 50%;display: block;margin-top: 6px;margin-right: 6px;" />
                      启用
                    </span>
                  </div>
                  <div v-if="scope.row.labelStatus === '1'">
                    <span style="display: flex; ">
                      <i class="dotClass"
                         style="background-color: red;width: 10px;height: 10px;border-radius: 50%;display: block;margin-top: 6px;margin-right: 6px;" />
                      停用
                    </span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div style="margin-bottom: 10px; margin-top: 10px;">
              <el-pagination :total="queryLabelInfo.total"
                             :current-page="queryLabelInfo.currentPage"
                             @current-change="handleLabelCurrentChange"
                             @size-change="handleLabelSizeChange"
                             layout="total, sizes, prev, pager, next, jumper"></el-pagination>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary"
                   @click="confirm">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getLabelTree, // 获取标签树
  getLabelList, // 获取标签列表
} from "@/api/data/table-info";
export default {
  name: "SelectLabel",
  props: ["hasSelected"],
  data () {
    return {
      labelDefaultProps: {
        children: "childrenList",
        label: "labelLibraryName",
      },
      // 标签树
      labelTreeData: [],
      queryLabelInfo: {
        superLabel: "",
        currentPage: 1,
        pageSize: 10,
        total: 0,
        labelLevel: 3,
      },
      // 标签数据
      labelData: [],
      labelLibraryId: "000000",
      defaultExpandKeys: [], // 树根节点值
      selectLabelData: [],
    };
  },
  created () {
    this.getLabelTree();
  },
  methods: {
    onOpen () {
      let rows = this.hasSelected;
      if (rows) {
        rows.forEach((row) => {
          let r = this.labelData.find(
            (item) => item.labelLibraryId == row.labelLibraryId
          );
          this.$refs.labelTable.toggleRowSelection(r);
        });
      } else {
        this.$refs.labelTable.clearSelection();
      }
    },
    onClose () {
      this.$refs.labelTable.clearSelection();
    },
    confirm () {
      this.$emit("confirm", this.selectLabelData);
      this.$refs.labelTable.clearSelection();
      this.$emit("update:visible", false);
    },
    close () {
      this.$refs.labelTable.clearSelection();
      this.$emit("update:visible", false);
    },
    // 查询标签树
    getLabelTree () {
      getLabelTree().then((res) => {
        this.getLabelList(
          res.data[0].labelLibraryId,
          this.queryLabelInfo.currentPage,
          this.queryLabelInfo.pageSize
        );
        this.defaultExpandKeys = [res.data[0].labelLibraryId];
        this.labelTreeData = res.data;
      });
    },
    // 查询标签列表
    getLabelList (superLabel, pageNo, pageSize, labelName) {
      getLabelList(superLabel, pageNo, pageSize, labelName).then((res) => {
        this.labelData = res.data.records;
        this.queryLabelInfo.total = res.data.total;
      });
    },
    // 点击标签树节点
    handleLabelNodeClick (data) {
      this.labelLibraryId = data.labelLibraryId;
      this.defaultExpandKeys[0] = data.labelLibraryId;
      this.queryLabelInfo.currentPage = null;
      this.getLabelList(
        data.labelLibraryId,
        this.queryLabelInfo.currentPage,
        this.queryLabelInfo.pageSize
      );
    },
    // 分页切换
    handleLabelCurrentChange (val) {
      this.queryLabelInfo.currentPage = val;
      this.getLabelList(
        this.defaultExpandKeys[0],
        this.queryLabelInfo.currentPage,
        this.queryLabelInfo.pageSize
      );
    },
    handleLabelSizeChange (val) {
      this.queryLabelInfo.pageSize = val;
      this.getLabelList(
        this.defaultExpandKeys[0],
        this.queryLabelInfo.currentPage,
        this.queryLabelInfo.pageSize
      );
    },
    // 选择标签
    handleSelectLabel (val) {
      this.selectLabelData = val;
    },
  },
};
</script>

<style>
</style>