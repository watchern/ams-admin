<template>
  <div class="app-container" style="height:80vh;overflow:auto">
    <el-row>
      <el-col
        v-if="openType !== 'showTable' && openType !== 'tableRegister'"
        align="right"
      >
        <!-- <el-button type="primary" size="mini" class="oper-btn iconoper-export" title="上移" @click="upTheCol()" />
        <el-button type="primary" size="mini" class="oper-btn iconoper-import" title="下移" @click="downTheCol()" /> -->
        <el-button
          type="primary"
          size="mini"
          class="oper-btn add"
          @click="addCol()"
        />
        <el-button
          type="primary"
          size="mini"
          class="oper-btn copy"
          :disabled="selections.length !== 1"
          @click="copyCol()"
        />
        <el-button
          type="primary"
          size="mini"
          class="oper-btn delete"
          :disabled="selections.length === 0"
          @click="delCol()"
        />
      </el-col>
    </el-row>
    <template
      v-if="openType !== 'showTable' && openType !== 'tableRegister'"
      class="detail-form"
    >
      <el-form ref="dataForm" :model="tempTable">
        <el-form-item label="表名称" prop="tableName">
          <el-input v-model="tempTable.tableName" />
        </el-form-item>
        <!-- <el-form-item v-if="openType !== 'addTable'" label="新建表注释" prop="tableComment">
          <el-input v-model="tempTable.tableComment" />
        </el-form-item> -->
      </el-form>
    </template>
    <el-table :data="temp" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="colName" label="字段名称" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-tooltip
            :disabled="scope.row.colName.length < 12"
            effect="dark"
            :content="scope.row.colName"
            placement="top"
          >
            <el-input
              v-model="scope.row.colName"
              style="width: 90%"
              :disabled="
                openType === 'showTable' || openType === 'tableRegister'
              "
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="dataType" label="数据类型">
        <template slot-scope="scope">
          <el-select
            ref="dataType"
            v-model="scope.row.dataType"
            :disabled="openType === 'showTable' || openType === 'tableRegister'"
            filterable
            style="width: 90%"
            placeholder="请选择数据类型"
          >
            <el-option
              v-for="item in sqlType"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        prop="dataLength"
        label="数据长度（精度）"
        show-overflow-tooltip
      >
        <template slot-scope="scope" show-overflow-tooltip>
        <!--   v-model 需要根据是否是decimal展示长度+精度 用到了双三目，有点难看 -->
          <el-input
            @change="judelength(scope.row)"
            v-model="scope.row.dataType.trim()==='DECIMAL' ? scope.row.dataLength+(scope.row.colPrecision?','+scope.row.colPrecision:'' ):scope.row.dataLength"
            style="width: 90%"
            :disabled="openType === 'showTable' || openType === 'tableRegister'"
          />
        </template>
      </el-table-column>
      <el-table-column prop="isNullable" label="是否为空" width="80px">
        <template slot-scope="scope">
          <el-radio
            v-model="scope.row.isNullable"
            :disabled="openType === 'showTable' || openType === 'tableRegister'"
            :label="1"
            @click.native.prevent="clickitem(scope.$index, 1)"
            ><span
          /></el-radio>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="openType !== 'addTable'" prop="colComment" label="注释" show-overflow-tooltip>
        <template slot-scope="scope" show-overflow-tooltip>
          <el-input v-model="scope.row.colComment" :disabled="openType === 'showTable' || openType === 'tableRegister'" style="width:90%;" />
        </template>
      </el-table-column> -->
    </el-table>
  </div>
</template>

