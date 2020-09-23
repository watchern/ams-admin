
<template>
  <div class="ans-input email-model">
    <div
      class="clearfix input-element"
      :class="disabled ? 'disabled' : ''"
    >
      <span
        v-for="(item,$index) in activeList"
        :key="$index"
        class="tag-wrapper"
        :class="activeIndex === $index ? 'active' : ''"
      >
        <span class="tag-text">{{ item }}</span>
        <em
          v-if="!disabled"
          class="remove-tag ans-icon-close"
          @click.stop="_del($index)"
        />
      </span>
      <x-poptip
        v-model="isEmail"
        placement="bottom-start"
        :append-to-body="true"
        :visible-arrow="false"
        trigger="manual"
      >
        <div class="email-list-model">
          <div
            class="ans-scroller"
            style=" max-height: 300px;"
          >
            <div class="scroll-area-wrapper scroll-transition">
              <ul class="dropdown-container">
                <li
                  v-for="(item,$index) in emailList"
                  :key="$index"
                  class="ans-option"
                  @click.stop="_selectEmail($index + 1)"
                >
                  <span
                    class="default-option-class"
                    :class="index === ($index + 1) ? 'active' : ''"
                  >{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <span
          slot="reference"
          class="label-wrapper"
        >
          <!--@keydown.tab="_emailTab"-->
          <input
            ref="emailInput"
            v-model="email"
            class="email-input"
            :style="{width:emailWidth + 'px'}"
            type="text"
            :disabled="disabled"
            :placeholder="$t('Please enter email')"
            @blur="_emailEnter"
            @keydown.tab="_emailTab"
            @keyup.delete="_emailDelete"
            @keyup.enter="_emailEnter"
            @keyup.space="_emailEnter"
            @keyup.186="_emailEnter"
            @keyup.up="_emailKeyup('up')"
            @keyup.down="_emailKeyup('down')"
          >
        </span>
      </x-poptip>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import emailList from './email.js'
import { isEmial, fuzzyQuery } from './utilstart'
import $ from 'jquery'

export default {
  name: 'Email',
  model: {
    prop: 'activeList',
    event: 'valueEvent'
  },
  props: {
    activeList: Array,
    repeatData: Array,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tagModel: false,
      email: '',
      activeIndex: null,
      emailList: [],
      index: 0,
      emailWidth: 100,
      isCn: false
    }
  },
  watch: {
    email(val) {
      this._handlerEmail(val)
      // Check mailbox index initialization
      this.activeIndex = null
    },
    activeList(val) {
      this.$emit('valueEvent', val)
    }
  },
  created() {

  },
  mounted() {
    setTimeout(() => {
      // Processing width
      this._handlerEmailWitch()
    }, 500)

    // Input method judgment
    $('.email-input').on('input', function() {
      // Chinese input is not truncated
      if ($(this).prop('comStart')) return
      this.isCn = false
    }).on('compositionstart', () => {
      $(this).prop('comStart', true)
      // Check mailbox index initialization
      this.activeIndex = null
      this.isCn = true
    }).on('compositionend', () => {
      $(this).prop('comStart', false)
      // Check mailbox index initialization
      this.activeIndex = null
      this.isCn = false
    })
  },
  methods: {
    /**
     * Manually add a mailbox
     */
    _manualEmail() {
      if (this.email === '') {
        return true
      }
      this.email = _.trim(this.email).replace(/(;$)|(；$)/g, '')

      const email = this.email

      const is = (n) => {
        return _.some(_.cloneDeep(this.repeatData).concat(_.cloneDeep(this.activeList)), v => v === n)
      }

      if (isEmial(email)) {
        if (!is(email)) {
          this.emailWidth = 0
          this.activeList.push(email)
          this.email = ''
          this._handlerEmailWitch()
          return true
        } else {
          this.$message.warning(`邮箱已存在！收件人和抄送人不能重复`)
          return false
        }
      } else {
        this.$message.warning(`邮箱输入不合法`)
        return false
      }
    },
    /**
     * Processing mailbox
     */
    _handlerEmail(val) {
      if (!val) {
        this.emailList = []
        this.isEmail = false
      } else {
        const a = _.cloneDeep(this.repeatData).concat(_.cloneDeep(this.activeList))
        const b = a.concat(emailList)
        const list = fuzzyQuery(b, val)
        this.emailList = _.uniqWith(list.length && list, _.isEqual)
        this.isEmail = !!list.length
        if (this.emailList.length) {
          this.index = 1
        }
      }
    },
    /**
     * Carriage return
     */
    _emailEnter() {
      // not list Hand filling
      if (!this.emailList.length) {
        this._manualEmail()
        return
      }
      this._selectEmail(this.index)
    },
    /**
     * delete email
     */
    _emailDelete() {
      // Do not delete in case of input method in Chinese
      if (!this.isCn) {
        this.emailWidth = 0
        if (_.isInteger(this.activeIndex)) {
          this.activeList.pop()
          this.activeIndex = null
        } else {
          if (!this.email) {
            this.activeIndex = this.activeList.length - 1
          }
        }
        this._handlerEmailWitch()
      }
    },
    /**
     * click delete
     */
    _del(i) {
      this.emailWidth = 0
      this.activeList.splice(i, 1)
      this._handlerEmailWitch()
    },
    /**
     * keyup Up/down event processing
     */
    _emailKeyup(type) {
      const emailList = this.emailList.length
      if (emailList === 1) {
        this.index = 1
        return
      }
      if (emailList) {
        if (type === 'up') {
          this.index = ((i) => {
            let num
            if (i === 0 || i === 1) {
              num = emailList
            } else {
              num = i - 1
            }
            return num
          })(this.index)
        } else {
          this.index = ((i) => {
            let num
            if (i === 0 || i === emailList) {
              num = 1
            } else {
              num = i + 1
            }
            return num
          })(this.index)
        }
      }
    },
    /**
     * Check mailbox processing
     */
    _selectEmail(i) {
      const item = this.emailList[i - 1]
      this.isEmail = false
      this.email = ''

      // Non-existing data
      if (_.filter(_.cloneDeep(this.repeatData).concat(_.cloneDeep(this.activeList)), v => v === item).length) {
        this.$message.warning(`邮箱已存在！收件人和抄送人不能重复`)
        return
      }
      // Width initialization
      this.emailWidth = 0
      // Insert data
      this.activeList.push(item)
      // Calculated width
      this._handlerEmailWitch()
      // Check mailbox index initialization
      this.activeIndex = null
      setTimeout(() => {
        // Focus position
        this.$refs.emailInput.focus()
      }, 100)
    },
    /**
     * Processing width
     */
    _handlerEmailWitch() {
      setTimeout(() => {
        this.emailWidth = parseInt($('.email-model').width() - $(this.$refs.emailInput).position().left - 20)
        if (this.emailWidth < 80) {
          this.emailWidth = 200
        }
      }, 100)
    },
    /**
     * Tab event processing
     */
    _emailTab() {
      // Data processing
      this._emailEnter()
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss">
.email-model {
  width: 100%;
  .input-element {
    min-height: 32px;
    padding: 1px 8px;
    .tag-wrapper {
      display: inline-block;
      height: 22px;
      margin: 3px 8px 3px 0px;
      padding: 0 10px;
      background: #ebf8ff;
      border-radius: 2px;
      cursor: default;
      &.active {
        background: #e2eff9;
      }
      .tag-text {
        margin-right: 8px;
        font-size: 12px;
        line-height: 22px;
        color: #666;
        cursor: text;
      }
      .remove-tag {
        font-size: 12px;
        -webkit-transform: scale(0.8);
        -ms-transform: scale(0.8);
        transform: scale(0.8);
        color: #666;
        cursor: pointer;
        &:hover {
          color: #000;
        }
      }
    }
    .label-wrapper {
      margin-left: -6px;
      input {
        height: 29px;
        line-height: 29px;
        border: 0;
        padding-left: 4px;
      }
    }
    &.disabled {
      .tag-wrapper {
        background: #d9d9d9;
      }
      .email-input {
        background: none;
      }
    }
  }
}
.email-list-model {
  margin: -10px -13px;
  .ans-scroller {
    width: 230px;
    overflow-y: scroll;
    .default-option-class {
      width: 230px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .ans-option .default-option-class.active {
    background: #ebf8ff;
  }
}
</style>
