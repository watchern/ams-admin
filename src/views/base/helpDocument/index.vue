<template>
  <div class="page-container">
    <div class="filter-container">
      <QueryField 
      ref="queryfield" 
      :form-data="queryFields"
      @submit="getList" />
    </div>
		<el-row>
			<el-col align="right">
				<el-button type="primary" class="oper-btn add" title="添加帮助文档"  @click="handleAdd()" />
				<el-button type="primary" class="oper-btn edit" title="修改" @click="handleUpdate()" />
				<el-button type="primary" class="oper-btn delete" title="删除" @click="" />
			</el-col>
		</el-row>
		<el-table 
			:key="tableKey" 
			v-loading="listLoading" 
			:data="list" 
			border 
			fit 
			height="500px"
			highlight-current-row 
			style="width: 100%; top: 80px" 
			@sort-change="sortChange" 
			@selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="菜单id"  align="center" prop="menuId" />
      <el-table-column label="菜单名称" align="center" prop="menuName" />
      <el-table-column label="菜单地址"  align="center" prop="menuPath" />
      <el-table-column label="帮助文档"  prop="helpDocument" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pageQuery.pageNo" :limit.sync="pageQuery.pageSize" @pagination="getList" />
		<el-dialog title="添加" :visible.sync="addDialogVisible" width="30%">
      <el-form>
        <el-form-item label="菜单id">
          <el-input v-model="temp.menuId"/>
        </el-form-item>
      </el-form>
			<el-form>
        <el-form-item label="菜单名称">
          <el-input v-model="temp.menuName" />
        </el-form-item>
      </el-form>
			<el-form>
        <el-form-item label="菜单地址">
          <el-input v-model="temp.menuPath" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="addHelpDocument(temp)">进入编辑</el-button>
      </span>
    </el-dialog>
	</div>
</template>
<script>
import { listByPageHelpDocument } from '@/api/base/helpdocument'
import QueryField from '@/components/Ace/query-field/index'
import Pagination from '@/components/Pagination/index'
export default {
  components: { Pagination, QueryField },
  data() {
    return {
      tableKey: 'errorUuid',
      list: null,
      total: 0,
			listLoading: false,
			addDialogVisible : false,
      queryFields: [
        { label: '菜单名称', name: 'menuName', type: 'fuzzyText' },
        { label: '菜单地址', name: 'menuPath', type: 'fuzzyText' },
        { label: '操作时间范围', name: 'helpDocumentTime', type: 'timePeriod' }
      ],
      // selectedRowVal:0,
      tableOptions: {
        columnDefs: [
          {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 30,
            pinned: 'left',
            display: false
          },
          {
            field: 'helpDocumentUuid',
            hide: true
          },
          {
            headerName: '菜单id',
            field: 'menuId',
            pinned: 'left',
            filter: 'agTextColumnFilter'
          },
          {
            headerName: '菜单名称',
            field: 'menuName',
            pinned: 'left'
          },
          {
            headerName: '菜单地址',
            field: 'menuPath',
            pinned: 'left'
          },
          {
            headerName: '帮助文档',
            field: 'helpDocument',
            pinned: 'left'
          }
        ]
      },
      formStyle: {
        width: '700px',
        height: '400px'
      },
      temp: {
        helpDocumentUuid: '',
        menuId: '',
        menuName: '',
        menuPath: '',
        helpDocument: '',
      },
      pageQuery: {
        condition: {},
        pageNo: 1,
        pageSize: 20,
      }
    }
  },
  computed: {

  },
  created() {
    this.getList()
	},
  methods: {
    getList(query) {
      this.listLoading = true
      if (query) {
        this.pageQuery.condition = query
        this.pageQuery.pageNo = 1
      }
      listByPageHelpDocument(this.pageQuery).then(resp => {
				console.log(resp)
        this.total = resp.data.total
        this.list = resp.data.records
        this.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.selections = val
    },
    handleFilter() {
      this.pageQuery.pageNo = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.pageQuery.sortBy = order
      this.pageQuery.sortName = prop
      this.handleFilter()
    },
    resetQuery() {
      this.query = {
        condition: {
					menuId: '',
					menuName: '',
					menuPath: '',
					helpDocument: ''
        }
      }
		},
		handleAdd () {
			this.addDialogVisible = true;
		},
		addHelpDocument (temp) {
			console.log(temp)
		},
		handleUpdate () {
			this.temp = Object.assign({}, this.selections[0])
			console.log(this.temp)
		}
  }
}
</script>
