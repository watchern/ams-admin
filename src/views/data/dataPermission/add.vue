<template>
  <div>
    <div class="title">数据访问权限申请</div>
    <el-form label-position="right"
             :model="operatePermissionApply"
             :rules="rules"
             label-width="120px"
             class="demo-ruleForm"
             v-loading="loading"
             ref="ruleForm">

      <el-row>
        <el-col :span="12">

          <el-form-item label="申请名称"
                        prop="permissionApplyName"
                        class=" ">
            <el-input v-model="operatePermissionApply.permissionApplyName"
                      style="width: 100%"
                      :disabled="addOrUpdate == 2"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="访问时间"
                        prop="times"
                        class=" ">
            <el-date-picker v-model="operatePermissionApply.times"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            style="width: 100%"
                            :disabled="addOrUpdate == 2">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="数据使用人"
                        prop="permissionApplyUserName"
                        class=" ">
            <div class="select">
              <el-input v-model="operatePermissionApply.permissionApplyUserName"
                        style="width: 90%;"
                        disabled></el-input>
              <el-button type="primary"
                         @click="dialogVisible = true"
                         :disabled="addOrUpdate == 2">选择</el-button>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="数据集"
                        prop="dataSet"
                        class=" ">
            <div class="select">
              <el-input v-model="operatePermissionApply.dataSet"
                        disabled
                        style="width: 90%;"></el-input>
              <el-button type="primary"
                         @click="dialogVisible2 = true"
                         :disabled="addOrUpdate == 2">选择</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="申请事由"
                        prop="applyRemark"
                        class=" ">
            <el-input type="textarea"
                      v-model="operatePermissionApply.applyRemark"
                      placeholder="请输入内容"
                      :rows="4"
                      :disabled="addOrUpdate == 2"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请人"
                        prop="createUserName"
                        class=" ">
            <el-input v-model="operatePermissionApply.createUserName"
                      disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

    <el-dialog title="数据使用人"
               :visible.sync="dialogVisible"
               width="50%"
               append-to-body
               center>
      <person-tree ref="personTree"></person-tree>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="changeLoginname(true)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="数据集"
               :visible.sync="dialogVisible2"
               width="50%"
               append-to-body
               center>
      <div class="selectByName">
        <el-input v-model="dataRoleName"
                  size="small"
                  placeholder="请输入内容"
                  clearable></el-input>
        <div class="search-btn">
          <el-button size="mini"
                     type="primary"
                     @click="goQuery">查询</el-button>
          <el-button size="mini"
                     type="primary"
                     @click="dataRoleName = ''">重置</el-button>
        </div>
      </div>
      <el-table :key="tableKey"
                v-loading="listLoading"
                :data="list"
                height="400px"
                stripe
                border
                fit
                highlight-current-row
                style="width: 100%;"
                @sort-change="sortChange"
                @selection-change="selectionChange">
        <el-table-column type="selection"
                         width="55" />
        <el-table-column label="数据角色名称"
                         min-width="150px"
                         prop="dataRoleName"
                         show-overflow-tooltip />
        <el-table-column label="创建时间"
                         align="center"
                         min-width="150px"
                         prop="createTime"
                         show-overflow-tooltip />
        <el-table-column label="授权方式"
                         align="center"
                         prop="authenType"
                         min-width="150px"
                         :formatter="formatAuthenType" />
      </el-table>
      <pagination v-show="total>0"
                  :total="total"
                  :page.sync="pageQuery.pageNo"
                  :limit.sync="pageQuery.pageSize"
                  @pagination="getList" />
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary"
                   @click="changeDataSet">确 定</el-button>
      </span>
    </el-dialog>

    <!--        <div class="title">-->
    <!--            申请数据清单-->
    <!--            <el-button type="primary">查看已有权限表</el-button>-->
    <!--        </div>-->
    <!--        <div class="shuttle">-->
    <!--            <div class="shuttle_left">-->
    <!--                <el-input-->
    <!--                    placeholder="输入关键字进行过滤"-->
    <!--                    v-model="filterText"-->
    <!--                    style="margin-bottom: 20px"-->
    <!--                >-->
    <!--                </el-input>-->
    <!--                <el-tree-->
    <!--                    class="filter-tree"-->
    <!--                    :data="treeData"-->
    <!--                    show-checkbox-->
    <!--                    node-key="id"-->
    <!--                    :props="defaultPropsData"-->
    <!--                    default-expand-all-->
    <!--                    :filter-node-method="filterNode"-->
    <!--                    ref="tree"-->
    <!--                    :check-strictly="true"-->
    <!--                >-->
    <!--                </el-tree>-->
    <!--            </div>-->
    <!--            <div class="shuttle_middle">-->
    <!--                <el-button-->
    <!--                    size="mini"-->
    <!--                    type="primary"-->
    <!--                    class="btn_top"-->
    <!--                    @click="towardsLeft"-->
    <!--                >>-->
    <!--                </el-button-->
    <!--                >-->
    <!--                <el-button-->
    <!--                    size="mini"-->
    <!--                    type="primary"-->
    <!--                    class="btn_bottom"-->
    <!--                    @click="towardsRight"-->
    <!--                ><-->
    <!--                </el-button-->
    <!--                >-->
    <!--            </div>-->
    <!--            <div class="shuttle_right">-->
    <!--                <el-table-->
    <!--                    ref="multipleTable"-->
    <!--                    :data="tableData"-->
    <!--                    tooltip-effect="dark"-->
    <!--                    style="width: 100%"-->
    <!--                    @selection-change="handleSelectionChange"-->
    <!--                    border-->
    <!--                    stripe-->
    <!--                    height="400px"-->
    <!--                    header-row-class-name="headerRowStyle"-->
    <!--                >-->
    <!--                    <el-table-column type="selection" width="55"></el-table-column>-->
    <!--                    <el-table-column label="表路径" prop="label" width="180">-->
    <!--                    </el-table-column>-->
    <!--                    <el-table-column label="筛选条件">-->
    <!--                        <template slot-scope="scope">-->
    <!--                            <div style="display: flex">-->
    <!--                                <el-input-->
    <!--                                    v-model="scope.row.id"-->
    <!--                                    placeholder="请输入内容"-->
    <!--                                ></el-input>-->
    <!--                                &lt;!&ndash;                <el-button&ndash;&gt;-->
    <!--                                &lt;!&ndash;                  size="mini"&ndash;&gt;-->
    <!--                                &lt;!&ndash;                  type="primary"&ndash;&gt;-->
    <!--                                &lt;!&ndash;                  @click="handleEdit(scope.$index, scope.row)"&ndash;&gt;-->
    <!--                                &lt;!&ndash;                  >配置过滤条件</el-button&ndash;&gt;-->
    <!--                                &lt;!&ndash;                >&ndash;&gt;-->
    <!--                            </div>-->
    <!--                        </template>-->
    <!--                    </el-table-column>-->
    <!--                </el-table>-->
    <!--            </div>-->
    <!--        </div>-->
    <div class="itemBtn"
         v-if="addOrUpdate != 2">
      <el-button @click="close('ruleForm')">取消</el-button>

      <el-button type="primary"
                 @click="submitForm('ruleForm')">保存</el-button>

    </div>
  </div>
