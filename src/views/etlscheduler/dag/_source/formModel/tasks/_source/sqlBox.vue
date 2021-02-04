<template>
  <div class="sql-model">
    <m-list-box>
      <div slot="content">
        <div class="from-mirror1">
          <textarea
            id="code-sql-mirror1"
            name="code-sql-mirror1"
            style="opacity: 0"
          />
        </div>
      </div>
    </m-list-box>
    <a class="ans-modal-box-close">
      <em
        class="ans-icon-min"
        @click="closeModal"
      />
    </a>
  </div>
</template>
<script>
import _ from 'lodash'
import mListBox from './listBox'
import disabledState from '@/components/etl/mixin/disabledState'
import codemirror from '@/components/etl/file/codemirror'
import $ from 'jquery'
let editor

export default {
  name: 'Sql',
  components: { mListBox },
  mixins: [disabledState],
  props: {
    item: String
  },
  data() {
    return {
      // script
      sql: ''
    }
  },
  watch: {},
  created() {
    const o = this.item

    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.sql = o
    }
  },
  mounted() {
    setTimeout(() => {
      this._handlerEditor()
    }, 200)
  },
  destroyed() {
    if (editor) {
      editor.toTextArea() // Uninstall
      editor.off($('.code-sql-mirror1'), 'keypress', this.keypress)
      editor.off($('.code-sql-mirror1'), 'changes', this.changes)
    }
  },
  methods: {
    /**
     * Processing code highlighting
     */
    _handlerEditor() {
      // editor
      const self = this
      editor = codemirror('code-sql-mirror1', {
        mode: 'sql',
        readOnly: this.isDetails
      })
      editor.on('change', function() {
        self.$emit('getSriptBoxValue', editor.getValue())
      })
      this.keypress = () => {
        if (!editor.getOption('readOnly')) {
          editor.showHint(
            {
              completeSingle: false
            }
          )
        }
      }

      this.changes = () => {
        // editor.showHint()
        this._cacheParams()
      }

      // Monitor keyboard
      editor.on('keypress', this.keypress)

      // editor.on('changes', this.changes)

      // 代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
      editor.on('cursorActivity', this.changes)

      editor.setValue(this.sql)

      return editor
    },
    closeModal() {
      const self = this
      self.$emit('closeAble')
    }
  }
}
</script>
<style lang="scss" rel="stylesheet/scss" scope>
.sql-model {
  width: 100%;
}
.from-mirror1 {
  .CodeMirror {
    min-height: 600px;
    max-height: 700px;
  }
}
</style>
