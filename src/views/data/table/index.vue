<template>
  <div class="page-container">
    <!-- left_conter -->
    <div class="left_conter">

      <el-tabs v-model="activeName"
               type="card"
               @tab-click="handleClick">
        <el-tab-pane label="系统"
                     :disabled="tabclick"
                     name="0"></el-tab-pane>
        <el-tab-pane label="主题"
                     :disabled="tabclick"
                     name="1"></el-tab-pane>
        <el-tab-pane label="分层"
                     :disabled="tabclick"
                     name="2"></el-tab-pane>
        <!-- <el-tab-pane label="目录"
                     :disabled="tabclick"
                     name="3"></el-tab-pane> -->
      </el-tabs>
      <div class="padding10">
        <el-input v-model="filterText2"
                  :disabled="tabclick"
                  placeholder="输入关键字进行过滤" />
      </div>
      <!-- 数据源 -->
      <div class="padding10 dataSource">
        <el-form :inline="true"
                 :model="query"
                 label-position="bottom">
          <el-form-item label="数据源："
                        label-width="90px">
            <el-select v-model="query.dataSource"
                       :disabled="tabclick"
                       @change="selectdata"
                       placeholder="请选择数据源">
              <el-option v-for="item in options"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>

      </div>

      <div v-show="loading== true"
           class="loading">
        <div class="conter_loading">
          <span><img src="../../../assets/img/loading.gif"
                 alt=""></span>
        </div>
      </div>

      <div v-show="loading== false"
           class="conter_vh">

        <div class="padding10_l">
          <!-- 系统 主题 分层  目录-->
          <div class="tree-containerall">

            <MyElTree ref="tree2"
                      :props="props"
                      :data="tree_list"
                      :filter-node-method="filterNode"
                      :default-expanded-keys="['ROOT']"
                      class="filter-tree"
                      highlight-current="true"
                      node-key="id"
                      @node-click="nodeClick">
              <span slot-scope="{ node, data }"
                    class="custom-tree-node">
                <i v-if="data.id === 'ROOT'"
                   :class="data.icon" />
                <i
                   v-if="data.type === 'folder' || data.type === 'system' || data.type === 'layered' || data.type === 'theme'">
                  <span class="agreeicon0"></span>
                </i>
                <i v-if="data.type === 'table'">
                  <span class="icon iconfont agreeicon1"></span>
                </i>
                <i v-if="data.type === 'view'">
                  <span class="icon iconfont agreeicon4"></span>
                </i>

                <i v-if="data.type === 'column'"
                   class="el-icon-c-scale-to-original" />
                <span>{{ node.label }}</span>
                <span style="margin-left: 10px">
                  <el-button v-if="
                    data.id === 'ROOT' ||
                    (data.extMap && data.extMap.folder_type === 'maintained')
                  "
                             type="text"
                             size="mini"
                             @click.stop="() => handleCreateFolder(node, data)">
                    <i class="el-icon-circle-plus" />
                  </el-button>
                  <el-button v-if="data.extMap && data.extMap.folder_type === 'maintained'"
                             type="text"
                             size="mini"
                             @click.stop="() => handleUpdateFolder(node, data)">
                    <i class="el-icon-edit" />
                  </el-button>
                  <el-button v-if="
                    (data.extMap && data.extMap.folder_type === 'maintained') ||
                    data.type === 'table'||
                    data.type === 'view'
                  "
                             type="text"
                             size="mini"
                             @click.stop="() => handleRemove(node, data)">
                    <i class="el-icon-delete" />
                  </el-button>
                </span>
              </span>
            </MyElTree>

          </div>
          <!-- 目录 -->

        </div>

      </div>

    </div>
    <!-- left_conter end-->

    <!-- right_conter -->
    <div class="right_conter padding10">
      <DataResourceDisplay @down_template_cn="DownTemplateCN"
                           @Important_cn='ImportantCn'
                           @Importdata_dictionary="ImportdataDictionary"
                           @down_template_dictionary="DownTemplateDictionary"
                           @Important_table='ImportantTable'
                           @down_template_table="DownTemplateTable"
                           @on_deails="onDeailsChange"
                           @sync_data="SyncData"
                           :isBtn="isBtn"
                           @on_register="registTable"
                           @Recognition='recognitionChange'
                           :list="list"
                           :list_loading="list_loading"
                           v-if="show_details == false"></DataResourceDisplay>
      <!-- 基本信息详情 -->
      <Details ref="Details_ref"
               :tableMetaUuid="tableMetaUuid"
               v-if="show_details == true"></Details>

      <!-- 默认表单 -->
      <!-- <div v-if="divInfo == false">
        <div class="padding10">
          <el-row>
            <el-col align="right">
              <el-button type="primary"
                         style="padding:0 10px;width:auto"
                         class="oper-btn "
                         @click="registTable()">注册资产-{{query.dataSource}}</el-button>
            </el-col>
          </el-row>
        </div>
        <el-table v-loading="listLoading"
                  :data="list.records"
                  border
                  fit
                  highlight-current-row
                  style="width: 100%;height:calc(100% - 140px);overflow: auto;">
          <el-table-column type="selection"
                           width="55" />
          <el-table-column label="表名称"
                           prop="displayTbName" />
          <el-table-column label="表代码"
                           prop="chnName">
            <template slot-scope="scope">
              <div v-if="scope.row.tableRelationQuery.tableCode">
                {{scope.row.tableRelationQuery.tableCode.substring(0,scope.row.tableRelationQuery.tableCode.lastIndexOf(">"))}}
              </div>

            </template>
          </el-table-column>
          <el-table-column label="表类型"
                           prop="chnName">
            <template slot-scope="scope">
              {{
                scope.row.tableRelationQuery.tableType == 1
                      ? '表'
                      : scope.row.tableRelationQuery.tableType == 2
                      ? '视图'
                      : scope.row.tableRelationQuery.tableType == 3
                      ? '存储过程'
                      : scope.row.tableRelationQuery.tableType == 4
                      ? '接口'
                      : scope.row.tableRelationQuery.tableType == 5
                       ? '报表'
                      : scope.row.tableRelationQuery.tableType == 6
                      ? '指标'
                      : scope.row.tableRelationQuery.tableType == 7
                      ? '标签' : '其它'
              }}
            </template>
          </el-table-column>
          <el-table-column label="创建人"
                           align="center"
                           prop="createUserName">
            <template slot-scope="scope">
              {{scope.row.tableRelationQuery.createUserName}}
            </template>
          </el-table-column>

          <el-table-column label="操作"
                           align="center"
                           min-width="100">
            <template slot-scope="scope">
              <el-button type="primary"
                         class="oper-btn delete"
                         title="删除"
                         size="mini"
                         @click="delete_table(scope.row.tableMetaUuid)" />
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-show="list.total>0"
                       :total="list.total"
                       :current-page="list.currentPage"
                       background
                       @current-change="handleCurrentChange"
                       @size-change="handleSizeChange"
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div> -->
      <!-- 注册资产 -->
      <el-dialog :close-on-click-modal="false"
                 :default-expand-all="true"
                 :title="'选择注册表'"
                 :visible.sync="registTableFlag"
                 class="dlag_width"
                 width="600px">
        <el-input style="width: 70%"
                  v-model="filterText1"
                  placeholder="输入想要查询的表名称（模糊搜索）" />
        <el-button @click="getTables"> 搜索 </el-button>

        <div class="tree-containerselect padding10">
          <MyElTree ref="tree1"
                    v-loading="treeLoading"
                    :props="props"
                    :data="tableData"
                    class="filter-tree"
                    show-checkbox
                    @check-change="nodeClick_table"
                    @node-click="nodeClick_table"
                    default-expand-all>
            <span slot-scope="{ node, data }"
                  class="custom-tree-node">
              <i v-if="data.type === 'USER'">
                <img src="../../../assets/img/table_0.png"
                     style="height: 16px;width: 16px;margin-right: 2px;vertical-align: top;*vertical-align: middle;">
              </i>
              <i v-if="data.type === 'TABLE'">
                <img src="../../../assets/img/table_1.png"
                     style="height: 16px;width: 16px;margin-right: 2px;vertical-align: top;*vertical-align: middle;">
              </i>
              <i v-if="data.type === 'COLUMN'">
                <img src="../../../assets/img/table_2.png"
                     style="height: 16px;width: 16px;margin-right: 2px;vertical-align: top;*vertical-align: middle;">
              </i>
              <span>{{ node.label }}</span>
            </span>
          </MyElTree>
        </div>
        <span slot="footer">
          <el-button @click="registTableFlag = false">取消</el-button>

          <el-button type="primary"
                     :disabled="isDisable"
                     v-if="is_next == true"
                     @click="next()">下一步</el-button>
        </span>
      </el-dialog>

      <!-- 如果选多个表 -->
      <el-dialog :visible.sync="dialogVisible_forms"
                 width="600px"
                 class="dlag_width"
                 :before-close="handleClose">
        <el-table :data="Column_table"
                  style="width: 100%">
          <el-table-column prop="date"
                           label="字段名称">
            <template slot-scope="scope">
              <span v-for="(item,index) in scope.row.colMetas"
                    :key="index">{{item.colName}}
                <i v-if="scope.row.colMetas.length!==1">、</i>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="title"
                           label="表名称">
            <template slot-scope="scope">
              {{ scope.row.tbName}}
            </template>

          </el-table-column>
        </el-table>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="dialogVisible_forms = false">关闭</el-button>
          <el-button type="primary"
                     @click="next_save()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 下一步 基本信息-->
      <el-dialog title="基本信息"
                 class="data_res dlag_width"
                 :visible.sync="dialogVisible_information"
                 @close="handleClose('form')"
                 width="60%">
        <el-form :rules="rules"
                 ref="form"
                 label-width="100px"
                 :model="form"
                 :inline="false">
          <!-- 表名-->
          <div class="son">
            <el-form-item label="表名:"
                          prop="tbName">
              <el-input type="text"
                        disabled
                        placeholder="请输入表名"
                        v-model="form.tbName"
                        :rows="4">
              </el-input>
            </el-form-item>

          </div>
          <!-- 表中文名 -->
          <div class="son">

            <el-form-item label="表中文名:">
              <el-input type="text"
                        placeholder="请输入表中文名"
                        v-model="form.chName"
                        :rows="4">
              </el-input>

            </el-form-item>
          </div>

          <!--  表说明-->
          <div class="son">
            <el-form-item label="表说明:">
              <el-input type="textarea"
                        placeholder="请输入表说明"
                        v-model="form.tableRemarks">
              </el-input>
            </el-form-item>

          </div>

          <!-- 资产编码 && 资产类型：-->
          <div class="son">
            <el-form-item label="资产编码:"
                          prop="tableCode">
              <el-input type="text"
                        placeholder="请输入资产编码"
                        v-model="form.tableCode"
                        :rows="4">
              </el-input>
            </el-form-item>

            <el-form-item label="资产类型:"
                          prop="tableType">
              <el-select v-model="form.tableType"
                         :rows="4"
                         placeholder="请选择资产类型">
                <el-option v-for="item in data_type"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 资产主题 && 资产分层 -->
          <div class="son">
            <el-form-item label="资产主题:"
                          prop="tableThemeId">
              <el-select v-model="form.tableThemeId"
                         :rows="4"
                         placeholder="请选择资产主题">
                <el-option v-for="item in next_data.themeList"
                           :key="item.codeUuid"
                           :label="item.codeName"
                           :value="item.codeUuid" />
              </el-select>
            </el-form-item>

            <el-form-item label="资产分层:"
                          prop="tableLayeredId">
              <el-select v-model="form.tableLayeredId"
                         :rows="4"
                         placeholder="请选择资产分层">
                <el-option v-for="item in next_data.layeredList"
                           :key="item.codeUuid"
                           :label="item.codeName"
                           :value="item.codeUuid" />
              </el-select>
            </el-form-item>

          </div>

          <!-- 所属系统 && 文件名-->
          <div class="son">

            <el-form-item label="所属系统:"
                          prop="businessSystemId">
              <el-select v-model="form.businessSystemId"
                         :rows="4"
                         placeholder="请选择所属系统">
                <el-option v-for="item in next_data.businessSystemList"
                           :key="item.businessSystemUuid"
                           :label="item.businessSystemName"
                           :value="item.businessSystemUuid" />
              </el-select>
            </el-form-item>
            <el-form-item label="文件名:">
              <el-input type="text"
                        placeholder="请输入文件名称"
                        v-model="form.fileName"
                        :rows="4">
              </el-input>
            </el-form-item>
          </div>

          <!-- 数据日期 && 表大小-->
          <div class="son">

            <el-form-item label="数据日期:">
              <el-date-picker format="yyyy-MM-dd"
                              type="date"
                              value-format="yyyy-MM-dd"
                              @change="changeRelationParam"
                              placeholder="请输入数据日期"
                              :rows="4"
                              v-model="form.dataDate">
              </el-date-picker>

            </el-form-item>
            <el-form-item label="表大小:">
              <el-input type="text"
                        disabled
                        placeholder="请输入文件名称"
                        v-model="form.tableSize"
                        :rows="4">
              </el-input>
            </el-form-item>
          </div>
          <!-- <el-form-item label="所属目录:"
                          prop="folderUuid">
              <el-cascader v-model="form.folderUuid"
                           :options="next_contentsList"
                           placeholder="请选择所属目录"
                           clearable
                           :props="props2"
                           ref="cascaderArr"
                           @change="handleChange"></el-cascader>
            </el-form-item> -->

          <!-- 表数据量 &&   负责人-->
          <div class="son ">
            <el-form-item label="表数据量:">
              <el-input type="text"
                        disabled
                        placeholder="请输入表数据量"
                        v-model="form.rowNum"
                        :rows="4">
              </el-input>
            </el-form-item>

            <div class="son_check">

              <!-- prop="personName_str" -->
              <el-form-item label="负责人:">
                <el-input type="text"
                          disabled
                          v-model="form.personName_str">
                </el-input>

              </el-form-item>
              <el-button type="primary"
                         class="oper-btn"
                         @click="check_people()">选择</el-button>
            </div>

          </div>

          <!--表分区 && 增全量 -->
          <div class="son ">
            <el-form-item label="表分区:"
                          prop="partitions">
              <!-- <el-table :data="form.tableData"
                        style="width: 100%">
                <el-table-column prop="address"
                                 label="日期">
                </el-table-column>
              </el-table> -->
              <ul class="table">
                <li class="head">
                  分区名称
                </li>
                <li v-for="(item,index_partitions) in form.partitions"
                    :key="index_partitions"
                    class="li_son"
                    key="index">{{item}}</li>
              </ul>
            </el-form-item>

            <el-form-item label="增全量:"
                          prop="isSpike">
              <el-select v-model="form.isSpike"
                         :rows="4"
                         placeholder="请选择是否增量">
                <el-option v-for="item in option_isSpike"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value" />
              </el-select>

            </el-form-item>
            <!-- <el-form-item label="是否推送文件:"
                          prop="isSentFile">
              <el-select v-model="form.isSentFile"
                         :rows="4"
                         placeholder="请选择是否推送文件">
                <el-option v-for="item in option_isSentFile"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value" />
              </el-select>
            </el-form-item> -->

          </div>
          <!--表名 文件名称 -->
          <!-- <div class="son "
               v-for="(item,index) in form.check_list"
               :key="index"
               :ref="`ruleForm${index}`">

            <el-form-item label="表名:">
              <p>{{item.label}}</p>
            </el-form-item>

            <el-form-item label="文件名称:"
                          :prop="'check_list.' + index + '.fileName'"
                          :rules="{
            required: true,
            message: '请输入文件名称',
            trigger: 'blur',
          }">
              <el-input type="text"
                        placeholder="请输入文件名称"
                        v-model="item.fileName"
                        :rows="4"
                        @input="checkFileName_change(item.fileName)">
              </el-input>
            </el-form-item>
          </div> -->

          <!--  资产备注-->
          <!-- <div class="son">
            <el-form-item label="资产备注:"
                          prop="tableRemarks">
              <el-input type="textarea"
                        placeholder="请输入表资产备注"
                        v-model="form.tableRemarks">
              </el-input>
            </el-form-item>

          </div> -->

          <!-- 数据标签：-->
          <div class="son ">
            <div class="son_check">

              <el-form-item label="数据标签：:">
                <!-- <el-input type="text"
                          disabled
                          v-model="form.personName_str">
                </el-input> -->

                <div class="_width tag_conter">
                  <el-tag :key="tag"
                          v-for="tag in tagsarr"
                          closable
                          :disable-transitions="false"
                          @close="handleClose(tag)">
                    {{tag}}
                  </el-tag>

                </div>

              </el-form-item>
              <el-button type="primary"
                         class="oper-btn"
                         @click="check_tag()">选择</el-button>
            </div>

          </div>

        </el-form>
        <div class="padding10_l">
          <p style="text-align: center;">列信息</p>
          <el-table :data="Column_table"
                    style="width: 100%">
            <el-table-column prop="date"
                             label="字段名称">
              <template slot-scope="scope">
                {{ scope.row.colName}}
              </template>

            </el-table-column>
            <!-- <el-table-column prop="name"
                             label="字段中文名">
            </el-table-column> -->
            <el-table-column prop="address"
                             label="字段类型">
              <template slot-scope="scope">
                {{ scope.row.dataType}}
              </template>
            </el-table-column>

            <el-table-column prop="address"
                             label="字段长度">
              <template slot-scope="scope">
                {{ scope.row.dataLength}}
              </template>
            </el-table-column>

            <!-- <el-table-column prop="address"
                             label="字段说明">
            </el-table-column> -->
          </el-table>
        </div>

        <span slot="footer"
              class="dialog-footer">
          <el-button @click="step()">上一步</el-button>
          <!-- <el-button type="primary"
                     :disabled="isDisable"
                     @click="save('form')"
                     v-if="ifFileNameExist">保存</el-button> -->

          <el-button type="primary"
                     :loading="btnLoading"
                     :disabled="isDisable"
                     @click="save('form')">{{this.btnLoading == true ? '保存中' : '保存'}}</el-button>

          <el-button @click="close_diag()">关闭</el-button>

        </span>
      </el-dialog>

      <!-- 选择责任人 -->
      <el-dialog title="选择责任人"
                 :visible.sync="resultShareDialogIsSee"
                 width="50%">
        <personTree ref="orgPeopleTree"></personTree>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="resultShareDialogIsSee = false">取 消</el-button>
          <el-button type="primary"
                     @click="modelResultShare()">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog :title="dialogTitle"
                 :visible.sync="folderFormVisible"
                 width="600px"
                 :close-on-click-modal="false">
        <el-form ref="folderForm"
                 :model="folderForm"
                 class="detail-form">
          <el-form-item label="文件夹名称">
            <el-input v-model="folderForm.folderName" />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="folderFormVisible = false">取消</el-button>
          <el-button type="primary"
                     @click="dialogStatus === 'create' ? createFolder() : updateFolder()">保存</el-button>
        </span>
      </el-dialog>

      <!-- 选择标签 -->
      <el-dialog title="选择标签"
                 :visible.sync="dialogVisible_tag"
                 width="60%"
                 class="dlag_width">
        <div>
          <div class="right_query">
            <el-form :inline="true"
                     :model="tag_query"
                     label-position="bottom">
              <el-form-item>
                <el-input v-model="tag_query.name"
                          placeholder="标签名"
                          clearable />
              </el-form-item>

              <el-form-item>
                <el-select v-model="tag_query.status"
                           :rows="4"
                           placeholder="请选择是否增量">
                  <el-option v-for="item in option_isSpike"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value" />
                </el-select>

              </el-form-item>

              <el-form-item>
                <el-button type="primary"
                           @keyup.enter.native="search">查询</el-button>
                <el-button type="primary">清空</el-button>

              </el-form-item>

            </el-form>
          </div>
          <div class="padding10_l">
            <el-table :data="tableData"
                      style="width: 100%">
              <el-table-column prop="date"
                               align="center"
                               label="标签树">
              </el-table-column>
              <el-table-column prop="name"
                               align="center"
                               label="被引用次数">
              </el-table-column>
              <el-table-column prop="address"
                               align="center"
                               label="标签状态">
              </el-table-column>

              <el-table-column prop="address"
                               align="center"
                               label="创建人">
              </el-table-column>

              <el-table-column prop="address"
                               align="center"
                               label="创建时间">
              </el-table-column>

              <el-table-column label="操作"
                               align="center"
                               prop="address"
                               width="100px">
                <template slot-scope="scope"
                          v-if="!scope.row.noShow">
                  <el-button type="primary"
                             size="mini">操作</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="dialogVisible_tag = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 认权管理 -->
      <el-dialog title="认权管理"
                 :visible.sync="visible_Recognition"
                 width="60%"
                 class="dlag_width">
        <div>
          <div class="data_res com">
            <el-form ref="form"
                     :model="Recognition">
              <el-form-item label="认权人:"
                            prop="people">
                <el-input type="text"
                          disabled
                          placeholder="请选择认权人"
                          v-model="Recognition.personName_str">
                </el-input>
                <el-button type="primary"
                           @click="check_people()">选择</el-button>
              </el-form-item>

            </el-form>

          </div>
          <div class="padding10_l">
            <el-table :data="Recognition_check_list"
                      style="width: 100%">
              <el-table-column prop="tbName"
                               align="center"
                               label="表名称">
              </el-table-column>
              <el-table-column prop="name"
                               align="center"
                               label="表类型">
              </el-table-column>
            </el-table>
          </div>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="visible_Recognition = false">取 消</el-button>
          <el-button type="primary"
                     @click="save_people_change()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 弹窗2 导入数据-->
      <el-dialog v-if="importVisible"
                 :title="upload_title"
                 :visible.sync="importVisible"
                 :close-on-click-modal="false"
                 width="800px">
        <el-row>
          <el-col>
            <directory-file-import @fileuploadname="fileuploadname" />
          </el-col>
        </el-row>
        <span slot="footer">
          <el-button @click="importVisible = false">取消</el-button>
          <el-button @click="importTableDictionary()"
                     v-if="upload_title = '数据字典导入'">导入</el-button>
          <el-button @click="importTablCn()"
                     v-else-if="upload_title = '汉化信息导入'">导入</el-button>
          <el-button @click="importTableTable()"
                     v-else>导入</el-button>

          <!-- <el-button type="primary"
                     @click="upload_title = '数据字典导入' ? importTableDictionary()
  :upload_title = '汉化信息导入' ? importTablCn() 
   : upload_title = '表关系导入' ? importTableTable() :'' ">导入</el-button> -->

        </span>
      </el-dialog>

    </div>
    <!-- right_conter end-->

  </div>

