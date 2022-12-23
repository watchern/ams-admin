<template>
  <div class="add">
    <div class="title">数据访问权限申请</div>
    <el-form
      label-position="right"
      :model="apComDataBaseData"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
      v-loading="loading"
      ref="ruleForm"
    >
      <el-form-item label="申请名称" prop="name" class="item-a">
        <el-input v-model="apComDataBaseData.name"></el-input>
      </el-form-item>
      <el-form-item label="申请人" prop="dbtype" class="item-a">
        <el-input v-model="apComDataBaseData.dbtype"></el-input>
      </el-form-item>
      <el-form-item label="访问时间" prop="instance" class="item-a">
        <el-date-picker
          v-model="apComDataBaseData.instance"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="数据使用人" prop="loginname" class="item-a">
        <div
          style="width: 100%; height: 200px; position: absolute; overflow: auto"
        >
          <el-tree :props="defaultProps" :load="loadNode" lazy>
            <span slot-scope="{ data }">
              <div v-if="data.isParent === true">
                <div class="icon_cls icons"></div>
                {{ data.name }}
              </div>

              <el-checkbox-group
                v-model="checkList"
                @change="changeResumetype"
                v-else
              >
                <el-checkbox :label="data.id">{{ data.name }}</el-checkbox>
              </el-checkbox-group>
            </span></el-tree
          >
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="remark" class="item-a">
        <el-input
          type="textarea"
          v-model="apComDataBaseData.remark"
          placeholder="请输入内容"
          :rows="6"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="title">
      申请数据清单 <el-button type="primary">查看已有权限表</el-button>
    </div>
    <div class="shuttle">
      <div class="shuttle_left">
        <el-input
          placeholder="输入关键字进行过滤"
          v-model="filterText"
          style="margin-bottom: 20px"
        >
        </el-input>
        <el-tree
          class="filter-tree"
          :data="treeData"
          show-checkbox
          node-key="id"
          :props="defaultPropsData"
          default-expand-all
          :filter-node-method="filterNode"
          ref="tree"
          :render-content="renderContent"
          :check-strictly="true"
        >
        </el-tree>
      </div>
      <div class="shuttle_middle">
        <el-button
          size="mini"
          type="primary"
          class="btn_top"
          @click="towardsLeft"
          >></el-button
        ><el-button
          size="mini"
          type="primary"
          class="btn_bottom"
          @click="towardsRight"
          ><</el-button
        >
      </div>
      <div class="shuttle_right">
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          border
          stripe
          height="400px"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column label="表路径" prop="label" width="180">
          </el-table-column>
          <el-table-column label="筛选条件">
            <template slot-scope="scope">
              <div style="display: flex">
                <el-input
                  v-model="scope.row.id"
                  placeholder="请输入内容"
                ></el-input>
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleEdit(scope.$index, scope.row)"
                  >配置过滤条件</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- <div class="itemBtn">
      <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      <el-button @click="close('ruleForm')">取消</el-button>
    </div> -->
  </div>
</template>

