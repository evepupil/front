<template>
  <div class="main-content">
    <!-- 搜索容器在最上方居中 -->
    <div class="search-container">
      <div class="search-input-group">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索药品"
          clearable
          class="search-input"
        />
        <el-button type="primary" @click="fetchMedicines" class="search-button">搜索</el-button>
      </div>
      <div class="filter-container">
        <div class="filter-group">
          <span>类别:</span>
          <el-checkbox v-model="selectAllCategories" @change="toggleAllCategories">全部</el-checkbox>
          <el-checkbox-group v-model="selectedCategories" @change="fetchMedicines">
            <el-checkbox label="抗生素">抗生素</el-checkbox>
            <el-checkbox label="抗病毒药物">抗病毒药物</el-checkbox>
            <el-checkbox label="抗真菌药物">抗真菌药物</el-checkbox>
            <el-checkbox label="抗肿瘤药物">抗肿瘤药物</el-checkbox>
            <el-checkbox label="镇痛药">镇痛药</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-group">
          <span>处方药:</span>
          <el-checkbox-group v-model="isPrescriptionArray" @change="handlePrescriptionChange">
            <el-checkbox label="是">是</el-checkbox>
            <el-checkbox label="否">否</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-group">
          <span>保健品:</span>
          <el-checkbox-group v-model="isHealthcareArray" @change="handleHealthcareChange">
            <el-checkbox label="是">是</el-checkbox>
            <el-checkbox label="否">否</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <!-- 药品容器包含药品列表和推荐区域 -->
    <div class="medicine-container">
      <!-- 药品列表在左侧 -->
      <ul class="medicine-list">
        <li v-for="medicine in medicines" :key="medicine.id" class="medicine-item" @click="openDialog(medicine)">
          <img :src="medicine.image ? 'data:image/jpeg;base64,' + medicine.image : require('@/assets/default_image.jpg')" alt="药品图片" class="medicine-image" />
          <div class="medicine-info">
            <h3 class="medicine-name" :title="medicine.name">{{ medicine.name }}</h3>
            <p class="medicine-description" v-if="medicine.description">{{ medicine.description }}</p>
            <p class="medicine-description empty-description" v-else>&nbsp;</p>
            <p class="medicine-price">价格: {{ medicine.price }}元</p>
            <p class="medicine-stock">库存: {{ medicine.stock }}件</p>
            <p class="medicine-stock">销量: {{ medicine.sales }}件</p>

          </div>
        </li>
      </ul>
      
      <!-- 推荐区域在右侧 -->
      <div class="recommendations">
        <div class="new-products">
          <h3>新品推荐</h3>
          <ul>
            <li v-for="(newMedicine, index) in newMedicines.slice(0, 5)" :key="newMedicine.id" class="medicine-item" @click="openDialog(newMedicine)">
              <span class="rank">{{ index + 1 }}.</span>
              <img :src="newMedicine.image ? 'data:image/jpeg;base64,' + newMedicine.image : require('@/assets/default_image.jpg')" alt="新品图片" class="recommendation-image" />
              <div class="medicine-info">
                <h3 class="medicine-name" :title="newMedicine.name">{{ newMedicine.name }}</h3>
                <p class="medicine-description" v-if="newMedicine.description">{{ newMedicine.description }}</p>
                <p class="medicine-description empty-description" v-else>&nbsp;</p>
                <p class="medicine-price">价格: {{ newMedicine.price }}元</p>
                <p class="medicine-stock">库存: {{ newMedicine.stock }}件</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="hot-products">
          <h3>热门推荐</h3>
          <ul>
            <li v-for="(hotMedicine, index) in hotMedicines" :key="hotMedicine.id" class="medicine-item" @click="openDialog(hotMedicine)">
              <span class="rank">{{ index + 1 }}.</span>
              <img :src="hotMedicine.image ? 'data:image/jpeg;base64,' + hotMedicine.image : require('@/assets/default_image.jpg')" alt="热门图片" class="recommendation-image" />
              <div class="medicine-info">
                <h3 class="medicine-name" :title="hotMedicine.name">{{ hotMedicine.name }}</h3>
                <p class="medicine-description" v-if="hotMedicine.description">{{ hotMedicine.description }}</p>
                <p class="medicine-description empty-description" v-else>&nbsp;</p>
                <p class="medicine-price">价格: {{ hotMedicine.price }}元</p>
                <p class="medicine-stock">库存: {{ hotMedicine.stock }}件</p>
                <p class="medicine-sales">销量: {{ hotMedicine.sales }}件</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination">
      <div class="select">
        <el-select v-model="itemsPerPage" @change="fetchMedicines" placeholder="每页数量">
        <el-option label="20" :value="20"></el-option>
        <el-option label="50" :value="50"></el-option>
      </el-select>
      </div>
            <el-pagination
        @current-change="fetchMedicines"
        :current-page="currentPage"
        :page-size="itemsPerPage"
        :total="totalMedicines"
        layout="prev, pager, next"
        class="pagination-component"
      />
    </div>
    
    <!-- 药品详情对话框 -->
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
  </div>
