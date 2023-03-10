<template>
  <div class="padding10 _width">
    <div class="search_center">
      <div class="search_conter">
        <!-- 父盒子 -->
        <div class="father_box"
             :class="currentval && dropDown.length > 0 ?'input_is_show':''"
             @click="onclick">
          <!-- 生成的标签 -->
          <div class="left" ref="leftBox">
<!--            :style="{maxWidth: maxWidths +'px'}"-->
            <div class="TagsAll_conter"
                 id="list"

                 ref="TagsAll">
              <div v-for="(item, index) in TagsAll"
                   :key="index"
                   :id="'arr'+[index]"
                   class="spanbox">
                <span class="tagspan">{{ item.name }}{{ item.value }}</span>
                <i class="span_close el-icon-close"
                   @click="removeTag(index, item)"></i>
              </div>
              <div
                  ref="inputTag"
                  class="edit-div"
                  contenteditable="true"
                  v-html="currentval"
                  @focus="inputFocus"
                  @input="inputValueChange($event)"
                  @keydown="pushKeyDown($event)"
                  @compositionstart="onCompositionStart"
                  @compositionend="onCompositionEnd"
              ></div>
            </div>

            <!-- 输入框 -->
            <!-- @keyup.enter="addTags" -->
            <!-- :style="inputStyle" -->
<!--            <el-input-->
<!--                v-model="currentval"-->
<!--                      @keyup.delete="deleteTags"-->
<!--                      class="inputTag"-->
<!--                      ref="inputTag"-->
<!--                      id="inputTag"-->
<!--                      type="text" >-->
<!--              <template slot="prefix">-->
<!--                {{ currentval }}-->
<!--              </template>-->
<!--            </el-input>-->

          </div>

          <i class="el-icon-search searchbtn"
             @click="search()"></i>
          <i class="el-icon-close clear_search"
             @click="clear_search()"></i>

        </div>
        <div v-if="currentval && dropDown.length > 0"
             :class="currentval && dropDown.length > 0 ?'conter_is_show':''"
             class="dropDownBox">
          <div v-for="(item, index) in dropDown"
               :key="index"
               class="dropDownItem"
               @click="addTags(item)">
            <div class="dropDownTitel">{{ item.name }}:</div>
            <div class="dropDownMsg">{{ currentval }}</div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "queryTags",
  props: {
    parentArr: {
      type: Array,
      default () {
        return [];
      },
    },
    limit: {
      // 最多生成标签数，这里可以设置最多生成的标签数量
      type: Number,
    },
    dropDown: {
      type: Array,
      default () {
        return [];
      },
    },
  },
  data () {
    return {
      currentval: "",
      TagsAll: [],
      inputLength: "",
      serachParams: {},
      left_width: '',//左侧搜索词 容器
      input_left: "",//右侧输入框距离左侧距离
      minWIdth: 580,
      maxWidths: '',
      lock: false,
    };
  },
  watch: {
    TagsAll () {
      this.$emit("change", this.serachParams);
    },
    currentval (val) {
      // if(val!=''){
      //   let inputWidth=document.getElementById("#inputTag");
      //   let inputBoxWidth=document.getElementsByClassName(".inputTag");
      //   console.log(inputWidth,inputBoxWidth)
      // }
      // 
      // 实时改变input输入框宽度，防止输入内容超出input默认宽度显示不全
      // this.inputLength = this.$refs.inputTag.value.length * 12 + 50;
    },
    parentArr () {
      this.TagsAll = this.parentArr.length ? this.parentArr : [];
    },
  },
  computed: {
    inputStyle () {
      let style = {};
      style.width = `${this.inputLength}px`;
      return style;
    },
    //将生成的数据拼接成字符串，因为我们公司后台需要这种格式的数据。
    finall () {
      return this.TagsAll.join(",");
    },
  },
  mounted () {
    this.TagsAll = this.parentArr;
    // this.dropDown = this.dropDownData;

    // this.watch_width();//监听输入框宽度
  },

  methods: {
    inputFocus(){

    },
    //回车时阻止默认换行行为
    pushKeyDown(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
      }
    },
    inputValueChange(e) {
      if (!this.lock) {
        this.currentval = e.target.innerText;
        this.$nextTick(()=>{
          this.keepLastIndex(e.target)
        })
      }
    },
    onCompositionStart() {
      this.lock = true;
    },
    onCompositionEnd(e) {
      // this.currentval = e.data;
      this.lock = false;
      this.currentval = e.target.innerText;
      this.$nextTick(()=>{
        this.keepLastIndex(e.target)
      })
    },
    keepLastIndex(obj) {
      if (window.getSelection) { //ie11 10 9 ff safari
        obj.focus(); //解决ff不获取焦点无法定位问题
        let range = window.getSelection(); //创建range
        range.selectAllChildren(obj); //range 选择obj下所有子内容
        range.collapseToEnd(); //光标移至最后
      } else if (document.selection) { //ie10 9 8 7 6 5
        let range = document.selection.createRange(); //创建选择对象
        //var range = document.body.createTextRange();
        range.moveToElementText(obj); //range定位到obj
        range.collapse(false); //光标移至最后
        range.select();
      }
    },
    watch_width () {
      this.$nextTick(()=>{
        let height = this.$refs.TagsAll.scrollWidth;
        this.$refs.TagsAll.scrollTo(height,0);
      })


      // const elementResizeDetectorMaker = require("element-resize-detector");
      // const erd = elementResizeDetectorMaker()
      // const that = this
      // erd.listenTo(document.querySelector('.TagsAll_conter'), function (element) {
      //   that.input_left = element.offsetWidth
      //
      //   // 如果左侧输入宽度超过395的尺寸 则为左侧最大宽度；minWIdth 为右侧输入框墨人最小宽度
      //   if (that.input_left >= 395) {
      //     that.maxWidths = 395
      //     that.minWIdth = 185
      //   } else {
      //     // 如果没有 则右侧输入框撑满
      //     that.minWIdth = (580 - that.input_left)
      //   }
      // })
    },


    // 查询
    search () {
      // this.$emit("search", this.serachParams);
      this.$emit("search", this.TagsAll);
    },
    // 重置
    clear_search () {
      this.TagsAll = [];
      this.serachParams = {}
      // 如果内容清空后 返回默认位置
      console.log(this.TagsAll.length);
      if (this.TagsAll.length == 0) {
        this.input_left = 0;
      }
      // this.$emit("clearSearch_click", this.TagsAll, this.serachParams);
    },

    //改变参数
    changeParams(){
      let obj={};
      this.TagsAll.forEach((item)=>{
        if(obj[item.code]){
          obj[item.code]=obj[item.code]+","+item.value;
        }else{
          obj[item.code]=item.value;
        }
      })
      this.serachParams=obj;
    },
    //回车-- 增加tag
    addTags (val) {
      //新增函数中可以加一些你所需要的校验规则。比如只能是数子，或者不能输入‘，’等
      if (val) {
        if (this.currentval) {
          var obj = {};
          let arrarys = []
          if (typeof val === "string") {
            val = val + ": ";
            obj = { name: val, value: this.currentval };
          } else {
            obj = { name: val.name + ": ", value: this.currentval, code: val.code };
          }
          this.TagsAll.push(obj);


          this.changeParams();
          this.currentval = "";//清空输入的值

        }
      } else {
        this.$message({ type: "warning", message: "请选择一条类型" });
      }
      this.watch_width();
    },
    // 点击删除
    removeTag (index, item) {
      this.TagsAll.splice(index, 1);

      this.changeParams();
      // 如果内容清空后 返回默认位置
      if (this.TagsAll == []) {
        this.left_wid = '';
        this.input_left = '';
      }
    },

    //键盘删除键删除tag
    deleteTags () {
      if (this.currentval === "") {
        this.TagsAll.pop();
        this.changeParams();
      }
    },
    onclick () {
      this.$nextTick(() => {
        this.$refs.inputTag.focus();
      });
    },
  },
};
</script>

