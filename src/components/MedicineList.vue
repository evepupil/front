<template>
  <div class="medicine-list-container">
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索药品"
        clearable
        class="search-input"
      />
      <el-button type="primary" @click="fetchMedicines" class="search-button">搜索</el-button>
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
    <div class="main-content">
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
      <div class="recommendations">
        <div class="new-products">
          <h3>新品推荐</h3>
          <ul>
            <li v-for="newMedicine in newMedicines" :key="newMedicine.id">
              <img :src="newMedicine.image ? 'data:image/jpeg;base64,' + newMedicine.image : require('@/assets/default_image.jpg')" alt="新品图片" class="recommendation-image" />
              <span>{{ newMedicine.name }}</span>
            </li>
          </ul>
        </div>
        <div class="hot-products">
          <h3>热门推荐</h3>
          <ul>
            <li v-for="hotMedicine in hotMedicines" :key="hotMedicine.id">
              <img :src="hotMedicine.image ? 'data:image/jpeg;base64,' + hotMedicine.image : require('@/assets/default_image.jpg')" alt="热门图片" class="recommendation-image" />
              <span>{{ hotMedicine.name }}</span>
            </li>
          </ul>
        </div>
      </div>
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
      searchKeyword: '',
      selectedCategory: '',
      isPrescription: null,
      isHealthcare: null,
      medicines: [],
      newMedicines: [], // 新品推荐
      hotMedicines: [], // 热门推荐
      dialogVisible: false,
      selectedMedicine: null,
      purchaseQuantity: 1,
      currentPage: 1,
      itemsPerPage: 20,
      totalMedicines: 0,
    };
  },
  async mounted() {
    await this.fetchMedicines();
    await this.fetchRecommendations(); // 获取推荐药品
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
          this.loadMedicineImages(this.medicines); // 加载药品图片
        } else {
          ElMessage.error('获取药品列表失败');
        }
      } catch (error) {
        console.error('获取药品列表失败:', error);
      }
    },
    async fetchRecommendations() {
      try {
        const response = await http.get('/medicines/recommendations');
        if (response.data.code === 0) {
          this.newMedicines = response.data.newMedicines; // 新品推荐
          this.hotMedicines = response.data.hotMedicines; // 热门推荐
          // 根据 ID 获取图片
          await this.loadMedicineImages(this.newMedicines);
          await this.loadMedicineImages(this.hotMedicines);
        } else {
          ElMessage.error('获取推荐药品失败');
        }
      } catch (error) {
        console.error('获取推荐药品失败:', error);
      }
    },
    async loadMedicineImages(medicines) {
      for (const medicine of medicines) {
        try {
          const response = await http.post('/medicines/ids', { ids: [medicine.id] });
          if (response.data.code === 0) {
            medicine.image = response.data.medicines[0].image; // 更新图片
          }
        } catch (error) {
          console.error('获取药品图片失败:', error);
        }
      }
    },
    openDialog(medicine) {
      this.selectedMedicine = medicine;
      this.dialogVisible = true;
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
.medicine-list-container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
}

.search-container {
  display: flex;
  align-items: center; /* 水平居中对齐 */
  margin-bottom: 16px; /* 搜索框和药品列表之间的间距 */
}

.search-input {
  width: 300px; /* 设置搜索框宽度 */
  margin-right: 10px; /* 搜索框与按钮之间的间距 */
}

.filter-container {
  display: flex;
  margin-top: 16px;
  gap: 16px; /* 筛选器之间的间距 */
}

.filter-select {
  width: 120px; /* 设置筛选器宽度 */
}

.main-content {
  display: flex; /* 使用 Flexbox 布局 */
  margin-top: 20px; /* 主内容与搜索框之间的间距 */
}

.medicine-container {
  width: 70%; /* 药品列表占70%宽度 */
  padding-right: 20px; /* 右侧间距 */
}

.recommendations {
  width: 30%; /* 推荐区域占30%宽度 */
}

.new-products, .hot-products {
  margin-bottom: 20px; /* 推荐区域之间的间距 */
}

.recommendation-image {
  width: 100%; /* 推荐药品图片宽度 */
  height: auto; /* 自适应高度 */
}

h3 {
  margin-bottom: 10px; /* 标题与内容之间的间距 */
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
