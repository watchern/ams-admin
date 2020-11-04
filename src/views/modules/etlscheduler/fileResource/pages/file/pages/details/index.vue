<template>
  <m-list-construction title="文件详情">
    <div slot="content" style="margin: 20px">
      <div class="file-details-content">
        <h2>
          <span>{{ name }}</span>
          <div class="down">
            <em class="ans-icon-download" style="font-size:20px" data-container="body" data-toggle="tooltip" title="下载详情" @click="_downloadFile" />
            <em>{{ size }}</em>
          </div>
        </h2>
        <template v-if="isNoType">

          <div v-if="!msg" class="code-mirror-model">
            <textarea id="code-details-mirror" name="code-details-mirror" />
          </div>

          <m-no-data v-if="msg" :msg="msg" />

        </template>
        <template v-if="!isNoType">
          <m-no-type />
        </template>
      </div>
      <m-spin :is-spin="isLoading" />
    </div>
  </m-list-construction>
</template>
<script>
import _ from 'lodash'
import { mapActions } from 'vuex'
import mNoType from './_source/noType'
import { filtTypeArr } from '../_source/common'
import codemirror from '../_source/codemirror'
import { handlerSuffix } from './_source/utils'
import { downloadFile } from '@/components/Dolphin/download'
import { bytesToSize } from '@/components/Dolphin/util/util'
import mSpin from '@/components/Dolphin/spin/spin'
import localStore from '@/components/Dolphin/util/localStorage'
import mNoData from '@/components/Dolphin/noData/noData'
import mListConstruction from '@/components/Dolphin/listConstruction/listConstruction'
import $ from 'jquery'

let editor

export default {
  name: 'FileDetails',
  props: {},
  data() {
    return {
      name: '',
      isNoType: true,
      isLoading: false,
      filtTypeArr: filtTypeArr,
      loadingIndex: 0,
      mode: 'python',
      isData: true,
      size: null,
      msg: ''
    }
  },
  methods: {
    ...mapActions('resource', ['getViewResources', 'updateContent']),
    _go() {
      this.$router.push({ name: 'file' })
    },
    _downloadFile() {
      downloadFile('/dolphinscheduler/resources/download', {
        id: this.$route.params.id
      })
    },
    _getViewResources() {
      this.isLoading = true
      this.isData = true
      this.msg = ''
      this.getViewResources(this._rtParam).then(res => {
        this.name = res.data.alias.split('.')[0]
        if (!res.data) {
          this.isData = false
        } else {
          this.isData = true
          this._handlerEditor().setValue(res.data.content + '\n')

          // Initialize the plugin to prevent repeated calls
          if (editor.lineCount() < 1000) {
            this.isData = false
          }

          setTimeout(() => {
            $('.code-mirror-model').scrollTop(12).scrollLeft(0)
          }, 200)
        }
        this.isLoading = false
      }).catch(e => {
        this.msg = e.msg || 'error'
        this.$message.error(e.msg || '')
        // this._handlerEditor().setValue('')
        this.isLoading = false
      })
    },
    /**
       * up
       */
    _onUp: _.debounce(function() {
      this.loadingIndex = this.loadingIndex - 3
      console.log('_onUp')
      this._editorOff()

      this._getViewResources()
    }, 1000, {
      'leading': false,
      'trailing': true
    }),
    /**
       * down
       */
    _onDown: _.debounce(function() {
      this.loadingIndex = this.loadingIndex + 3
      console.log('_onDown')
      this._editorOff()

      this._getViewResources()
    }, 1000, {
      'leading': false,
      'trailing': true
    }),
    /**
       * off handle
       */
    _editorOff() {
      editor = null
      $('.CodeMirror').remove()
    },
    /**
       * Processing code highlighting
       */
    _handlerEditor() {
      const h = $('.home-main').height() - 160

      editor = codemirror('code-details-mirror', {
        mode: this.mode
      })

      editor.display.wrapper.style.height = `${h}px`

      this.scroll = ({ doc }) => {
        const scrollTop = doc.scrollTop
        const totalHeight = doc.height

        // down
        if ((scrollTop + h) > totalHeight) {
          if (this.isData) {
            // this._onDown()
          }
        }
        // up
        if (scrollTop < 3) {
          if (this.loadingIndex > 0) {
            this._onUp()
          }
        }
      }

      editor.on('scroll', this.scroll)
      return editor
    }
  },
  computed: {
    _rtParam() {
      return {
        id: this.$route.params.id,
        skipLineNum: parseInt(`${this.loadingIndex ? this.loadingIndex + '000' : 0}`),
        limit: parseInt(`${this.loadingIndex ? this.loadingIndex + 3 : 3}000`)
      }
    }
  },
  watch: {
  },
  created() {
    const file = _.split(localStore.getItem('file'), '|', 2)
    const fileName = file[0]
    const fileSize = file[1]
    const i = fileName.lastIndexOf('.')
    const a = fileName.substring(i, fileName.length)
    this.mode = handlerSuffix[a]
    this.size = bytesToSize(parseInt(fileSize))
    this.isNoType = _.includes(this.filtTypeArr, _.trimStart(a, '.'))
  },
  mounted() {
    if (this.isNoType) {
      // get data
      this._getViewResources()
    }
  },
  destroyed() {
    if (editor) {
      editor.toTextArea()
      editor.off($('.code-details-mirror'), 'scroll', this.scroll)
    }
  },
  components: { mListConstruction, mNoType, mSpin, mNoData }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .file-details-content {
    width: 100%;
    background: #fff;
    padding-bottom: 20px;
    >h2 {
      line-height: 60px;
      text-align: center;
      padding-bottom: 6px;
      position: relative;
      .down {
        position: absolute;
        right: 0;
        top: 0;
        >i {
          font-size: 20px;
          color: #2d8cf0;
          cursor: pointer;
          vertical-align: middle;
        }
        em {
          font-size: 12px;
          font-style: normal;
          vertical-align: middle;
          color: #777;
          margin-left: -2px;
        }
      }
    }
  }
  .file-operation {
    padding: 30px 0;
    text-align: center;
  }
</style>
