<template>
  <div>
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索药品"
        @input="fetchMedicines"
        clearable
        class="search-input"
      />
      <div class="filter-container">
        <el-select v-model="selectedCategory" placeholder="药品类别" @change="fetchMedicines" class="filter-select" clearable>
          <el-option label="抗生素" value="抗生素"></el-option>
          <el-option label="抗病毒药物" value="抗病毒药物"></el-option>
          <el-option label="抗真菌药物" value="抗真菌药物"></el-option>
          <el-option label="抗肿瘤药物" value="抗肿瘤药物"></el-option>
          <el-option label="镇痛药" value="镇痛药"></el-option>
        </el-select>
        <el-select v-model="isPrescription" placeholder="处方药" @change="fetchMedicines" class="filter-select" clearable>
          <el-option label="是" :value="true"></el-option>
          <el-option label="否" :value="false"></el-option>
        </el-select>
        <el-select v-model="isHealthcare" placeholder="保健品" @change="fetchMedicines" class="filter-select" clearable>
          <el-option label="是" :value="true"></el-option>
          <el-option label="否" :value="false"></el-option>
        </el-select>
      </div>
    </div>
    <div class="medicine-container">
      <ul class="medicine-list">
        <li v-for="medicine in medicines" :key="medicine.id" class="medicine-item" @click="openDialog(medicine)">
          <img :src="medicine.image ? 'data:image/jpeg;base64,' + medicine.image : require('@/assets/default_image.jpg')" alt="药品图片" class="medicine-image" />
          <div class="medicine-info">
            <h3 class="medicine-name">{{ medicine.name }}</h3>
            <p class="medicine-description">{{ medicine.description }}</p>
            <span class="medicine-price">价格: {{ medicine.price }}元</span>
            <span class="medicine-stock">库存: {{ medicine.stock }}件</span>
          </div>
        </li>
      </ul>
    </div>
    <el-dialog v-model="dialogVisible" title="药品详情">
      <div v-if="selectedMedicine">
        <div class="medicine-image-container">
          <img v-if="selectedMedicine.image" :src="'data:image/jpeg;base64,' + selectedMedicine.image" alt="药品图片" class="medicine-detail--image" />
        </div>
        <h3>{{ selectedMedicine.name }}</h3>
        <p><strong>描述:</strong> {{ selectedMedicine.description }}</p>
        <p><strong>价格:</strong> {{ selectedMedicine.price }}元</p>
        <p><strong>库存:</strong> {{ selectedMedicine.stock }}件</p>
        <p><strong>销量:</strong> {{ selectedMedicine.sales }}件</p>
        <el-input-number v-model="purchaseQuantity" :min="1" :max="selectedMedicine.stock" label="选择数量"></el-input-number>
      </div>
      <template v-slot:footer>
        <el-button @click="addToCart">加入购物车</el-button>
        <el-button @click="createOrder">创建订单</el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <div class="pagination">
      <el-select v-model="itemsPerPage" @change="fetchMedicines" placeholder="每页数量">
        <el-option label="20" :value="20"></el-option>
        <el-option label="50" :value="50"></el-option>
      </el-select>
      <el-pagination
        @current-change="fetchMedicines"
        :current-page="currentPage"
        :page-size="itemsPerPage"
        :total="totalMedicines"
        layout="prev, pager, next"
        class="pagination-component"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElSelect, ElOption, ElPagination, ElInput, ElDialog, ElInputNumber, ElMessage } from 'element-plus';

