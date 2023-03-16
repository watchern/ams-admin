<template>
  <div class="left_tree_style">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="系统" :disabled="tabclick" name="0"></el-tab-pane>
      <el-tab-pane label="主题" :disabled="tabclick" name="1"></el-tab-pane>
      <el-tab-pane label="分层" :disabled="tabclick" name="2"></el-tab-pane>
    </el-tabs>
    <div class="padding10">
      <el-input
        v-model="filterText2"
        :disabled="tabclick"
        placeholder="输入关键字进行过滤"
      />
    </div>
    <!-- 数据源 -->
    <div class="padding10 dataSource">
      <el-form :inline="true" :model="query" label-position="bottom">
        <el-form-item label="数据源：" label-width="90px">
          <el-select
            v-model="query.dataSource"
            :disabled="tabclick"
            @change="selectdata"
            placeholder="请选择数据源"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="loading == true" class="loadings">
      <div class="conter_loadings">
        <span><img src="@/assets/img/loading.gif" alt="" /></span>
      </div>
    </div>

    <div v-else class="conter_vh">
      <!-- 系统 主题 分层  目录-->
      <div class="tree-containerall">
        <MyElTree
          ref="tree2"
          :props="props"
          :data="tree_list"
          :filter-node-method="filterNode"
          :default-expanded-keys="['ROOT']"
          class="filter-tree"
          highlight-current="true"
          node-key="id"
          :expand-on-click-node="false"
          :default-expand-all	= "true"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <i v-if="data.id === 'ROOT'" :class="data.icon" />
            <i
              v-if="
                data.type === 'folder' ||
                data.type === 'system' ||
                data.type === 'layered' ||
                data.type === 'theme'
              "
            >
              <span class="agreeicon0"></span>
            </i>
            <i v-if="data.type === 'table'">
              <span class="icon iconfont agreeicon1"></span>
            </i>
            <i v-if="data.type === 'view'">
              <span class="icon iconfont agreeicon4"></span>
            </i>
            
            <i
              v-if="data.type === 'column'"
              class="el-icon-c-scale-to-original"
            />
            <span @click="nodeClick(data)">{{ node.label }}</span>
            <span style="margin-left:2vh;" v-if="data.type === 'table' || data.type === 'view'"> 
              <el-button
                title="删除节点"
                type="text"
                size="mini"
                @click="() => removeNode(node, data)">
                <svg-icon icon-class="icon-delete-1" />
              </el-button>
            </span>
            
          </span>
        </MyElTree>
      </div>
      <!-- 目录 -->
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
  data() {
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
      centreTreeNodeSelectedObj:[],//树节点勾选对象
    };
  },
  computed: {},
  watch: {
    filterText2(val) {
      this.$refs.tree2.filter(val);
    },
  },
  mounted () { },
  created () {
    this.query.businessSystemId = "";

  },
  methods: {
    switchTabAccredit(index){
      this.activeName = index
    },
    switchDataSourceAccredit(val){
      this.query.dataSource = val
      //刷新树
      this.loadLeftTreeTypeFun(this.centreTreeNodeSelectedObj)
    },
    //删除节点
    removeNode(node,data){
      var _this=this
      if(node.level===1){
        //如果是根节点下的表则直接删除
        this.centreTreeNodeSelectedObj.forEach(function(item,k){
          if(item.id===data.id){
            _this.centreTreeNodeSelectedObj.splice(k, 1);
          }
        })
      }
      if(node.level>1){
        //只删除表
        this.centreTreeNodeSelectedObj.forEach(function(item,k){
          if(item.id===data.id){
            _this.centreTreeNodeSelectedObj.splice(k, 1);
          }
        })
        //如果文件夹下只有一张表则连同文件夹一起删除
        if(node.parent.childNodes.length===1){
          //删除文件夹
          this.centreTreeNodeSelectedObj.forEach(function(item,k){
            if(item.id===node.parent.data.id){
              _this.centreTreeNodeSelectedObj.splice(k, 1);
            }
          })
        }
      }
      //刷新树
      this.loadLeftTreeTypeFun(this.centreTreeNodeSelectedObj)
      //去掉左侧树的勾选状态
      data.strLevel = this.query.dataSource
      this.$emit("unLeftTreeSelected",data)
    },
    //获取选中的值
    loadLeftTreeTypeFun(datas) {
      //将数组置空
      this.tree_list = []
      this.centreTreeNodeSelectedObj = []

      //重新赋值
      this.centreTreeNodeSelectedObj = datas
      var treeData = this.toTree(datas)
      this.tree_list = treeData
    },
    toTree(data) {
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
            if(x===undefined){
              tree.push(item)
            }else{
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
    selectdata(val) {
      this.tree_list=[]
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
      //数据授权-资源绑定-切换数据源
      this.$emit("switchDataSourceAccreditLeft", val)
    },
    // 系统
    post_getBusinessSystemTree() {
      this.loading = true;
      this.tabclick = true;
      var strLevel = this.activeName + this.query.dataSource
      for(var i=0;i<this.centreTreeNodeSelectedObj.length;i++){
        if(this.centreTreeNodeSelectedObj[i].strLevel === strLevel){
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
      this.loading = false;
      this.tabclick = false;
    },
    // 主题
    post_getThemeTree() {
      this.loading = true;
      this.tabclick = true;
      var strLevel = this.activeName + this.query.dataSource
      for(var i=0;i<this.centreTreeNodeSelectedObj.length;i++){
        if(this.centreTreeNodeSelectedObj[i].strLevel === strLevel){
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
      this.loading = false;
      this.tabclick = false;
    },
    // 分层
    post_getLayeredTree() {
      this.loading = true;
      this.tabclick = true;
      var strLevel = this.activeName + this.query.dataSource
      for(var i=0;i<this.centreTreeNodeSelectedObj.length;i++){
        if(this.centreTreeNodeSelectedObj[i].strLevel === strLevel){
          var treeData = this.toTree(this.centreTreeNodeSelectedObj[i].data)
          this.tree_list = treeData
        }
      }
      this.loading = false;
      this.tabclick = false;
    },
   
    handleClick(tab, event) {
      this.tree_list=[]
      this.activeName = tab.index
      if (tab.index == "0") {
        this.post_getBusinessSystemTree(); //系统
      } else if (tab.index == "1") {
        this.post_getThemeTree(); //主题
      } else if (tab.index == "2") {
        this.post_getLayeredTree(); //分层
      } 
      //数据授权-资源绑定-联动效果
      this.$emit("switchTabAccreditLeft", tab.name)
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    nodeClick (data) {
      var strLevel = this.query.dataSource
      data.strLevelType = strLevel
      this.$emit("nodeClick",data)
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

.tree-containerall>>>.el-tree {
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

.left_tree_style>>>.el-tabs__header {
  margin: 0;
}

.left_tree_style>>>.el-tabs__item {
  width: 25%;
  text-align: center;
}

.left_tree_style>>>.el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  border-bottom-color: transparent;
}

.left_tree_style>>>.el-tabs__nav {
  width: 100%;
}

.dataSource>>>.el-form-item {
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
