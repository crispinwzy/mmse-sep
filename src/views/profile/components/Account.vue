<template>
  <el-form>
    <el-form-item label="Name">
      <el-input v-model.trim="form.name" />
    </el-form-item>
    <el-form-item label="Introduction">
      <el-input v-model.trim="form.introduction" type="textarea" />
    </el-form-item>
    <el-form-item label="Password">
      <el-input v-model.trim="form.password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          introduction: ''
        }
      }
    }
  },
  data() {
    return {
      form: {
        name: '',
        introduction: '',
        password: ''
      }
    }
  },
  created() {
    this.form = {
      name: this.user.name,
      introduction: this.user.introduction,
      password: ''
    }
  },
  methods: {
    submit() {
      this.user.name = this.form.name
      this.user.introduction = this.form.introduction

      this.form = {
        name: this.user.name,
        introduction: this.user.introduction,
        password: ''
      }

      this.$message({
        message: 'Your information has been updated successfully',
        type: 'success',
        duration: 5 * 1000
      })
    }
  }
}
</script>
