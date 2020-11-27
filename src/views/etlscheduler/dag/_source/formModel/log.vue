<template>
  <span class="log-model">
    <span v-if="stateId && item.type !== 'SUB_PROCESS'">
      <slot name="history" />
      <span @click="_ckLog">
        <slot name="log" />
      </span>
    </span>
    <transition name="fade">
      <div
        v-show="isLog || source === 'list'"
        class="log-pop"
      >
        <div class="log-box">
          <div class="title">
            <span>查看日志</span>
            <div class="full-screen">
              <a
                href="javascript:"
                data-container="body"
                data-toggle="tooltip"
                title="下载日志"
                @click="_downloadLog"
              >
                <em
                  class="ans-icon-download"
                  style="font-size: 20px"
                />
              </a>
              <a
                href="javascript:"
                class="refresh-log"
                :class="loading ? 'active' :''"
                data-container="body"
                data-toggle="tooltip"
                title="刷新日志"
                @click="!loading && _refreshLog()"
              >
                <em class="ans-icon-refresh" />
              </a>
              <a
                v-show="!isScreen"
                href="javascript:"
                data-container="body"
                data-toggle="tooltip"
                title="进入全屏"
                @click="_screenOpen"
              >
                <em class="ans-icon-max" />
              </a>
              <a
                v-show="isScreen"
                href="javascript:"
                data-container="body"
                data-toggle="tooltip"
                title="取消全屏"
                @click="_screenClose"
              >
                <em class="ans-icon-min" />
              </a>
            </div>
          </div>
          <div class="content">
            <div class="content-log-box">
              <textarea
                id="textarea-log"
                class="textarea-ft"
                style="width: 100%"
                spellcheck="false"
              />
            </div>
          </div>
          <div class="operation">
            <x-button
              type="primary"
              shape="circle"
              @click="close"
            > 关闭</x-button>
          </div>
        </div>
      </div>
    </transition>
  </span>
</template>
<script>
import _ from 'lodash'
// import store from '@/components/Dolphin/store'
import store from '@/store'
// import router from '@/conf/home/router
import router from '@/router'
import { downloadFile } from '@/components/etl/download'
import $ from 'jquery'

/**
 * Calculate text size
 */
const handerTextareaSize = (isH = 0) => {
  $('body').find('.tooltip.fade.top.in').remove()
  return $('.textarea-ft').css({ 'height': `${$('.content-log-box').height() - isH}px` })
}

let content = ''