</template>

<script>
import tabledatatabs from "@/views/data/table/tabledatatabs";
import MyElTree from "@/components/public/tree/src/tree.vue";
import {
  listUnCached,
  getDataTreeNode,//目录
  getBusinessSystemTree,//系统
  getThemeTree,//主题
  getLayeredTree,//分层
  delTable,
  listByTreePage,//列表
  getColsInfoByTableName,//获取列信息
  synDataStructure,//同步数据
} from "@/api/data/table-info";
import { saveFolder, updateFolder, delFolder } from "@/api/data/folder";
import { commonNotify } from "@/utils";
import QueryField from '@/components/public/query-field/index'
import personTree from "@/components/publicpersontree/index";
import {
  insertRunResultShare,//责任人
} from "@/api/analysis/auditmodelresult";
import DataResourceDisplay from "@/components/directory/data_resource_display.vue"
import Details from "@/components/directory/details.vue"
import directoryFileImport from '@/views/data/tableupload'//导入
import { listByPage, selectOne, importTable, import_dictionary, importTable_table } from '@/api/data/dict'
import qs from 'qs'
import axios from 'axios'

import {
  // page_list_data,//列表
  // getById,//详情
  // save_data,//新增保存
  // update_data,//编辑保存
  // delete_data,//删除
  checkFileName,//校验文件名是否已经存在
  batchSaveTable_save,//下一步 保存
  getListTree,//注册资产下一步
} from "@/api/lhg/register.js";



