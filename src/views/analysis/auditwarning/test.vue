<template>
  <div>
    <ag-grid-vue style="width: 800px; height: 500px;"
                 class="ag-theme-alpine"
                 :columnDefs="columnDefs"
                 sideBar=true
                 toolPanel='columns'
                 enablePivot=true
                 :rowData="rowData">
    </ag-grid-vue>
  </div>
</template>

<script>
// 引入ag-grid-vue
import { AgGridVue } from 'ag-grid-vue';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
export default {
  components: { AgGridVue },
  data () {
    return {
      columnDefs: [
        {headerName: '姓名', field: 'name'},
        {headerName: '性别', field: 'gender'},
        {headerName: '年龄', field: 'age'}
      ],
      rowData: [
        {name: '李煜', gender: '男', age: 20},
        {name: '柳叶', gender: '女', age: 25},
        {name: '姜宇', gender: '男', age: 18}
      ]
    };
  }
};
</script>

<style scoped>
.table{
  width: 600px;
  height: 200px;
}
</style>
