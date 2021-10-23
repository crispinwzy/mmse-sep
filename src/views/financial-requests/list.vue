<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.q" placeholder="Search financial requests..." style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-permission="['production_manager', 'service_manager']" class="filter-item" style="margin-left: 10px; float:right;" type="success" icon="el-icon-edit" @click="handleCreate">
        New Financial Request
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <el-link type="primary" @click="showDetails(row)">{{ row.id }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="Requesting Department" align="center">
        <template slot-scope="{row}">
          <span>{{ row.requestingDept }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Event ID" align="center">
        <template slot-scope="{row}">
          <span>{{ row.eventId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Required Amount" align="center">
        <template slot-scope="{row}">
          <span>{{ row.requiredAmount }} SEK</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" class-name="status-col" width="150">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="310" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <!-- For PM/SM -->
          <el-button v-permission="['production_manager', 'service_manager']" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-permission="['production_manager', 'service_manager']" :disabled="row.status!='pending'" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>

          <!-- For HR -->
          <el-button v-permission="['financial_manager']" :disabled="row.status!=='pending'" size="mini" type="success" @click="handleModifyStatus(row, 'approve')">
            Approve
          </el-button>
          <el-button v-permission="['financial_manager']" :disabled="row.status!=='pending'" size="mini" type="info" @click="handleModifyStatus(row, 'reject')">
            Reject
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="financialForm" :rules="rules" :model="temp" label-position="left" label-width="250px" style="padding:0 20px;">
        <el-form-item label="Requesting Department" prop="requestingDept">
          <el-radio-group v-model="temp.requestingDept">
            <el-radio label="Administration" value="Administration" />
            <el-radio label="Services" value="Services" />
            <el-radio label="Production" value="Production" />
            <el-radio label="Financial" value="Financial" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Event ID" prop="eventId">
          <el-input v-model="temp.eventId" />
        </el-form-item>
        <el-form-item label="Required Amount (SEK)" prop="requiredAmount">
          <el-input v-model="temp.requiredAmount" />
        </el-form-item>
        <el-form-item label="Reason" prop="reason">
          <el-input v-model="temp.reason" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <!-- Detail -->
    <el-dialog v-if="selectedRow" :title="`Financial Request #${selectedRow.id}`" :visible.sync="detailsDialogVisible" width="600px">
      <el-descriptions :column="1" size="" border label-class-name="desc-label">
        <el-descriptions-item :span="1">
          <template slot="label">
            Requesting Department
          </template>
          {{ selectedRow.requestingDept }}
        </el-descriptions-item>

        <el-descriptions-item :span="1">
          <template slot="label">
            Event ID
          </template>
          {{ selectedRow.eventId }}
        </el-descriptions-item>

        <el-descriptions-item :span="1">
          <template slot="label">
            Required Amount
          </template>
          {{ selectedRow.requiredAmount }} SEK
        </el-descriptions-item>

        <el-descriptions-item :span="1">
          <template slot="label">
            Reason
          </template>
          {{ selectedRow.reason }}
        </el-descriptions-item>

        <el-descriptions-item :span="1">
          <template slot="label">
            Status
          </template>
          <el-tag :type="selectedRow.status | statusFilter">
            {{ selectedRow.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import permission from '@/directive/permission/index.js'
import { fetchList, create, update } from '@/api/financial-requests'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'EventRequests',
  components: { Pagination },
  directives: { waves, permission },
  filters: {
    statusFilter(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        q: undefined,
        sort: '-id'
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        requestingDept: '',
        eventId: undefined,
        requiredAmount: '',
        reason: '',
        status: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      detailsDialogVisible: false,
      selectedRow: null,
      textMap: {
        update: 'Edit',
        create: 'Create Recruitment Request'
      },
      rules: {
        requestingDept: [{ required: true, message: 'required', trigger: 'change' }],
        eventId: [{ required: true, message: 'required', trigger: 'blur' }],
        requiredAmount: [{ required: true, message: 'required', trigger: 'blur' }],
        reason: [{ required: true, message: 'required', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState({
      role: state => state.user.roles[0]
    })
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, action) {
      this.$confirm(`Are you sure you want to ${action} this recruitment request?`, 'Confirm Action', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          switch (action) {
            case 'approve':
              row.status = 'approved'
              break
            case 'reject':
              row.status = 'rejected'
              break
          }

          this.$message({
            message: 'Success',
            type: 'success'
          })
        })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        requestingDept: '',
        eventId: undefined,
        requiredAmount: '',
        reason: '',
        status: undefined
      }
    },
    showDetails(row) {
      this.selectedRow = row
      this.detailsDialogVisible = true
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['financialForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['financialForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.status = 'pending'
          create(this.temp).then(() => {
            this.list.unshift(JSON.parse(JSON.stringify(this.temp)))
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Recruitment Request Created',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      // this.temp = Object.assign({}, row) // copy obj
      this.temp = JSON.parse(JSON.stringify(row))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['financialForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['financialForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Updated Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('Are you sure you want to delete?', 'Confirm Deletion', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          this.$notify({
            title: 'Success',
            message: 'Deleted Successfully',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style>
.desc-label {
  width: 180px;
}
</style>
