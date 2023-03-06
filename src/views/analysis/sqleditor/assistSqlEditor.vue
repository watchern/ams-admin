<template>
  <div class="app-container">
<!--    上半部分-->
    <el-row>
<!--      左侧树-->
      <el-col :span="5">
        <div class="left-upPart-container">
          <LeftTrees
                  ref="tree_left"
                  @details="details">
          </LeftTrees>
        </div>
      </el-col>

<!--      中间画布-->
      <el-col :span="15">
        <div class="centre-upPart-container">
          <tableCanvas
                  :tableMetaUuid="tableMetaUuid"
                  ref="tableLines">
          </tableCanvas>
        </div>
      </el-col>

<!--      右侧 连接-->
      <el-col :span="4">
        <div class="right-upPart-container">
          <div style="color:#5887B3;padding-bottom:5px">表连接</div>
          <div class="table-ref">
<!--            el-input 第一个id不为空时展示 v-if-->
            <el-input
                    :readonly="true"
                    v-model="orderContents"
            >
            </el-input>
<!--           第二个id不为空时展示 v-if=""-->
            <div class="select-container">
                <div class="ref-title">关联关系：</div>
                <div class="ref-select">
                    <el-select v-model="relationships" placeholder="请选择">
                      <el-option
                              v-for="item in options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">
                      </el-option>
                    </el-select>
                  </div>
               <div class="column-input">
                <el-input
                        :readonly="true"
                        v-model="columUUid"
                ></el-input>
              </div>
            </div>
          </div>

          <div style="color:#5887B3;padding:20px 0 5px 0">连接条件</div>
            <div class="ref-condition"></div>
<!--          <el-input-->
<!--            type="textarea"-->
<!--            :readonly="true"-->
<!--            v-model="orderContents"-->
<!--&lt;!&ndash;          >&ndash;&gt;-->
<!--          </el-input>-->
        </div>
      </el-col>
    </el-row>
<!--      下部分-->
    <el-row>
      <el-col :span="5">
        <div class="left-downPart-container">
          <div class="orderTitle">排序</div>
            <div class="order-by" v-for="{orderitem,index} in orderList" :key="index">
<!--                <div>{{index}}</div>>-->
<!--                <div>{{orderitem.columnUuid}}</div>-->
<!--                <el-input-->
<!--                        class="ordInput"-->
<!--                        type="textarea"-->
<!--                        :readonly="true"-->
<!--                        :rows="5"-->
<!--                        v-model="orderContents">-->
<!--                </el-input>-->
            </div>
        </div>
      </el-col>

      <el-col :span="19">
          <div class="right-downPart-container">
            <div>
              <el-table
                    :data="tableData"
                    height="195px"
                    style="width: 100%">
                  <el-table-column type="index" align='center' width="40px"></el-table-column>
                <el-table-column
                  prop="date"
                  label="来源"
                  align='center'
                  min-weight="150px"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="英文字段名称"
                  align='center'
                  min-weight="120px"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="address"
                  label="中文字段名称"
                  align='center'
                  min-weight="120px"
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  prop="namee"
                  label="别名"
                  align='center'
                  show-overflow-tooltip
                >
                    <template slot-scope="scope">
                        <el-input size="mini" placeholder="请输入"></el-input>
                    </template>
                </el-table-column>
                <el-table-column
                  prop="nameeeea"
                  label="聚合函数"
                  align='center'
                  width="130px">
                    <template slot-scope="scope">
                        <div class="selectFunction" v-if="showSelectFun">
                            <el-select v-model="relationships" placeholder="请选择" >
                                <el-option
                                        v-for="item in options"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                  prop="nameeeei"
                  align='center'
                  label="排序"
                  width="120px">
                    <div class="icon">
                        <i class="el-icon-caret-top" ></i>
                        <i class="el-icon-caret-bottom"></i>
                        <i class="el-icon-d-caret"></i>
                    </div>
                </el-table-column>

                <el-table-column
                  prop="nameeeee"
                  align='center'
                  label="筛选"
                  width="130px">
                </el-table-column>
                <el-table-column
                  prop="group"
                  align='center'
                  label="分组"
                  width="130px">
                    <template slot-scope="scope">
                        <el-button  type='primary' size="mini" @click="processView()">加入分组</el-button>
                    </template>
                </el-table-column>
              </el-table>
            </div>
            <el-input
                  type="textarea"
                  :readonly="true"
                  v-model="resultSQL"
                  resize="none"
                  :autosize="{ minRows:3,maxRows:3 }"
          >
          </el-input>
          </div>
      </el-col>
    </el-row>
    
  </div>
