<template>
  <div class="_width  resources">
    <!-- 基本信息详情 -->
    <div class="top_tag">
      <ul>
        <li class="navgatorLi"
            :class="{'isActive': index===navgatorIndex}"
            @click="handleLeft(index)"
            v-for="(item,index) in tag"
            :key="item">{{item}}</li>

      </ul>
    </div>
    <div class="right_details"
         id="right_details"
         ref="element">

      <div class="rightList">
        <!-- 基本信息 -->
        <div class="information rightList_child"
             id="id0">
          <h2 :class="{'isActive': navgatorIndex == 0}">基本信息</h2>
          <div class="information_form padding10">
            <el-form ref="form"
                     :model="form"
                     label-width="80px">
              <el-form-item label="表名称:">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="表中文名:">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="表说明:">
                <el-input v-model="form.name"
                          type="textarea"></el-input>
              </el-form-item>

              <div class="son">
                <el-form-item label="资源编码：">
                  <el-select v-model="form.name"
                             placeholder="请选择">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="资源类型：">
                  <el-select v-model="form.name"
                             placeholder="请选择">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="所属主题：">
                  <el-select v-model="form.name"
                             placeholder="请选择所属主题">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="资源分层：">
                  <el-select v-model="form.name"
                             placeholder="请选择资源分层">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="所属系统：">
                  <el-select v-model="form.name"
                             placeholder="请选择所属系统">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="资源分层：">
                  <el-input placeholder="请输入文件名称"></el-input>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="数据日期：">
                  <el-select v-model="form.name"
                             placeholder="请输入数据日期">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="表大小：">
                  <el-input placeholder="请输入表大小"></el-input>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="数据数量：">
                  <el-select v-model="form.name"
                             placeholder="请输入数据数量">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="负责人">
                  <el-input placeholder="请输入负责人"></el-input>
                </el-form-item>
              </div>

              <div class="son">
                <el-form-item label="表分区">
                  <el-select v-model="form.name"
                             placeholder="请输入数据数量">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="增全量">
                  <el-select v-model="form.name"
                             placeholder="请选择增量全量">
                    <el-option v-for="item in options"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>

              <el-form-item label="数据标签:">
                <div class="input_blue"
                     @click="onclick_infotion_tag()">
                  <div v-for="(item,index) in TagsAll"
                       :key="index"
                       class="spanbox">
                    <span class="tagspan">{{item}}</span>
                    <i class="span_close"
                       @click="removeTag_infotion_tag(index,item)"></i>
                  </div>
                  <!-- 输入框 -->
                  <input v-model="search_name_infotion"
                         @keyup.enter="addTags_infotion_tag"
                         @keyup.delete="deleteTags_infotion_tag"
                         :style="inputStyle"
                         class="inputTag"
                         ref="inputTag"
                         type="text" />
                </div>

              </el-form-item>

              <el-form-item label="表热度:">
                <ul class="Heat_ul _width">
                  <li v-for="(it,i) in Heat"
                      :key="i">
                    <p>{{it.name}}</p><span>{{it.num}}</span>
                  </li>
                </ul>
              </el-form-item>
              <div class="son">
                <el-button type="primary">查看SQL语句</el-button>
              </div>

            </el-form>
          </div>

        </div>
        <!-- 列信息 -->
        <div class="rightList_child"
             id="id1">
          <h2 :class="{'isActive': navgatorIndex == 1}">列信息</h2>
          <div class="padding10">
            <el-table :data="tableData"
                      style="width: 100%">
              <el-table-column prop="date"
                               label="字段名称">
              </el-table-column>
              <el-table-column prop="name"
                               label="字段中文名">
              </el-table-column>
              <el-table-column prop="address"
                               label="字段类型">
              </el-table-column>
              <el-table-column prop="address"
                               label="字段长度">
              </el-table-column>

              <el-table-column prop="address"
                               label="字段说明">
              </el-table-column>

            </el-table>
          </div>
        </div>
        <!-- 索引信息 -->
        <div class="rightList_child"
             id="id2">
          <h2 :class="{'isActive': navgatorIndex == 2}">索引信息</h2>
          <div class="padding10">
            <el-table :data="tableData"
                      style="width: 100%">
              <el-table-column prop="date"
                               label="名称">
              </el-table-column>
              <el-table-column prop="name"
                               label="类型">
              </el-table-column>
              <el-table-column prop="address"
                               label="列">
              </el-table-column>
              <el-table-column prop="address"
                               label="是否唯一">
              </el-table-column>

            </el-table>
          </div>
        </div>
        <!-- 数据表关联关系 -->
        <div class="rightList_child"
             id="id3">
          <h2 :class="{'isActive': navgatorIndex == 3}">数据表关联关系</h2>
          <!-- <ProcessTree></ProcessTree> -->
        </div>
        <!-- 数据表关联关系 -->
        <div class="rightList_child"
             id="id4">
          <h2 :class="{'isActive': navgatorIndex == 4}">数据表字典信息</h2>
          数据表字典信息
          <!-- <LineMap></LineMap> -->
          <EditMap></EditMap>

        </div>

        <div class="rightList_child"
             style="text-align: right;">
          <el-button type="primary">保存</el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import ProcessTree from "@/components/directory/process_tree.vue"
