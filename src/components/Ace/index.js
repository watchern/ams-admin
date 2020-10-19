import NewAgGrid from '@/components/Ace/new-ag-grid/index'
import NewInput from '@/components/Ace/form/new-input'
import NewTree from '@/components/Ace/new-tree/index'
import newCheckboxGroup from '@/components/Ace/form/new-checkbox-group'
import newSelect from '@/components/Ace/form/new-select'
import newCard from '@/components/Ace/base/new-card'
import newCalender from '@/components/Ace/base/new-calender'
import newDropdown from '@/components/Ace/base/new-dropdown'
import ToolsTemplate from '@/components/Ace/base/tools-template'
import NewTime from '@/components/Ace/base/new-time'
import AceAlert from '@/components/Ace/ace-alert/index'
import AceDialog from '@/components/Ace/ace-dialog/index'
import AceSelect from '@/components/Ace/ace-select/index'
import AceSelectCalender from '@/components/Ace/ace-select-calender/index'
import AceProgress from '@/components/Ace/ace-progress/index'
export default {
  install(Vue) {
    Vue.component('new-ag-grid', NewAgGrid)
    Vue.component('new-input', NewInput)
    Vue.component('new-tree', NewTree)
    Vue.component('new-checkbox-group', newCheckboxGroup)
    Vue.component('new-select', newSelect)
    Vue.component('new-card', newCard)
    Vue.component('new-calender', newCalender)
    Vue.component('new-dropdown', newDropdown)
    Vue.component('tools-template', ToolsTemplate)
    Vue.component('new-time', NewTime)
    Vue.component('ace-alert', AceAlert)
    Vue.component('ace-dialog', AceDialog)
    Vue.component('ace-select', AceSelect)
    Vue.component('ace-select-calender', AceSelectCalender)
    Vue.component('ace-progress', AceProgress)
  }
}
