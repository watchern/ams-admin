<template>
  <div id="remarkContent" />
</template>

<script>
var type = getParams().type
export default {
  name: 'SettingRemark',
  mounted() {
    this.initHtml()
  },
  methods: {
    initHtml() {
      var html = ''
      switch (type) {
        case 'filter':					// 数据筛选
          html += '<p>1、布局说明：页面布局分为填写筛选条件区域和生成筛选条件树的区域</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）填写筛选条件区域：选择筛选字段&nbsp;→&nbsp;选择操作类型&nbsp;→&nbsp;填写筛选的值或者勾选【空值】&nbsp;→&nbsp;选择筛选属性（与/或分别代表的是and/or）&nbsp;→&nbsp;点击【添加条件】按钮生成筛选条件</p>"
          html += "<p class='indent2'>（2）生成筛选条件树区域：生成的筛选条件将以树节点列表形式展现</p>"
          html += "<p class='indent4'>①&nbsp;修改条件：点击选中左侧节点&nbsp;→&nbsp;填写筛选条件区域反显选择筛选条件&nbsp;→&nbsp;重新编辑条件&nbsp;→&nbsp;点击【修改条件】按钮更新选择的筛选条件</p>"
          html += "<p class='indent4'>②&nbsp;删除条件：点击选中左侧节点&nbsp;→&nbsp;点击【删除条件】按钮&nbsp;→&nbsp;移除生成筛选条件树上已选择的筛选条件，支持Ctrl多选删除</p>"
          html += "<p class='indent4'>③&nbsp;增加括号：点击选中左侧节点（至少选择两条）&nbsp;→&nbsp;点击【增加括号】按钮&nbsp;→&nbsp;将已选择的筛选条件进行合并处理，支持Ctrl多选</p>"
          html += "<p class='indent4'>④&nbsp;删除括号：点击选中左侧节点&nbsp;→&nbsp;点击【删除括号】按钮&nbsp;→&nbsp;将已选择的筛选条件进行拆分处理，每次只能选择一个节点</p>"
          break
        case 'sort':					// 数据排序
          html += '<p>1、布局说明：页面布局分为待选择排序字段列表和已选择排序字段列表</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）在左侧列表中勾选要排序的字段&nbsp;→&nbsp;点击【>>】按钮将选择的字段添加到右侧已选择排序字段列表中；</p>"
          html += "<p class='indent2'>（2）在右侧列表中勾选已排序的字段&nbsp;→&nbsp;点击【<<】按钮将选择的字段从右侧已选择排序字段列表中移除；</p>"
          html += "<p class='indent2'>（3）在右侧列表中，可通过直接拖拽调整排序字段的优先级顺序，可通过下拉框选择排序字段的排序方式（升序或降序，默认升序）</p>"
          break
        case 'sample':				// 数据抽样
          html += '<p>选项说明：</p>'
          html += "<p class='indent2'>（1）样本量（个）：抽取结果集中固定的个数的数据</p>"
          html += "<p class='indent2'>（2）比例（%）：抽取结果集中固定比例的数据</p>"
          html += "<p class='indent2'>（3）前N个：抽取结果集中前N个的数据</p>"
          html += "<p class='indent2'>（4）等距抽样：每隔相同的步长抽取结果集中的数据</p>"
          break
        case 'layering':			// 数据分层
          html += '<p>1、布局说明：页面布局分为分层字段选择区域和分层区间列表区域</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）选择分层字段，选择字段后，如果结果集中该列的数据不全为空，则会显示该字段的最大值与最小值，否则显示无</p>"
          html += "<p class='indent2'>（2）点击【增加区间】按钮，在分层区间列表中增加一行分层设置</p>"
          html += "<p class='indent2'>（3）分层区间输入框内即可键入内容，也可点击输入框右侧的【上】【下】实现自增自减，步长为1</p>"
          html += "<p class='indent2'>（4）可点击红色【X】号，移除该行的分层配置</p>"
          html += '<p>3、规则说明：分层字段必须是类型为数值型或日期形式，分层区间的输入值必须是数值或日期</p>'
          break
        case 'groupCount':		// 分组汇总
          html += '<p>1、分组设置：</p>'
          html += "<p class='indent2'>（1）布局说明：左侧列表包含所有待选择的分组字段，右侧列表是已选择的分组字段；</p>"
          html += "<p class='indent2'>（2）操作说明：</p>"
          html += "<p class='indent4'>①&nbsp;在左侧列表中勾选要分组的字段&nbsp;→&nbsp;点击【>>】按钮将选择的字段添加到右侧已选择分组字段列表中；</p>"
          html += "<p class='indent4'>②&nbsp;在右侧列表中勾选已分组的字段&nbsp;→&nbsp;点击【<<】按钮将选择的字段从右侧已选择分组字段列表中移除；</p>"
          html += '<p>2、汇总设置：</p>'
          html += "<p class='indent2'>（1）布局说明：左侧列表包含所有待选择的汇总字段，右侧列表是已选择的汇总字段；</p>"
          html += "<p class='indent2'>（2）操作说明：</p>"
          html += "<p class='indent4'>①&nbsp;在左侧列表中勾选要汇总的字段&nbsp;→&nbsp;点击【>>】按钮将选择的字段添加到右侧已选择汇总字段列表中；</p>"
          html += "<p class='indent4'>②&nbsp;在右侧列表中勾选已汇总的字段&nbsp;→&nbsp;点击【<<】按钮将选择的字段从右侧已选择汇总字段列表中移除；</p>"
          html += '<p>3、规则说明：</p>'
          html += "<p class='indent2'>（1）分组汇总配置主要以【分组设置】为主，即【汇总设置】中可使用字段会根据【分组设置】的变化而变化</p>"
          html += "<p class='indent2'>（2）【汇总设置】的左侧列表中的字段来源于【分组设置】的左侧列表字段</p>"
          html += "<p class='indent2'>（3）已存在于【分组设置】的右侧列表中的字段不会出现在【汇总设置】的左侧和右侧列表中，即同一字段不能同时设置成分组和汇总</p>"
          html += "<p class='indent2'>（4）已设置成汇总的字段，若再次将该字段设置成分组字段时，【汇总设置】的右侧列表中会自动移除该字段</p>"
          html += "<p class='indent2'>（5）已设置成分组和汇总的字段将作为结果集的输出字段且不可手动修改</p>"
          break
        case 'delRepeat':			// 数据去重
          html += '<p>1、布局说明：页面布局分为待选择去重字段列表和已选择去重字段列表</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）在左侧列表中勾选要去重的字段&nbsp;→&nbsp;点击【>>】按钮将选择的字段添加到右侧已选择去重字段列表中；</p>"
          html += "<p class='indent2'>（2）在右侧列表中勾选已去重的字段&nbsp;→&nbsp;点击【<<】按钮将选择的字段从右侧已选择去重字段列表中移除；</p>"
          html += '<p>3、规则说明：已设置成去重的字段将作为结果集的输出字段且不可手动修改</p>'
          break
        case 'comparison':		// 数据频次分析
          html += '<p>1、例子：分析【表A】的【姓名】字段和【表B】的【客户名称】字段中【张三】在【表A】和【表B】中出现的次数</p>'
          html += '<p>2、名词解释：</p>'
          html += "<p class='indent2'>（1）分析内容：指要分析的表中的数据，即例子中的【张三】</p>"
          html += "<p class='indent2'>（2）出现频次：指要分析的表中的数据在各个表中出现的次数，即例子中的【张三】在【表A】和【表B】中出现的次数</p>"
          html += "<p class='indent2'>（3）自助分析：勾选后，系统将自动分析所选取表字段的全部内容，此时分析内容输入框为不可编辑，即分析例子中【表A】的【姓名】字段和【表B】的【客户名称】字段中的全部内容</p>"
          html += "<p class='indent2'>（4）忽略空值：勾选后，系统将自动去除要分析内容所属字段中为空的数据，即去除例子中【姓名】字段和【客户名称】字段中为空的数据</p>"
          html += '<p>3、操作说明：选择分析内容的条件并且输入分析内容的值或者直接勾选自动分析设置&nbsp;→&nbsp;选择出现频次的条件并且输入出现频次的值&nbsp;→&nbsp;选择性勾选忽略空值设置&nbsp;→&nbsp;选择结果表的对应分析字段</p>'
          break
        case 'change':				// 数据转码
          html += '<p>1、操作说明：</p>'
          html += "<p class='indent2'>（1）点击【添加】按钮，转码列表中增加一行配置信息&nbsp;→&nbsp;选择字段名称&nbsp;→&nbsp;点击【选择】按钮，在弹出的窗口列表中选择转码规则</p>"
          html += "<p class='indent2'>（2）可点击【删除】按钮，移除本行转码配置</p>"
          html += '<p>2、规则说明：同一个字段不能设置多个转码规则</p>'
          break
        case 'union':				// 数据合并
          html += '<p>1、布局说明：页面分为左侧和右侧两个列表，分别展现两个来源结果表中需要处理的字段</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）点击先后点击左右两侧的【选择数据】按钮，在打开的弹窗中选择需要处理的结果集字段&nbsp;→&nbsp;选择数据处理方式（合并、交集、补集）</p>"
          html += "<p class='indent2'>（2）可点击【交换表】按钮，交换左右两侧字段列表</p>"
          html += '<p>3、规则说明：</p>'
          html += "<p class='indent2'>（1）左右两侧所选择的字段的类型必须保持一致，可通过直接拖拽调整上下顺序，进而调整对应关系</p>"
          html += "<p class='indent2'>（2）配置后所展现的结果集字段为左侧列表中选择的字段，即左侧表为主表，将右侧表的数据追加到左侧表，可通过【交换表】按钮调整表间主从关系</p>"
          html += "<p class='indent2'>（3）仅支持同时处理两张表之间的数据</p>"
          html += '<p>4、图例（点击链接查看）：</p>'
          html += "<p class='indent2'>（1）<a onclick='this.viewEg(\"union\")'>合并：</a>选取两个表的合并字段（字段的数据含义和数据类型必须相同），根据合并字段显示两个表所选字段内容合并后的结果数据，输出结果中的字段将以主表（基表）为主</p>"
          html += "<p class='indent2'>（2）<a onclick='this.viewEg(\"intersect\")'>交集：</a>选取两个表的交集字段（字段的数据含义和数据类型必须相同），根据交集字段显示两个表所选字段内容中完全相同部分的结果数据，输出结果中的字段将以主表（基表）为主</p>"
          html += "<p class='indent2'>（3）<a onclick='this.viewEg(\"exclude\")'>补集：</a>选取两个表的补集字段（字段的数据含义和数据类型必须相同），根据补集字段显示副表（从表）所选取字段中的内容不存在于主表（基表）所选取字段中的内容的数据，输出结果中的字段将以主表（基表）为主</p>"
          break
          // 		            case "barChart":			//自定义图形
          // 			        break;
        case 'sql':						// SQL查询器
          html += '<p>1、布局说明：页面分为数据表区、SQL函数区、功能按钮区、编写SQL区、结果展示区</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）数据表区：</p>"
          html += "<p class='indent4'>①&nbsp;数据表区和SQL函数区中的树节点均可进行拖拽操作，拖拽到编写SQL区</p>"
          html += "<p class='indent4'>②&nbsp;右键点击树的根节点，【刷新】数据表树信息</p>"
          html += "<p class='indent4'>③&nbsp;右键点击数据表节点，可进行【生成SELECT语句】、【查看表信息】的操作，业务数据下的汉化表只有【生成SELECT语句】的操作</p>"
          html += "<p class='indent2'>（2）SQL函数区：编写SQL区提供部分联想功能，可自动提示数据表名称和SQL关键字</p>"
          html += "<p class='indent2'>（3）功能按钮区：</p>"
          html += "<p class='indent4'>①&nbsp;格式化：美化编写的SQL语句。展现更加清晰和直观</p>"
          html += "<p class='indent4'>②&nbsp;辅助SQL查询器：打开新窗口，用户可通过此工具辅助编写SQL语句</p>"
          // html += "<p class='indent4'>③&nbsp;SQL校验：校验编写的SQL语句是否缺少关键字，即SQL语句的合法性，</p>";
          html += "<p class='indent4'>③&nbsp;执行：执行SQL语句，在结果展示区展示结果</p>"
          html += "<p class='indent2'>（4）结果展示区：</p>"
          html += "<p class='indent4'>①&nbsp;数据结果集：如果执行的SQL语句中存在SELECT查询语句（在语句末尾），则会展示该SELECT语句的结果集数据</p>"
          html += "<p class='indent4'>②&nbsp;执行信息：展示执行操作的反馈信息</p>"
          html += '<p>3、规则说明：</p>'
          html += "<p class='indent2'>（1）SELECT语句中尾句如果不是SELECT查询语句，则不会自动生成结果表</p>"
          html += "<p class='indent2'>（2）SELECT查询语句中不能含有【*】，工具不支持类似的【SELECT * FROM XX】语句，必须明确写明查询列</p>"
          html += "<p class='indent2'>（3）SELECT查询语句中不能有重复字段，重复字段可使用别名且别名不能重复</p>"
          break
          //		            case "newNullNode":	//结果表					暂时屏蔽
        case 'relation':				// 数据关联
          html += '<p>1、布局说明：页面分为左侧图形区（以图形化形式展现来源结果表的表结构信息）和右侧关系展示区（展现表与表之间的连接关系及连接条件）</p>'
          html += '<p>2、操作说明：</p>'
          html += "<p class='indent2'>（1）鼠标点击【A表】的一个字段拖拽指向【B表】的一个字段，生成两个表之间的连接线，同时在右侧会追加生成关联关系、变换生成连接条件（可自定义修改）</p>"
          html += "<p class='indent2'>（2）点击不同的连接线，右侧的连接关系会跟着变换，即展现当前选中的连接线的连接条件</p>"
          html += "<p class='indent2'>（3）暂只支持【Backspace】删除键、【Delete】删除键两种快捷键操作</p>"
          html += '<p>3、图例（点击链接查看）：</p>'
          html += "<p class='indent2'>（1）<a onclick='this.viewEg(\"left_join\")'>左连接：</a>选取关联字段将两张表进行关联，左表的所有数据均显示，右表的数据只显示关联字段值相等的数据，若右表关联结果无数据则补空显示</p>"
          html += "<p class='indent2'>（2）<a onclick='this.viewEg(\"right_join\")'>右连接：</a>选取关联字段将两张表进行关联，右表的所有数据均显示，左表的数据只显示关联字段值相等的数据，若左表关联结果无数据则补空显示</p>"
          html += "<p class='indent2'>（3）<a onclick='this.viewEg(\"inner_join\")'>内连接：</a>选取关联字段将两张表进行关联，仅显示两张表中关联字段值相等的数据</p>"
          html += "<p class='indent2'>（4）<a onclick='this.viewEg(\"join\")'>外连接：</a>选取关联字段将两张表进行关联，显示出左表和右表关联后的所有数据，但去除重复数据，两表中若无关联数据则补空显示</p>"
          break
      }
      $('#remarkContent').append(html)
    },
    // 点击链接预览图片
    viewEg(type) {
      var src = 'images/'; var alt = ''
      console.log(src)
      switch (type) {
        case 'left_join':
          src += 'left_join.jpg'
          alt = '左连接'
          break
        case 'right_join':
          src += 'right_join.jpg'
          alt = '右连接'
          break
        case 'inner_join':
          src += 'inner_join.jpg'
          alt = '内连接'
          break
        case 'join':
          src += 'join.jpg'
          alt = '外连接'
          break
        case 'union':
          src += 'union.png'
          alt = '合并'
          break
        case 'intersect':
          src += 'intersect.png'
          alt = '交集'
          break
        case 'exclude':
          src += 'exclude.jpg'
          alt = '补集'
          break
      }
      layer.photos({
        photos: { 'data': [{ 'src': src, 'alt': alt }] },
        anim: 5
      })
    }
  }
}
</script>

<style scoped type="text/css">
    p{
        line-height: 1.8em;
        word-wrap: break-word;
    }
    p.indent2{
        text-indent: 2em;
    }
    p.indent4{
        text-indent: 4em;
    }
    #remarkContent{
        width:100%;
        height:100%;
        padding:20px;
    }
</style>
