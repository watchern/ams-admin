// 导出封装的组件
import indicatorAnalysis from "./src/views/index"

indicatorAnalysis.install = Vue => Vue.component(indicatorAnalysis.name, indicatorAnalysis);//注册组件

export default indicatorAnalysis