<style scoped lang="scss">
html {
  --font-color: #fff;
  --bg-color: rgba(255, 255, 255, 0.4);
}
.search_conter {
  margin: 0 auto;
  position: relative;
  width: 700px;
}
/* 外层div */
.father_box {
  box-sizing: border-box;
  background-color: white;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  word-wrap: break-word;
  overflow: hidden;
  padding: 2px 108px 2px 4px;
  box-sizing: border-box;
  border-radius: 25px;
  height: 42px;
}
/* 隐藏搜索滚动条  */
.father_box ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
}
.father_box {
  -ms-overflow-style: none;
}
.father_box {
  overflow: -moz-scrollbars-none;
}
/* 隐藏搜索滚动条 end */

.left {
  display: flex;
  min-width: 0;
  width: 100%;
  height: 100%;
  /*float: left;*/
  position: relative;
  border-radius: 25px;
}
.TagsAll_conter {
  /*position: absolute;*/
  /*left: 0;*/
  /*top: 0px;*/
  height: 36px;
  /*float: left;*/
  /* border: 1px solid blue; */
  /* width: auto;
  overflow-x: auto; */
  width: auto;
  white-space: nowrap;
  overflow-x: auto;
  /*border-radius: 25px;*/
  max-width: 100%;
}
/* .dw {
  width: 0 !important;
} */
/* 标签 */
.spanbox {
   display: inline-block;
  font-size: 14px;
  margin: 0px 4px 0px 0;
  background-color: rgb(229, 229, 229);
  /* background: #2c81fd; */
  border: 1px solid rgb(229, 229, 229);
  border-radius: 25px;
  /*display: flex;*/
  /*align-items: center;*/
  /*justify-content: center;*/
  /*width: auto;*/
  /*float: left;*/
  transition: all 3s;
  /*position: relative;*/
  /*overflow: hidden;*/
  z-index: 1;
}
.tagspan {
  height: 34px;
  line-height: 34px;
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
  color: #666;
  font-weight: 400;
  transition: all 0.3s;
}
.span_close {
  padding: 0 5px 0 4px;
  opacity: 1;
  line-height: 30px;
  filter: none;
  color: rgb(26, 26, 26, 0.8);
  font-weight: 600;
  font-size: 12px;
}

