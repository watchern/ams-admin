import NewAgGrid from '@/components/public/new-ag-grid/index'
import NewInput from '@/components/public/form/new-input'
import NewTree from '@/components/public/new-tree/index'
import newCheckboxGroup from '@/components/public/form/new-checkbox-group'
import newSelect from '@/components/public/form/new-select'
import newCard from '@/components/public/base/new-card'
import newCalender from '@/components/public/base/new-calender'
import ToolsTemplate from '@/components/public/base/tools-template'
import NewTime from '@/components/public/base/new-time'
// import AceAlert from '@/components/public/ace-alert/index'
// import AceDialog from '@/components/public/ace-dialog/index'
// import AceSelect from '@/components/public/ace-select/index'
// import AceSelectCalender from '@/components/public/ace-select-calender/index'
// import AceProgress from '@/components/public/ace-progress/index'

export default {
  install(Vue) {
    Vue.component('new-ag-grid', NewAgGrid)
    Vue.component('new-input', NewInput)
    Vue.component('new-tree', NewTree)
    Vue.component('new-checkbox-group', newCheckboxGroup)
    Vue.component('new-select', newSelect)
    Vue.component('new-card', newCard)
    Vue.component('new-calender', newCalender)
    Vue.component('tools-template', ToolsTemplate)
    Vue.component('new-time', NewTime)
    // Vue.component('ace-alert', AceAlert)
    // Vue.component('ace-dialog', AceDialog)
    // Vue.component('ace-select', AceSelect)
    // Vue.component('ace-select-calender', AceSelectCalender)
    // Vue.component('ace-progress', AceProgress)
  }
}
