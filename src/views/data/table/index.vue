<template>
  <div class="main-page w100 h100 flex a-center j-start flex-row">
    <!--左侧树-->
    <div class="main-page-left h100 flex-shrink">
      <new-tree />
    </div>
    <!--右侧表-->
    <div class="main-page-right flex1 h100">
      <div class="new-table-search flex a-center j-between flex-row">
        <div class="search-left h100 flex a-center j-start flex-row">
          <div class="tag-box flex a-center j-center">
            <i class="el-icon-plus text-white" />
          </div>
          <div class="tag-box flex a-center j-center">
            <i class="el-icon-remove text-white" />
          </div>
          <div class="tag-box flex a-center j-center">
            <i class="el-icon-edit text-white" />
          </div>
          <div class="tag-box flex a-center j-center">
            <i class="el-icon-search text-white" />
          </div>
        </div>
        <div class="search-right h100 flex a-center j-end flex-row">
          <new-input v-model="searchVal" @keydown="keydown" :placeholder="'按业务属性编码查找'" />
          <div class="icon-box relative flex a-center j-center" :class="[isShowNewCard && 'icon-box-active']" @click.stop.prevent="isShowNewCard=!isShowNewCard">
            <i class="el-icon-search icon flex-shrink" />
            <div v-if="isShowNewCard" class="new-card-warp absolute" @click.stop.prevent="()=>{}">
              <new-card />
            </div>
          </div>
        </div>
      </div>
      <div class="new-table-content">
        <div class="count-total-wrap">
          <i class="el-icon-warning icon-waring" />
          <span class="info">共{{ total }}项 已选择 <span class="info-color">{{ selectedRowVal }}</span> 项</span>
        </div>
        <div class="new-table-content-wrap">
          <new-ag-grid ref="agGridDom" :table-options="tableOptions" :row-data="tableData"
                       :page-num="pageNum" :page-size="pageSize" :total="total"
                        @handleCurrentChange="init()"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableCommon from '@/mixin/table-common.js'
import { listByPage } from '@/api/data/biz-attr'
export default {
  mixins: [TableCommon],
  data() {
    return {
      tableData: [],
      attrName: '11',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      isShowNewCard: false,
      searchVal: '',
      // selectedRowVal:0,
      tableOptions: {
        columnDefs: [
          {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: 'left'
          },
          {
            headerName: '业务属性编码',
            field: 'attrName',
            filter: 'agTextColumnFilter',
            pinned: 'left'
          },
          { headerName: '业务属性名称', field: 'attrName' },
          {
            headerName: '项目状态',
            field: 'age',
            filter: 'agNumberColumnFilter'
          },
          { headerName: '描述', field: 'describe', filter: 'agNumberColumnFilter' },
        ]
      }
    }
  },
  computed: {
    selectedRowVal() {
      return 4
    }
  },
  created() {
    this.init()
  },
  methods: {
    progressBar(params) {
      return this.$tool.setTableCellRender(params)
    },
    init() {
      var param = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        attrName: this.attrName
      }
      listByPage(param).then(resp => {
        this.total = resp.data.total;
        this.tableData = resp.data.records;
      });
      /*getUserRes()
        .then(response => {
          console.log(response)
        })*/
    },
    keydown() {}
  }
}
</script>

<style lang="scss" scoped>
.main-page {
  padding: 12px;
  overflow-y: auto;
  &-left {
    width: 350px;
    background: #ffffff;
    box-shadow: 3px 0 17px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 3px 0 17px 0 rgba(0,0,0,0.10);
    border-radius: 30px 1px 1px 30px;
  }
  &-right {
    background: #edf1f5;
    font-size: 12px;
    .new-table-search {
      height: 58px;
      margin-bottom: 0px;
      padding: 0 23px;
      .search-left{
        .tag-box{
          background: #343942;
          width: 24px;
          height: 24px;
          margin-right: 7.5px;
          border-radius: 4px;
        }
      }
      .search-right {
        .icon-box {
          border: 1px solid #343942;
          box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.04);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 16px;
          margin-left: 11px;
          font-size: 16px;
          &-active{
            background: #343942;
            color: #C8FF8C;
          }
          .new-card-warp{
            top: 40px;
            right: 0px;
            z-index: 100;
          }
        }
      }
    }
    .new-table-content {
      height: calc(100% - 80px);
      &-wrap{
        height: calc(100% - 36px);
      }
      .count-total-wrap{
        height: 36px;
        background: #D7C6C9;
        border-radius: 4px;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #343942;
        letter-spacing: 1px;
        line-height: 36px;
        padding:0 11px;
        .info-color{
          color: #9B4C4C;
        }
        .icon-waring{
          font-size: 16px;
          color: #9B4C4C;
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
