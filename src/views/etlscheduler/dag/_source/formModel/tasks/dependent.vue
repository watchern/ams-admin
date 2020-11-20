<template>
  <div class="dependence-model">
    <m-list-box>
      <div slot="text">添加依赖</div>
      <div slot="content">
        <div class="dep-opt">
          <a
            href="javascript:"
            class="add-dep"
            @click="!isDetails && _addDep()"
          >
            <em v-if="!isLoading" class="ans-icon-increase" :class="_isDetails" data-toggle="tooltip" title="Add" />
            <em v-if="isLoading" class="ans-icon-spinner2 as as-spin" data-toggle="tooltip" title="Add" />
          </a>
        </div>
        <div class="dep-box">
          <span
            v-if="dependTaskList!==null && dependTaskList.length>0"
            class="dep-relation"
            @click="!isDetails && _setGlobalRelation()"
          >
            {{ relation === 'AND' ? '且' : '或' }}
          </span>
          <div v-for="(el,$index) in dependTaskList" :key="$index" class="dep-list">
            <span
              v-if="el.dependItemList.length"
              class="dep-line-pie"
              @click="!isDetails && _setRelation($index)"
            >
              {{ el.relation === 'AND' ? '且' : '或' }}
            </span>
            <em
              class="oper-btn delete dep-delete"
              data-toggle="tooltip"
              data-container="body"
              :class="_isDetails"
              title="删除"
              @click="!isDetails && _deleteDep($index)"
            />
            <m-depend-item-list
              v-model="el.dependItemList"
              :depend-task-list="dependTaskList"
              :index="$index"
              @on-delete-all="_onDeleteAll"
              @getDependTaskList="getDependTaskList"
            />
          </div>
        </div>
      </div>
    </m-list-box>
  </div>
</template>
<script>
import _ from 'lodash'
import mListBox from './_source/listBox'
import mDependItemList from './_source/dependItemList'
import disabledState from '@/components/etl/mixin/disabledState'

export default {
  name: 'Dependence',
  components: { mListBox, mDependItemList },
  mixins: [disabledState],
  props: {
    backfillItem: Object
  },
  data() {
    return {
      relation: 'AND',
      dependTaskList: [],
      isLoading: false
    }
  },
  computed: {
    cacheDependence() {
      return {
        relation: this.relation,
        dependTaskList: _.map(this.dependTaskList, v => {
          return {
            relation: v.relation,
            dependItemList: _.map(v.dependItemList, v1 => _.omit(v1, ['depTasksList', 'state', 'dateValueList']))
          }
        })
      }
    }
  },
  watch: {
    dependTaskList(e) {
      setTimeout(() => {
        this.isLoading = false
      }, 600)
    },
    cacheDependence(val) {
      this.$emit('on-cache-dependent', val)
    }
  },
  beforeCreate() {
  },
  created() {
    const o = this.backfillItem
    const dependentResult = $(`#${o.id}`).data('dependent-result') || {}
    // Does not represent an empty object backfill
    if (!_.isEmpty(o)) {
      this.relation = _.cloneDeep(o.dependence.relation) || 'AND'
      this.dependTaskList = _.cloneDeep(o.dependence.dependTaskList) || []
      const defaultState = this.isDetails ? 'WAITING' : ''
      // Process instance return status display matches by key
      _.map(this.dependTaskList, v => _.map(v.dependItemList, v1 => v1.state = dependentResult[`${v1.definitionId}-${v1.depTasks}-${v1.cycle}-${v1.dateValue}`] || defaultState))
    }
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    _addDep() {
      if (!this.isLoading) {
        this.isLoading = true
        this.dependTaskList.push({
          dependItemList: [],
          relation: 'AND'
        })
      }
    },
    _deleteDep(i) {
      // remove index dependent
      this.dependTaskList.splice(i, 1)

      // remove tootip
      $('body').find('.tooltip.fade.top.in').remove()
    },
    _onDeleteAll(i) {
      this.dependTaskList.map((item, i) => {
        if (item.dependItemList.length === 0) {
          this.dependTaskList.splice(i, 1)
        }
      })
      // this._deleteDep(i)
    },
    _setGlobalRelation() {
      this.relation = this.relation === 'AND' ? 'OR' : 'AND'
    },
    getDependTaskList(i) {
      // console.log('getDependTaskList',i)
    },
    _setRelation(i) {
      this.dependTaskList[i].relation = this.dependTaskList[i].relation === 'AND' ? 'OR' : 'AND'
    },
    _verification() {
      this.$emit('on-dependent', {
        relation: this.relation,
        dependTaskList: _.map(this.dependTaskList, v => {
          return {
            relation: v.relation,
            dependItemList: _.map(v.dependItemList, v1 => _.omit(v1, ['depTasksList', 'state', 'dateValueList']))
          }
        })
      })
      return true
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .dependence-model {
    margin-top: -10px;
    .dep-opt {
      margin-bottom: 10px;
      padding-top: 3px;
      line-height: 24px;
      .add-dep {
        color: #0097e0;
        margin-right: 10px;
        i {
          font-size: 18px;
          vertical-align: middle;
        }
      }
    }
    .dep-list {
      margin-bottom: 16px;
      position: relative;
      border-left: 1px solid #eee;
      padding-left: 16px;
      margin-left: -16px;
      transition: all 0.2s ease-out;
      padding-bottom: 20px;
      &:hover{
        border-left: 1px solid #0097e0;
        transition: all 0.2s ease-out;
        .dep-line-pie {
          transition: all 0.2s ease-out;
          border: 1px solid #0097e0;
          background: #0097e0;
          color: #fff;
        }
      }
      .dep-line-pie {
        transition: all 0.2s ease-out;
        position: absolute;
        width: 20px;
        height: 20px;
        border: 1px solid #e2e2e2;
        text-align: center;
        top: 50%;
        margin-top: -20px;
        z-index: 1;
        left: -10px;
        border-radius: 10px;
        background: #fff;
        font-size: 12px;
        cursor: pointer;
        &::selection {
          background:transparent;
        }
        &::-moz-selection {
          background:transparent;
        }
        &::-webkit-selection {
          background:transparent;
        }
      }
      .dep-delete {
        position: absolute;
        bottom: -6px;
        left: 14px;
        font-size: 18px;
        color: #ff0000;
        cursor: pointer;
      }
    }
    .dep-box {
      border-left: 4px solid #eee;
      margin-left: -46px;
      padding-left: 42px;
      position: relative;
      .dep-relation {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 1px solid #e2e2e2;
        text-align: center;
        top: 50%;
        margin-top: -10px;
        z-index: 1;
        left: -12px;
        border-radius: 10px;
        background: #fff;
        font-size: 12px;
        cursor: pointer;
        &::selection {
          background:transparent;
        }
        &::-moz-selection {
          background:transparent;
        }
        &::-webkit-selection {
          background:transparent;
        }
      }
    }
  }
</style>
