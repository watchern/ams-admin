<template>
  <div class="script-model">
    <m-list-box>
      <div slot="content">
        <div class="from-mirror1">
          <textarea
            id="code-shell-mirror1"
            name="code-shell-mirror1"
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
import disabledState from '@/components/Dolphin/mixin/disabledState'
import codemirror from '@/components/Dolphin/file/codemirror'
import $ from 'jquery'
let editor

export default {
  name: 'Shell',
  components: { mListBox },
  mixins: [disabledState],
  props: {
    item: String
  },
  data() {
    return {
      // script
      rawScript: ''
    }
  },
  watch: {},
  created() {
    const o = this.item

    // Non-null objects represent backfill
    if (!_.isEmpty(o)) {
      this.rawScript = o
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
      editor.off($('.code-shell-mirror1'), 'keypress', this.keypress)
    }
  },
  methods: {
    /**
     * Processing code highlighting
     */
    _handlerEditor() {
      // editor
      const self = this
      editor = codemirror('code-shell-mirror1', {
        mode: 'shell',
        readOnly: this.isDetails
      })
      editor.on('change', function() {
        self.$emit('getSriptBoxValue', editor.getValue())
      })

      this.keypress = () => {
        if (!editor.getOption('readOnly')) {
          editor.showHint({
            completeSingle: false
          })
        }
      }

      // Monitor keyboard
      editor.on('keypress', this.keypress)

      editor.setValue(this.rawScript)

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
.script-model {
  width: 100%;
}
.from-mirror1 {
  .CodeMirror {
    min-height: 600px;
    max-height: 700px;
  }
}
</style>