</template>

<script>
import {
  findOrgUserList,
  getDataSetAndUsersByApplyUuid,
  insertOperatePermissionApply, updateOperatePermissionApply
} from "@/api/data/dataPermission.js";
import personTree from "@/components/publicpersontree/index";
import Cookies from 'js-cookie';
import { getDictList } from "@/utils";
import { listByPage } from "@/api/data/role";
import Pagination from '@/components/Pagination'
import { formatDate } from "ams-etlscheduler-hx/src/components/etl/filter/filter"; // secondary package based on el-pagination

export default {
  name: "dataPermissionAdd",
  // props: {
  //     info: Object,
  // },
  props: ['addOrUpdate', 'temp'],//addOrUpdate : 0为新增，1为修改，2为查看详情
  components: {
    personTree,
    Pagination
  },
  data () {
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
      // apComDataBaseData: {
      //     companyid: "",
      //     company: "",
      //     name: "",
      //     dbtype: "",
      //     type: "",
      //     instance: "",
      //     loginname: "",
      //     loginpassword: "",
      //     port: "",
      //     serverid: "",
      //     industryid: "",
      //     datasecuritylevel: "",
      //     datatype: "",
      //     remark: "",
      //     dataSet: "",
      // },
      operatePermissionApply: {
        operatePermissionApplyUuid: "",
        permissionApplyName: "",
        createUserName: "",
        times: "",
        permissionApplyUserName: "",
        applyRemark: "",
        dataSet: "",
      },
      //   form校验
      rules: {
        permissionApplyName: [{ required: true, message: "请输入", trigger: "blur" }],
        createUserName: [{ required: true, message: "请选择", trigger: "change" }],
        type: [{ required: true, message: "请选择", trigger: "change" }],
        times: [{ required: true, message: "请输入", trigger: "blur" }],
        loginname: [{ required: true, message: "请输入", trigger: "blur" }],
        loginpassword: [{ required: true, message: "请输入", trigger: "blur" }],
        port: [{ required: true, message: "请输入", trigger: "change" }],
        serverid: [{ required: true, message: "请选择", trigger: "change" }],
        industryid: [{ required: true, message: "请选择", trigger: "change" }],
        datasecuritylevel: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        company: [{ required: true, message: "请选择", trigger: "change" }],
        permissionApplyUserName: [{ required: true, message: "请选择", trigger: "change" }],
        applyRemark: [{ required: true, message: "请输入", trigger: "blur" }],
        dataSet: [{ required: true, message: "请选择", trigger: "blur" }],
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
      dialogVisible: false,
      dialogVisible2: false,
      dataSetSelect: [],
      usersSelect: [],
      tableKey: 'dataRoleUuid',
      listLoading: false,
      list: [],
      total: 0,
      authenTypeJson: [],
      pageQuery: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      dataRoleName: "",
    };
  },
  watch: {
    filterText (val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    //根据数据集名称获取数据集
    goQuery () {
      this.getList({
        dataRoleName: this.dataRoleName
      })
    },
    //数据授权方式
    formatAuthenType (row, column) {
      var data = getDictList('004001')
      if (data === null) {
        cacheDict().then((resp) => {
          sessionStorage.setItem("sysDict", JSON.stringify(resp.data));
        });
        data = getDictList('004001')
      }
      var authenObj = data.filter(obj => {
        return obj.codeValue === row.authenType
      })
      if (authenObj !== null) {
        return authenObj[0].codeName
      }
    },
    //
    // formatDuring(row, column) {
    //     return row.startTime + '至' + row.endTime
    // },
    handleFilter () {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange (data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    //获取数据集
    getList (query) {
      this.authenTypeJson = getDictList('004001')
      this.listLoading = true
      if (query) this.pageQuery.condition = query
      listByPage(this.pageQuery).then(resp => {
        this.total = resp.data.total
        resp.data.records.forEach(item => {
          if (item.authenType === '004001002') {
            this.list.push(item);
          }
        })
        // this.list = resp.data.records
        this.listLoading = false
      })
    },
    //监听数据集选择信息
    selectionChange (val) {
      this.dataSetSelect = val;
    },
    //从dialog取出选中的数据集
    changeDataSet () {
      if (this.dataSetSelect && this.dataSetSelect.length > 0) {
        this.operatePermissionApply.dataSet = this.dataSetSelect[0].dataRoleName;
        for (let i = 1; i < this.dataSetSelect.length; i++) {
          this.operatePermissionApply.dataSet += '、' + this.dataSetSelect[i].dataRoleName;
        }
      }
      this.dialogVisible2 = false;
    },
    //从dialog取出选中的数据使用人
    changeLoginname (flag) {
      if (flag) {
        this.usersSelect = this.$refs.personTree.selectValue
      }
      let selectVal = this.usersSelect;
      if (selectVal && selectVal.length > 0) {
        this.operatePermissionApply.permissionApplyUserName = selectVal[0].cnname;
        for (let i = 1; i < selectVal.length; i++) {
          this.operatePermissionApply.permissionApplyUserName += '、' + selectVal[i].cnname;
        }
      }
      this.dialogVisible = false;
    },
    handleSelectionChange (val) {
      this.multipleSelection = val;
    },
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // handleChange(value, direction, movedKeys) {
    //     console.log(value, direction, movedKeys);
    // },
    //初始化数据
    init () {
      this.getList();
      if (this.addOrUpdate == 0) {
        this.operatePermissionApply.createUserName = JSON.parse(Cookies.get("user")).userName;
      } else if (this.addOrUpdate == 1 || this.addOrUpdate == 2) {
        this.getDataSetAndUsers();
      }
    },
    //获取已选数据集和申请人
    getDataSetAndUsers () {
      getDataSetAndUsersByApplyUuid(this.temp.operatePermissionApplyUuid).then(resp => {
        if (resp.data) {
          this.usersSelect = resp.data.users;
          this.dataSetSelect = resp.data.dataSet;
          this.operatePermissionApply = {
            operatePermissionApplyUuid: this.temp.operatePermissionApplyUuid,
            permissionApplyName: this.temp.permissionApplyName,
            createUserName: this.temp.createUserName,
            times: [this.temp.permissionApplyStartTime, this.temp.permissionApplyEndTime],
            permissionApplyUserName: "",
            applyRemark: this.temp.applyRemark,
            dataSet: "",
          }
          this.changeLoginname(false);
          this.changeDataSet();
        }
      })
    },
    //   保存
    submitForm (formName) {
      // this.$emit("oka", this.operatePermissionApply);
      this.$refs[formName].validate(valid => {
        if (valid) {
          let startTime = formatDate(new Date(this.operatePermissionApply.times[0]));
          let endTime = formatDate(new Date(this.operatePermissionApply.times[1]));
          let selectVal = this.usersSelect;
          let permissionApplyUserList = [];
          let permissionApplyDatasetList = [];
          //提取使用人的名称和ID
          for (let i = 0; i < selectVal.length; i++) {
            let selectUser = {
              makeUserName: selectVal[i].cnname,
              makeUserUuid: selectVal[i].userid,
            }
            permissionApplyUserList.push(selectUser);
          }
          //提取数据集ID
          for (let i = 0; i < this.dataSetSelect.length; i++) {
            let permissionApplyDataset = {
              permissionRoleUuid: this.dataSetSelect[i].dataRoleUuid,
              permissionRoleName: this.dataSetSelect[i].dataRoleName,
            }
            permissionApplyDatasetList.push(permissionApplyDataset);
          }
          //提交数据对象
          var obj = {
            // id: this.operatePermissionApply.id,
            operatePermissionApplyUuid: this.operatePermissionApply.operatePermissionApplyUuid,
            permissionApplyName: this.operatePermissionApply.permissionApplyName,
            createUserUuid: JSON.parse(Cookies.get("user")).userId,
            createUserName: this.operatePermissionApply.createUserName,
            // type: this.operatePermissionApply.type,
            // instance: this.operatePermissionApply.instance,
            permissionApplyStartTime: startTime,
            permissionApplyEndTime: endTime,
            permissionApplyUserList: permissionApplyUserList,
            // loginpassword: this.operatePermissionApply.loginpassword,
            // port: this.operatePermissionApply.port,
            // serverid: this.operatePermissionApply.serverid,
            // industryid: this.operatePermissionApply.industryid,
            // datasecuritylevel: this.operatePermissionApply.datasecuritylevel,
            // company: this.operatePermissionApply.company,
            // companyid: this.operatePermissionApply.companyid,
            // datatype: this.operatePermissionApply.datatype,
            applyRemark: this.operatePermissionApply.applyRemark,
            permissionApplyDatasetList: permissionApplyDatasetList,
          }
          if (this.addOrUpdate == 0) {
            insertOperatePermissionApply(obj).then(res => {
              this.$message.success('操作成功')
              this.$emit('oka', obj);

            })
          } else {
            updateOperatePermissionApply(obj).then(res => {
              this.$message.success('操作成功')
              this.$emit('oka', obj);

            })
          }
        } else {
          return false
        }
      })
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
    close (formName) {
      this.$refs[formName].resetFields();
      this.$emit("close");
    },
    loadNode (node, resolve) {
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
        findOrgUserList("").then((res) => {
          resolve(res.data);
        });
      }
      if (node.data.isParent === false) return resolve([]);
    },
    // 向左
    towardsLeft () {
      this.tableData = this.$refs.tree.getCheckedNodes();
      this.checkedNodes = this.$refs.tree.getCheckedNodes();
    },
    // 向右
    towardsRight () {
      this.multipleSelection.forEach((item) => {
        const index = this.checkedNodes.findIndex((d) => d.id === item.id);
        this.checkedNodes.splice(index, 1);
      });
      this.tableData = this.checkedNodes
      this.$refs.tree.setCheckedNodes(this.checkedNodes);
    },
  },
  created () {
    // this.init()
    // this.apComDataBaseData = this.info
    this.init();
  },
};
</script>


<style lang="scss" scoped>
.demo-ruleForm {
  // width: 100%;
  // align-items: center;
  // display: flex;
  // flex-wrap: wrap;
  // flex-direction: column;

  // .el-select {
  //   width: 100%;
  // }

  // ::v-deep .el-form-item {
  //   margin-bottom: 22px !important;

  //   .select {
  //     display: flex;
  //     flex-direction: row;
  //   }
  // }

  // ::v-deep .el-form-item__label {
  //   text-align: right;
  //   vertical-align: middle;
  //   float: left !important;
  // }
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

.add {
  height: calc(100vh - 250px);
  overflow: auto;
}

.headerRowStyle {
  background: #4676be !important;
}

.itemBtn {
  width: 100%;
  text-align: right;
}

.select {
  display: flex;
}
.selectByName {
  width: 50%;
  display: flex;

  .search-btn {
    width: 55%;
    margin-left: 20px;
  }
}
</style>