<script>
import { findOrgUserList } from "@/api/data/dataPermission.js";
export default {
  name: "dataPermissionAdd",
  props: {
    info: Object,
  },
  components: {},
  data() {
    return {
      tableData: [],
      // tree节点配置
      defaultProps: {
        label: "name",
        children: "zones",
        isLeaf: "leaf",
      },
      // 选择人员id
      checkList: [],
      // form对象
      apComDataBaseData: {
        companyid: "",
        company: "",
        name: "",
        dbtype: "",
        type: "",
        instance: "",
        loginname: "",
        loginpassword: "",
        port: "",
        serverid: "",
        industryid: "",
        datasecuritylevel: "",
        datatype: "",
        remark: "",
      },
      //   form校验
      rules: {
        name: [{ required: true, message: "请输入", trigger: "blur" }],
        dbtype: [{ required: true, message: "请选择", trigger: "change" }],
        type: [{ required: true, message: "请选择", trigger: "change" }],
        instance: [{ required: true, message: "请输入", trigger: "blur" }],
        loginname: [{ required: true, message: "请输入", trigger: "blur" }],
        loginpassword: [{ required: true, message: "请输入", trigger: "blur" }],
        port: [{ required: true, message: "请输入", trigger: "change" }],
        serverid: [{ required: true, message: "请选择", trigger: "change" }],
        industryid: [{ required: true, message: "请选择", trigger: "change" }],
        datasecuritylevel: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        company: [{ required: true, message: "请选择", trigger: "change" }],
        datatype: [{ required: true, message: "请选择", trigger: "change" }],
        remark: [{ required: true, message: "请输入", trigger: "blur" }],
      },
      loading: false,
      filterText: "",
      treeData: [
        {
          id: 1,
          label: "一级 1",
          children: [
            {
              id: 4,
              label: "二级 1-1",
              children: [
                {
                  id: 9,
                  label: "三级 1-1-1",
                },
                {
                  id: 10,
                  label: "三级 1-1-2",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          label: "一级 2",
          children: [
            {
              id: 5,
              label: "二级 2-1",
            },
            {
              id: 6,
              label: "二级 2-2",
            },
          ],
        },
        {
          id: 3,
          label: "一级 3",
          children: [
            {
              id: 7,
              label: "二级 3-1",
            },
            {
              id: 8,
              label: "二级 3-2",
            },
          ],
        },
      ],
      defaultPropsData: {
        children: "children",
        label: "label",
      },
      checkedNodes: [],
      multipleSelection: [],
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleChange(value, direction, movedKeys) {
      console.log(value, direction, movedKeys);
    },
    init() {
      // this.loading = true;
    },
    //   保存
    submitForm(formName) {
      this.$emit("oka", this.apComDataBaseData);
      // this.$refs[formName].validate(valid => {
      //   if (valid) {
      //     var obj = {
      //       id: this.apComDataBaseData.id,
      //       name: this.apComDataBaseData.name,
      //       dbtype: this.apComDataBaseData.dbtype,
      //       type: this.apComDataBaseData.type,
      //       instance: this.apComDataBaseData.instance,
      //       loginname: this.apComDataBaseData.loginname,
      //       loginpassword: this.apComDataBaseData.loginpassword,
      //       port: this.apComDataBaseData.port,
      //       serverid: this.apComDataBaseData.serverid,
      //       industryid: this.apComDataBaseData.industryid,
      //       datasecuritylevel: this.apComDataBaseData.datasecuritylevel,
      //       company: this.apComDataBaseData.company,
      //       companyid: this.apComDataBaseData.companyid,
      //       datatype: this.apComDataBaseData.datatype,
      //       remark: this.apComDataBaseData.remark,
      //     }
      //     updApDataBaseData(obj, '').then(res => {
      //       this.$message.success('操作成功')
      //       this.$emit('oka',obj)
      //     })
      //   } else {
      //     return false
      //   }
      // })
    },
    // 重置
    // resetForm(formName) {
    //   this.ruleForm = {
    //     companyid: '',
    //     company: '',
    //     name: '',
    //     dbtype: '',
    //     type: '',
    //     instance: '',
    //     loginname: '',
    //     loginpassword: '',
    //     port: '',
    //     serverid: '',
    //     industryid: '',
    //     datasecuritylevel: '',
    //     datatype: '',
    //     remark: '',
    //   }
    //   this.$refs[formName].resetFields()
    // },
    // 关闭
    close(formName) {
      this.$refs[formName].resetFields();
      this.$emit("close");
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([
          {
            isParent: true,
            open: true,
            name: "华夏银行总行",
            pid: "0000000000000000000000000000000000000000000000000000000000000000",
            id: "3e823923-f75c84cae0-d9519a8eeb7514770b4d5731cd770813",
            level: 0,
            nocheck: true,
            children: [],
          },
        ]);
      }
      if (node.data.isParent === true) {
        let formData = new FormData();
        formData.append("id", node.data.id);
        formData.append("level", node.data.level);
        findOrgUserList(formData).then((res) => {
          resolve(res);
        });
      }
      if (node.data.isParent === false) return resolve([]);
    },
    // 向左
    towardsLeft() {
      this.tableData = this.$refs.tree.getCheckedNodes();
      this.checkedNodes = this.$refs.tree.getCheckedNodes();
    },
    // 向右
    towardsRight() {
      this.multipleSelection.forEach((item) => {
        const index = this.checkedNodes.findIndex((d) => d.id === item.id);
        this.checkedNodes.splice(index, 1);
      });
      this.tableData = this.checkedNodes
      this.$refs.tree.setCheckedNodes(this.checkedNodes);
    },
  },
  created() {
    // this.init()
    // this.apComDataBaseData = this.info
  },
};
</script>

<style lang="scss" scoped>
.demo-ruleForm {
  display: flex;
  flex-wrap: wrap;
  .el-select {
    width: 100%;
  }
  ::v-deep .el-form-item {
    margin-bottom: 22px !important;
  }
  ::v-deep .el-form-item__label {
    text-align: right;
    vertical-align: middle;
    float: left !important;
  }
}
.icon_cls {
  display: inline-block;
  width: 15px;
  height: 10px;
  background: url("../../../assets/img/zTreeStandard.png") no-repeat;
  /* background-size: 100% 100%; */
}
.icons {
  background-position: -110px -20px;
}
</style>
