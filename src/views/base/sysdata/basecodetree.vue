<template>
  <div class="centerDiv">
    <el-card class="box-card">
      <div class="text item treeDiv">
        <el-tree
          ref="tree"
          :data="data"
          lazy
          node-key="id"
          check-strictly
          :load="loadnode"
          :props="defaultProps"
          @node-click="nodeclick"
        />
      </div>
    </el-card>
  </div>
</template>
<script>
// import { stringify } from "querystring";
import { loadchildnodeOne } from '@/api/base/sysData'
export default {
  data() {
    return {
      data: [],
      defaultProps: {
        children: 'children',
        label: 'codeName'
      },
      pageQueryTree: {
        condition: null,
        pageNo: 1,
        pageSize: 20,
        sortBy: 'asc',
        sortName: 'create_time'
      },
      treeFistNode: '',
      dataSortUuid: '',
      dataSortName: '',
      baseCode: {},
      objCode: {
        codeUuid: '',
        dataSortUuid: '',
        parentCodeUuid: ''
      }
    }
  },
  methods: {
    loadnode(node, resolve) {
      // 如果展开第一级节点，从后台加载一级节点列表
      if (node.level === 0) {
        this.loadfirstnode(resolve)
      }
      // 如果展开其他级节点，动态从后台加载下一级节点列表
      if (node.level >= 1) {
        this.loadchildnode(node, resolve)
      }
    },
    // 加载第一级节点 -默认加载树结构
    loadfirstnode(resolve) {
      var dataSortUuid = this.$store.state.dataSort.dataSortUuid
      var dataSortName = this.$store.state.dataSort.dataSortName
      var data = [
        {
          codeUuid: dataSortUuid,
          codeName: dataSortName
        }
      ]
      resolve(data)
      this.baseCode.codeUuid = dataSortUuid
      this.baseCode.codeName = dataSortName
      // 传递值
      this.$store.dispatch('dataSort/setBaseCode', this.baseCode)
    },
    // 刷新树组件
    // refreshtree() {
    //   this.axios.get('http://localhost:6060/loadtype').then(function(resp) {
    //     this.data = resp.data
    //   })
    // },
    resetobjCode() {
      this.objCode = {
        dataSortUuid: '',
        parentCodeUuid: ''
      }
    },
    // 加载根节点的子节点集合
    loadchildnode(node, resolve) {
      if (node.level === 1) {
        console.log(node)
        console.log(resolve)
        this.resetobjCode()
        this.objCode.dataSortUuid = node.data.codeUuid
        this.objCode.parentCodeUuid = node.data.codeUuid
        this.pageQueryTree.condition = Object.assign({}, this.objCode)
        loadchildnodeOne(this.pageQueryTree).then(resp => {
          var jsonStr = JSON.stringify(resp.data.records)
          console.log(jsonStr)
          // eslint-disable-next-line no-eval
          var label = eval('(' + jsonStr + ')')
          resolve(label)
        })
      } else {
        this.resetobjCode()
        this.objCode.parentCodeUuid = node.data.codeUuid
        console.log(this.objCode)
        this.pageQueryTree.condition = Object.assign({}, this.objCode)
        loadchildnodeOne(this.pageQueryTree).then(resp => {
          var jsonStr = JSON.stringify(resp.data.records)
          // eslint-disable-next-line no-eval
          var label = eval('(' + jsonStr + ')')
          resolve(label)
        })
      }
      //   var str = "" ;
      //   for(var i=0;i<data.length;i++){
      //        var a =  data[i].codeName;
      //        str+= "{'label':'"+a+"'},";
      //   }
      //  str =  str.substring(0,str.length-1);
      //  str = "["+str+"]";
      //   alert(str)
      //   var label = eval('('+str+')') ;
      //   alert(label)
    },
    // 点击节点上触发的事件，传递三个参数，数据对象使用第一个参数
    nodeclick(data) {
      // alert(data.label+",id="+data.id);
      this.baseCode.codeUuid = data.codeUuid
      this.baseCode.codeName = data.codeName
      this.baseCode.dataSortUuid = data.dataSortUuid
      // 传递值
      this.$store.dispatch('dataSort/setBaseCode', this.baseCode)
    }
  }
}
</script>

<style  scoped>
.treeDiv {
  height: 600px;
}
</style>
