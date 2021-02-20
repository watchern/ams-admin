<template>
  <div>
    <el-table  style="height: 400px;overflow-y: scroll"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="项目名称"
        width="200px"
        align="center"
        prop="PRJ_NAME"
      />
      <el-table-column
        label="创建人名称"
        width="150px"
        align="center"
        prop="CREATE_PERSON_NAME"
      />
      <el-table-column
        label="创建时间"
        width="200px"
        align="center"
        prop="CREATE_TIME"
      />
    </el-table>
  </div>
</template>
<script>
import { getProjectByLoginUserUuid } from "@/api/base/userproject";
export default {
  created() {
    this.getProject();
  },
  data() {
    return {
      listLoading: true,
      list: [],
      selectValue: {},
    };
  },
  methods: {
    getProject() {
      getProjectByLoginUserUuid().then((resp) => {
        this.list = resp.data;
        this.listLoading = false;
      });
    },
    /**
     * 当多选框改变时触发
     */
    handleSelectionChange(val) {
      this.selectValue = val;
    },
    /**
     * 返回选中的数据方法
     */
    getSelectValue() {
      return this.selectValue;
    }
  },
};
</script>
