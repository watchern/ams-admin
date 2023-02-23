<template>
  <div class="page-container">
    <div class="pd20">

      <div class="filter-container">
        <QueryField ref="queryfield"
                    :form-data="queryFields"
                    @submit="getList" />
      </div>
      <!--        办理按钮-->
      <div class="mb10">
        <el-row>
          <el-col align="right">
            <el-button type="primary"
                       class="oper-btn"
                       @click="handleTransact()">办理</el-button>
          </el-col>
        </el-row>
      </div>

      <el-table :key="tableKey"
                v-loading="listLoading"
                :data="tableData"
                stripe
                border
                fit
                highlight-current-row
                style="width: 100%;"
                height="calc(100vh - 300px)"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection"
                         width="55" />
        <el-table-column label="申请模块名称"
                         prop="requestModelName"
                         min-width="200px"
                         show-overflow-tooltip />
        <el-table-column label="涉及安全表"
                         prop="refSafeTable"
                         width="200px"
                         show-overflow-tooltip />
        <el-table-column label="当前环节"
                         align="center"
                         prop="currentLink"
                         width="200px"
                         show-overflow-tooltip />
        <el-table-column label="表安全等级"
                         align="center"
                         prop="tbSafeLevel"
                         width="150px"
                         show-overflow-tooltip />
        <el-table-column label="数据敏感级别"
                         align="center"
                         prop="dataSensitiveLevel"
                         width="150px"
                         show-overflow-tooltip />
        <el-table-column label="状态"
                         align="center"
                         prop="status"
                         width="150px"
                         :formatter="statusFormat"
                         show-overflow-tooltip />
        <el-table-column label="申请时间"
                         prop="requestTime"
                         align="center"
                         width="200px"
                         show-overflow-tooltip />
        <el-table-column label="数据申请人"
                         align="center"
                         prop="requestPersionName"
                         width="200px"
                         show-overflow-tooltip />
        <el-table-column label="操作"
                         align="center"
                         width="320px">
          <template slot-scope="scope">

            <el-link v-if="scope.row.status == '待办理' || scope.row.status == '已办理'"
                     :underline="false"
                     type="text"
                     @click="showFlow()">流程查看
            </el-link>
            <el-link v-if="scope.row.status == '已办理'"
                     type="text"
                     :underline="false"
                     style="width: auto"
                     @click="downLoad()">下载
            </el-link>
            <el-link v-if="scope.row.status == '待办理' || scope.row.status == '已办理'"
                     type="text"
                     :underline="false"
                     style="width: auto"
                     @click="showFile()">文件预览
            </el-link>
          </template>
        </el-table-column>
      </el-table>
      <pagination :total="total"
                  :page.sync="pageQuery.pageNo"
                  :limit.sync="pageQuery.pageSize"
                  @pagination="getList" />
      <el-dialog title="办理"
                 :visible.sync="dialogTransactVisible"
                 :close-on-click-modal="false">
        <div>
          <div>待开发</div>>
          <FlowItem></FlowItem>
        </div>
        <span class="sess-flowitem"
              slot="footer">
          <el-button size="mini"
                     type="primary"
                     class="table_header_btn"
                     @click="saveOpinion">提交</el-button>
          <el-button size="mini"
                     type="primary"
                     class="table_header_btn"
                     @click="dialogFlowItemShow = false">关闭</el-button>
        </span>
      </el-dialog>
      <el-dialog title="流程跟踪---待开发"
                 :visible.sync="dialogFlowVisible"
                 :close-on-click-modal="false">
        <div>
          <flowOpinionList></flowOpinionList>
        </div>
      </el-dialog>
      <el-dialog title="下载"
                 :visible.sync="dialogdownLoadVisible"
                 :close-on-click-modal="false">
        <div>待开发</div>>
      </el-dialog>
      <el-dialog title="文件预览"
                 :visible.sync="dialogFileVisible"
                 :close-on-click-modal="false">
        <div class="detail-form">
          <template class="detail-form">
            <div>待开发</div>
          </template>
        </div>
        <div slot="footer"
             class="table-footer">
          <el-button type="text"
                     @click="nextList()">下一页</el-button>
          <el-button type="text"
                     @click="allList()">查看全部</el-button>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button class="oper-btn"
                     @click="dialogFileVisible = false">返 回</el-button>
        </div>
      </el-dialog>
    </div>
  </div>