import LineMap from "@/components/directory/lineMap.vue"
import EditMap from "@/components/directory/edit_map.vue"

export default {
  components: { ProcessTree, LineMap, EditMap },
  props: {
    parentArr: {
      type: Array,
      default () {
        return []
      }
    },
    limit: {
      // 最多生成标签数量
      type: Number,

    },
  },
  data () {
    return {
      navgatorIndex: 0,
      listBoxState: true,//点击导航栏时，暂时停止监听页面滚动
      dom_scrollTop: 0,//元素滚动距离
      tag: ['基本信息', '列信息', '索引信息', '数据表关联关系', '数据表字典信息'],
      // 基本信息
      form: {
        name: '',
      },

      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      },
      ],

      TagsAll: ['aa'],
      inputLength: '',
      search_name_infotion: '',//标签

      Heat: [
        { name: 'python工具引用次数', num: '99' },
        { name: 'python工具引用次数python工具引用次数', num: '99' },
        { name: 'python工具引用次数', num: '22' },
        { name: 'python工具引用次数', num: '99' },
        { name: 'python工具引用次数', num: '99' },
        { name: 'python工具引用次数', num: '99' },

      ],//表热度

      // 列信息
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],

    };
  },
  computed: {
    inputStyle () {
      let style = {};
      style.width = `${this.inputLength}px`;
      return style;
    },
    finall () {
      return this.TagsAll.join(',')
    }
  },
  watch: {
    TagsAll () {
      this.$emit('on-change', this.TagsAll)
    },
    search_name_infotion (val) {
      this.inputLength = this.$refs.inputTag.value.length * 12 + 50;
    },
    parentArr () {
      this.TagsAll = this.parentArr.length ? this.parentArr : []
    }
  },
  mounted () {
    // let timeId;
    window.addEventListener('scroll', () => {
      // 页面滚动停止100毫秒后才会执行下面的函数。
      // clearTimeout(timeId);
      // timeId = setTimeout(() => {
      // this.scrollToTop();
      this.handleScroll()
      //   }, 100);
    }, true);
  },
  created () {
    // this.$nextTick(function () {
    //   let height_conter = this.$refs.element.offsetHeight;  //100
    // })

  },
  methods: {
    // 点击导航菜单，页面滚动到指定位置
    handleLeft (index) {
      this.navgatorIndex = index;
      this.$el.querySelector(`#id${index}`).scrollIntoView({
        behavior: "smooth",  // 平滑过渡
        block: "start"  // 上边框与视窗顶部平齐。默认值
      });
      this.listBoxState = false;

      // let timeId;
      // clearTimeout(timeId);
      // timeId = setTimeout(() => {
      this.listBoxState = true;
      // }, 200);
    },
    handleScroll () {
      var dom_scrollTop = document.querySelector('#right_details').scrollTop;//获取监听指定区域滚动位置的值
      // let offsetTop = document.querySelector("#right_details").offsetTop; //获取固定元素初始滚动位置
      if (this.listBoxState) {//作用是点击导航栏时，延迟这里执行。
        this.tag.map((v, i) => {
          // 获取监听元素距离视窗顶部距离
          var offsetTop = document.getElementById(`id${i}`).offsetTop;
          // 获取监听元素本身高度
          var scrollHeight = document.getElementById(`id${i}`).scrollHeight;
          // 如果 dom滚动位置 >= 元素距离视窗距离 && dom滚动位置 <= 元素距离视窗距离+元素本身高度
          // 则表示页面已经滚动到可视区了。

          if (dom_scrollTop >= offsetTop && dom_scrollTop <= (offsetTop + scrollHeight)) {

            // 导航栏背景色选中
            this.navgatorIndex = i;
          }
        })
      }

    },
    // 删除标签
    removeTag_infotion_tag (index, item) {
      this.TagsAll.splice(index, 1)
    },

    //生成标签
    addTags_infotion_tag () {
      if (this.search_name_infotion) {
        this.TagsAll.push(this.search_name_infotion);
        this.search_name_infotion = '';
      }
    },
    //键盘删除键删除tag
    deleteTags_infotion_tag () {
      this.TagsAll.pop()
    },
    onclick_infotion_tag () {
      this.$nextTick(() => {
        this.$refs.inputTag.focus();
      })
    }

  }
}
</script>

