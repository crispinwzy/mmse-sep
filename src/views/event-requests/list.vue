<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.client" placeholder="Client" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-permission="['customer_service']" class="filter-item" style="margin-left: 10px; float:right;" type="success" icon="el-icon-edit" @click="handleCreate">
        New Event Request
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
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-col :span="12">
              <el-form-item label="Expected Attendee Number">
                <span>{{ props.row.expectedAttendeeNumber }}</span>
              </el-form-item>
              <el-form-item label="Expected Budget">
                <span>{{ props.row.expectedBudget }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <h3>Preferences</h3>
              <el-form-item label="Decorations">
                <i v-if="props.row.preferences.decorations" class="el-icon-success" />
              </el-form-item>
              <el-form-item label="Parties">
                <i v-if="props.row.preferences.parties" class="el-icon-success" />
              </el-form-item>
              <el-form-item label="Photos/filming">
                <i v-if="props.row.preferences.photos_filming" class="el-icon-success" />
              </el-form-item>
              <el-form-item label="Breakfast, lunch, dinner">
                <i v-if="props.row.preferences.meal" class="el-icon-success" />
              </el-form-item>
              <el-form-item label="Soft/hot drinks">
                <i v-if="props.row.preferences.drinks" class="el-icon-success" />
              </el-form-item>
            </el-col>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Client Info" align="center">
        <el-table-column label="Client Name" width="120" align="center">
          <template slot-scope="{row}">
            <span>{{ row.client.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Phone Number" width="140" align="center">
          <template slot-scope="{row}">
            <span>{{ row.client.phoneNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Email" width="200" align="center">
          <template slot-scope="{row}">
            <span>{{ row.client.email }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="Event Type" align="center">
        <template slot-scope="{row}">
          <span>{{ row.eventType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Start Date" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.startDate | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="End Date" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endDate | parseTime('{y}-{m}-{d}') }}</span>
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
          <!-- Edit -->
          <el-button v-permission="['customer_service', 'senior_customer_service', 'admin_manager']" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <!-- For SCS -->
          <el-button v-if="role==='senior_customer_service'" :disabled="row.status!=='pending'" size="mini" type="success" @click="handleModifyStatus(row, 'approve')">
            Approve
          </el-button>
          <el-button v-if="role==='senior_customer_service'" :disabled="row.status!='pending'" size="mini" type="info" @click="handleModifyStatus(row, 'reject')">
            Reject
          </el-button>

          <!-- For FM -->
          <el-button v-if="role==='financial_manager'" :disabled="row.status!=='approved_by_SCS'" size="mini" type="success" @click="handleModifyStatus(row, 'approve')">
            Approve
          </el-button>
          <el-button v-if="role==='financial_manager'" :disabled="row.status!=='approved_by_SCS'" size="mini" type="info" @click="handleModifyStatus(row, 'reject')">
            Reject
          </el-button>

          <!-- For AM -->
          <el-button v-if="role==='admin_manager'" :disabled="row.status!=='approved_by_FM'" size="mini" type="success" @click="handleModifyStatus(row, 'approve')">
            Approve
          </el-button>
          <el-button v-if="role==='admin_manager'" :disabled="row.status!=='approved_by_FM' && row.status!=='approved'" size="mini" type="info" @click="handleModifyStatus(row, 'reject')">
            Reject
          </el-button>

          <!-- Delete -->
          <el-button v-permission="['senior_customer_service', 'admin_manager']" :disabled="row.status!='pending'" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="requestForm" :rules="rules" :model="temp" label-position="left" label-width="250px" style="padding:0 20px;">
        <el-form-item label="Client Name" prop="name">
          <el-input v-model="temp.client.name" />
        </el-form-item>
        <el-form-item label="Client Phone Number" prop="phoneNumber">
          <el-input v-model="temp.client.phoneNumber" />
        </el-form-item>
        <el-form-item label="Client Email" prop="email">
          <el-input v-model="temp.client.email" />
        </el-form-item>
        <el-form-item label="Event Type" prop="eventType">
          <el-input v-model="temp.eventType" />
        </el-form-item>
        <el-form-item label="Start Date" prop="startDate">
          <el-date-picker v-model="temp.startDate" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="End Date" prop="endDate">
          <el-date-picker v-model="temp.endDate" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Expected Number of Attendees" prop="expectedAttendeeNumber">
          <el-input v-model="temp.expectedAttendeeNumber" />
        </el-form-item>

        <el-form-item label="Preferenecs">
          <el-checkbox v-model="temp.preferences.decorations" label="Decorations" name="decaorations" />
          <el-checkbox v-model="temp.preferences.parties" label="Parties" name="parties" />
          <el-checkbox v-model="temp.preferences.photos_filming" label="Photos/filming" name="photos_filming" />
          <el-checkbox v-model="temp.preferences.meal" label="Breakfast, lunch, dinner" name="meal" />
          <el-checkbox v-model="temp.preferences.drinks" label="Soft/hot drinks" name="drinks" />
        </el-form-item>

        <el-form-item label="Expected Budget" prop="expectedBudget">
          <el-input v-model="temp.expectedBudget" />
        </el-form-item>

        <!-- <el-form-item label="Job description">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item> -->
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
  </div>
</template>

<script>
import { mapState } from 'vuex'
import permission from '@/directive/permission/index.js'
import { fetchList, createEventRequest, updateEventRequest } from '@/api/event-requests'
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
        approved_by_SCS: 'primary',
        approved_by_FM: 'primary',
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
        client: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        client: {
          name: '',
          email: '',
          phoneNumber: ''
        },
        startDate: undefined,
        endDate: undefined,
        eventType: '',
        expectedAttendeeNumber: '',
        preferences: {
          decaorations: undefined,
          parties: undefined,
          photos_filming: undefined,
          meal: undefined,
          drinks: undefined
        },
        expectedBudget: undefined,
        status: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Request for Event Planning'
      },
      rules: {
        // type: [{ required: true, message: 'type is required', trigger: 'change' }],
        // name: [{ required: true, message: 'client name is required', trigger: 'blur' }],
        // email: [{ type: 'email', required: true, message: 'email is required', trigger: 'blur' }],
        // phoneNumber: [{ type: 'number', required: true, message: 'client name is required', trigger: 'blur' }],
        // startDate: [{ type: 'date', required: true, message: 'start date is required', trigger: 'change' }],
        // endDate: [{ type: 'date', required: true, message: 'end date is required', trigger: 'change' }]
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
      this.$confirm(`Are you sure you want to ${action} this event request?`, 'Confirm Deletion', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          switch (action) {
            case 'approve':
              if (this.role === 'senior_customer_service') {
                row.status = 'approved_by_SCS'
              } else if (this.role === 'financial_manager') {
                row.status = 'approved_by_FM'
              } else if (this.role === 'admin_manager') {
                row.status = 'approved'
              }
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
        client: {
          name: '',
          email: '',
          phoneNumber: ''
        },
        startDate: undefined,
        endDate: undefined,
        eventType: '',
        expectedAttendeeNumber: '',
        preferences: {
          decaorations: undefined,
          parties: undefined,
          photos_filming: undefined,
          meal: undefined,
          drinks: undefined
        },
        expectedBudget: undefined,
        status: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['requestForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['requestForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.status = 'pending'
          createEventRequest(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Event Request Created',
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
        this.$refs['requestForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['requestForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateEventRequest(tempData).then(() => {
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
            message: 'Delete Successfully',
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

<style scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 240px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
