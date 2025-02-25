<template>
  <div>
    <h2>用户管理</h2>
    <el-table :data="users" style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="is_admin" label="用户类型" :formatter="formatUserType" />
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button @click="openEditDialog(scope.row)" type="primary">编辑</el-button>
          <el-button @click="deleteUser(scope.row.id)" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="编辑用户信息" v-model="editDialogVisible">
      <el-form :model="editUser" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editUser.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editUser.phone"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="editUser.address"></el-input>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-input :value="editUser.is_admin ? '管理员' : '普通用户'" disabled></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUserProfile">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElMessage } from 'element-plus';

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [], // 存储用户列表
      editUser: {
        username: '',
        email: '',
        phone: '',
        address: '',
        is_admin: false,
      },
      editDialogVisible: false, // 控制编辑对话框的显示
    };
  },
  async created() {
    await this.fetchUsers(); // 获取用户列表
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await http.get('/users'); // 从后端获取用户列表
        if (response.data.code === 0) {
          this.users = response.data.users; // 更新用户列表
        } else {
          ElMessage.error('获取用户列表失败');
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
      }
    },
    openEditDialog(user) {
      this.editUser = { ...user }; // 复制用户信息到编辑对象
      this.editDialogVisible = true; // 打开编辑对话框
    },
    async updateUserProfile() {
      try {
        const response = await http.put(`/users/${this.editUser.id}`, this.editUser); // 假设后端有此接口
        if (response.data.code === 0) {
          ElMessage.success('用户信息更新成功');
          this.editDialogVisible = false; // 关闭对话框
          await this.fetchUsers(); // 重新获取用户列表
        } else {
          ElMessage.error('更新用户信息失败');
        }
      } catch (error) {
        console.error('更新用户信息失败:', error);
        ElMessage.error('更新用户信息失败');
      }
    },
    formatUserType(row) {
      return row.is_admin ? '管理员' : '普通用户'; // 格式化用户类型
    },
    async deleteUser(userId) {
      try {
        const response = await http.delete(`/users/${userId}`); // 删除用户
        if (response.data.message === 'User deleted successfully!') {
          ElMessage.success('用户删除成功');
          this.fetchUsers(); // 刷新用户列表
        } else {
          ElMessage.error('删除用户失败');
        }
      } catch (error) {
        ElMessage.error('删除用户失败');
      }
    },
  },
};
</script>

<style scoped>
/* 添加样式 */
</style> 