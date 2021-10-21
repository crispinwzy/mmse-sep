<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.q" placeholder="Search tasks..." style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-permission="['production_manager', 'service_manager']" class="filter-item" style="margin-left: 10px; float:right;" type="success" icon="el-icon-edit" @click="handleCreate">
        New Task
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
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Task Subject" align="center">
        <template slot-scope="{row}">
          <el-link type="primary" @click="showDetails(row)">{{ row.subject }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="Priority" align="center" width="120">
        <template slot-scope="{row}">
          <el-tag :type="row.priority | priorityFilter" effect="plain">
            {{ row.priority }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Assign To" align="center">
        <template slot-scope="{row}">
          <span>{{ row.assignTo }}</span>
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
          <el-button v-permission="['production_manager', 'service_manager']" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <!-- Delete -->
          <el-button v-permission="['production_manager', 'service_manager']" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px">
      <el-form ref="taskForm" :rules="rules" :model="temp" label-position="left" label-width="140px" style="padding:0 20px;">
        <el-form-item label="Event ID" prop="eventId">
          <el-input v-model="temp.eventId" />
        </el-form-item>
        <el-form-item label="Task Subject" prop="subject">
          <el-input v-model="temp.subject" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="temp.description" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="Assign To" prop="assignTo">
          <el-select v-model="temp.assignTo">
            <el-option v-for="item in assigneeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Priority" prop="priority">
          <el-select v-model="temp.priority">
            <el-option label="High" value="High" />
            <el-option label="Medium" value="Medium" />
          </el-select>
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

    <el-dialog v-if="selectedTask" :title="'Task Details'" :visible.sync="taskDetailsDialogVisible" width="800px">
      <el-descriptions :column="1" size="" border>
        <el-descriptions-item>
          <template slot="label">
            ID
          </template>
          {{ selectedTask.id }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Event ID
          </template>
          {{ selectedTask.eventId }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Subject
          </template>
          {{ selectedTask.subject }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Description
          </template>
          {{ selectedTask.description }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Priority
          </template>
          <el-tag :type="selectedTask.priority | priorityFilter" effect="plain">
            {{ selectedTask.priority }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Assign to
          </template>
          {{ selectedTask.assignTo }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Status
          </template>
          <el-tag :type="selectedTask.status | statusFilter">
            {{ selectedTask.status }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label">
            Comment from Assignee
          </template>
          {{ selectedTask.commentFromAssignee }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import permission from '@/directive/permission/index.js'
import { fetchList, createTask, updateTask } from '@/api/tasks'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'EventRequests',
  components: { Pagination },
  directives: { waves, permission },
  filters: {
    priorityFilter(status) {
      const statusMap = {
        High: 'danger',
        Medium: 'warning'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      const statusMap = {
        pending: 'warning',
        in_progress: 'primary',
        done: 'success'
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
      assigneeOptions: ['David', 'Kevin', 'Susan', 'Michael', 'Lisa', 'Laura'],
      temp: {
        id: undefined,
        eventId: '',
        subject: '',
        description: '',
        assignTo: '',
        priority: '',
        sender: undefined,
        status: undefined,
        commentFromAssignee: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      taskDetailsDialogVisible: false,
      selectedTask: null,
      textMap: {
        update: 'Edit Task',
        create: 'Create New Task'
      },
      rules: {
        eventId: [{ required: true, message: 'event ID is required', trigger: 'blur' }],
        subject: [{ required: true, message: 'subject is required', trigger: 'blur' }],
        assignTo: [{ required: true, message: 'please select assignee', trigger: 'change' }],
        priority: [{ required: true, message: 'please select priority', trigger: 'change' }]
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
        eventId: '',
        subject: '',
        description: '',
        assignTo: '',
        priority: '',
        sender: undefined,
        status: undefined,
        commentFromAssignee: undefined
      }
    },
    showDetails(row) {
      this.selectedTask = row
      this.taskDetailsDialogVisible = true
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['taskForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.status = 'pending'
          createTask(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Task Sent',
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
        this.$refs['taskForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateTask(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Task Updated Successfully',
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
