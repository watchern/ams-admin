<template>
  <div class="new-ag-grid-wrap h100">
    <div id="myGrid" class="ag-theme-balham w100 new-ag-grid" />
    <div v-if="gridOptions.isPagination" class="new-pagination flex a-center j-start w100">
      <el-pagination
        :current-page="pageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { Grid } from 'ag-grid/main'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'
export default {
  props: {
    tableOptions: {
      type: Object,
      default: () => ({})
    },
    rowData: {
      type: Array,
      default: () => []
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    total: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      gridOptions: {
        rowHeight: 52,
        isPagination: true,
        rowSelection: 'multiple',
        onGridReady: () => {
          this.gridOptions.api.sizeColumnsToFit() // 调整表格大小自适应
        },
        columnDefs: [],
        rowData: []
      }
    }
  },
  watch: {
    rowData: {
      handler: function(newVal, oldVal) {
        this.gridOptions.rowData = newVal
        this.gridOptions.api &&
          this.gridOptions.api.setRowData &&
          this.gridOptions.api.setRowData(newVal)
      },
      deep: true,
      immediate: true
    },
    tableOptions: {
      handler: function(newVal, oldVal) {
        this.gridOptions = Object.assign({}, this.gridOptions, newVal)
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initTable()
    })
  },
  methods: {
    initTable() {
      const eGridDiv = document.querySelector('#myGrid')
      new Grid(eGridDiv, this.gridOptions)
      this.getSelectRows()
    },
    getSelectRows() {
      var rows = this.gridOptions && this.gridOptions.api && this.gridOptions.api.getSelectedRows()
      return rows
    },
    handleSizeChange(val) {
      this.$emit('handleSizeChange', val)
    },
    handleCurrentChange(val) {
      this.$emit('handleCurrentChange', val)
    }
  }
}
</script>
<style lang="scss" scoped>
.new-ag-grid-wrap{
  .new-ag-grid{
    height: calc(100% - 50px);
  }
  .new-pagination{
    height: 50px;
    overflow: hidden;
    position: relative;
    &::after{
      content: "";
      position: absolute;
      display: inline-block;
      left: 20px;
      right: 20px;
      height: 2px;
background: rgba(0,0,0,0.07);
      top: 0;
    }
    >>>.el-pagination{
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 20px;
    }
  }
}
</style>
<style scoped>
.new-pagination >>>.number.active{
  border-radius: 50%;
  background:  #343942 !important;
  color: white;
  min-width: 28px !important;
}
.new-pagination >>> .el-pager li,.new-pagination >>> .el-pagination button:disabled{
  background: #EDF1F5 !important;
}
.new-pagination >>> .el-pagination .btn-prev,.new-pagination >>> .el-pagination .btn-next{
  background: #EDF1F5 !important;
}
.new-ag-grid >>> .ag-header,
.new-ag-grid >>> .ag-header-row,
.new-ag-grid >>> .ag-header-cell {
  height: 40px !important;
  line-height: 40px !important;
  background: transparent !important;
}
.new-ag-grid >>> .ag-header-cell::after {
  display: none !important;
  border: none !important;
}
.new-ag-grid >>> .ag-header-cell-text {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #102033;
  letter-spacing: 0.39px;
}

.new-ag-grid  >>> .ag-row,.new-ag-grid >>> .ag-header,.new-ag-grid  >>> .ag-cell-last-left-pinned,.new-ag-grid  >>> .ag-theme-balham .ag-cell,.new-ag-grid  >>> .ag-header-row{
  border: none !important;
}
.new-ag-grid  >>>  .ag-cell{
  line-height: 52px;
  opacity: 0.9;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: rgba(53,58,67,0.95);
  letter-spacing: -0.16px;
  background: #EDF1F5  ;
}
.new-ag-grid  >>> .ag-row-hover{
  background: #B7BCBC !important;
}
.new-ag-grid  >>> .ag-root{
  border: none !important;
  background: #EDF1F5 !important;
}
</style>
