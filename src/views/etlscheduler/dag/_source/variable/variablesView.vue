<template>
  <div class="variable-model">
    <template v-if="list">
      <div class="list">
        <div class="name"><em class="fa ans-icon-code" /><strong style="padding-top: 3px;display: inline-block">全局参数</strong></div>
        <div class="var-cont">
          <template v-for="(item,$index) in list.globalParams">
            <x-button
              :key="$index"
              size="xsmall"
              type="ghost"
              :data-clipboard-text="item.prop + ' = ' +item.value"
              :class="'gbudp-' + $index"
              @click="_copy('gbudp-' + $index)"
            >
              <strong style="color: #2A455B;">{{ item.prop }}</strong> = {{ item.value }}
            </x-button>
          </template>
        </div>
      </div>
      <div
        class="list"
        style="height: 30px;"
      >
        <div class="name"><em class="fa ans-icon-code" /><strong style="padding-top: 3px;display: inline-block">局部参数</strong></div>
        <div class="var-cont">
          &nbsp;
        </div>
      </div>
      <div
        v-for="(item,key,$index) in list.localParams"
        :key="$index"
        class="list list-t"
      >
        <div class="task-name">Task({{ $index }})：{{ key }}</div>
        <div
          v-if="item.localParamsList.length"
          class="var-cont"
        >
          <template v-for="(el,index) in item.localParamsList">
            <x-button
              :key="index"
              size="xsmall"
              type="ghost"
              :data-clipboard-text="_rtClipboard(el,item.taskType)"
              :class="'copy-part-' + index"
              @click="_copy('copy-part-' + index)"
            >
              <span
                v-for="(e,k,i) in el"
                :key="i"
              >
                <template v-if="item.taskType === 'SQL' || item.taskType === 'PROCEDURE'">
                  <template v-if="(k !== 'direct' && k !== 'type')">
                    <strong style="color: #2A455B;">{{ k }}</strong> = {{ e }}
                  </template>
                </template>
                <template v-else>
                  <strong style="color: #2A455B;">{{ k }}</strong> = {{ e }}
                </template>
              </span>
            </x-button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import Clipboard from 'clipboard'

export default {
  name: 'VariablesView',
  props: {},
  data() {
    return {
      list: {}
    }
  },
  methods: {
    ...mapActions('dag', ['getViewvariables']),
    /**
     * Get variable data
     */
    _getViewvariables() {
      this.getViewvariables({
        processInstanceId: this.$route.params.id
      }).then(res => {
        this.list = res.data
      }).catch(e => {
        this.$message.error(e.msg || '')
      })
    },
    /**
     * Click to copy
     */
    _copy(className) {
      const clipboard = new Clipboard(`.${className}`)
      clipboard.on('success', e => {
        this.$message.success(`复制成功`)
        // Free memory
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        // Copy is not supported
        this.$message.warning(`该浏览器不支持自动复制`)
        // Free memory
        clipboard.destroy()
      })
    },
    /**
     * Copyed text processing
     */
    _rtClipboard(el, taskType) {
      const arr = []
      Object.keys(el).forEach((key) => {
        if (taskType === 'SQL' || taskType === 'PROCEDURE') {
          if (key !== 'direct' && key !== 'type') {
            arr.push(`${key}=${el[key]}`)
          }
        } else {
          arr.push(`${key}=${el[key]}`)
        }
      })
      return arr.join(' ')
    }
  },
  watch: {},
  created() {
    this._getViewvariables()
  },
  mounted() {
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.variable-model {
  padding: 10px;
  padding-bottom: 5px;
  .list {
    position: relative;
    min-height: 30px;
    .var-cont {
      padding-left: 19px;
      > button {
        margin-bottom: 6px;
        margin-right: 6px;
      }
    }
    .name {
      padding-bottom: 10px;
      font-size: 16px;
      > .fa {
        font-size: 16px;
        color: #0097e0;
        margin-right: 4px;
        vertical-align: middle;
        font-weight: bold;
      }
      > b {
        vertical-align: middle;
      }
    }
    > span {
      height: 28px;
      line-height: 28px;
      padding: 0 8px;
      background: #2d8cf0;
      display: inline-block;
      margin-bottom: 8px;
      color: #fff;
    }
  }
  .list-t {
    padding-left: 0px;
    margin-bottom: 10px;
    .task-name {
      padding-left: 19px;
      padding-bottom: 8px;
      font-size: 12px;
      font-weight: bold;
      color: #0097e0;
    }
  }
}
</style>
