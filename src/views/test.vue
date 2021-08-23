<template>
  <div>
    <div class="outer-div">
                <div class="button-bar">
                    <button v-on:click="sizeToFit()">Size to Fit</button>
                    <button v-on:click="autoSizeAll(false)">Auto-Size All</button>
                    <button v-on:click="autoSizeAll(true)">Auto-Size All (Skip Header)</button>
                </div>
                <div class="grid-wrapper">
                    <ag-grid-vue
                style="width: 100%; height: 500px;"
                class="ag-theme-alpine"
                id="myGrid"
                :columnDefs="columnDefs"
                @grid-ready="onGridReady"
                :defaultColDef="defaultColDef"
                :rowData="rowData"></ag-grid-vue>
                </div>
            </div>
  </div>
</template>
<script>
import { AgGridVue } from 'ag-grid-vue';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
export default {
  name: "App",
  data() {
    return {
      columnDefs: [
        { field: 'athlete', width: 150, suppressSizeToFit: true },
        {
          field: 'age',
          headerName: 'Age of Athlete',
          width: 90,
          minWidth: 50,
          maxWidth: 150,
        },
        { field: 'country', width: 120 },
        { field: 'year', width: 90 },
        { field: 'date', width: 110 },
        { field: 'sport', width: 110 },
        { field: 'gold', width: 100 },
        { field: 'silver', width: 100 },
        { field: 'bronze', width: 100 },
        { field: 'total', width: 100 },
      ],
      gridApi: null,
      columnApi: null,
      defaultColDef: { resizable: true },
      rowData: null,
    };
  },
  components: {
    "ag-grid-vue": AgGridVue,
  },
  beforeMount() {},
  methods: {
    sizeToFit() {
      this.gridApi.sizeColumnsToFit();
    },
    autoSizeAll(skipHeader) {
      var allColumnIds = [];
      this.gridColumnApi.getAllColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
      });
      this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
    },
    onGridReady(params) {
      console.log('zzz')
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;

      const updateData = (data) => {
        this.rowData = data;
      };

      fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => updateData(data));
    },
  },
};
</script>
<style scoped>
.outer-div {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.button-bar {
  margin-bottom: 1rem;
}

.grid-wrapper {
  flex: 1 1 auto;
}
</style>