</template>

<script>
import axios from 'axios';
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElSelect, ElOption, ElDialog, ElInputNumber, ElMessage,  ElButton, ElCheckbox, ElCheckboxGroup } from 'element-plus';

export default {
  name: 'MedicineList',
  components: {
    ElSelect,
    ElOption,
    ElDialog,
    ElInputNumber,
    ElButton,
    ElCheckbox,
    ElCheckboxGroup
  },
  data() {
    return {
      searchKeyword: '',
      showDropdown: false, // 控制下拉框的显示
      selectedCategories: [], // 选中的类别
      selectAllCategories: false, // 是否全选类别
      isPrescription: null, // 是否处方药
      isHealthcare: null, // 是否保健品
      isPrescriptionArray: [], // 处方药复选框数组
      isHealthcareArray: [], // 保健品复选框数组
      medicines: [],
      newMedicines: [], // 新品推荐
      hotMedicines: [], // 热门推荐
      dialogVisible: false,
      selectedMedicine: null,
      purchaseQuantity: 1,
      currentPage: 1,
      itemsPerPage: 20,
      totalMedicines: 0,
      allCategories: ['抗生素', '抗病毒药物', '抗真菌药物', '抗肿瘤药物', '镇痛药'], // 所有类别
    };
  },
  async mounted() {
    await this.fetchMedicines();
    await this.fetchRecommendations();// 获取推荐药品
  },
  methods: {
    async fetchMedicines() {
      try {
        const response = await axios.get('/medicines', {
          params: {
            limit: this.itemsPerPage,
            index: (this.currentPage - 1) * this.itemsPerPage,
            keyword: this.searchKeyword,
            categories: this.selectedCategories,
            is_prescription: this.isPrescription,
            is_healthcare: this.isHealthcare,
          },
        });
        if (response.data.code === 0) {
          this.medicines = response.data.medicines;
          this.totalMedicines = this.medicines.length; 
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
    handleDropdownCommand(command) {
      // 处理下拉框的命令
      console.log(command);
    },
    hideDropdown() {
      this.showDropdown = false; // 隐藏下拉框
    },
    toggleAllCategories(val) {
      if (val) {
        this.selectedCategories = [...this.allCategories];
      } else {
        this.selectedCategories = [];
      }
      this.fetchMedicines();
    },
    handlePrescriptionChange() {
      if (this.isPrescriptionArray.includes('是') && this.isPrescriptionArray.includes('否')) {
        this.isPrescription = null;
      } else if (this.isPrescriptionArray.includes('是')) {
        this.isPrescription = true;
      } else if (this.isPrescriptionArray.includes('否')) {
        this.isPrescription = false;
      } else {
        this.isPrescription = null;
      }
      this.fetchMedicines();
    },
    handleHealthcareChange() {
      if (this.isHealthcareArray.includes('是') && this.isHealthcareArray.includes('否')) {
        this.isHealthcare = null;
      } else if (this.isHealthcareArray.includes('是')) {
        this.isHealthcare = true;
      } else if (this.isHealthcareArray.includes('否')) {
        this.isHealthcare = false;
      } else {
        this.isHealthcare = null;
      }
      this.fetchMedicines();
    },
  },
  watch: {
    selectedCategories(newVal) {
      this.selectAllCategories = newVal.length === this.allCategories.length;
    }
  }
};
</script>

<style scoped>
/* 主内容区域使用相对布局 */
.main-content {
  position: relative;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
}

/* 搜索容器居中显示在最上方 */
.search-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto 30px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-input-group {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 600px;
  margin-right: 10px;
}

.search-button {
  min-width: 100px;
}

/* 筛选器容器 */
.filter-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.filter-group {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0;
}

.filter-group span {
  display: inline-block;
  width: 70px;
  margin-right: 12px;
  white-space: nowrap;
  text-align: left;
  color: #606266;
  font-weight: 500;
}

/* 药品列表容器 */
.medicine-container {
  display: flex;
  width: 100%;
  gap: 40px;
  padding-right: 20px;
}

/* 药品列表占据左侧 */
.medicine-list {
  width: calc(100% - 280px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding-right: 0;
}

.recommendations {
  width: 280px;
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .medicine-list {
    width: calc(100% - 280px);
    grid-template-columns: repeat(3, 1fr);
  }
  .recommendations {
    width: 280px;
  }
}
.medicine-item {
  width: 100%;
  min-width: 240px;
  height: 340px;
  min-height: 240px;
  border: none;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s, box-shadow 0.3s;
}

.medicine-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.medicine-image, .recommendation-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}

.medicine-info {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  padding: 0 8px;
}

.medicine-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.4;
}

.medicine-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.4;
}

.medicine-price {
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
  margin: 4px 0;
}

.medicine-stock, .medicine-sales {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 分页控件样式 */
.pagination {
  margin-top: 30px;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

/* 对话框样式 */
.medicine-image-container {
  width: 100%;
  height: 300px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.medicine-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

@media (max-width: 1200px) {
  .medicine-list {
    width: 65%;
    grid-template-columns: repeat(3, 1fr);
  }
  .recommendations {
    width: 35%;
  }
}

@media (max-width: 768px) {
  .medicine-container {
    flex-direction: column;
  }
  .medicine-list, .recommendations ul {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .medicine-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
  .medicine-item {
    width: calc(50% - 10px);
  }
  .search-container {
    width: 100%;
    padding: 15px;
  }
  .search-input {
    width: 100%;
  }
  .medicine-list, .recommendations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

</style>
.recommendations {
  width: 100%;
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.new-products,
.hot-products {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.new-products h3,
.hot-products h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f2f5;
}

.recommendations .medicine-item {
  display: flex;
  align-items: flex-start;
  height: auto;
  min-height: 100px;
  margin-bottom: 15px;
  padding: 10px;
}

.recommendations .medicine-item:last-child {
  margin-bottom: 0;
}

.recommendations .recommendation-image {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  margin-bottom: 0;
}

.recommendations .medicine-info {
  flex: 1;
  padding: 0;
}

.recommendations .medicine-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.recommendations .medicine-description,
.recommendations .medicine-price,
.recommendations .medicine-stock,
.recommendations .medicine-sales {
  font-size: 12px;
  margin: 2px 0;
}

.recommendations .rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  margin-right: 8px;
  padding: 0 6px;
  background: #f44336;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .medicine-container {
    flex-direction: column;
  }
  .medicine-list {
    width: 100%;
  }
  .recommendations {
    width: 100%;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .recommendations {
    flex-direction: column;
  }
  .new-products,
  .hot-products {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .medicine-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
  .medicine-item {
    width: calc(50% - 10px);
  }
  .search-container {
    width: 100%;
    padding: 15px;
  }
  .search-input {
    width: 100%;
  }
  .medicine-list, .recommendations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}


<style scoped>
.recommendations {
  width: 100%;
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.new-products,
.hot-products {
  width: 300px;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.new-products h3,
.hot-products h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f2f5;
}

.recommendations .medicine-item {
  display: flex;
  align-items: flex-start;
  height: auto;
  min-height: 100px;
  margin-bottom: 15px;
  padding: 10px;
}

.recommendations .medicine-item:last-child {
  margin-bottom: 0;
}

.recommendations .recommendation-image {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  margin-bottom: 0;
}

.recommendations .medicine-info {
  flex: 1;
  padding: 0;
}

.recommendations .medicine-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.recommendations .medicine-description,
.recommendations .medicine-price,
.recommendations .medicine-stock,
.recommendations .medicine-sales {
  font-size: 12px;
  margin: 2px 0;
}

.recommendations .rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  margin-right: 8px;
  padding: 0 6px;
  background: #f44336;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .medicine-container {
    flex-direction: column;
  }
  .medicine-list {
    width: 100%;
  }
  .recommendations {
    width: 100%;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .recommendations {
    flex-direction: column;
  }
  .new-products,
  .hot-products {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .medicine-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
  .medicine-item {
    width: calc(50% - 10px);
  }
  .search-container {
    width: 100%;
    padding: 15px;
  }
  .search-input {
    width: 100%;
  }
  .medicine-list, 
  .recommendations ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

</style>
