<template>
  <div>
    <p style="color: silver; font-size: large">———————————————————————————</p>
    <queryBuilder ref="queryBuilder" v-model="queryJson" :rules="queryRules" />
  </div>
</template>

<script>
import queryBuilder from "@/components/Ace/vue-query-builder/src/VueQueryBuilder";
export default {
  components: {
    queryBuilder,
  },
  props: ["columns", "data", "inputselectvalue"], // columns是每一列的信息(列名,列数据类型，长度)   data用于返现数据  inputselectvalue:sql编辑器下拉框内容
  data() {
    return {
      queryRules: [], // querybuilder的规则数据
      queryJson: {}, // queryBuilder上动态绑定的json数据
    };
  },
  created() {
    this.setQueryBuilderColumn();
  },
  mounted() {
    this.initData();
  },
  methods: {
    /**
     *初始化数据
     */
    initData() {
      // 如果数据不为0则证明是修改，需要反显数据
      if (this.data.children != null) {
        // 反显数据
        this.queryJson = this.data;
      }
    },
    /**
     * 设置queryBuilder列
     */
    setQueryBuilderColumn() {
      console.log(11111111111111)
      console.log(this.columns)
      console.log(this.data)
      console.log(this.inputselectvalue)
      const queryRules = [];
      for (let i = 0; i < this.columns.columnList.length; i++) {
        const operators = this.getQueryBuilderOperators(
          this.columns.columnList[i]
        );
        const obj = {};
        obj.type = "inputselect";
        obj.id = this.columns.columnList[i].columnName;
        obj.label = this.columns.columnList[i].columnName;
        obj.operators = operators;
        var cho = [];
        if (this.inputselectvalue != undefined) {
          for (var j = 0; j < this.inputselectvalue.length; j++) {
            var eachChoice = {
              label: this.inputselectvalue[j].outputColumnName,
              value: this.inputselectvalue[j].outputColumnName,
            };
            cho.push(eachChoice);
          }
        }
        obj.choices = cho;
        queryRules.push(obj);
      }
      this.queryRules = queryRules;
    },
    /**
     * 获取queryBuilder的过滤选项  只分两种，数值和字符串
     * @returns {string[]}
     */
    getQueryBuilderOperators(columnObj) {
      let operators = [];
      if (columnObj.columnType.toUpperCase().indexOf("TIMESTAMP") != -1 || columnObj.columnType.toUpperCase().indexOf("RAW") != -1) {
        columnObj.columnType = "VARCHAR";
      }
      if (
        columnObj.columnType.toUpperCase().indexOf("VARCHAR") != -1 ||
        columnObj.columnType.toUpperCase().indexOf("CLOB") != -1
      ) {
        operators = ["=", "<>", "like", "not like"];
      } else if (
        columnObj.columnType.toUpperCase().indexOf("INT") != -1 ||
        columnObj.columnType.toUpperCase().indexOf("NUMBER") != -1
      ) {
        operators = ["=", "<>", "<", "<=", ">", ">="];
      }
      return operators;
    },
    /**
     * 由父类触发的方法，目的是为了获取queryBuilder中得到的sql语句和返显的Json数据
     */
    selectSql() {
      if (this.queryJson.children == null) {
        alert("请添加条件后在进行查询！");
      } else {
        var sql = this.queryToSql(this.queryJson);
        var obj = { sql: sql, queryJson: this.queryJson };
        this.$emit("queryconditionchangetable", sql, this.queryJson);
      }
    },
    /**
     * 为了获取queryBuilder中得到的sql语句和返显的Json数据
     */
    getSelectSql() {
      if (this.queryJson.children == null) {
        alert("请添加条件后在进行查询！");
      } else {
        var sql = this.queryToSql(this.queryJson);
        var obj = { sql: sql, queryJson: this.queryJson };
        return obj;
      }
    },
    //通过返显的Json字符串拼出返显的sql
    queryToSql(query) {
      const sql = [];
      const that = this;
      const logicalOperator = query.logicalOperator;
      const children = query.children;
      children.forEach((child) => {
        const type = child.type;
        if (type === "query-builder-rule") {
          var dataTypeObj = {};
          /** 根据当前列名获取和当前列名相同的列信息对象，
           * 目的是为了获得当前列的类型，进行后续判断是字符串还是数字，来判断在不在value两边加''
           */
          for (var i = 0; i < this.columns.columnList.length; i++) {
            if (this.columns.columnList[i].columnName == child.query.rule) {
              dataTypeObj = this.columns.columnList[i];
              break;
            }
          }
          if (
            dataTypeObj.columnType.toUpperCase() == "TIMESTAMP" ||
            dataTypeObj.columnType.toUpperCase().indexOf("VARCHAR") > -1 ||
            dataTypeObj.columnType.toUpperCase() == "CLOB"
          ) {
            if (
              child.query.operator == "like" ||
              child.query.operator == "not like"
            ) {
              sql.push(child.query.rule);
              sql.push(child.query.operator);
              sql.push("'%" + child.query.value + "%'");
            } else {
              sql.push(child.query.rule);
              sql.push(child.query.operator);
              sql.push("'" + child.query.value + "'");
            }
          } else {
            sql.push(child.query.rule);
            sql.push(child.query.operator);
            sql.push(child.query.value);
          }
        } else {
          sql.push("(");
          sql.push(that.queryToSql(child.query));
          sql.push(")");
        }
        sql.push(logicalOperator);
      });
      sql.splice(sql.length - 1, sql.length);
      return sql.join(" ");
    },
  },
};
</script>
