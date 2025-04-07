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
  margin: 0 auto;
  padding: 20px;
}

/* 搜索容器居中显示在最上方 */
.search-container {
  width: 80%;
  margin: 0 auto 30px auto;
  text-align: center;
}

.search-input-group {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.search-input {
  width: 600px;
  margin-right: 10px;
}

/* 筛选器容器 */
.filter-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 5px;
}

.filter-group span {
  display: inline-block;
  width: 70px;
  margin-right: 8px;
  white-space: nowrap;
  text-align: left;
}

/* 药品列表容器 */
.medicine-container {
  display: flex;
  width: 100%;
}

/* 药品列表占据左侧 */
.medicine-list {
  width: 70%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-right: 20px;
}

/* 推荐区域占据右侧，并使用flex布局横向排列 */
.recommendations {
  width: 30%;
  display: flex;
  flex-direction: row; /* 改为横向排列 */
  justify-content: space-between; /* 两边对齐 */
  flex-wrap: wrap; /* 允许在小屏幕上换行 */
}

.new-products, .hot-products {
  width: 48%; /* 各占48%宽度，留出间距 */
  margin-bottom: 20px;
}

/* 确保推荐区域的药品项适应宽度 */
.recommendations .medicine-item {
  width: 100%; /* 在推荐区域中占满宽度 */
  margin-bottom: 10px;
}

/* 排名样式 */
.rank {
  font-weight: bold;
  margin-right: 5px;
  color: #333;
}

/* 其他样式保持不变 */
.medicine-item {
  width: 180px;
  height: 240px;
  min-height: 240px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
}

.medicine-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.recommendation-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

/* 确保复选框组在一行显示 */
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
}

.el-checkbox {
  margin-right: 8px;
}

/* 分页控件样式 */
.pagination {
  clear: both;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination .select {
  width: 60px;
}

.pagination-component {
  margin-left: 16px;
}

/* 修改 medicine-name 样式，确保超出文本正确隐藏 */
.medicine-name {
  display: block; /* 确保元素是块级元素 */
  overflow: hidden; /* 超出部分隐藏 */
  white-space: nowrap; /* 不换行 */
  text-overflow: ellipsis; /* 省略号 */
  width: 100%; /* 确保宽度占满父容器 */
  max-width: 100%; /* 限制最大宽度 */
  margin-top: 8px;
  margin-bottom: 4px;
  position: relative; /* 为悬浮提示定位 */
  font-size: 16px; /* 设置合适的字体大小 */
  box-sizing: border-box; /* 确保padding不会影响宽度计算 */
  padding-right: 5px; /* 右侧留出一些空间 */
}

/* 确保medicine-info容器有明确的宽度限制 */
.medicine-info {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px; /* 各行之间的间距 */
}

/* 修改悬浮提示样式，确保它能正确显示 */
.medicine-name:hover::after {
  content: attr(title);
  position: absolute;
  left: 0;
  top: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 8px;
  border-radius: 4px;
  z-index: 100; /* 确保在最上层 */
  white-space: normal;
  max-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  line-height: 1.4;
}

/* 药品描述样式 */
.medicine-description {
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 15px;
  color: #666;
  line-height: 1.2;
}

/* 空描述样式 */
.empty-description {
  height: 17px; /* 与正常描述行高度一致 */
  visibility: visible; /* 确保空行可见 */
}

/* 价格和库存样式 */
.medicine-price, .medicine-stock {
  margin: 0;
  font-size: 15px;
  line-height: 1.0;
}
.medicine-image-container {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.medicine-image-container img{
  max-width: 100%;   /* 限制最大宽度为容器宽度 */
  max-height: 100%;  /* 限制最大高度为容器高度 */
  object-fit: contain; /* 保持图片比例，完全显示 */
}
</style>