export default {
  components: {
    MyElTree, tabledatatabs, QueryField,
    DataResourceDisplay, Details,
    directoryFileImport,
    personTree: () => import('@/components/publicpersontree/index')
  },
  data () {
    return {
      ifFileNameExist: true,
      activeName: '0',//tab切换
      ifExpandAll: false, // 是否展开所有树节点
      tabShow: "basicinfo",
      tableId: "",
      registTableFlag: false,
      divInfo: false,
      filterText1: null,
      filterText2: null,
      filterText3: null,
      fromData: [],
      props: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },
      // 目录
      defaultProps: {
        label: "label",
        isLeaf: "leaf",
        children: "children",
      },

      tree_list: [],//左侧资料树数据结构
      folderForm: {
        folderUuid: null,
        folderName: null,
        parentFolderUuid: null,
        orderNum: 0,
        fullPath: null,
      },
      folderFormVisible: false,
      dialogStatus: "",
      parentNode: {},
      tempData: {}, // 点击编辑时临时存放data
      textMap: {
        update: "编辑文件夹",
        create: "添加文件夹",
      },
      // selectValue: 1,
      treeLoading: false,
      tableData: [],
      chooseTables: [],

      // 列表
      listLoading: false,
      list: [],//table 列表


      // 资料树筛选 数据源
      query: {
        dataSource: 'Postgre',//筛选条件
        pageNo: 1,
        pageSize: 10,
        businessSystemId: '',//id主键
        tableThemeId: '',//主题
        tableLayeredId: '',//分层
        folderUuid: '',//目录ID
      },

      options: [{
        value: 'Postgre',
        label: 'ADS'
      }, {
        value: 'Hive',
        label: 'MRS-DWS'
      }],
      dialogVisible_information: false,//下一步 基本信息

      rules: {
        tableCode: [
          { required: true, message: '请输入资产编码', trigger: 'blur' },
        ],
        tableType: [
          { required: true, message: '请选择资产类型', trigger: 'change' },
        ],

        tableThemeId: [
          { required: true, message: '请选择所属主题', trigger: 'change' },
        ],
        businessSystemId: [
          { required: true, message: '请选择id', trigger: 'change' },
        ],

        tableLayeredId: [
          { required: true, message: '请选择资产分层', trigger: 'change' },
        ],

        folderUuid: [
          { required: true, message: '请选择所属目录', trigger: 'change' },
        ],
        isSpike: [
          { required: true, message: '请选择是否增量', trigger: 'change' },
        ],

        isSentFile: [
          { required: true, message: '请选择是否推送文件', trigger: 'change' },
        ],

        fileName: [
          { required: true, message: '请输入文件名称', trigger: 'change' },
        ],
        personName_str: [
          { required: true, message: '请选择资产责任人', trigger: 'change' },
        ],
        tableRemarks: [
          { required: true, message: '请输入资产备注', trigger: 'blur' },
        ],
      },
      btnLoading: false,//保存loading
      // 新增的数据
      form: {

        tbName: '', //表名
        chName: '', //表中文名（后台给

        rowNum: '',//表数据量
        tableSize: '',//表大小:
        partitions: '',//表分区
        fileName: '',//文件名称
        dataDate: '',//数据日期

        tableCode: '',// 资产编码
        tableType: '',// 资产类型
        tableThemeId: '',// 资产主题
        businessSystemId: '',//id
        tableLayeredId: '',//资产分层
        folderUuid: '',//所属目录
        // increment: '',//是否增量
        isSpike: 1,//是否增量
        isSentFile: 0,//是否推送文件
        tableRemarks: '',//资产备注
        personName: '',
        personUuid: '',//资产责任人
        personName_str: '',//责任人
        personLiables: [],
        // fileName: [],//文件名称

        tableData: [{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }],

        file_name: '',
        check_list: [
          {
            label: '',
            fileName: '',
            pid: '',
            id: '',
          }
        ],//选择的数据表
      },

      // 增量全量
      option_isSpike: [
        {
          value: 0,
          label: '全量'
        },
        {
          value: 1,
          label: '增量'
        },
      ],
      // 是否推送
      option_isSentFile: [
        {
          value: 0,
          label: '不推送'
        },
        {
          value: 1,
          label: '推送'
        },
      ],
      isDisable: false, //防止重复提交
      resultShareDialogIsSee: false,//选择责任人
      selectValue: [], // 存储表格中选中的数据
      next_data: [],// 点击下一步的数据
      props2: {
        label: 'label',
        children: 'children',
        value: 'id'
      },
      next_contentsList: [],//目录
      // check_next_contentsList: {},//选择的目录
      is_next: false,//是否显示下一步
      ischeck_data: {},//第一步选择的数据库

      data_type: [
        {
          value: 1,
          label: '表'
        }
      ],
      // 点击懒加载tree

      node_had: [], // 触发 tree 的 :load=loadNode 重复触发  动态更新tree
      resolve_had: [], // 触发 tree 的 :load=loadNode 重复触发  动态更新tree
      treeData: [],
      loading: true,
      tabclick: false,

      show_details: false,//显示基本信息详情
      isBtn: true,//是否显示按钮




      visible_Recognition: false,//认权管理
      Recognition: {
        personName_str: '',
      },

      // 如果选择了多个表
      dialogVisible_forms: false,
      formList: [],//

      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }],

      dialogVisible_tag: false,//选择标签
      // 标签
      tag_query: {
        name: '',
        status: '',
      },
      // 选择的标签
      tagsarr: ['标签一', '标签二', '标签三'],
      inputValue: '',

      // 汉化
      importVisible: false,
      // dialogStatus: '',

      upload_title: '',
      // preview: '数据字典导入',
      // import: '汉化信息导入',
      // table: '表关系导入',

      importtemp: {},
      Column_table: [],//列信息
      Column_table_query: {
        dbName: '',
        tbName: '',
      },
      list_loading: false,//列表loading
      list: [],

      Recognition_check_list: [],//认权列表


      // list_details: {},// 点击列表进入详情
      tableMetaUuid: '',//详情id

    };
  },
  computed: {
    dialogTitle () {
      return (
        (this.parentNode.label == null
          ? ""
          : "在<" + this.parentNode.label + ">下") +
        this.textMap[this.dialogStatus]
      );
    },
    fromDisabled () {
      return false;
    },
    toDisabled () {
      return false;
    },
  },
  watch: {
    filterText1 (val) {
      this.$refs.tree1.filter(val);
    },
    filterText2 (val) {
      this.$refs.tree2.filter(val)
    },
    filterText3 (val) {
      this.$refs.tree3.filter(val)
    }
  },
  created () {
    this.post_getBusinessSystemTree();//系统
    // this.post_getThemeTree();//主题
    // this.post_getLayeredTree();//分层
    // this.post_getDataTreeNode();//目录

    this.query.businessSystemId = ''
    this.query_lisy();

  },
  methods: {
    // 数据字典下载
    DownTemplateDictionary () {
      // 导出表信息作为模板
      // this.$message({ type: 'info', message: '无选择表,失败!' })
      axios.post(`/data/tableMeta/exportTableFile`, qs.stringify({}),
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // 请求的数据类型为form data格式
          }
        }
      ).then(res => {
        const filename = decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1]
        )
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
    },


    // 数据字典导入
    ImportdataDictionary (data) {

      this.upload_title = data
      this.importVisible = true
    },


    // 汉化模版下载
    DownTemplateCN (data) {
      // 导出表信息作为模板
      // this.$message({ type: 'info', message: '无选择表,失败!' })
      axios.post(`/data/tableMeta/exportFile`, qs.stringify({ tableMetasJson: JSON.stringify(data) }),
        {
          responseType: 'blob', headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // 请求的数据类型为form data格式
          }
        }
      ).then(res => {
        const filename = decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1]
        )
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
    },
    // 汉化信息导入
    ImportantCn (data) {
      this.upload_title = data
      this.importVisible = true
    },

    // 表关系导入
    ImportantTable (data) {

      this.upload_title = data
      this.importVisible = true
    },

    // 表关系下载
    DownTemplateTable () {
      // 导出表信息作为模板
      this.$message({ type: 'info', message: '无选择表,失败!' })
      axios.post(`/data/tableRelation/exportFile`, qs.stringify({}),
        {
          responseType: 'blob', headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // 请求的数据类型为form data格式
          }
        }
      ).then(res => {
        const filename = decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1]
        )
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
    },

    // 上传文件信息
    fileuploadname (data) {
      // 文件名
      this.importtemp.tableFileName = data

    },

    // 字典确认导入
    importTableDictionary () {

      import_dictionary(this.importtemp).then(res => {
        if (res.data.code === '200') {
          this.importVisible = false
          this.$notify({
            title: '成功',
            message: res.data.msg,
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.query_lisy()
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          })
        }
      })
    },

    // 汉化确认导入
    importTablCn () {
      importTable(this.importtemp).then(res => {
        if (res.data.code === '200') {
          this.importVisible = false
          this.$notify({
            title: '成功',
            message: res.data.msg,
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.query_lisy()
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          })
        }
      })
    },



    // 表关系导入
    importTableTable () {
      importTable_table(this.importtemp).then(res => {
        if (res.data.code === '200') {
          this.importVisible = false
          this.$notify({
            title: '成功',
            message: res.data.msg,
            type: 'success',
            duration: 2000,
            position: 'bottom-right'
          })
          this.query_lisy()
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg
          })
        }
      })
    },
    // 同步数据
    SyncData (data) {
      let arr_str = []
      for (var i = 0; i < data.length; i++) {
        arr_str.push(data[i].tableMetaUuid)
      }
      let params = {
        dataSource: this.query.dataSource,
        tableMetaUuids: arr_str,
      }
      synDataStructure(params).then((resp) => {
        if (resp.code == 0) {
          this.$message({
            type: "success",
            message: "同步成功!",
          });
          this.query_lisy();//刷新列表
        } else {
          this.$message({
            type: "error",
            message: resp.msg,
          });
        }

      });
    },

    // 认权管理
    recognitionChange (data) {

      this.Recognition_check_list = data
      this.visible_Recognition = true
    },

    // 认权确认
    save_people_change () {
      //请选择认权人
      // this.Recognition.personName_str
      if (this.Recognition.personName_str == '') {
        this.$message({ type: "warning", message: "请选择认权人" });
      } else {
        this.visible_Recognition = false

        // var arr = []
        // var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
        // for (var i = 0; i < selectedNode.length; i++) {
        //   personUuids.push(selectedNode[i].personuuid);
        //   personNames.push(selectedNode[i].cnname);

        //   this.form.personName_str = personNames.join(",");
        //
        //   this.form.personUuid = personUuids
        //   this.form.personName = personNames
        //   let obj = {
        //     personUuid: selectedNode[i].personuuid,
        //     personName: selectedNode[i].cnname
        //   }
        //   arr.push(obj)
        // }
        //   this.form.personLiables = arr




      }
    },




    // 显示基本信息详情
    onDeailsChange (data) {

      // let tableId = data.tableMetaUuid
      // return false
      this.tableMetaUuid = data.tableMetaUuid
      this.show_details = true
      // if (this.openType !== 'addTable') {

      // }
    },
    //校验文件名是否存在
    checkFileName_change (fileName) {
      // 
      // checkFileName(fileName).then((res) => {
      //   if (res.data) {
      //     this.$message({
      //       message: '文件名已存在',
      //       type: 'success',
      //       showClose: true,
      //     })

      //     //隐藏保存按钮
      //     this.ifFileNameExist = false
      //   } else {
      //     this.$message({
      //       message: res.message,
      //       type: 'success',
      //       showClose: true,
      //     })
      //     //显示保存按钮
      //     this.ifFileNameExist = true
      //     // this.$message.success("文件名可用");
      //   }
      // }
      // )
      // this.registTableFlag = false;//关闭上一步

    },

    // tab切换
    handleClick (tab, event) {
      if (tab.index == '0') {
        // this.tabclick = true
        // setTimeout(() => {
        //   this.tabclick = false
        // }, 3000)
        this.post_getBusinessSystemTree();//系统
      } else if (tab.index == '1') {
        this.post_getThemeTree();//主题
      } else if (tab.index == '2') {
        this.post_getLayeredTree();//分层
      }
      // else {
      //   this.post_getDataTreeNode(this.query.dataSource);//目录
      // }
    },
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },

    // 系统
    post_getBusinessSystemTree () {
      this.loading = true
      this.tabclick = true
      getBusinessSystemTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data
        this.loading = false
        this.tabclick = false
      });
    },
    // 主题
    post_getThemeTree () {
      this.loading = true
      this.tabclick = true
      getThemeTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data
        this.loading = false
        this.tabclick = false
      });
    },
    // 分层
    post_getLayeredTree () {
      this.loading = true
      this.tabclick = true
      getLayeredTree(true, this.query.dataSource, true).then((resp) => {
        this.tree_list = resp.data
        this.loading = false
        this.tabclick = false
      });
    },
    // 目录
    // post_getDataTreeNode () {
    //   this.loading = true
    //   this.tabclick = true
    //   getDataTreeNode(this.query.dataSource).then((resp) => {
    //     this.tree_list = resp.data
    //     this.loading = false
    //     this.tabclick = false

    //   });
    // },

    // loadNode2 (node, resolve) {
    // if (!node.data) {
    //   resolve([{ id: "ROOT", label: "数据集", leaf: false }]);
    // } else {
    //   getDataTreeNode(node.data.id = pid, dataSource).then((resp) => {
    //     resolve(resp.data);
    //   });
    // }
    // },
    // loadNode2 (node, resolve) {
    //   if (node.level === 0) {
    //     //  父级
    //     resolve(this.treeData);
    //   }
    //   if (node.level >= 1) {
    //     // 子级
    //     that.loadNodeChildren(node.data.id, resolve);

    //   }
    // },
    // //  父级
    // getTagList (pid) {
    //   getDataTreeNode(pid, this.query.dataSource).then((resp) => {
    //     this.treeData = resp.data
    //
    //     // let _data = resp.data;
    //     // return resolve(this.treeData)
    //   });
    // },
    // // 子节点
    // loadNodeChildren (pid, resolve) {
    //
    //   getDataTreeNode(pid, this.query.dataSource).then((resp) => {
    //     let _data = resp.data;
    //
    //     let resArr = [];//插入子级数据
    //     _data.forEach(item => {
    //       item = JSON.parse(JSON.stringify(item));
    //       resArr.push({
    //         label: item.label,
    //         id: item.id,
    //         leaf: item.leaf,
    //         // parentCategoryId: item.parentCategoryId,
    //         // currentLevel: item.currentLevel,
    //         // relateCount: item.relateCount
    //       });
    //     })
    //
    //     this.$refs.tree3.updateKeyChildren(node.data.id, resArr);
    //     return resolve(_data);
    //   });
    // },


    // 点击注册资源的 数据库列表
    getTables () {
      this.treeLoading = true;
      listUnCached(
        "table",
        "",
        this.filterText1 == null ? "" : this.filterText1,
        this.query.dataSource,
      ).then((resp) => {
        this.treeLoading = false;
        this.tableData = resp.data;
      });
    },

    // 刷根据节点ID刷新节点
    refreshNodeBy (id) {
      let node = this.$refs.tree2.getNode(id); // 通过节点id找到对应树节点对象
      node.loaded = false;
      node.expand(); // 主动调用展开节点方法，重新查询该节点下的所有子节点
    },
    // 点击切换树 切换 表单
    nodeClick (data, node, tree) {
      this.divInfo = false;
      this.show_details = false//显示列表

      if (node.data.type === "table") {
        this.$nextTick(() => {
          this.divInfo = true;
          this.tableId = node.data.id;
        });
      } else {
        if (data.type == "system") {
          this.query.businessSystemId = node.data.id;
          this.query.tableThemeId = '';
          this.query.tableLayeredId = '';
          this.query.folderUuid = '';
          this.query_lisy();


        } else if (data.type == "theme") {
          this.query.businessSystemId = ''
          this.query.tableThemeId = node.data.id;
          this.query.tableLayeredId = '';
          this.query.folderUuid = '';
          this.query_lisy();

        } else if (data.type == "layered") {
          this.query.businessSystemId = ''
          this.query.tableThemeId = '';
          this.query.tableLayeredId = node.data.id;
          this.query.folderUuid = '';
          this.query_lisy();

        }
        // else if (node.data.type === "folder") {
        // 目录
        // let _node = this.$refs.tree.getNode(node);
        // //  设置未进行懒加载状态
        // _node.loaded = false;
        // // 重新展开节点就会间接重新触发load达到刷新效果
        //   // _node.expand();
        //   this.post_getDataTreeNode();//目录
        //   // this.getTagList('ROOT', this.query.dataSource)
        //   // this.getTagList(node.data.id, this.query.dataSource);//目录
        //   this.query.businessSystemId = ''
        //   this.query.tableThemeId = '';
        //   this.query.tableLayeredId = '';
        //   this.query.folderUuid = node.data.id;
        //   this.query_lisy();

        // }
        // 分页
      }
    },

    // 列表 接口
    query_lisy () {
      // this.listLoading = true;
      this.list_loading = true//子组件loading
      let params = {
        businessSystemId: this.query.businessSystemId,//id主键
        tableThemeId: this.query.tableThemeId,//主题
        tableLayeredId: this.query.tableLayeredId,//分层
        folderUuid: this.query.folderUuid,//目录
        dataSource: this.query.dataSource,//数据源
        pageNo: this.query.pageNo,
        pageSize: this.query.pageSize,
      }
      listByTreePage(params).then((resp) => {
        this.list_loading = false//子组件loading
        this.list = resp.data.records

        // this.listLoading = false
        //
      });
    },
    // 删除
    delete_table (id) {
      delTable(id).then((res) => {
        if (res.code == 0) {
          this.$message({
            message: '删除成功',
            type: 'success',
            showClose: true,
          })
        } else {
          this.$message({
            message: res.msg,
            type: 'error',
            showClose: true,
          })
        }
        this.query_lisy()
      });
    },
    resetFolderForm () {
      Object.keys(this.folderForm).forEach((key) => {
        this.$set(this.folderForm, key, null);
      });
    },
    handleCreateFolder (node, data) {
      this.resetFolderForm();
      this.parentNode = node;
      this.dialogStatus = "create";
      this.folderForm.parentFolderUuid = data.id;
      var nodePath = this.$refs.tree2.getNodePath(data);
      var fullPath = [];
      // 将各级目录名拼接到全路径中
      nodePath.forEach((path) => {
        fullPath.push(path.label);
      });
      this.folderForm.fullPath = fullPath.join("/");
      this.folderFormVisible = true;
    },
    handleUpdateFolder (node, data) {
      this.resetFolderForm();
      this.tempData = data;
      this.dialogStatus = "update";
      this.folderForm.folderUuid = data.id;
      this.folderForm.folderName = data.label;
      // 修改为使用后台拼接，原因path.label取得是修改之前的label
      // let fullPath = [];
      // 拼接全路径（从ROOT节点开始一直到自己）
      // this.$refs.tree2.getNodePath(data).forEach((path) => {
      //   fullPath.push(path.label);
      // });
      // this.folderForm.fullPath = fullPath.join("/");
      this.folderFormVisible = true;
    },
    handleRemove (node, data) {
      this.$confirm("是否删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (data.type === "table" || data.type === "view") {
            delTable(data.id).then((resp) => {
              this.$notify(
                commonNotify({ type: "success", message: "删除成功！" })
              );
              this.$refs.tree2.remove(data);
            });
          } else {
            delFolder(data.id).then((resp) => {
              this.$notify(
                commonNotify({ type: "success", message: "删除成功！" })
              );
              this.$refs.tree2.remove(data);
            });
          }
        })
        .catch(() => { });
    },
    createFolder () {
      if (this.folderForm.folderName == null || this.folderForm.folderName.trim().length == 0) {
        this.$message({ type: 'info', message: "文件夹名不可为空，请重新输入文件夹名！" })
        return
      }
      saveFolder(this.folderForm).then((resp) => {
        var childData = {
          id: resp.data,
          label: this.folderForm.folderName,
          pid: this.folderForm.parentFolderUuid,
          type: "FOLDER",
          extMap: {
            folder_type: "maintained",
          },
        };
        this.$refs.tree2.append(childData, this.parentNode);
        this.$notify(commonNotify({ type: "success", message: "创建成功！" }));
        this.folderFormVisible = false;
      });
    },
    updateFolder () {
      if (this.folderForm.folderName == null || this.folderForm.folderName.trim().length == 0) {
        this.$message({ type: 'info', message: "文件夹名不可为空，请重新输入文件夹名！" })
        return
      }
      updateFolder(this.folderForm).then((resp) => {
        this.tempData.label = this.folderForm.folderName;
        this.$refs.tree2.updateKeyChildren(
          this.folderForm.folderUuid,
          this.tempData
        );
        this.folderFormVisible = false;
        // 更新树
        this.refreshNodeBy("ROOT");
      });
    },
    handleSelectChange (val) { },
    removeTable () {
      var ids = this.$refs.tree2.getCheckedKeys();
      delTable(ids.join(",")).then((resp) => {
        this.$notify(
          commonNotify({
            type: "success",
            message: `成功移除${ids.length}张表`,
          })
        );
        ids.forEach((id) => {
          this.$refs.tree2.remove({ id: id });
        });
      });
    },

    // ································

    // 时间格式化
    formatCreateTime (row, column) {
      // 拼接日期规格为YYYY-MM-DD hh:mm:ss
      var createTime = new Date(row.createTime)
      var createTimeRow = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate() + ' ' + createTime.getHours() + ':' + createTime.getMinutes() + ':' + createTime.getSeconds()
      return createTimeRow
    },
    // 选择数据源
    selectdata (val) {
      this.query.dataSource = val
      if (this.activeName == '0') {
        // 系统
        this.post_getBusinessSystemTree();//系统
      } else if (this.activeName == '1') {
        // 主题
        this.post_getThemeTree();//主题
      } else if (this.activeName == '2') {
        // 分层
        this.post_getLayeredTree();//分层
      } else {
        // 目录
        this.post_getDataTreeNode();//目录
      }

    },
    // 注册资产
    registTable () {
      // var ckFolder = this.$refs.tree2.getCurrentNode();
      // //  return;
      // if (!ckFolder || ckFolder.type !== "FOLDER") {
      //   this.$notify(
      //     commonNotify({ type: "warning", message: "请选中文件夹" })
      //   );
      //   return false;
      // }
      this.registTableFlag = true


      // this.$nextTick(() => {
      //   if (this.$refs.tree1) {
      //     this.$refs.tree1.clearSelection();//清空选择的责任人
      //   }
      // })

      this.getTables()
    },
    // 上一步
    step () {
      // this.registTableFlag = true;//关闭上一步
      this.dialogVisible_information = false;//关闭基本信息

      this.clear()
    },
    // 清除注册资产第二步的数据
    clear () {
      // 清空
      this.form.tableCode = ''
      this.form.tableType = ''
      this.form.tableThemeId = ''
      this.form.businessSystemId = ''
      this.form.tableLayeredId = ''
      this.form.folderUuid = ''
      this.form.personUuid = ''
      this.form.tableRemarks = ''
      this.form.isSpike = 1
      this.form.isSentFile = 0
      this.form.check_list.fileName = '',
        this.form.check_list.pid = '',
        this.form.check_list.id = '',
        this.form.check_list.label = '',

        this.personUuid = [];
      this.personName = [];
    },
    // 第一步选择的数据库
    nodeClick_table (data, node, tree) {
      //获取所有选中的节点 start
      let res = this.$refs.tree1.getCheckedNodes()
      var check_list = []
      for (var i = 0; i < res.length; i++) {
        let obj = {
          label: res[i].label,
          fileName: '',
          pid: res[i].pid,
          id: res[i].id,
        }
        check_list.push(obj)
      }
      this.form.check_list = check_list


      if (this.form.check_list.length !== 0) {
        // 显示保存按钮
        this.is_next = true;
        this.ischeck_data = data
      } else {
        this.is_next = false
      }
      //
    },


    // 注册资产 单挑数据 下一步
    next () {
      var list = []
      this.form.check_list.forEach((item) => {
        // let ids = {
        //   pid: item.pid,
        // }
        list.push(item.pid)
      })
      // 选择多个数据表
      if (this.form.check_list.length >= 2) {
        this.post_getColsInfoByTableName();//获取列信息
        this.dialogVisible_forms = true
      } else {
        // this.registTableFlag = false;//关闭上一步
        this.dialogVisible_information = true//显示下一步 基本信息
        this.post_getColsInfoByTableName();//获取列信息
        this.getListTree_data()
        this.form.tbName = this.Column_table_query.tbName.toString()//表名赋值
      }

    },

    // 获取列信息
    post_getColsInfoByTableName () {

      let arr = []
      for (var i = 0; i < this.form.check_list.length; i++) {
        // this.form.file_name = this.form.check_list[i].fileName//文件夹名称
        this.Column_table_query.dbName = this.form.check_list[i].pid
        // = //多个tbName
        arr.push(this.form.check_list[i].label)
      }
      this.Column_table_query.tbName = arr
      const params = {
        dbName: this.Column_table_query.dbName,
        tbNames: this.Column_table_query.tbName,
        tableDataSource: this.query.dataSource,
      }
      getColsInfoByTableName(params).then((resp) => {
        if (resp.data.length !== 1) {
          this.Column_table = resp.data
        } else {
          this.Column_table = resp.data[0].colMetas
          this.form.rowNum = resp.data[0].rowNum//表数据量
          this.form.tableSize = resp.data[0].tableSize//表大小
          this.form.partitions = resp.data[0].partitions//表分区
          this.form.tableCode = resp.data[0].tableRelationQuery.tableCode//资产编码
        }
      })
    },

    // 选择多个的情况  下一步的确认
    next_save () {
      // alert('选择多个的情况 下一步的确认')
      // this.dialogVisible_forms = false;//关闭多选的表单弹窗显示
      // this.dialogVisible_information = true//显示下一步 基本信息
      // this.getListTree_data()

    },
    getListTree_data () {
      getListTree().then((res) => {
        this.next_data = res.data
        if (res.data.contentsList.children) {
          this.next_contentsList = res.data.contentsList.children
        }
        this.next_contentsList.forEach(item => {
          //
          // debugger;

          // 所属目录三级联动判断
          if (item.children.length == 0) {
            item.children = undefined
          } else {
            this.formatCascaderData(item.children)
          }
        })
        // businessSystemList//系统
        // contentsList//目录
        // layeredList//分层
        // themeList//主题

      })
    },





    // 点击 所属目录层级联动
    handleChange (val) {
      // const checkedNode = this.$refs["cascaderArr"].getCheckedNodes();
      //   //获取当前点击节点的label值
      //   //获取由label组成的数组
      // return false
      // this.check_next_contentsList = checkedNode[0]
      // this.form.folderUuid = checkedNode[0].id
      let folderUuid = val.toString();


      this.form.folderUuid = folderUuid

      //
    },

    // 格式化数据，递归将空的children置为undefined
    formatCascaderData (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined;
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.formatCascaderData(data[i].children)
        }
      }
      return data
    },
    // 关闭弹窗
    handleClose (form) {
      this.$refs[form].resetFields() //清空添加的值
      this.clear()
    },

    // 数据日期:
    changeRelationParam (value) {
      this.form.dataDate = value
      console.log(this.form.dataDate);
      // console.log(that.form.tableCode);
    },

    // 下一步的关闭
    close_diag () {
      this.dialogVisible_information = false
      this.chooseTables = []//传输的数据
    },

    // 下一步的保存
    save (form) {
      // this.btnLoading = true
      this.isDisable = true
      setTimeout(() => {
        this.isDisable = false
      }, 2000)
      this.$refs[form].validate((valid) => {
        if (valid) {
          // var ckFolder = this.$refs.tree2.getCurrentNode();
          // ckTbs.filter((tb) => { return tb.type === "TABLE"; }).forEach((node) => {


          let names = this.form.check_list.map(item => item["fileName"]);
          let nameSet = new Set(names);

          if (nameSet.size == names.length) {
            // 
            for (var i = 0; i < this.form.check_list.length; i++) {
              this.form.file_name = this.form.check_list[i].fileName//文件夹名称
              // this.form.file_name = this.form.fileName[i]
              const tableForm = {
                tbName: this.Column_table_query.tbName,//表名
                tableMetaUuid: this.form.check_list[i].id,
                displayTbName: this.form.check_list[i].label,
                dbName: this.form.check_list[i].pid,
                tbName: this.form.check_list[i].label,
                folderUuid: this.form.folderUuid,//目录id
                personLiables: this.form.personLiables,// 资产责任人
                // increment: this.form.increment,//是否增量
                isSpike: this.form.isSpike, //是否增量
                tableRelationQuery: {
                  tableDataSource: this.query.dataSource, //数据源
                  businessSystemId: this.form.businessSystemId, //id主键
                  tableCode: this.form.tableCode, //资产编码
                  tableLayeredId: this.form.tableLayeredId, //资产分层主键
                  tableMetaUuid: this.form.check_list[i].id, //资产主键

                  tableRemarks: this.form.tableRemarks, //资产备注
                  tableThemeId: this.form.tableThemeId, //资产主题主键
                  tableType: this.form.tableType, //资产类型
                  isSpike: this.form.isSpike, //是否增量
                  isSentFile: this.form.isSentFile, //是否推送文件
                  // fileName: this.form.fileName //文件名称
                  fileName: this.form.file_name
                },
              };
              this.chooseTables.push(tableForm);
            }
            batchSaveTable_save(this.chooseTables).then((resp) => {
              if (resp.code == 0) {
                this.$message({
                  type: "success",
                  message: "新增成功!",
                });
                this.btnLoading = false;//保存loadnin
                this.chooseTables = []//传输的数据
                this.post_getBusinessSystemTree();//系统
                this.post_getThemeTree();//主题
                this.post_getLayeredTree();//分层
                // this.post_getDataTreeNode();//目录

              } else {
                this.btnLoading = false
                this.$message({
                  type: "error",
                  message: res.msg,
                });
              }
              this.dialogVisible_information = false;
              this.registTableFlag = false;//关闭上一步
            })
          } else {
            this.$message({ type: "info", message: "文件名字不可以重复!" });
          }
        } else {
          this.btnLoading = false;//保存loadnin
          this.$message({
            message: '请填写信息',
            type: 'info',
            showClose: true,
          })
          return false
        }
      })
    },

    // 选择责任人
    check_people () {
      this.resultShareDialogIsSee = true;
      this.clearcheckbox();
      // this.$nextTick(() => {
      //   if (this.$refs.orgPeopleTree) {
      //     if (this.$refs.multipleTable) {
      //       this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection();//清空选择的责任人
      //     }
      //   }
      // })
    },
    // 选择标签
    check_tag () {
      this.dialogVisible_tag = true
    },
    // 删除标签
    handleClose (tag) {
      this.tagsarr.splice(this.tagsarr.indexOf(tag), 1);
    },

    // 清除多选框
    clearcheckbox () {
      this.$nextTick(() => {
        if (this.$refs.multipleTable) {
          this.$refs.multipleTable.clearSelection();//清除多选框
        }
        if (this.$refs.orgPeopleTree) {
          if (this.$refs.multipleTable) {
            this.$refs.orgPeopleTree.$refs.multipleTable.clearSelection();//清空选择的认权人
            this.$refs.orgPeopleTree.findOrgTree_data();
            this.$refs.orgPeopleTree.list = [];
            this.$refs.orgPeopleTree.total = 0;
          }
        }
      })
    },



    modelResultShare () {
      // this.listLoading = true;
      var runTaskRelUuids = [];
      var personUuids = [];
      var personNames = [];

      var arr = []
      var selectedNode = this.$refs.orgPeopleTree.getSelectValue();
      for (var i = 0; i < selectedNode.length; i++) {
        personUuids.push(selectedNode[i].personuuid);
        personNames.push(selectedNode[i].cnname);

        // this.form.personName_str = personNames.join(",");
        this.Recognition.personName_str = personNames.join(",");


        this.form.personUuid = personUuids
        this.form.personName = personNames
        // this.form.personName = personNames.toString();
        //
        // 
        // 
        let obj = {
          personUuid: selectedNode[i].personuuid,
          personName: selectedNode[i].cnname
        }
        arr.push(obj)
      }
      this.form.personLiables = arr

      this.resultShareDialogIsSee = false;
    },



    // 右侧表单
    // 多选
    // handleSelectionChange (val) {
    //   this.Selectval = val;
    // },

    /**
  * 当多选框改变时触发
  */
    // handleSelectionChange (val) {
    //   this.selectValue = val
    // },

    // 分页
    handleCurrentChange (val) {
      this.query.pageNo = val
      this.query_lisy()
      // this.findSonNodeTreeList(
      //   this.addForm.superLabel,
      //   this.queryInfo.currentPage,
      //   this.queryInfo.pageSize,
      // )
    },
    // 每页多少条
    handleSizeChange (val) {
      this.query.pageSize = val
      this.query_lisy()
      // this.queryInfo.pageSize = val
      // this.findSonNodeTreeList(
      //   this.defaultExpandKeys[0],
      //   this.queryInfo.currentPage,
      //   this.queryInfo.pageSize,
      // )
    },
  },



};
</script>
<style scoped>
@import url("./../../../assets/css/common.css");
.left_conter {
  position: relative;
}
.dataSource >>> .el-form-item {
  display: flex;
  width: 100%;
}
.conter_vh {
  height: calc(100% - 158px);
  overflow: auto;
}

