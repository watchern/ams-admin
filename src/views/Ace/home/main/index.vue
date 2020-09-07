<template>
  <div class="main-page w100 h100 flex a-center j-start flex-row">
    <div class="main-page-left h100 flex-shrink">
      <new-tree></new-tree>
    </div>
    <div class="main-page-right flex1 h100">
      <div class="new-table-search flex a-center j-between flex-row">
        <div class="search-left h100 flex a-center j-start flex-row">
          <div class="tag-box flex a-center j-center" v-for="(item,index) in 4" :key="index">
            <i class="el-icon-search text-white"></i>
          </div>
        </div>
        <div class="search-right h100 flex a-center j-end flex-row">
          <new-input v-model="searchVal" @keydown="keydown"></new-input>
          <div class="icon-box relative flex a-center j-center" @click.stop.prevent="isShowNewCard=!isShowNewCard" :class="[isShowNewCard && 'icon-box-active']">
            <i class="el-icon-search icon flex-shrink" ></i>
            <div class="new-card-warp absolute" v-if="isShowNewCard" @click.stop.prevent="()=>{}">
              <new-card></new-card>
            </div>
          </div>
        </div>
      </div>
      <div class="new-table-content">
        <div class="count-total-wrap">
          <i class="el-icon-warning icon-waring"></i>
          <span class="info">共{{total}}项 已选择 <span class="info-color">{{selectedRowVal}}</span> 项</span>
        </div>
        <div class="new-table-content-wrap">
          <new-ag-grid :tableOptions="tableOptions" :rowData="tableData" :pageNum='pageNum' :pageSize='pageSize' :total='total' ref='agGridDom'></new-ag-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableCommon from '@/mixin/table-common.js'
export default {
  mixins:[TableCommon],
  data() {
    return {
      tableData: [],
      isShowNewCard:false,
      searchVal: "",
      // selectedRowVal:0,
      tableOptions: {
        columnDefs: [
          {
            headerName: "",
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: "left"
          },
          {
            headerName: "审计项目名称",
            field: "name",
            filter: "agTextColumnFilter",
            pinned: "left"
          },
          { headerName: "被审计机构", field: "sex" },
          {
            headerName: "项目状态",
            field: "age",
            filter: "agNumberColumnFilter"
          },
          { headerName: "立项人", field: "sr", filter: "agNumberColumnFilter" },
          {
            headerName: "执行机构",
            field: "b",
            filter: "agNumberColumnFilter"
          },
          {
            headerName: "立项日期",
            field: "c",
            filter: "agNumberColumnFilter"
          },
          {
            headerName: "项目进度",
            field: "d",
            filter: "agNumberColumnFilter",
            minWidth: 200,
            cellRenderer: this.progressBar
          }
        ]
      }
    };
  },
  created() {
    this.init();
  },
  computed:{
    selectedRowVal(){
      return 4
    }
  },
  methods: {
    progressBar(params) {
      return this.$tool.setTableCellRender(params);
    },
    init() {
      setTimeout(() => {
        this.tableData = [
          {
            id: 1,
            name: "公司整体信贷业务专项问题审计",
            sex: "北京分行、天津",
            age: '执行中',
            sr: '王经理',
            b: "总行审计部",
            c: '2020-04-19',
            d: { width: "0", color: "#ccc" }
          },
          {
            id: 1,
            name: "公司整体信贷业务专项问题审计",
            sex: "深圳分行",
            age: '待执行',
            sr: '王经理',
            b: "总行审计部",
            c: '2020-04-19',
            d: { width: "40", color: "blue" }
          },
          {
            id: 1,
            name: "2020消费者权益保护审计",
            sex: "深圳分行",
            age: '待执行',
            sr: '王经理',
            b: "总行审计部",
            c: '2020-04-19',
            d: { width: "60", color: "red" }
          },
        ];
      }, 1000);
    },
    keydown() {}
  }
};
</script>

<style lang="scss" scoped>
.main-page {
  padding: 12px;
  overflow-y: auto;
  &-left {
    width: 350px;
    background: #ffffff;
    box-shadow: 3px 0 17px 0 rgba(0, 0, 0, 0.1);
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