<script>
import { getSqlType, getColsInfo } from "@/api/data/table-info";
import { addTable, updateTable } from "@/api/data/directory";
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ["tableId", "openType", "forderId"],
  data() {
    return {
      copyColObj: {},
      selections: [],
      sqlType: {},
      temp: [],
      tempIndex: 0,
      tempColumn: [],
      oldName: "",
      show: false,
      tempTable: { tableName: "" },
    };
  },
  created() {
    this.initTable(this.tableId);
  },
  methods: {
    judelength(rowdata) {
      console.log(rowdata);
      let xx = rowdata.dataType.toUpperCase();
      switch (xx) {
        case "CHAR":
         if (1 <= rowdata.dataLength && rowdata.dataLength <= 8000) {
          } else {
            this.$message.error('char类型长度范围:1-8000之间数字');
          }
          break;
        case "VARCHAR2":
          if (1 <= rowdata.dataLength && rowdata.dataLength <= 8000) {
          } else {
            this.$message.error("varchar2类型长度范围:1-8000之间数字");
          }
          break;
        case "VARCHAR":
          if (1 <= rowdata.dataLength && rowdata.dataLength <= 8000) {
          } else {
            this.$message.error("varchar类型长度范围:1-8000之间数字");
          }
          break;
        case "NVARCHAR":
          if (1 <= rowdata.dataLength && rowdata.dataLength <= 4000) {
          } else {
            this.$message.error("nvarchar类型长度范围:1-4000之间数字");
          }
          break;
        case "NUMBER":
          var flag1 = new RegExp("^[0-9]$");
          var flag2 = new RegExp("^[0-9]+[,]+[0-9]$");
          if (flag1.test(rowdata.dataLength)) {
          } else if (flag2.test(rowdata.dataLength)) {
          } else {
            this.$message.error(
              "number类型长度范围:单个数字，也可以是 数字,数字(英文逗号)"
            );
          }
          break;
        case "DECIMAL":
          var flag = new RegExp("^[0-9]+[,]+[0-9]$");
          if (flag.test(rowdata.dataLength)) {
          } else {
            this.$message.error("decimal类型长度范围:数字,数字(英文逗号)");
          }
          break;
        case "INT":
          var flag = new RegExp("^[0-9]{1,11}$");
          if (flag.test(rowdata.dataLength)) {
          } else {
            this.$message.error("int类型长度范围:最长11位长度数字");
          }
          break;
      }
    },
    initTable(tableId) {
      getSqlType().then((resp) => {
        this.sqlType = resp.data;
      });
      if (this.openType !== "addTable") {
        getColsInfo(tableId).then((resp) => {
          // 返回两个新的数组
          this.oldName = resp.data.displayTbName;
          this.tempTable.tableName = resp.data.displayTbName;
          resp.data.colMetas.forEach((e) => {
            this.tempIndex++;
            e.tempIndex = this.tempIndex;
          });
          this.tempColumn = resp.data.colMetas.slice();
          this.temp = JSON.parse(JSON.stringify(resp.data.colMetas));
        });
      }
    },
    handleSelectionChange(val) {
      this.selections = val;
    },
    upTheCol() {
      var rulObj = Object.assign({}, this.selections[0]); // copy obj
      var index = this.temp.findIndex(
        (v) => JSON.stringify(v) === JSON.stringify(rulObj)
      );
      this.temp.splice(index - 1, 0, rulObj);
      this.temp.splice(index + 1, 1);
      this.selections = rulObj;
      // var rulObj = Object.assign({}, this.selections[0]) // copy obj
      // var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(rulObj))
      // if (this.temp.length > 1 && index !== 0) {
      //   var tempObj = this.temp[index - 1]
      //   this.temp[index - 1] = this.temp[index]
      //   this.temp[index] = tempObj
      // }
    },
    downTheCol() {
      var rulObj = Object.assign({}, this.selections[0]); // copy obj
      var index = this.temp.findIndex(
        (v) => JSON.stringify(v) === JSON.stringify(rulObj)
      );
      this.temp.splice(index - 1, 0, rulObj);
      this.temp.splice(index + 1, 1);
      this.selections = rulObj;
      // var rulObj = Object.assign({}, this.selections[0]) // copy obj
      // var index = this.temp.findIndex(v => JSON.stringify(v) === JSON.stringify(rulObj))
      // if (this.temp.length > 1 && index !== this.temp.length - 1) {
      //   var tempObj = this.temp[index + 1] // 以c为基点
      //   this.temp[index + 1] = this.temp[index]
      //   this.temp[index] = tempObj
      // }
    },
    addCol() {
      var newObj = {}; // copy obj
      newObj.colName = "";
      newObj.dataType = "";
      newObj.dataLength = "";
      newObj.isNullable = 0;
      this.tempIndex++;
      newObj.tempIndex = this.tempIndex;
      newObj.colComment = "";
      this.temp.splice(this.temp.length, 0, newObj);
    },
    delCol() {
      this.selections.forEach((r, i) => {
        var index = this.temp.findIndex(
          (v) => JSON.stringify(v) === JSON.stringify(r)
        );
        this.temp.splice(index, 1);
      });
    },
    copyCol() {
      this.copyColObj = Object.assign({}, this.selections[0]);
      this.temp.splice(this.temp.length, 0, this.copyColObj);
    },
    clickitem(row, e) {
      // 当点击已经选中的把 isNullable 置0，就是取消选中，并返回
      if (this.temp[row].isNullable === e) {
        this.temp[row].isNullable = 0;
        return;
      }
      // 不是选中，选中当前点击 Radio
      this.temp[row].isNullable = e;
    },
    saveTableInfo() {
      if (this.openType === "addTable") {
        this.saveTable();
      } else {
        this.updateTable();
      }
    },
    // 保存基本信息
    saveTable() {
      for (let index = 0; index < this.temp.length; index++) {
        //先判空
        let obj = this.temp[index]
        if(obj.colName==''||obj.colName==undefined){
          this.$message.error("请完善建表信息，字段名称不能为空");
          return
        }else if(obj.dataType==''||obj.dataType==undefined){
          this.$message.error("请完善建表信息，数据类型不能为空");
          return
        }else{
          // const r = this.temp[index];
          //   if (r.dataLength !== "") {
          //     r.dataLength = parseInt(r.dataLength);
          //   }
        }
        //再判合法
        let xx = obj.dataType.toUpperCase();
        switch (xx) {
        case "CHAR":
         if (1 <= obj.dataLength && obj.dataLength <= 8000 && obj.dataLength!='') {
          } else {
            this.$message.error('char类型长度范围:1-8000之间数字');
            return
          }
          break;
        case "VARCHAR2":
          if (1 <= obj.dataLength && obj.dataLength <= 8000 && obj.dataLength!='') {
          } else {
            this.$message.error("varchar2类型长度范围:1-8000之间数字");
            return
          }
          break;
        case "VARCHAR":
          if (1 <= obj.dataLength && obj.dataLength <= 8000 && obj.dataLength!='') {
          } else {
            this.$message.error("varchar类型长度范围:1-8000之间数字");
            return
          }
          break;
        case "NVARCHAR":
          if (1 <= obj.dataLength && obj.dataLength <= 4000 && obj.dataLength!='') {
          } else {
            this.$message.error("nvarchar类型长度范围:1-4000之间数字");
            return
          }
          break;
        case "NUMBER":
          var flag1 = new RegExp("^[0-9]$");
          var flag2 = new RegExp("^[0-9]+[,]+[0-9]$");
          if ((flag1.test(obj.dataLength)|| flag2.test(obj.dataLength)) && obj.dataLength!='') {
          } else {
            this.$message.error(
              "number类型长度范围:单个数字，也可以是 数字,数字(英文逗号)"
            );
            return
          }
          break;
        case "DECIMAL":
          var flag = new RegExp("^[0-9]+[,]+[0-9]$");
          if (flag.test(obj.dataLength) && obj.dataLength!='') {
            // decimal类型分两个字段传到后台，原因是dataLength是long类型 不能接受字符串
            var strings = obj.dataLength.toString().split(",");
            obj.dataLength = strings[0];
            obj.colPrecision = strings[1];
          } else {
            this.$message.error("decimal类型长度范围:数字,数字(英文逗号)");
            return
          }
          break;
        case "INT":
          var flag = new RegExp("^[0-9]{1,11}$");
          if (flag.test(obj.dataLength) && obj.dataLength!='') {
          } else {
            this.$message.error("int类型长度范围:最长11位长度数字");
            return
          }
          break;
      }
      }
      const addObj = {};
      addObj.colMetas = this.temp;
      addObj.folderUuid = this.forderId;
      addObj.tbName = this.tempTable.tableName;
      addTable(addObj)
        .then((res) => {
          if (res.data.status === "500") {
            this.$notify({
              title: "失败",
              message: res.data.msg,
              type: "error",
              duration: 2000,
              position: "bottom-right",
            });
          } else {
            this.$notify({
              title: "成功",
              message: "新建表成功！",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
            var childData = {
              id: res.data.successTable.tableMetaUuid,
              label: res.data.successTable.displayTbName,
              pid: res.data.successTable.folderUuid,
              type: "table",
              extMap: {
                accessType: ["FETCH_TABLE_DATA", "BASIC_PRIV"],
                createTime: res.data.successTable.createTime,
                tableName: res.data.successTable.tbName,
                tbSizeByte: 0,
                tblType: "T",
              },
            };
            // 添加节点
            this.$emit("table-show", this.show);
            this.$emit("append-node", childData, this.clickNode);
            this.$emit("saveTableInfoHelp"); 
          }
        })
        .catch((result) => {});
    },
    updateTable() {
      const newTableObj = {};
      newTableObj.tableMetaUuid = this.tableId;
      newTableObj.colMetas = this.temp;
      newTableObj.tbName = this.tempTable.tableName;
      newTableObj.tbComment = this.tempTable.tbComment;
      const oldTableObj = {};
      oldTableObj.tableMetaUuid = this.tableId;
      oldTableObj.colMetas = this.tempColumn;
      oldTableObj.tbName = this.oldName;
      oldTableObj.tbComment = this.tempTable.tbComment;
      var obj = {};
      console.log(newTableObj.colMetas);
      for (let i = 0; i < newTableObj.colMetas.length; i++) {
        if (
          newTableObj.colMetas[i].colName != "" &&
          newTableObj.colMetas[i].dataType != "" &&
          newTableObj.colMetas[i].dataLength != ""
        ) {
        } else {
          this.$message.error("请完善数据信息!");
          return;
        }
      }
      obj.newTableObj = newTableObj;
      obj.oldTableObj = oldTableObj;

      updateTable(obj)
        .then((res) => {
          if (res.data.status === "500") {
            this.$message({
              type: "info",
              message: "修改失败！" + res.data.msg,
            });
          } else {
            // 修改成功后重新给页面复制
            this.oldName = res.data.sussessTable.tbName;
            this.tempTable.tableName = res.data.sussessTable.tbName;
            res.data.sussessTable.colMetas.forEach((e) => {
              this.tempIndex = 0;
              this.tempIndex++;
              e.tempIndex = this.tempIndex;
            });
            this.tempColumn = res.data.sussessTable.colMetas.slice();
            this.temp = JSON.parse(
              JSON.stringify(res.data.sussessTable.colMetas)
            );
            this.$notify({
              title: "成功",
              message: "修改表结构成功",
              type: "success",
              duration: 2000,
              position: "bottom-right",
            });
          }
          this.$emit("table-show", this.show);
          this.$emit("saveTableInfoHelp"); 
        })
        .catch((result) => {});
      // var newColumn = this.arrRemoveMix(this.temp, this.tempColumn)
      // var oldColumn = this.arrRemoveMix(this.tempColumn, this.temp)
      // console.log(newColumn)
      // console.log(oldColumn)
      // // 修改字段类型sql
      // var modify = ''
      // // 新增字段sql
      // var add = ''
      // // 重命名字段sql
      // var alter = ''
      // // 删除字段sql
      // var drop = ''
      // // eslint-disable-next-line no-unused-vars
      // var sql = 'ALTER TABLE "' + this.tableObj.tbName + '" ' + '\n'
      // for (let index = 0; index < newColumn.length; index++) {
      //   const r = newColumn[index]
      //   if (typeof r.colMetaUuid === 'undefined') {
      //     if (r.isNullable === 0) {
      //       r.isNullable = 'NULL'
      //     } else {
      //       r.isNullable = 'NOT NULL'
      //     }
      //     if (r.dataLength !== '') {
      //       r.dataType = r.dataType + '(' + r.dataLength + ') '
      //     }
      //     add = add + 'ADD ( "' + r.colName + '" ' + r.dataType + ' ' + r.isNullable + ' ) ' + '\n'
      //   } else {
      //     var oldCol = oldColumn.filter(obj => { return obj.colMetaUuid === r.colMetaUuid })
      //     var reNameArr = oldColumn.filter(obj => { return obj.colName === r.colName })
      //     if (r.isNullable === 0) {
      //       r.isNullable = 'NULL'
      //     } else {
      //       r.isNullable = ' '
      //     }
      //     if (r.dataLength !== '') {
      //       r.dataType = r.dataType + '(' + r.dataLength + ') '
      //     }
      //     // 如果初始表列id在最终保存修改中找不到,说明该列已经重命名
      //     if (reNameArr.length === 0) {
      //       alter = alter + 'ALTER TABLE "' + this.tableObj.tbName + '" RENAME COLUMN"' + oldCol[0].colName + '" TO "' + r.colName + '"' + '\n'
      //       modify = modify + 'MODIFY ( "' + oldCol[0].colName + '" ' + r.dataType + ' ' + r.isNullable + ' ) ' + '\n'
      //     } else {
      //       modify = modify + 'MODIFY ( "' + r.colName + '" ' + r.dataType + ' ' + r.isNullable + ' ) ' + '\n'
      //     }
      //   }
      // }

      // for (let index = 0; index < oldColumn.length; index++) {
      //   const r = oldColumn[index]
      //   if (typeof r.colMetaUuid !== 'undefined') {
      //     var dropArr = newColumn.filter(obj => { return obj.colMetaUuid === r.colMetaUuid })
      //     // 如果初始表列id在最终保存修改中找不到,说明该列已经被删除
      //     if (dropArr.length === 0) {
      //       drop = drop + 'ALTER TABLE "' + this.tableObj.tbName + '" DROP("' + r.colName + '")' + '\n'
      //     }
      //   }
      // }
      // if (modify + add === '') {
      //   sql = drop + '\n' + alter
      // } else {
      //   sql = sql + modify + add + drop + '\n' + alter
      // }
      // const addObj = {}
      // addObj.sql = sql
      // addObj.tbName = this.tempTable.tableName
      // updateTable(addObj).then((res) => {
      //   this.$notify({
      //     title: '成功',
      //     message: '新建表成功',
      //     type: 'success',
      //     duration: 2000,
      //     position: 'bottom-right'
      //   })
      // }).catch((result) => {
      // })
    },
    // arrRemoveMix(arr1, arr2) {
    //   return this.filterData(this.arrayDifference(arr1, arr2))
    // },
    // arrayDifference(a, b) { // 差集 a - b
    //   const clone = a.slice(0) // clone = a
    //   for (let i = 0; i < b.length; i++) {
    //     const temp = b[i]
    //     for (var j = 0; j < clone.length; j++) {
    //       // eslint-disable-next-line eqeqeq
    //       if (this.isObjectValueEqual(temp, clone[j])) {
    //         clone.splice(j, 1) // remove clone[j]
    //       }
    //     }
    //   }
    //   return clone
    // },
    // filterData(array) { // 去重
    //   return Array.from(new Set(array))
    // },
    // 判断两个对象的值是否都相同
    // isObjectValueEqual(a, b) {
    //   // 取对象a和b的属性名
    //   var aProps = Object.getOwnPropertyNames(a)
    //   var bProps = Object.getOwnPropertyNames(b)
    //   // 判断属性名的length是否一致
    //   if (aProps.length !== bProps.length) {
    //     return false
    //   }
    //   // 循环取出属性名，再判断属性值是否一致
    //   for (var i = 0; i < aProps.length; i++) {
    //     var propName = aProps[i]
    //     if (propName !== '__ob__') {
    //       if (a[propName] !== b[propName]) {
    //         return false
    //       }
    //     }
    //   }
    //   return true
    // }
  },
};
</script>
