<template>
  <div>
    <ag-grid-vue
      style="height: 500px; width: 100%"
      class="ag-theme-balham"
      :columnDefs="columnDefs"
      :rowData="rowData"
    ></ag-grid-vue>
    <!--ag-theme-balham这个类名是组件提供的默认主题-->
  </div>
</template>
<script>
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { AgGridVue } from "@ag-grid-community/vue";
export default {
  data() {
        return {
            columnDefs: null,
            rowData: null
        }
    },
    components: {
        AgGridVue
    },
    beforeMount() {
        this.columnDefs = [
            { field: 'make' },
            { field: 'model' },
            { field: 'price' }
        ];

        this.rowData = [
            { make: 'Toyota', model: 'Celica', price: 35000 },
            { make: 'Ford', model: 'Mondeo', price: 32000 },
            { make: 'Porsche', model: 'Boxter', price: 72000 }
        ];
    },
};
</script>
<style scoped>
</style>