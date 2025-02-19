<template>
  <div class="manage-products">
    <h2>药品管理</h2>
    <el-form :model="medicineForm" label-width="100px">
      <el-form-item label="药品名称">
        <el-input v-model="medicineForm.name"></el-input>
      </el-form-item>
      <el-form-item label="类别">
        <el-select v-model="medicineForm.category" placeholder="请选择类别">
          <el-option label="抗生素" value="抗生素"></el-option>
          <el-option label="抗病毒药物" value="抗病毒药物"></el-option>
          <el-option label="抗真菌药物" value="抗真菌药物"></el-option>
          <el-option label="抗肿瘤药物" value="抗肿瘤药物"></el-option>
          <el-option label="镇痛药" value="镇痛药"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="medicineForm.description"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="medicineForm.price" type="number" min="0" step="0.01"></el-input>
      </el-form-item>
      <el-form-item label="库存">
        <el-input v-model="medicineForm.stock" type="number" min="0"></el-input>
      </el-form-item>
      <el-form-item label="是否为处方药">
        <el-switch v-model="medicineForm.is_prescription"></el-switch>
      </el-form-item>
      <el-form-item label="是否为保健品">
        <el-switch v-model="medicineForm.is_healthcare"></el-switch>
      </el-form-item>
      <el-form-item label="上传图片">
        <el-upload
          class="upload-demo"
          drag
          :before-upload="beforeUpload"
          :on-change="handleImageChange"
          :file-list="[]"
          :limit="1"
          :auto-upload="false"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          list-type="picture"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template v-slot:tip>
            <div>只能上传1张JPG/PNG 文件，且不超过 2MB</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="uploadMedicine">上传药品信息</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElSelect, ElOption, ElSwitch, ElUpload } from 'element-plus';
import http from '@/http'; // 引入配置好的 Axios 实例

export default {
  name: 'ManageProducts',
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElSelect,
    ElOption,
    ElSwitch,
    ElUpload,
  },
  data() {
    return {
      medicineForm: {
        name: '',
        category: '',
        description: '',
        price: 0,
        stock: 0,
        is_prescription: false,
        is_healthcare: false,
      },
      imageFile: null, // 用于存储上传的图片文件
    };
  },
  methods: {
    handleImageChange(file) {
      this.imageFile = file.raw;
    },
    
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        ElMessage.error('上传图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    async uploadMedicine() {
      // 验证价格和库存
      if (this.medicineForm.price <= 0) {
        ElMessage.error('价格必须大于0');
        return;
      }
      if (this.medicineForm.stock < 0) {
        ElMessage.error('库存不能为负数');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('name', this.medicineForm.name);
        formData.append('category', this.medicineForm.category);
        formData.append('description', this.medicineForm.description);
        formData.append('price', this.medicineForm.price);
        formData.append('stock', this.medicineForm.stock);
        formData.append('is_prescription', this.medicineForm.is_prescription);
        formData.append('is_healthcare', this.medicineForm.is_healthcare);
        
        // 上传图片
        if (this.imageFile) {
          formData.append('image', this.imageFile); // 取上传的文件
        }

        const response = await http.post('/medicines/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

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
        category: '',
        description: '',
        price: 0,
        stock: 0,
        is_prescription: false,
        is_healthcare: false,
      };
      this.imageFile = null; // 清空上传的文件
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