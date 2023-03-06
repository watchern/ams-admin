<template>
  <div>
    <el-dialog v-bind="$attrs" v-on="$listeners" width="60%" top="5vh" @opened="onOpen" @close="onClose">
      <div>
        <div class="flex" style="overflow: hidden;">
          <div class="padding10" style="width: 25%;">
            <el-tree style="height: calc(70hv);overflow-y: auto;" :data="data" :props="defaultProps" @node-click="handleNodeClick" :default-expanded-keys="defaultExpandKeys" node-key="id" :expand-on-click-node="false" :highlight-current="true" ref="orgTree">
              <span class="custom-label-tree-node" slot-scope="{node, data}">
                <div v-if="data.children.length > 0">
                  <i :class="[ node.expanded ? 'el-icon-folder' : 'el-icon-folder-opened' ]"></i>
                  <span v-if="node.label.trim().length < 9">{{ node.label }}</span>
                  <el-tooltip placement="top" v-else>
                    <div slot="content">{{ node.label }}</div>
                    <span>{{ node.label }}</span>
                  </el-tooltip>
                </div>
                <div v-else>
                  <i class="el-icon-folder"></i>
                  <span v-if="node.label.trim().length < 9">{{ node.label }}</span>
                  <el-tooltip placement="top" v-else>
                    <div slot="content">{{ node.label }}</div>
                    <span>{{ node.label }}</span>
                  </el-tooltip>
                </div>
              </span>
            </el-tree>
          </div>
          <div class="padding10" style="width: 75%;">
            <div class="flex">
              <el-input placeholder="请输入姓名进行过滤" v-model="queryPeopleInfo.name" style="width: 320px; margin-bottom: 10px;" clearable></el-input>
              <el-button class="select-btn" size="small" type="primary" @click="filterData">查询</el-button>
            </div>
            <el-table v-loading="tableLoading" ref="peopleTable" :data="dataList" style="width: 100%;" height="calc(55vh)" row-key="personUuid" @selection-change="handleSelectPeople">
              <el-table-column type="selection" :reserve-selection="true" width="50" align="center"></el-table-column>
              <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
              <el-table-column label="人员名称" align="center" prop="cnname"></el-table-column>
              <el-table-column label="组织名称" align="center" prop="org.cnname"></el-table-column>
            </el-table>
            <div style="margin-bottom: 10px; margin-top: 10px;">
              <el-pagination :current-page="queryPeopleInfo.currentPage" layout="total, sizes, prev, pager, next, jumper" :total="queryPeopleInfo.total" @size-change="handleSizeChange" @current-change="handleCurrentChange"></el-pagination>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { findOrgTree, findPeopleByPage } from "@/api/base/orgpeople";
export default {
  name: "SelectPerson",
  data() {
    return {
      data: [], //组织人员树的数据
      defaultProps: {
        children: "children",
        label: "name",
      }, //组织人员树的默认属性
      tableLoading: false,
      dataList: [], //存放后台传来的所有人员数据，用于前台分页
      selectPeopleData: [], //存放多选框选中的数据
      defaultExpandKeys: [], // 树根节点值
      queryPeopleInfo: {
        orgUuid: "",
        name: "",
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  props: ["hasSelected"],
  created() {},
  methods: {
    onOpen() {
      this.tableLoading = true;
      this.reverseSelect();
      this.findOrgTree_data();
    },
    onClose() {
      this.queryPeopleInfo = {
        orgUuid: "",
        name: "",
        currentPage: 1,
        pageSize: 10,
        total: 0,
      };
      this.$refs.peopleTable.clearSelection();
    },
    confirm() {
      this.$emit("confirm", this.selectPeopleData);
      this.$refs.peopleTable.clearSelection();
      this.$emit("update:visible", false);
    },
    close() {
      this.$emit("update:visible", false);
    },
    /**
     * 初始化组织树
     */
    findOrgTree_data() {
      findOrgTree().then((res) => {
        this.defaultExpandKeys = [res.data[0].id];
        this.data = res.data;
        this.queryPeopleInfo.orgUuid = res.data[0].id;
        this.initData(this.queryPeopleInfo);
      });
    },
    /**
     * 点击树节点时候触发
     */
    handleNodeClick(data) {
      this.queryPeopleInfo.orgUuid = data.id;
      this.queryPeopleInfo.currentPage = 1;
      this.queryPeopleInfo.pageSize = 10;
      this.initData(this.queryPeopleInfo);
    },
    /**
     * 初始化表格数据
     */
    initData(param) {
      findPeopleByPage(param).then((res) => {
        this.dataList = res.data.records;
        this.dataList = this.dataList.map((item) => {
          return {
            ...item,
            personUuid: item.personuuid,
          };
        });
        this.queryPeopleInfo.total = res.data.total;

        this.tableLoading = false;
      });
    },
    filterData() {
      this.initData(this.queryPeopleInfo);
    },
    // 当每页数量改变
    handleSizeChange(val) {
      this.tableLoading = true;
      this.queryPeopleInfo.pageSize = val;
      this.initData(this.queryPeopleInfo);
    },
    // 当当前页改变
    handleCurrentChange(val) {
      this.tableLoading = true;
      this.queryPeopleInfo.currentPage = val;
      this.initData(this.queryPeopleInfo);
    },
    // 选择人员
    handleSelectPeople(val) {
      this.selectPeopleData = val;
    },
    // 反显方法
    reverseSelect() {
      let rows = this.hasSelected;
      if (rows) {
        rows.forEach((row) => {
          this.$refs.peopleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.peopleTable.clearSelection();
      }
    },
  },
};
</script>
<style scoped>
@import url("../../assets/css/common.css");
.select-btn {
  margin-left: 10px;
  height: 36px !important;
}
</style>
