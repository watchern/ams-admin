<template>
  <div class="statement-list-model">
    <div
      v-for="(item,$index) in localStatementList"
      :key="item.id"
      class="select-listpp"
      @click="_getIndex($index)"
    >
      <x-input
        v-model="localStatementList[$index]"
        :disabled="isDetails"
        type="textarea"
        resize="none"
        :autosize="{minRows:1}"
        placeholder="请输入非查询sql语句"
        style="width: 500px;"
        @on-blur="_verifProp()"
      />
      <span v-if="!isDetails" class="lt-add">
        <a
          href="javascript:"
          @click="!isDetails && _removeStatement($index)"
        >
          <span
            class="oper-btn delete"
            :class="_isDetails"
            data-toggle="tooltip"
            title="删除"
          />
        </a>
      </span>
      <span
        v-if="$index === (localStatementList.length - 1) && !isDetails"
        class="add"
      >
        <a
          href="javascript:"
          @click="!isDetails && _addStatement()"
        >
          <span
            class="oper-btn add"
            :class="_isDetails"
            data-toggle="tooltip"
            title="添加"
          />
        </a>
      </span>
    </div>
    <span
      v-if="!localStatementList.length && !isDetails"
      class="add"
      style="top:0"
    >
      <a
        href="javascript:"
        @click="!isDetails && _addStatement()"
      >
        <span
          class="oper-btn add"
          :class="_isDetails"
          data-toggle="tooltip"
          title="添加"
        />
      </a>
    </span>
  </div>
</template>
<script>
import _ from 'lodash'
import disabledState from '@/components/etl/mixin/disabledState'
export default {
  name: 'UserDefStatements',
  components: {},
  mixins: [disabledState],
  props: {
    statementList: Array
  },
  data() {
    return {
      // Increased data
      localStatementList: [],
      // Current execution index
      localStatementIndex: null
    }
  },
  watch: {
    // Monitor data changes
    statementList() {
      this.localStatementList = this.statementList
    }
  },
  created() {
    this.localStatementList = this.statementList
  },
  mounted() {
  },
  methods: {
    /**
     * Current index
     */
    _getIndex(index) {
      this.localStatementIndex = index
    },
    /**
     * delete item
     */
    _removeStatement(index) {
      this.localStatementList.splice(index, 1)
      this._verifProp('value')
    },
    /**
     * add
     */
    _addStatement() {
      this.localStatementList.push('')
    },
    /**
     * blur verification
     */
    _handleValue() {
      this._verifProp('value')
    },
    /**
     * Verify that the value exists or is empty
     */
    _verifProp(type) {
      const arr = []
      let flag = true
      _.map(this.localStatementList, v => {
        arr.push(v)
        if (!v) {
          flag = false
        }
      })
      if (!flag) {
        if (!type) {
          this.$message.warning(`前置/后置sql语句不能为空`)
        }
        return false
      }

      this.$emit('on-statement-list', _.cloneDeep(this.localStatementList))
      return true
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.statement-list-model {
  .select-listpp {
    margin-bottom: 6px;
    .lt-add {
      position:relative;
      top:-8px;
      margin: 2px;
      padding-left: 4px;
      a {
        // em{
        //   vertical-align: middle;
        //   margin-bottom: 15px;
        //   display: inline-block;
        // }
        .iconfont {
          font-style:normal;
          font-size: 18px;
          vertical-align: middle;
          margin-bottom: -2px;
          display: inline-block;
        }
      }
    }
  }
  .add {
    position:relative;
    top:-4px;
    a {
      .iconfont {
        font-style:normal;
        font-size: 16px;
        vertical-align: middle;
        display: inline-block;
        margin-top: -5px;
      }
    }
  }
}
</style>
