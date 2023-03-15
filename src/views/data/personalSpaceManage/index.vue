<template>
  <div>
    <div style="display: flex;">
      <div class="left_conter"
           style="height: calc( 100vh - 150px);    overflow: hidden; ">
        <!--                <el-col :span="6">-->
        <!--                <el-tree-->
        <!--                        :data="data"-->
        <!--                        show-checkbox-->
        <!--                        node-key="id"-->
        <!--                        :default-expanded-keys="[2, 3]"-->
        <!--                        :default-checked-keys="[5]"-->
        <!--                >-->
        <!--                </el-tree>-->
        <LeftTrees ref="leftTreePage"
                   :isSize="isSize"
                   @personalSpacePageQueryByTreeNode="personalSpaceQueryByTreeNode"></LeftTrees>
        <!--              </el-col>-->
      </div>
      <div class="right_conter"
           style="width: calc( 100% - 280px);padding: 10px; box-sizing: border-box;">
        <div style="padding: 0 10px;box-sizing: border-box;">
          <el-row>
            <el-form :inline="true"
                     :model="tableMetaDetail"
                     class="demo-form-inline">
              <el-form-item label="表名称:">
                <el-input v-model="tableMetaDetail.displayTbName"
                          placeholder="表名称"></el-input>
              </el-form-item>
              <el-form-item label="表类型:">
                <el-select v-model="tableMetaDetail.tblType"
                           placeholder="表类型">
                  <el-option label="表"
                             value="T"></el-option>
                  <el-option label="视图"
                             value="V"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary"
                           @click="initPersonalSpaceManageData">查询</el-button>
                <el-button type="primary"
                           @click="onReInput">重置</el-button>
              </el-form-item>
            </el-form>
          </el-row>

          <div class="person">
            <!-- <el-row> -->
            <!--                            <span>您的个人空间一共{{personHoldedSpace}},已使用{{personUsedSpace}},未使用20G,使用率5%</span>-->
            <p class="text">您的个人空间一共
              <span>{{personHoldedSpace}}</span>,已使用<span>{{personUsedSpace}}</span>,使用率<span>{{spaceUsedPercent}}</span>
              <span @click="toPersonSpacePage"
                    class="my_span_style">跳转空间申请</span>
            </p>

            <!--                            <el-button type="primary"-->
            <!--                                       @click="joinInsertDialog">新增表</el-button>-->
            <!--                            <el-button type="primary"-->
            <!--                                       @click="onDelete">删除表</el-button>-->
            <!--                            <el-button type="primary"-->
            <!--                            >数据导入</el-button>-->
            <div style="width: 200px;">
              <el-button type="primary"
                         @click="onExportData"
                         size="mini">导出数据</el-button>
              <el-button type="primary"
                         @click="joinDataShareDialog"
                         size="mini">数据共享</el-button>
            </div>
          </div>
        </div>

        <div style="padding: 10px  10px 0;box-sizing: border-box;">

          <!--        <el-button type="primary"-->
          <!--                   @click="backToUpPage">关闭</el-button>-->
          <!-- </el-row> -->
          <el-table :data="tableMetaDataList"
                    border
                    style="width: 100%"
                    height="calc(100vh - 300px)"
                    @selection-change="handleSelectionChange">
            <el-table-column type="selection"
                             width="55">
            </el-table-column>
            <el-table-column prop="displayTbName"
                             label="表名称"
                             show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="tblType"
                             label="类型">
            </el-table-column>
            <el-table-column prop="fieldsNum"
                             label="字段数量">
            </el-table-column>
            <el-table-column prop="rowNum"
                             label="数据行数">
            </el-table-column>
            <el-table-column prop="tableSize"
                             label="占有空间">
            </el-table-column>
            <el-table-column prop="viewProcess"
                             label="操作"
                             width="120"
                             show-overflow-tooltip>
              <template slot-scope="scope">
                <el-link @click="toSeeDataOfTable(scope.row)"
                         type="primary"
                         :underline="false"
                         class="linkClass">查看数据</el-link>
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <el-pagination @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page="query.pageNo"
                           :page-sizes="[10, 20, 30, 40]"
                           :page-size="query.pageSize"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="dataTotal">
            </el-pagination>
          </el-row>
        </div>
      </div>
    </div>
    <!--        新增界面弹窗-->
    <div>
      <el-dialog title="个人空间管理"
                 :visible.sync="openInsertDialog"
                 width="60%">
        <!--                下面是表信息-->
        <el-form :model="tableMetaDetail"
                 class="demo-ruleForm"
                 label-width="80px">
          <el-form-item label="表名称"
                        class="item-b">
            <el-input v-model="tableMetaDetail.displayTbName"
                      placeholder="请输入表名称"></el-input>
          </el-form-item>
          <el-form-item label="表描述"
                        class="item-b">
            <div style="display: flex">
              <el-input v-model="tableMetaDetail.colComment"
                        placeholder="表描述"
                        style="width: 100%"></el-input>
            </div>
          </el-form-item>
        </el-form>
        <!--下面是字段信息集合展示-->
        <el-button type="primary">新增</el-button>
        <el-button type="primary">删除</el-button>
        <el-table ref="multipleTable"
                  :data="colMetaList"
                  tooltip-effect="dark"
                  style="width: 100%">
          <el-table-column type="selection"
                           width="55">
          </el-table-column>
          <el-table-column prop="colName"
                           label="字段名">
          </el-table-column>
          <el-table-column prop="dataType"
                           label="字段类型">
          </el-table-column>
          <el-table-column prop="dataLength"
                           label="长度">
          </el-table-column>
          <el-table-column prop="isNullable"
                           label="允许为空">
          </el-table-column>
          <!--                    <el-table-column-->
          <!--                            prop="isPrimaryKey"-->
          <!--                            label="是否主键"-->
          <!--                    >-->
          <!--                    </el-table-column>-->
          <!--                    <el-table-column-->
          <!--                            prop="isUnique"-->
          <!--                            label="唯一约束"-->
          <!--                    >-->
          <!--                    </el-table-column>-->
          <!--                    <el-table-column-->
          <!--                            prop="defaultValue"-->
          <!--                            label="默认值"-->
          <!--                    >-->
          <!--                    </el-table-column>-->
          <el-table-column prop="colComment"
                           label="备注">
          </el-table-column>
        </el-table>
        <el-row type="flex"
                justify="end">
          <el-button type="primary"
                     @click="onSubmit">保存</el-button>
          <el-button type="primary"
                     @click="closeInsertDialog">关闭</el-button>
        </el-row>
      </el-dialog>
    </div>
    <!--        数据共享人员选择弹窗-->
    <div>
      <el-dialog title="人员选择"
                 :visible.sync="openDataShareDialog"
                 width="80%">
        <!--                下面是表信息-->
        <personTree ref="personTreePage"></personTree>
        <el-row type="flex"
                justify="end">
          <el-button type="primary"
                     @click="onBesure">确定</el-button>
          <el-button type="primary"
                     @click="closeInsertDialog">关闭</el-button>
        </el-row>
      </el-dialog>
    </div>
    <div>
      <el-dialog title="当前表数据展示"
                 :visible.sync="openToSeeTableData"
                 width="80%">
        <el-table :data="inTableDataList"
                  border
                  style="width: 100%"
                  height="calc(100vh - 300px)"
                  @selection-change="handleSelectionChange">
          <el-table-column v-for="key in inTableDataColumnNameList"
                           :key="key"
                           :prop="key"
                           :label="key"
                           style="display: flex"
                           show-overflow-tooltip>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  tableListPage
  , deleteTableMeta
  , incrementPersonalSpaceManage
  , saveTableMetaInfo
  , getCurrentUserPersonSpace
  , dataShare
  , isCanDataShare
}
  from '@/api/data/personalSpaceManage'
