<template>
  <div>
    <div class="listDisplay">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        stripe
        v-loading="loading"
        height="calc(100vh - 250px)"
      >
        <el-table-column
          v-for="(item, index) in tableColumn"
          :key="index"
          :label="item.label"
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
export default {
  name: "excelList",
  components: {},
  props: [],
  data() {
    return {
      tableData: [],
      tableColumn: [{ label: "222" }],
      loading: false,
    };
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    nextPage() {},
    viewAll() {},
  },
};
</script>

<style lang="scss" scoped></style>
