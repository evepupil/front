<template>
  <div class="manage-products">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h2>药品管理</h2>
        </div>
      </template>

      <el-form 
        :model="medicineForm" 
        :rules="rules"
        ref="medicineFormRef"
        label-width="120px"
        status-icon
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品名称" prop="name">
              <el-input v-model="medicineForm.name" placeholder="请输入药品名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类别" prop="category">
              <el-select v-model="medicineForm.category" placeholder="请选择类别" class="w-100">
                <el-option label="抗生素" value="抗生素"></el-option>
                <el-option label="抗病毒药物" value="抗病毒药物"></el-option>
                <el-option label="抗真菌药物" value="抗真菌药物"></el-option>
                <el-option label="抗肿瘤药物" value="抗肿瘤药物"></el-option>
                <el-option label="镇痛药" value="镇痛药"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="medicineForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入药品描述"
          ></el-input>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number 
                v-model="medicineForm.price" 
                :min="0" 
                :precision="2" 
                :step="0.1"
                class="w-100"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number 
                v-model="medicineForm.stock" 
                :min="0" 
                :precision="0"
                class="w-100"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否为处方药">
              <el-switch v-model="medicineForm.is_prescription"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否为保健品">
              <el-switch v-model="medicineForm.is_healthcare"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="上传图片" prop="image">
          <el-upload
            class="medicine-uploader"
            drag
            :before-upload="beforeUpload"
            :on-change="handleImageChange"
            :file-list="fileList"
            :limit="1"
            :auto-upload="false"
            list-type="picture-card"
          >
            <template #default>
              <el-icon><Upload /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
            </template>
            <template #tip>
              <div class="upload-tip">只能上传1张JPG/PNG文件，且不超过2MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">上传药品信息</el-button>
          <el-button @click="resetFormData">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import http from '@/http'

export default {
  name: 'ManageProducts',
  components: {
    Upload
  },
  setup() {
    const medicineFormRef = ref(null)
    const loading = ref(false)
    const fileList = ref([])

    const medicineForm = reactive({
      name: '',
      category: '',
      description: '',
      price: 0,
      stock: 0,
      is_prescription: false,
      is_healthcare: false,
    })

    const rules = {
      name: [
        { required: true, message: '请输入药品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择药品类别', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入药品描述', trigger: 'blur' }
      ],
      price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
      ],
      stock: [
        { required: true, message: '请输入库存数量', trigger: 'blur' },
        { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
      ]
    }

    const handleImageChange = (file) => {
      fileList.value = [file]
    }
    
    const beforeUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('上传图片只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    const submitForm = async () => {
      if (!medicineFormRef.value) return

      await medicineFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            const formData = new FormData()
            Object.keys(medicineForm).forEach(key => {
              formData.append(key, medicineForm[key])
            })
            
            if (fileList.value.length > 0) {
              formData.append('image', fileList.value[0].raw)
            }

            const response = await http.post('/medicines/add', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data.code === 0) {
              ElMessage.success('药品信息上传成功')
              resetFormData()
            } else {
              ElMessage.error(`上传失败: ${response.data.message}`)
            }
          } catch (error) {
            ElMessage.error(`上传失败: ${error.message}`)
          } finally {
            loading.value = false
          }
        }
      })
    }

    const resetFormData = () => {
      if (medicineFormRef.value) {
        medicineFormRef.value.resetFields()
        fileList.value = []
      }
    }

    return {
      medicineFormRef,
      medicineForm,
      rules,
      loading,
      fileList,
      handleImageChange,
      beforeUpload,
      submitForm,
      resetFormData
    }
  }
}
</script>

<style scoped>
.manage-products {
  padding: 20px;
}

.form-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.w-100 {
  width: 100%;
}

.medicine-uploader {
  text-align: center;
}

.upload-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 30px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}
</style>