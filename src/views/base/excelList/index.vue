<template>
  <div>
    <div class="listDisplay">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        stripe
        v-loading="loading"
        height="calc(100vh - 150px)"
      >
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item"
          :prop="item"
          show-overflow-tooltip
        />
      </el-table>
      <el-button size="mini" type="primary" @click="nextPage">下一页</el-button>
      <el-button size="mini" type="primary" @click="viewAll"
        >查看全部</el-button
      >
    </div>
  </div>
</template>

<script>
import { excelReadList } from "@/api/base/base";
export default {
  name: "excelList",
  components: {},
  props: [],
  data() {
    return {
      tableData: [],
      tableColumn: [],
      loading: false,
      index: 1,
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.init(this.index);
  },
  methods: {
    init(val) {
      this.loading = true;
      var num = val * 15;
      let formData = new FormData();
      formData.append("limitRowSize", num);
      excelReadList(formData).then((res) => {
        this.loading = false;
        this.tableData = res.data;
        let values = Object.values(res.title);
        this.tableColumn = values;
      });
    },
    nextPage() {
      this.index++;
      let num = this.index;
      this.init(num);
    },
    viewAll() {
      this.init(0);
    },
  },
};
</script>

<style lang="scss" scoped></style>