</template>
<script>
import LeftTrees from "@/components/loginTree/leftTree.vue";
import tableCanvas from "@/views/analysis/sqleditor/tableCanvas";

export default {
  name: 'AssistSqlEditor',
  components: {tableCanvas, LeftTrees },
  props: {
    tableMetaUuid: {
      type: String,
      default() {
        return "";
      },
    },
  },
  data() {
    return {
        //选中表的id数组
        tableIdList:[],
        orderContents:"",//排序内容
        //展示聚合函数选择
        showSelectFun:false,
        //左下角排序内容
          orderList: [
              {
              columnUuid:'id',
          },{

              columnUuid: 'name',
          },
              {
                  columnUuid: 'class',
              }
              ],
          tableData:[
              {
                  date: '2016-05-04',
                  name: '王小虎',
                  address:'',
                  namee:'',
                  nameeee:'',
                  nameeeea:'',
                  nameeeei:'',

              },{
                  date: '2016-05-04',
                  name: '王小虎',
                  address:'',
                  namee:'',
                  nameeee:'',
                  nameeeea:'',
                  nameeeei:'',

              },
              {
                  date: '2016-05-04',
                  name: '王小虎',
                  address:'',
                  namee:'',
                  nameeee:'',
                  nameeeea:'',
                  nameeeei:'',

              },{
                  date: '2016-05-04',
                  name: '王小虎',
                  address:'',
                  namee:'',
                  nameeee:'',
                  nameeeea:'',
                  nameeeei:'',

              }
          ],
          resultSQL:"",//最终返回结果SQL
          aggregateFun:{},
          relationships:"", //选择关联关系
          options: [{
              value: 'dikaer',
              label: ','
          },{
            value: 'leftRef',
            label: '左连接'
          }, {
            value: 'rightRef',
            label: '右连接'
          }, {
            value: 'inRef',
            label: '内连接'
          }, {
            value: 'outRef',
            label: '外连接'
          }],
        }
      },
  computed: {

  },
  created() {
    
  },
  mounted () {
    this.init();
  },
  methods: {
    //初始化事件
    init(){
      this.$refs.tree_left.loadLeftTreeTypeFun("1");
    },
    details(tableMetaUuid) {
        debugger
        this.tableMetaUuid = tableMetaUuid
        this.tableIdList.push(this.tableMetaUuid)
        this.$nextTick(() => {
        this.$refs.tableLines.init(1)//刷新列表 更新关系树
      })
    },
  //    点击加入分组展示聚合函数选择
      processView(){
        this.showSelectFun = true;
      },
    
  }
}
</script>
<style scoped>
#container {
  width: 100%;
  height: 100%;
}
.left-upPart-container{
  height: calc(100vh - 467px);
  padding-left: 10px;
}

.centre-upPart-container{
  width: 100%;
  padding: 0 20px 5px 20px;
  /*background: black;*/
}
.right-upPart-container{
    height: calc(100vh - 467px);
    padding-right: 10px;
}
.left-downPart-container{
    padding-left: 10px;
}
/*左下排序*/
.order-by{
    width: 100%;
    height: 50px;
    background-color:rgba(106, 106, 106, 0.0862745098);
    padding-left: 20px;
}
.orderTitle{
    color:#5887B3;
    padding-bottom:5px;
}
/*右下表格sql*/
.right-downPart-container{
    padding: 0 20px 5px 20px;
}
.sql-show{
  padding-top: 20px;
}
  .table-ref{
    padding: 10px 10px;
    width: 90%;
    height: 40%;
    overflow: auto;
    background-color:rgba(106, 106, 106, 0.0862745098);
  }
  .select-container{
      weight:80%;
      padding: 10px 0px;
  }
  .ref-title{
      height: 25px !important;
      display: inline;
    font-weight:bold;
  }

  .ref-select{
      height: 25px !important;
      display: inline;
      padding-left: 10px;
  }

  .column-input{
    padding-top: 10px;
  }
    .ref-condition{
        padding: 10px 10px;
        width: 90%;
        height: 43%;
        overflow: auto;
        /*background-color: rgba(218, 222, 230, 0.19);*/
        background-color:rgba(106, 106, 106, 0.0862745098);
    }

    /*聚合函数字段*/
    .selectFunction>>>.el-input__inner{
        height:28px !important;
    }

.el-icon-caret-top:hover, el-icon-caret-bottom:hover, .el-icon-d-caret:hover{
        background: #f9fafc;
    }
.el-icon-caret-top:focus, el-icon-caret-bottom:focus .el-icon-d-caret:focus{
    background: #f9fafc;
}

</style>