export default {
  name: 'Log',
  props: {
    item: {
      type: Object,
      default: null
    },
    source: {
      type: String,
      default: 'from'
    },
    logId: Number
  },
  data() {
    return {
      store,
      router,
      isLog: false,
      stateId: $(`#${this.item.id}`).attr('data-state-id') || null,
      isScreen: false,
      loadingIndex: 0,
      isData: true,
      loading: false
    }
  },
  methods: {
    _refreshLog() {
      this.loading = true
      this.store.dispatch('dag/getLog', this._rtParam).then(res => {
        setTimeout(() => {
          this.loading = false
          if (res.data) {
            this.$notify({
              title: '提示',
              message: `更新日志成功`,
              type: 'success',
              duration: 2000,
              position: 'bottom-right'
            })
          } else {
            this.$message.warning(`暂无更多日志`)
          }
        }, 1500)
        // Handling text field size
        handerTextareaSize().html('').text(res.data || `暂无日志`)
      }).catch(e => {
        this.$message.error(e.msg || '')
        this.loading = false
      })
    },
    _ckLog() {
      this.isLog = true
      this.store.dispatch('dag/getLog', this._rtParam).then(res => {
        this.$message.destroy()
        if (!res.data) {
          this.isData = false
          setTimeout(() => {
            this.$message.warning(`暂无更多日志`)
          }, 1000)
          // Handling text field size
          handerTextareaSize().html('').text(content || `暂无日志`)
        } else {
          this.isData = true
          content = res.data
          // Handling text field size
          handerTextareaSize().html('').text(content || `暂无日志`)

          setTimeout(() => {
            $('#textarea').scrollTop(2)
          }, 800)
        }
      }).catch(e => {
        this.$message.destroy()
        this.$message.error(e.msg || '')
      })
    },
    _screenOpen() {
      this.isScreen = true
      const $logBox = $('.log-box')
      const winW = $(window).width() - 40
      const winH = $(window).height() - 40
      $logBox.css({
        width: winW,
        height: winH,
        marginLeft: `-${parseInt(winW / 2)}px`,
        marginTop: `-${parseInt(winH / 2)}px`
      })
      $logBox.find('.content').animate({ scrollTop: 0 }, 0)
      // Handling text field size
      handerTextareaSize().html('').text(content)
    },
    _screenClose() {
      this.isScreen = false
      const $logBox = $('.log-box')
      $logBox.attr('style', '')
      $logBox.find('.content').animate({ scrollTop: 0 }, 0)
      // Handling text field size
      handerTextareaSize().html('').text(content)
    },
    /**
     * Download log
     */
    _downloadLog() {
      downloadFile('/etlscheduler/log/download-log', {
        taskInstanceId: this.stateId || this.logId
      })
    },
    /**
     * up
     */
    _onUp: _.debounce(function() {
      this.loadingIndex = this.loadingIndex - 1
      this._ckLog()
    }, 1000, {
      'leading': false,
      'trailing': true
    }),
    /**
     * down
     */
    _onDown: _.debounce(function() {
      this.loadingIndex = this.loadingIndex + 1
      this._ckLog()
    }, 1000, {
      'leading': false,
      'trailing': true
    }),
    /**
     * Monitor scroll bar
     */
    _onTextareaScroll() {
      const self = this
      $('#textarea-log').scroll(function() {
        const $this = $(this)
        // Listen for scrollbar events
        if (($this.scrollTop() + $this.height()) === $this.height()) {
          if (self.loadingIndex > 0) {
            self.$message.loading({
              content: `正在努力请求日志中...`,
              duration: 0,
              closable: false
            })
            self._onUp()
          }
        }
        // Listen for scrollbar events
        if ($this.get(0).scrollHeight === ($this.height() + $this.scrollTop())) {
          // No data is not requested
          if (self.isData) {
            self.$message.loading({
              content: `正在努力请求日志中...`,
              duration: 0,
              closable: false
            })
            self._onDown()
          }
        }
      })
    },
    /**
     * close
     */
    close() {
      $('body').find('.tooltip.fade.top.in').remove()
      this.isScreen = false
      this.isLog = false
      content = ''
      this.$emit('close')
    }
  },
  computed: {
    _rtParam() {
      return {
        taskInstanceId: this.stateId || this.logId,
        skipLineNum: parseInt(`${this.loadingIndex ? this.loadingIndex + '000' : 0}`),
        limit: parseInt(`${this.loadingIndex ? this.loadingIndex + 1 : 1}000`)
      }
    }
  },
  watch: {},
  created() {
    // Source is a task instance
    if (this.source === 'list') {
      this.$message.loading({
        content: `正在努力请求日志中...`,
        duration: 0,
        closable: false
      })
      this._ckLog()
    }
  },
  mounted() {
    this._onTextareaScroll()
  },
  updated() {
  },
  components: {}
}
</script>

<style lang="scss" rel="stylesheet/scss">
.log-pop {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
  .log-box {
    width: 660px;
    height: 520px;
    background: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -340px;
    margin-top: -250px;
    .title {
      height: 50px;
      border-bottom: 1px solid #dcdedc;
      span {
        font-size: 16px;
        color: #333;
        padding-left: 20px;
        display: inline-block;
        padding-top: 16px;
      }
      .full-screen {
        position: absolute;
        right: 20px;
        top: 12px;
        a {
          color: #0097e0;
          font-size: 12px;
          margin-left: 10px;
          i {
            vertical-align: middle;
          }
        }
        .clock {
          > i {
            font-size: 20px;
            vertical-align: middle;
            transform: scale(1);
          }
        }
        .refresh-log {
          > i {
            font-size: 20px;
            vertical-align: middle;
            transform: scale(1);
          }
          &.active {
            > i {
              -webkit-transition-property: -webkit-transform;
              -webkit-transition-duration: 1s;
              -moz-transition-property: -moz-transform;
              -moz-transition-duration: 1s;
              -webkit-animation: rotateloading 0.4s linear infinite;
              -moz-animation: rotateloading 0.4s linear infinite;
              -o-animation: rotateloading 0.4s linear infinite;
              animation: rotateloading 0.4s linear infinite;
              transform: scale(0.4);
              color: #999;
            }
          }
        }
      }
    }
    .content {
      height: calc(100% - 100px);
      background: #002a35;
      padding: 6px 2px;
      .content-log-box {
        width: 100%;
        height: 100%;
        word-break: break-all;
        textarea {
          background: none;
          color: #9cabaf;
          border: 0;
          font-family: "Microsoft Yahei,Arial,Hiragino Sans GB,tahoma,SimSun,sans-serif";
          font-weight: bold;
          resize: none;
          line-height: 1.6;
          padding: 0px;
        }
      }
    }
    .operation {
      text-align: right;
      height: 50px;
      line-height: 44px;
      border-top: 1px solid #dcdedc;
      padding-right: 20px;
      background: #fff;
      position: relative;
    }
  }
}
</style>
