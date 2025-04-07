<template>
  <el-header class="navbar-header">
    <div class="navbar-container">
      <div class="logo-container">
        <svg class="logo-icon" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z"/>
          <path fill="currentColor" d="M13 10h-2v3H8v2h3v3h2v-3h3v-2h-3z"/>
        </svg>
        <span class="logo-text">在线购药商城</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        mode="horizontal"
        router
        background-color="#ffffff"
        text-color="#303133"
        active-text-color="#409EFF"
      >
        <el-menu-item index="1" @click="navigateTo('')">首页</el-menu-item>
        <el-menu-item index="2" @click="navigateTo('cart')">购物车</el-menu-item>
        <el-menu-item index="3" @click="navigateTo('orders')">订单</el-menu-item>
        <el-menu-item index="4" v-if="isAdmin" @click="navigateTo('manage-products')">药品管理</el-menu-item>
        <el-menu-item index="5" v-if="isAdmin" @click="navigateTo('user-management')">用户管理</el-menu-item>
        <el-menu-item index="6" @click="navigateTo('profile')">个人中心</el-menu-item>
      </el-menu>
    </div>
  </el-header>
  
</template>

<script>
import {ElMessage} from "element-plus";
import axios from "axios";

export default {
  name: 'UserNavbar',
  data() {
    return {
      activeMenu: '1',// 默认选中的菜单项为首页
      searchKeyword: '',
      isAdmin: false, // 默认不是管理员
    };
  },
  created() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; // 从本地存储获取用户信息
    this.isAdmin = isAdmin; // 设置 isAdmin 状态
    this.setActiveMenu(); // 设置当前激活的菜单项
  },
  watch: {
    $route() {
      this.setActiveMenu(); // 路由变化时更新激活的菜单项
    },
  },
  async mounted() {
    await this.fetchMedicines();
  },
  methods: {
    handleFocus() {
      this.isFocused = true;
    },
    // 失焦时触发
    handleBlur() {
      this.isFocused = false;
    },
    navigateTo(route) {
      this.$router.push(`/${route}`); // 使用 Vue Router 进行导航
    },
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
          this.totalMedicines = this.medicines.length; 
          this.loadMedicineImages(this.medicines); // 加载药品图片
        } else {
          ElMessage.error('获取药品列表失败');
        }
      } catch (error) {
        console.error('获取药品列表失败:', error);
      }
    },
    setActiveMenu() {
      const path = this.$route.path;
      if (path.includes('cart')) {
        this.activeMenu = '2';
      } else if (path.includes('orders')) {
        this.activeMenu = '3';
      } else if (path.includes('manage-products')) {
        this.activeMenu = '4';
      } else if (path.includes('user-management')) {
        this.activeMenu = '5';
      } else if (path.includes('profile')) {
        this.activeMenu = '6';
      } else {
        this.activeMenu = '1';
      }
    },
  },
};
</script>

<style scoped>
.navbar-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-right: 48px;
  cursor: pointer;
}

.logo-icon {
  color: #409EFF;
  margin-right: 8px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.menu {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  border: none;
  height: 64px;
  line-height: 64px;
}

.el-menu-item {
  font-size: 15px;
  padding: 0 20px;
  height: 64px;
  line-height: 64px;
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  background-color: #f5f7fa;
}

.el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: 2px solid #409EFF;
  font-weight: 500;
}

</style>