.spanbox::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background-color: var(--bg-color);
  transform-origin: center;
  transform: translate3d(-50%, -50%, 0) scale(0, 0);
  transition: transform 1000ms ease-in-out;
  background: #e7eaf0;
}
.spanbox:hover::before {
  /* transform: scale(1, 1); */
  transform: translate3d(-50%, -50%, 0) scale(15, 15);
}
/* input */
.TagsAll_conter .el-input{
  width: auto!important;
}
::v-deep .inputTag {
  /*position: absolute;*/
  /*right: 0px;*/
  /*top: 0px;*/
  font-size: 16px;
  border: none;
  box-shadow: none;
  outline: none;
  background-color: transparent;
  padding: 0;
  vertical-align: top;
  height: 34px;
  color: #495060;
  line-height: 34px;
  min-width: 10%;
  text-align: start;
  width: auto;
  /*float: left;*/
 .el-input__prefix {
   display: inline-block;
   position: relative;
   box-sizing: border-box;
   color: transparent;
   font-size: inherit;
   height: 40px;
   line-height: 40px;
   //padding: 0 30px;
   padding-left: 50px;
   left: 0;
   visibility: hidden;
  }
   .el-input__inner {
    position: absolute;
     border:none!important;
     background: transparent!important;
     //padding-left: 0!important;
  }
}
.edit-div{
  height:100%;
  line-height:34px;
  width: auto;
  display: inline-block;
  min-width: 50px;
  vertical-align: top;
  font-size: 16px;
  border: none;
  box-shadow: none;
  outline: none;
  padding-left: 20px;
}
.inputTag >>> .el-input__inner {
  border: none !important;
}
.dropDownBox {
  width: 100%;
  max-height: 200px;
  border: 1px solid #dcdee2;
  backdrop-filter: saturate(200%) blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 10px 0 rgb(0 0 0 / 10%);
  overflow: auto;
  position: absolute;
  z-index: 2000;
  border-radius: 15px;
}
.input_is_show {
  border-radius: 25px 25px 0 0 !important;
  border-bottom: 0 !important;
  backdrop-filter: saturate(200%) blur(60px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  background: #f4f6f9
    linear-gradient(134deg, #fefeff 0%, #f3f0ff 33%, #ebf5fd 70%, #f6f9ff 100%);
}
.conter_is_show {
  border-top: 0 !important;
  border-radius: 0 0 25px 25px !important;
}

.dropDownItem {
  min-height: 30px;
  line-height: 30px;
  /* margin-left: 10px; */
  color: #666 !important;
  transition: all 0.3s;
}
.dropDownItem:hover {
  cursor: pointer;
  color: #2c81fd !important;
  background: rgba(44, 129, 253, 0.2) !important;
}
.dropDownTitel {
  display: inline-block;
  width: 20%;
  text-align: right;
  margin-right: 10px;
  vertical-align: top;
}
.dropDownMsg{
  display: inline-block;
  white-space: pre-wrap;
  word-break: break-all;
  width: 78%;
}
.searchbtn {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  /* border: 1px solid; */
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgb(0 0 0 / 30%);
  transition: all 0.3s;
  cursor: pointer;
}
.clear_search {
  position: absolute;
  right: 42px;
  top: 50%;
  transform: translate(-50%, -50%);
  border-right: 1px solid rgb(0 0 0 / 30%);
  width: 40px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgb(0 0 0 / 30%);
  transition: all 0.3s;
  cursor: pointer;
}
.searchbtn:hover,
.clear_search:hover {
  color: rgb(0 0 0 / 50%) !important;
}

.inputTag >>> .el-input__inner {
  border-radius: 25px;
  padding: 0 !important;
}
.is_margin_top {
  margin-top: 2px !important;
}
/* 搜索 右侧输入框 */
.inputTag >>> .el-input__inner {
  height: 36px;
  background: none !important;
  /* background: orange !important; */
}
</style>