import { preview } from '@/api/data/directory'
import LeftTrees from "@/components/loginTree/leftTree.vue";
import personTree from "@/components/publicpersontree/index"
export default {
  components: { personTree, LeftTrees },
  data () {
    return {
      tableMetaDetail: {
        tableMetaUuid: '',
        tbName: '',//表名称
        chnName: '',//表汉化名称
        colMetas: [],//字段信息
        tbComment: '',//表描述
        tblType: '',//表的类型 T是表 V是视图
        displayTbName: '',//展示的表名称
        seneInstUuid: '',//场景id
        folderUuid: ''//文件夹的id
      },
      tableMetaDataList: [],//数据表集合
      inTableDataList: [],//表中的数据集合
      inTableDataColumnNameList: [],//表中的数据字段集合
      //数据库中每一行的字段数据
      colMetaList: [],//字段信息的集合
      colMeta: {
        colMetaUuid: '',//主键id to find it easily
        tableMetaUuid: '',//表ID
        colName: '',//字段名
        dataType: '',//字段类型
        dataLength: '',//字段长度
        isNullable: '',//是否允许空值
        // isPrimaryKey:'',//是否主键
        // isUnique:'',//是否唯一约束
        colComment: '',//字段注释
        // defaultValue:'',//默认值
        // columnRemark:'',//字段备注
      },
      query: {
        condition: {}, //查询实体类放在里面
        pageNo: 1,
        pageSize: 10
      },
      dataTotal: 100,//数据的总数
      tableMetaIdList: [],//数据id的集合
      tableMetaSelectionList: [],//被选中的数据的集合
      openInsertDialog: false,//新增表弹窗
      openDataShareDialog: false,//数据共享弹窗
      openToSeeTableData: false,//显示表数据弹窗
      folderDataTree: [],//左侧目录树
      personHoldedSpace: '',//当前人持有的空间
      personUsedSpace: '',//当前人使用的空间
      spaceUsedPercent: '',//空间使用率
      selectPersonList: [],//数据共享弹窗中被选择的人员数据
      selectPersonUuidList: [],//数据共享选择人员的id集合
      selectPersonNameList: [],//数据共享选择人员的名字集合
      selectPersonUserIdList: [],//数据共享选择人员的账号集合

      isSize: true,
    }
  },
  mounted () {
    // var param = {
    //   appliedPersonalSpace:'2GB'
    // }
    // incrementPersonalSpaceManage(param)
    this.$refs.leftTreePage.loadLeftTreeTypeFun("3")
    //下面并非无用代码 是一个新增表数据的模板
    // var cloMeta1={
    //     cloName:'123',//字段名
    //     colMetaUuid:'1234',
    //     // tableMetaUuid:'233',//字段类型
    //     colName:'测试1',//字段长度
    //     dataType:'T',
    //     dataLength:'10',
    //     isNullable: '0',
    //     colComment: '测试111'
    // }
    // var cloMeta2={
    //     cloName:'121233',//字段名
    //     colMetaUuid:'1212334',
    //     // tableMetaUuid:'2233',//字段类型
    //     colName:'测试111',//字段长度
    //     dataType:'T',
    //     dataLength:'10',
    //     isNullable: '0',
    //     colComment: '测试111'
    // }
    // this.colMetaList.push(cloMeta1,cloMeta2)
    this.initPersonalSpaceManageData()
  },
  methods: {
    initPersonalSpaceManageData () {
      this.query.condition = this.tableMetaDetail
      tableListPage(this.query)
        .then((res) => {
          this.query.pageNo = res.data.current;
          this.query.pageSize = res.data.size
          this.dataTotal = res.data.total
          res.data.records.forEach((value, index) => {
            if (value.tblType != null) {
              var tempParam = value.tblType.substr(0, 1).toUpperCase()
              var param = tempParam.toUpperCase()
              if (param == "T") {
                value.tblType = '表'
              }
              if (param == "V") {
                value.tblType = '视图'
              }
            } else {
              value.tblType = '---'
            }
          })
          this.tableMetaDataList = res.data.records
          this.clearParams()
        })
      //获取当前人个人空间使用情况
      getCurrentUserPersonSpace()
        .then((res) => {
          this.personUsedSpace = res.data.personUsedSpace
          this.personHoldedSpace = res.data.personHoldedSpace
          var length1 = this.personUsedSpace.length
          var length2 = this.personHoldedSpace.length
          var value1 = this.personUsedSpace.substr(0, length1 - 2)
          var value2 = this.personHoldedSpace.substr(0, length2 - 2)
          //采用向上取整的形式 保证就算百分之百的情况下 也有部分空间剩余  保证有足够使用空间
          var usedPercent = Math.ceil(((value1 / value2) * 100))
          this.spaceUsedPercent = usedPercent + '%'
        })
    },
    //复选框改变触发事件
    handleSelectionChange (value) {
      this.tableMetaIdList = []
      this.tableMetaSelectionList = []
      this.tableMetaSelectionList = value
      value.forEach((val, index) => {
        this.tableMetaIdList.push(val.tableMetaUuid)
      })
    },
    onReInput () {
      this.clearParams()
    },
    //分页组件的页大小change事件
    handleSizeChange (val) {
      this.query.pageSize = val
      this.initPersonalSpaceManageData()
    },
    //分页组件当前页change事件
    handleCurrentChange (val) {
      this.query.pageNo = val
      this.initPersonalSpaceManageData()
    },
    //查看表中的数据
    toSeeDataOfTable (val) {
      var param = {
        extMap: {
          sceneCode: 'auditor',
          dataUserId: this.$store.getters.datauserid
        },
        id: val.tableMetaUuid,
        type: val.type == '表' ? 'table' : 'view'
      }
      preview(param)
        .then((res) => {
          if (res.data.code == 200) {
            this.openToSeeTableData = true
            this.inTableDataList = res.data.result
            this.inTableDataColumnNameList = res.data.columnNames
          } else {
            this.$notify.error("查看数据失败")
          }
        })
      //查看数据需要有一个弹窗
      //然后进去查询 将数值赋值给table
    },
    clearParams () {
      this.tableMetaDetail = {
        tableMetaUuid: '',
        tbName: '',//表名称
        chnName: '',//表汉化名称
        colMetas: [],//字段信息
        tbComment: '',//表描述
        tblType: '',//表的类型 T是表 V是视图
        displayTbName: '',//展示的表名称
        seneInstUuid: '',//场景id
        folderUuid: ''//文件夹的id
      }
    },
    //删除按钮
    onDelete () {
      // deletePersonalSpaceManage(this.personalSpaceManageIdList)
      // .then((res)=>{
      //     this.initPersonalSpaceManageData()
      // })
      if (this.tableMetaIdList.length == 0) {
        this.$notify.warning("请选择要删除的数据")
        return;
      }
      if (this.tableMetaIdList.length > 1) {
        this.$notify.warning("每次只能删除一条数据")
        return;
      }
      var param1 = this.tableMetaSelectionList[0].dbName
      var param2 = this.tableMetaSelectionList[0].tbName
      deleteTableMeta(param1, param2)
        .then((res) => {
          this.initPersonalSpaceManageData()
        })
    },
    //导出数据
    onExportData () {
      this.$axios
        .post("/data/personalSpaceManage/exportTableData", null, {
          responseType: "blob",
          headers: {
            "ContentType": 'application/x-www-form-urlencoded'
          }
        })
        .then((res) => {
          const filename = decodeURI(
            res.headers["content-disposition"].split(";")[1].split("=")[1]
          );
          const blob = new Blob([res.data], {
            type: "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
        });
    },
    //打开新增弹窗
    joinInsertDialog () {
      this.$nextTick(() => {
        this.clearParams()
      })
      this.openInsertDialog = true
    },
    //新增弹窗保存按钮
    onSubmit () {
      this.tableMetaDetail.colMetas = this.colMetaList
      saveTableMetaInfo(this.tableMetaDetail)
    },
    closeInsertDialog () {
      this.openInsertDialog = false
      this.clearParams()
    },
    //在字段集合中新增一个字段
    addOneColMeta () {

    },
    removeOneColMeta () {

    },
    //打开人员选择的弹窗
    joinDataShareDialog () {
      if (this.tableMetaSelectionList.length == 0) {
        this.$notify.warning("请先选择要共享的数据")
        return
      }
      this.openDataShareDialog = true
    },
    //人员选择弹窗的确定按钮
    onBesure () {
      this.selectPersonUuidList = []
      this.selectPersonNameList = []
      this.selectPersonUserIdList = []
      var temporaryList = this.$refs.personTreePage.selectValue
      temporaryList.forEach((value, index) => {
        this.selectPersonUuidList.push(value.personuuid)
        this.selectPersonNameList.push(value.cnname)
        this.selectPersonUserIdList.push(value.userid)
      })
      var personUuidStr = this.selectPersonUuidList.join(',')
      var personNameStr = this.selectPersonNameList.join(',')
      var userIdStr = this.selectPersonUserIdList.join(',')
      //需要到后台做一个判断 判断选中的表是否已经被共享过了 一个失败都失败
      var tempDbNameList = []
      var tempTbNameList = []
      this.tableMetaSelectionList.forEach((value, index) => {
        tempDbNameList.push(value.dbName)
        tempTbNameList.push(value.tbName)
      })
      var tempParam = {
        tempDbNameList: tempDbNameList,
        tempTbNameList: tempTbNameList,
        userIdStr: userIdStr,
        tableMetaIdList: this.tableMetaIdList
      }
      isCanDataShare(tempParam)
        .then((res) => {
          if (res.data == 200) {
            //还需要一个被选中的表的集合
            var param = {
              personUuidStr: personUuidStr,
              personNameStr: personNameStr,
              userIdStr: userIdStr,
              tableMetaIdList: this.tableMetaIdList
            }
            dataShare(param)
              .then((res) => {
                this.openDataShareDialog = false
                this.selectPersonUuidList = []
                this.selectPersonNameList = []
                this.selectPersonUserIdList = []
                this.tableMetaSelectionList = []
                this.tableMetaIdList = []
                this.$notify.success("数据共享成功")
                this.initPersonalSpaceManageData()
              })
              .catch((err) => {
                this.$notify.error("数据共享失败")
              })
          } else {
            this.$notify.error("存在已经被分享过的数据表")
          }
        })

    },
    personalSpaceQueryByTreeNode (data, node) {
      if (node.level == 1) {
        if (data.label == '个人空间') {
          this.initPersonalSpaceManageData()
        }
        if (data.label == '全行空间') {
          this.tableMetaDetail.folderUuid = data.id
          this.initPersonalSpaceManageData()
        }
      }
      if (node.level == 2) {
        //然后直接把展示的dataList 赋值 data.children
        var folderUuid = data.id
        var seneInstUuid = data.pid
        this.tableMetaDetail.folderUuid = folderUuid
        this.tableMetaDetail.seneInstUuid = seneInstUuid
        this.initPersonalSpaceManageData()
      }
    },
    toPersonSpacePage () {
      this.$router.push("expansion")
    }
  }
}
</script>

<style lang="scss" scoped>
.padding10 {
  padding: 10px;
  box-sizing: border-box;
}
.header_Filter {
  width: 100%;
}
.demo-ruleForm {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  ::v-deep .el-form-item {
    margin-bottom: 22px !important;
  }
  ::v-deep .el-form-item__label {
    text-align: right;
    vertical-align: middle;
    //float: left !important;
  }
}

.text span {
  font-weight: 600;
  margin: 0 3px;
  width: 100%;
}

.my_span_style {
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 400 !important;
  color: #0c87d6;
  border-bottom: 1px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.my_span_style:hover {
  // text-decoration: underline;
  border-bottom: 1px solid #6cb2dd;
  text-decoration-color: #6cb2dd;
  color: #6cb2dd;
  font-weight: 600;
}
.query >>> .el-form-item {
  margin-bottom: 0 !important;
}
.person {
  display: flex;
  justify-content: space-between;
  margin: bottom 10px;
}
</style>
