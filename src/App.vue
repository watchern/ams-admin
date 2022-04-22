<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
@import url("styles/css/index.css");
.el-loading-mask {
  z-index: 1998;
}

/* 应客户要求改滚动条颜色 */
.itxst ::-webkit-scrollbar{
  background-color: transparent;
}
.itxst ::-webkit-scrollbar-thumb{
  background-color: #559ed4 !important;
}
/*aggrid样式*/
.ag-theme-balham .ag-icon-asc::before {
  content: "" !important;
}
.ag-theme-balham .ag-icon-filter::before {
  content: "" !important;
}
.ag-theme-balham .ag-icon-desc::before {
  content: "" !important;
}
.ag-theme-balham .ag-menu .ag-menu-option-icon span {
  line-height: 16px;
}
.ag-theme-balham .ag-header-cell-menu-button .ag-icon-menu {
  height: 16px;
}
.ag-theme-balham .ag-icon-small-right {
  width: 10px;
}
.ag-theme-balham .ag-header-cell-label{
  justify-content: center;
}
.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: none;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  outline: 0;
}
.bjbutton{
  background-color:rgb(225, 243, 216);
  color:rgb(103, 194, 58);
  border:1px solid rgb(103, 194, 58);
}
</style>