</template>

<script>
import MyElTree from "@/components/public/tree/src/tree.vue";
import {

} from "@/api/data/table-info";
import { XmlFactory } from 'ag-grid-community';
export default {
  components: { MyElTree },
  data () {
    return {
      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },
      activeName: "0", //tab切换
      filterText2: null,
      tableMetaUuid: "",
      options: [
        {
          value: "Postgre",
          label: "DWS",
        },
        {
          value: "Hive",
          label: "MRS",
        },
      ],
      loading: false,
      tree_list: [], //左侧资料树数据结构
      // 资料树筛选 数据源
      query: {
        dataSource: "Postgre", //筛选条件
        pageNo: 1,
        pageSize: 10,
        businessSystemId: "", //id主键
        tableThemeId: "", //主题
        tableLayeredId: "", //分层
        folderUuid: "", //目录ID
        tbName: '',// 批量注册后 点击左侧树 一个会显示全部的问题
      },
      tabclick: false,
      treeLoading: false,
      tableData: [],
      chooseTables: [],
      loadLeftTreeType: "", //因为很多模块需要用到这棵树，用此类型来区分不同模块; 1-SQL编辑器 2-数据授权管理-资源绑定 左侧树
      isShowLoadLeftTreeBtn: true, //是否展示树节点操作按钮
      isShowPersonSpaceTab: false, //是否展示个人空间页签
      centreTreeNodeSelectedObj: [],//树节点勾选对象
    };
  },
  computed: {},
  watch: {
    filterText2 (val) {
      this.$refs.tree2.filter(val);
    },
  },
  mounted () { },
  created () {
    this.query.businessSystemId = "";

  },
  methods: {
    //删除节点
    removeNode (node, data) {
      if (node.level === 1) {
        //如果是根节点下的表则直接删除
        this.centreTreeNodeSelectedObj.forEach(function (item, k) {
          item.data.forEach(function (t, index) {
            if (t.id === data.id) {
              item.data.splice(index, 1);
            }
          })
        })
      }
      if (node.level > 1) {
        //如果文件夹下只有一张表则连同文件夹一起删除
        if (node.parent.childNodes.length > 1) {
          //只删除表
          this.centreTreeNodeSelectedObj.forEach(function (item, k) {
            item.data.forEach(function (t, index) {
              if (t.id === data.id) {
                item.data.splice(index, 1);
              }
            })
          })
        } else {
          //删除文件夹和表
          this.centreTreeNodeSelectedObj.forEach(function (item, k) {
            item.data.forEach(function (t, index) {
              if (t.id === data.id) {
                item.data.splice(index, 1);
              }
            })
            item.data.forEach(function (t, index) {
              if (t.id === data.pid) {
                item.data.splice(index, 1);
              }
            })
          })
        }
      }
      //刷新树
      this.loadLeftTreeTypeFun(this.centreTreeNodeSelectedObj)
      //去掉左侧树的勾选状态
      this.$emit("unLeftTreeSelected", data, this.centreTreeNodeSelectedObj)
    },
    //获取选中的值
    loadLeftTreeTypeFun (datas) {
      //将数组置空
      this.tree_list = []
      this.centreTreeNodeSelectedObj = []

      //重新赋值
      this.centreTreeNodeSelectedObj = datas
      var strLevel = this.activeName + this.query.dataSource
      for (var i = 0; i < this.centreTreeNodeSelectedObj.length; i++) {
        if (this.centreTreeNodeSelectedObj[i].strLevel === strLevel) {
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
    },
    toTree (data) {
      // 1.定义最外层的数组
      const tree = []
      // 2.定义一个空对象
      const otherObj = {}
      // 3.遍历数组内所有对象
      data.forEach(item => {
        // 3.1 清空children 
        item.children = []
        // 3.2 将当前对象的 id 作为键, 与当前对象自身形成键值对
        otherObj[item.id] = item
      })

      // 4.再次遍历数组内所有对象
      data.forEach(item => {
        // 4.1.判断每个当前对象的 pid, 如当前对象 pid 不为空, 则说明不是最上级的根对象
        if (item.pid != 0) {
          // var childNode = otherObj[item.pid];
          // otherObj[item.pid].children=[]
          // 4.3.利用当前对象的 otherObj[pid] 找到 otherObj[id] 中对应当前对象的父级对象, 将当前对象添加到其对应的父级对象的 children 属性中
          var x = otherObj[item.pid]
          if (x === undefined) {
            tree.push(item)
          } else {
            x.children.push(item)
          }

        } else {
          // 4.3.当前对象 pid 如果为空, 则为树状结构的根对象
          tree.push(item)
        }
      })
      // 5.返回树状结构
      return tree
    },
    // 选择数据源
    selectdata (val) {
      this.tree_list = []
      this.query.dataSource = val;
      if (this.activeName == "0") {
        // 系统
        this.post_getBusinessSystemTree(); //系统
      } else if (this.activeName == "1") {
        // 主题
        this.post_getThemeTree(); //主题
      } else if (this.activeName == "2") {
        // 分层
        this.post_getLayeredTree(); //分层
      } else if (this.activeName == "3") {
        // 个人空间
        this.post_getPersonSpaceTree(); //个人空间
      } else {
        // 目录
        this.post_getDataTreeNode(); //目录
      }
    },
    // 系统
    post_getBusinessSystemTree () {
      this.loading = true;
      this.tabclick = true;
      var strLevel = this.activeName + this.query.dataSource
      for (var i = 0; i < this.centreTreeNodeSelectedObj.length; i++) {
        if (this.centreTreeNodeSelectedObj[i].strLevel === strLevel) {
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
      this.loading = false;
      this.tabclick = false;
    },
    // 主题
    post_getThemeTree () {
      this.loading = true;
      this.tabclick = true;
      var strLevel = this.activeName + this.query.dataSource
      for (var i = 0; i < this.centreTreeNodeSelectedObj.length; i++) {
        if (this.centreTreeNodeSelectedObj[i].strLevel === strLevel) {
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
      this.loading = false;
      this.tabclick = false;
    },
    // 分层
    post_getLayeredTree () {
      this.loading = true;
      this.tabclick = true;
      var strLevel = this.activeName + this.query.dataSource
      for (var i = 0; i < this.centreTreeNodeSelectedObj.length; i++) {
        if (this.centreTreeNodeSelectedObj[i].strLevel === strLevel) {
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
      this.loading = false;
      this.tabclick = false;
    },

    handleClick (tab, event) {
      this.tree_list = []
      this.activeName = tab.index
      if (tab.index == "0") {
        this.post_getBusinessSystemTree(); //系统
      } else if (tab.index == "1") {
        this.post_getThemeTree(); //主题
      } else if (tab.index == "2") {
        this.post_getLayeredTree(); //分层
      }

    },
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    nodeClick (data) {
      var strLevel = this.activeName + this.query.dataSource
      data.strLevelType = strLevel
      this.$emit("nodeClick", data)
    },


  }
};
</script>

<style scoped >
.left_tree_style {
  height: 100%;
  /* overflow: auto; */
  /* height: calc(100% - 280px); */
}

.conter_vh {
  height: calc(100% - 170px);
}

.tree-containerall {
  height: 100%;
  /* overflow-x: auto; */
  /* border: 1px solid blue; */
}

.tree-containerall >>> .el-tree {
  height: 100%;
}

.loadings {
  /* position: absolute;
  left: 0;
  bottom: 0; */
  height: calc(100% - 160px);
  width: 100%;
  z-index: 9;
  background: rgba(106, 106, 106, 0.0862745098);
  border-radius: 15.5px;
}

.conter_loadings {
  width: 100%;
  height: 100%;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.7);

  display: flex;
  align-items: center;
  justify-content: center;
}

.loadings span {
  width: 60px;
}

.loadings span img {
  width: 100%;
}

.left_tree_style >>> .el-tabs__header {
  margin: 0;
}

.left_tree_style >>> .el-tabs__item {
  width: 25%;
  text-align: center;
}

.left_tree_style
  >>> .el-tabs--card
  > .el-tabs__header
  .el-tabs__item.is-active {
  border-bottom-color: transparent;
}

.left_tree_style >>> .el-tabs__nav {
  width: 100%;
}

.dataSource >>> .el-form-item {
  display: flex;
  width: 100%;
}
.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_0.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon1 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_1.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon2 {
  display: inline-block;
  height: 14px;
  width: 14px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_2.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon4 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../styles/icons/view.png");
  vertical-align: top;
  *vertical-align: middle;
}
</style>