export default {
  name: 'MedicineList',
  components: {
    ElSelect,
    ElOption,
    ElPagination,
    ElInput,
    ElDialog,
    ElInputNumber,
  },
  data() {
    return {
      medicines: [],
      currentPage: 1,
      itemsPerPage: 20,
      totalMedicines: 0, // 用于存储总药品数量
      searchKeyword: '', // 搜索关键字
      selectedCategory: '', // 选择的药品类别
      isPrescription: null, // 处方药选择
      isHealthcare: null, // 保健品选择
      dialogVisible: false, // 控制对话框的显示
      selectedMedicine: null, // 存储选中的药品信息
      purchaseQuantity: 1, // 购买数量
    };
  },
  async mounted() {
    await this.fetchMedicines();
  },
  methods: {
    async fetchMedicines() {
      try {
        const response = await axios.get('/medicines', {
          params: {
            limit: this.itemsPerPage,
            index: (this.currentPage - 1) * this.itemsPerPage,
            keyword: this.searchKeyword,
            category: this.selectedCategory,
            is_prescription: this.isPrescription,
            is_healthcare: this.isHealthcare,
          },
        });
        if (response.data.code === 0) {
          this.medicines = response.data.medicines;
          this.totalMedicines = this.medicines.length; // 假设后端返回总药品数量
        } else {
          ElMessage.error('获取药品列表失败');
        }
      } catch (error) {
        console.error('获取药品列表失败:', error);
      }
    },
    openDialog(medicine) {
      this.selectedMedicine = medicine; // 设置选中的药品
      this.purchaseQuantity = 1; // 重置购买数量
      this.dialogVisible = true; // 显示对话框
    },
    async addToCart() {
      try {
        const response = await http.post('/cart', {
          medicine_ids: [this.selectedMedicine.id],
          quantities: [this.purchaseQuantity],
        });
        if (response.data.code === 0) {
          ElMessage.success('添加到购物车成功！');
        } else {
          ElMessage.error('添加到购物车失败');
        }
      } catch (error) {
        console.error('添加到购物车失败:', error);
        ElMessage.error('添加到购物车失败');
      }
      this.dialogVisible = false; // 关闭对话框
    },
    async createOrder() {
      try {
        const response = await http.post('/orders', {
          medicine_items: [
            { medicine_id: this.selectedMedicine.id, quantity: this.purchaseQuantity },
          ],
        });
        if (response.data.code === 0) {
          ElMessage.success('订单创建成功！');
        } else {
          ElMessage.error('订单创建失败');
        }
      } catch (error) {
        console.error('订单创建失败:', error);
        ElMessage.error('订单创建失败');
      }
      this.dialogVisible = false; // 关闭对话框
    },
  },
};
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column; /* 垂直排列搜索框和筛选器 */
  margin-bottom: 16px; /* 搜索框和药品列表之间的间距 */
  align-items: center; /* 居中对齐 */
}

.search-input {
  width: 300px; /* 设置搜索框宽度 */
}

.filter-container {
  display: flex;
  margin-top: 16px;
  gap: 16px; /* 筛选器之间的间距 */
}

.filter-select {
  width: 120px; /* 设置筛选器宽度 */
}

.medicine-container {
  width: 95%; 
  height: auto; /* 自适应高度 */
  overflow-y: auto; /* 允许垂直滚动 */
  border: 1px solid #ccc; /* 边框样式 */
  border-radius: 8px; /* 圆角 */
  padding: 16px; /* 内边距 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  margin: 0 auto; /* 居中对齐 */
}

.pagination {
  display: flex;
  justify-content: center; /* 居中对齐 */
  margin-top: 10px;
}

.pagination-component {
  margin-left: 16px; /* 分页组件与选择框之间的间距 */
}

.medicine-list {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 16px; /* 药品项之间的间距 */
}

.medicine-item {
  width: 150px; /* 设置每个药品项的宽度 */
  border: 1px solid #ccc; /* 边框样式 */
  border-radius: 8px; /* 圆角 */
  padding: 8px; /* 内边距 */
  display: flex;
  flex-direction: column; /* 垂直排列内容 */
  align-items: flex-start; /* 左对齐 */
  text-align: left; /* 文本左对齐 */
  cursor: pointer; /* 鼠标悬停时显示为手型 */
}

.medicine-image {
  width: 100%; /* 图片宽度占满药品项 */
  height: 100px; /* 固定高度 */
  object-fit: cover; /* 保持图片比例并裁剪 */
}
.medicine-image-container {
  width: 300px; /* 图片宽度占满药品项 */
  height: 200px; /* 固定高度 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.medicine-detail--image {
  width: 100%; /* 图片宽度占满药品项 */
  height: 100%; /* 固定高度 */
  object-fit: cover; /* 保持图片比例并裁剪 */
}

.medicine-info {
  display: flex;
  flex-direction: column; /* 垂直排列名称、描述和价格 */
  width: 100%; /* 使其占满整个宽度 */
}

.medicine-name {
  overflow: hidden; /* 超出部分隐藏 */
  white-space: nowrap; /* 不换行 */
  text-overflow: ellipsis; /* 省略号 */
  max-width: 70%; /* 限制名称的最大宽度 */
}

.medicine-description {
  overflow: hidden; /* 超出部分隐藏 */
  white-space: nowrap; /* 不换行 */
  text-overflow: ellipsis; /* 省略号 */
  max-width: 100%; /* 限制描述的最大宽度 */
}

.medicine-price {
  margin-top: 4px; /* 描述和价格之间的间距 */
}

.medicine-stock {
  margin-top: 4px; /* 描述和库存之间的间距 */
}
</style>