<style scoped >
.resources {
  display: flex;
  /* overflow-y: auto; */
  /* height: 700px; */
  position: relative;
  height: calc(100vh - 180px);
}
.top_tag {
  width: 160px;
}
.navgatorLi {
  width: 100%;
  display: flex;
  border-top: none;
  font-size: 16px;
  height: 20px;
  cursor: pointer;
  text-align: left;
  margin-bottom: 20px;
}
.isActive {
  color: #0271be;
  font-weight: 600;
}

.right_details {
  width: calc(100% - 160px);
  /* height: 900px; */
  overflow-y: auto;
}
.rightList {
}
.rightList .rightList_child {
  /* min-height: 600px; */
  /* border: 1px solid red; */
  overflow-y: auto;
  margin-bottom: 30px;
}
.rightList .rightList_child h2 {
  font-size: 20px;
}
/* 基本信息 */
.information {
}
.information_form {
  box-sizing: border-box;
}
.information_form >>> .el-form-item {
  display: flex;
  margin-bottom: 20px !important;
}
.information_form >>> .el-form-item__content {
  flex: 1;
  margin-left: 0 !important;
}
.son {
  display: flex;
  justify-content: space-between;
}
.son >>> .el-form-item__content {
  /* width: 100%; */
  width: 300px;
}
.information_form >>> .el-textarea__inner {
  cursor: not-allowed !important;
}
.information_form >>> .el-select,
.information_form >>> .el-input__inner {
  background-color: #fff !important;
}
.son >>> .el-select {
  width: 100%;
}
/* 表热度 */
.Heat_ul {
  /* border: 1px solid; */
  float: left;
}

.Heat_ul li {
  float: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-right: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  border-bottom: 1px solid #fff;
  /* padding: 0 10px; */
  height: 40px;
  line-height: 40px;
  width: 20%;
}
.Heat_ul li p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: #5f9fcb;
  transition: color 0.3s;
}
.Heat_ul li:hover p {
  color: #115f94 !important;

  /* border-bottom: 1px solid #0271be; */
}
.Heat_ul li:nth-child(4n) {
  padding-right: 0 !important;
}
.Heat_ul li span {
  padding: 0 5px;
  color: #fff;
  background-color: #0271be;
  border-radius: 27em;
  margin-left: 3px;
  font-size: 14px;
  height: 25px;
  line-height: 25px;
}
/* 基本信息标签 */

.input_blue {
  /* width: 300px; */
  margin-right: 20px;
  flex: 1;
  box-sizing: border-box;
  background-color: white;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  padding-left: 5px;
  word-wrap: break-word;
  overflow: hidden;
}
.spanbox {
  display: inline-block;
  font-size: 14px;
  margin: 3px 4px 3px 0;
  background-color: rgb(229, 229, 229);
  border: 1px solid #e8eaec;
  border-radius: 3px;
}
.tagspan {
  height: 24px;
  line-height: 22px;
  max-width: 99%;
  position: relative;
  display: inline-block;
  padding-left: 8px;
  color: #495060;
  font-size: 14px;
  cursor: pointer;
  opacity: 1;
  vertical-align: middle;
  overflow: hidden;
  transition: 0.25s linear;
  color: rgb(26, 26, 26, 0.5);
}
.span_close {
  padding: 0 4px 0 4px;
  opacity: 1;
  -webkit-filter: none;
  filter: none;
  color: rgb(26, 26, 26, 0.5);
  font-weight: 200;
}
.span_close:after {
  content: "\00D7";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* line-height: 27px; */
  transition: 0.3s, color 0s;
}
.inputTag {
  font-size: 16px;
  border: none;
  box-shadow: none;
  outline: none;
  background-color: transparent;
  padding: 0;
  width: auto;
  min-width: 250px;
  vertical-align: top;
  height: 32px;
  color: #495060;
  line-height: 32px;
}
/* 基本信息 标签 :end */
</style>
