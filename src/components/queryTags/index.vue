<template>
  <div style="width:100%;position:relative">
    <!-- 父盒子 -->
    <div class="father_box"
         @click="onclick">
      <!-- 生成的标签 -->
      <div v-for="(item, index) in TagsAll"
           :key="index"
           class="spanbox">
        <span class="tagspan">{{ item.label }}{{ item.value }}</span>
        <i class="span_close"
           @click="removeTag(index, item)"></i>
      </div>

      <!-- 输入框 -->
      <input placeholder="请输入，按<回车>以分隔"
             v-model="currentval"
             @keyup.enter="addTags"
             @keyup.delete="deleteTags"
             :style="inputStyle"
             class="inputTag"
             ref="inputTag"
             type="text" />
    </div>
    <div v-if="currentval && dropDown.length > 0"
         class="dropDownBox">
      <div v-for="(item, index) in dropDown"
           :key="index"
           class="dropDownItem"
           @click="addTags(item)">
        <div class="dropDownTitel">{{ item.name }}:</div>
        {{ currentval }}
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
    dropDownData: {
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
      dropDown: [],
      inputLength: "",
      serachParams: {}
    };
  },
  watch: {
    TagsAll () {
      this.$emit("change", this.serachParams);
    },
    currentval (val) {
      // console.log(val);
      // 实时改变input输入框宽度，防止输入内容超出input默认宽度显示不全
      this.inputLength = this.$refs.inputTag.value.length * 12 + 50;
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
    this.dropDown = this.dropDownData;
  },
  methods: {

    //回车-- 增加tag
    addTags (val) {
      //新增函数中可以加一些你所需要的校验规则。比如只能是数子，或者不能输入‘，’等
      if (this.currentval) {
        var obj = {};
        if (typeof val === "string") {
          val = val + ": ";
          obj = { label: val, value: this.currentval };
        } else {
          console.log(this.dropDown);//所有的类型
          // console.log(val.code);//选择的类型
          // console.log(this.currentval);// 输入的值
          obj = { label: val.name + ": ", value: this.currentval, code: val.code };
        }
        this.TagsAll.push(obj);
        for (let i = 0; i < this.dropDown.length; i++) {
          if (this.dropDown[i].code == obj.code) {
            this.dropDown[i].vallist.push(obj.value);
            this.serachParams[this.dropDown[i].code] = this.dropDown[i].vallist.join(',')
          }
        }
        console.log(this.serachParams);
        this.currentval = "";//清空输入的值
      }
    },
    removeTag (index, item) {
      console.log(item);
      this.TagsAll.splice(index, 1);
      console.log(this.TagsAll);
    },

    //键盘删除键删除tag
    deleteTags () {
      if (this.currentval === "") {
        this.TagsAll.pop();
        console.log(this.TagsAll);
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

<style scoped>
/* 外层div */
.father_box {
  /* width: 300px; */
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
/* 标签 */
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
  color: rgb(26, 26, 26);
  font-weight: 600;
}
.span_close {
  padding: 0 4px 0 4px;
  opacity: 1;
  -webkit-filter: none;
  filter: none;
  color: rgb(26, 26, 26);
  font-weight: 600;
}
.span_close:after {
  content: "\00D7";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* line-height: 27px; */
  transition: 0.3s, color 0s;
}
/* input */
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
.dropDownBox {
  /* min-height: 50px; */
  width: 100%;
  max-height: 200px;
  /* background-color: white; */
  border: 1px solid rgba(255, 255, 255, 1);
  backdrop-filter: saturate(200%) blur(60px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 10px 0 rgb(0 0 0 / 10%);
  overflow: auto;
  position: absolute;
  z-index: 99;
  border-radius: 10px;
}
.dropDownItem {
  height: 25px;
  line-height: 25px;
  /* margin-left: 10px; */
}
.dropDownItem:hover {
  cursor: pointer;
  color: #2c81fd !important;
  background: rgba(44, 129, 253, 0.2) !important;
}
.dropDownTitel {
  display: inline-block;
  width: 80px;
  text-align: right;
  margin-right: 20px;
}
</style>