.left_conter >>> .el-tabs__header {
  margin: 0;
}
.left_conter >>> .el-tabs__item {
  width: 25%;
  text-align: center;
}
.left_conter >>> .el-tabs__nav {
  width: 100%;
}
.page-container {
  display: flex;
}
.data_res >>> .el-form {
  padding: 20px 20px 0;
  box-sizing: border-box;
}

.son {
  display: flex;
  margin-bottom: 20px;
}
.son >>> .el-form-item,
.son >>> .el-select,
.son >>> .el-cascader {
  width: 100%;
  display: flex;
  margin-bottom: 0 !important;
}
.data_res >>> .el-form-item__content {
  flex: 1;
  margin-left: 0 !important;
  float: left;
}
.data_res >>> .el-textarea .el-textarea__inner {
  resize: none;
}

.data_res >>> .el-form-item--medium .el-form-item__label {
  float: left !important;
  text-align: right;
}
.son_check {
  display: flex;
  align-items: center;
  width: 100%;
}
.son_check >>> .el-button {
  margin-left: 10px;
}

.table {
  border: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}
.table .head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 30px;
  line-height: 30px;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 400;
}
.table .li_son {
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 20px;
  padding: 10px;
  box-sizing: border-box;
}
/* 标签回显框 */
.tag_conter {
  color: #c0c4cc;
  cursor: not-allowed;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: #606266;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 7px;
}

