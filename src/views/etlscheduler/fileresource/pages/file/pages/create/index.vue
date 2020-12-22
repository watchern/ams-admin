<template>
  <m-list-construction title="创建文件">
    <template slot="content">
      <div class="resource-create-model">
        <m-list-box-f>
          <template slot="name"><strong>*</strong>文件名称</template>
          <template slot="content">
            <x-input
              v-model="fileName"
              type="input"
              maxlength="60"
              style="width: 300px;"
              placeholder="请输入名称"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name"><strong>*</strong>文件格式</template>
          <template slot="content">
            <x-select v-model="suffix" style="width: 100px;" @on-change="_onChange">
              <x-option
                v-for="city in fileTypeList"
                :key="city"
                :value="city"
                :label="city"
              />
            </x-select>
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">文件描述</template>
          <template slot="content">
            <x-input
              v-model="description"
              type="textarea"
              style="width: 430px;"
              placeholder="请输入名称"
              autocomplete="off"
            />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name"><strong>*</strong>文件内容</template>
          <template slot="content">
            <textarea id="code-create-mirror" name="code-create-mirror" />
          </template>
        </m-list-box-f>
        <m-list-box-f>
          <template slot="name">&nbsp;</template>
          <template slot="content">
            <div class="submit">
              <x-button type="primary" shape="circle" :loading="spinnerLoading" @click="ok()">{{ spinnerLoading ? 'Loading...' : '创建' }} </x-button>
              <x-button type="text" @click="() => $router.push({name: 'fileResource'})"> 取消 </x-button>
            </div>
          </template>
        </m-list-box-f>
      </div>
    </template>
  </m-list-construction>
</template>
<script>
import { mapActions } from 'vuex'
import { filtTypeArr } from '../_source/common'
import { handlerSuffix } from '../details/_source/utils'
import codemirror from '@/components/etl/file/codemirror'
import mListBoxF from '@/components/etl/listBoxF/listBoxF'
import mListConstruction from '@/components/etl/listConstruction/listConstruction'
import $ from 'jquery'

let editor
export default {
  name: 'ResourceListCreateFILE',
  props: {},
  data() {
    return {
      suffix: 'sh',
      fileName: '',
      description: '',
      fileTypeList: filtTypeArr,
      content: '',
      pid: -1,
      currentDir: '/',
      spinnerLoading: false
    }
  },
  methods: {
    ...mapActions('resource', ['createResourceFile']),
    ok() {
      if (this._validation()) {
        this.spinnerLoading = true
        this.createResourceFile({
          type: 'FILE',
          pid: this.pid,
          currentDir: this.currentDir,
          fileName: this.fileName,
          suffix: this.suffix,
          description: this.description,
          content: editor.getValue()
        }).then(res => {
          this.$notify({
            title: this.$t('message.title'),
            message: res.msg,
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          setTimeout(() => {
            this.spinnerLoading = false
            this.$router.push({ name: 'file' })
          }, 800)
        }).catch(e => {
          this.$message.error(e.msg || '')
          this.spinnerLoading = false
        })
      }
    },
    _validation() {
      if (!this.fileName) {
        this.$message.warning(`请输入数据源名称`)
        return false
      }
      if (!editor.getValue()) {
        this.$message.warning(`请输入资源内容`)
        return false
      }
      if (editor.doc.size > 3000) {
        this.$message.warning(`资源内容不能超过3000行`)
        return false
      }

      return true
    },
    /**
       * Processing code highlighting
       */
    _handlerEditor() {
      // editor
      editor = codemirror('code-create-mirror', {
        mode: 'shell',
        readOnly: false
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
    },
    _onChange(val) {
      editor.setOption('mode', handlerSuffix['.' + val.label])
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
    this.$modal.destroy()
    this._handlerEditor()
  },
  destroyed() {
    editor.toTextArea() // uninstall
    editor.off($('.code-create-mirror'), 'keypress', this.keypress)
  },
  components: { mListConstruction, mListBoxF }
}
</script>

<style lang="scss" rel="stylesheet/scss">
  .resource-create-model {
    padding: 30px;
  }
  .CodeMirror {
    border:1px solid #DDDEDD;
    border-radius: 3px;
  }
</style>
