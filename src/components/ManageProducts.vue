<template>
  <div class="manage-products">
    <h2>药品管理</h2>
    <el-form :model="medicineForm" label-width="100px">
      <el-form-item label="药品名称">
        <el-input v-model="medicineForm.name"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="medicineForm.description"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="medicineForm.price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="库存">
        <el-input v-model="medicineForm.stock" type="number"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="uploadMedicine">上传药品信息</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus';
import http from '@/http'; // 引入配置好的 Axios 实例

export default {
  name: 'ManageProducts',
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
  },
  data() {
    return {
      medicineForm: {
        name: '',
        description: '',
        price: 0,
        stock: 0,
      },
    };
  },
  methods: {
    async uploadMedicine() {
      try {
        // 假设有一个 API 可以处理药品信息上传
        const response = await http.post('/api/medicines', this.medicineForm);
        if (response.data.code === 0) {
          ElMessage.success('药品信息上传成功');
          this.resetForm();
        } else {
          ElMessage.error(`上传失败: ${response.data.message}`);
        }
      } catch (error) {
        ElMessage.error(`上传失败: ${error.message}`);
      }
    },
    resetForm() {
      this.medicineForm = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
      };
    },
  },
};
</script>

<style scoped>
.manage-products {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style> 