.tag_conter span {
  margin: 0 3px;
}

/* 认权人 */
.com >>> .el-form {
  width: 100%;
}
.com >>> .el-form-item__content {
  width: 100%;
  display: flex;
  align-items: center;
}
.com >>> .el-form-item {
  display: flex;
}
.com >>> .el-input {
  width: 300px;
}
.com >>> .el-button {
  margin: 0 10px;
}
</style>


<style lang="scss" scoped>
.trees {
  width: 45%;
  float: left;
  margin-top: 1%;
  height: 95%;
}
.divContent {
  position: absolute;
  width: 56%;
  left: 45%;
  height: 95%;
}
.select-link {
  // margin-top: 10px;
  cursor: pointer;
  margin-left: 10px;
}
.page-container .tree-containerselect {
  height: 55vh;
  overflow: auto;
}
.page-container .tree-containerselect .filter-tree {
  margin-top: 20px;
}
.page-container .tree-containerall {
  // height: 75vh;
  overflow: auto;
}
.page-container .tree-containerall .filter-tree {
  margin-top: 20px;
}
.transfer-center-item {
  width: 40px;
  margin: 2px;
  height: 40vh;
}
.agreeicon0 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_0.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon1 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_1.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon2 {
  display: inline-block;
  height: 14px;
  width: 14px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../assets/img/table_2.png");
  vertical-align: top;
  *vertical-align: middle;
}
.agreeicon4 {
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-top: 0;
  background-size: 100%;
  background-image: url("../../../styles/icons/view.png");
  vertical-align: top;
  *vertical-align: middle;
}
.controlTreeNode {
  width: 100%;
  height: 36px;
  text-align: center;
}
.expandTreeNode {
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 10px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ed4;
  &:active {
    background: #5ac3eb !important;
  }
  &:hover {
    background: #5ac3eb !important;
  }
  &:focus {
    background: #5ac3eb !important;
  }
}
.collapseTreeNode {
  position: relative;
  border: 1px #656565;
  top: 6px;
  left: 5px;
  height: 25px;
  width: 25px;
  display: inline-block;
  background: #559ed4;
  &:active {
    background: #5ac3eb !important;
  }
  &:hover {
    background: #5ac3eb !important;
  }
  &:focus {
    background: #5ac3eb !important;
  }
}
.expandIcon {
  height: 12px;
  z-index: 100;
  position: relative;
}
.collapseIcon {
  height: 12px;
  z-index: 100;
  position: relative;
}
.tree-line-btn {
  background: rgba(255, 255, 255, 0) !important;
}
</style>
