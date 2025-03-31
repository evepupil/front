<template>
  <el-header>
    <el-menu
      :default-active="activeMenu"
      class="menu"
      mode="horizontal"
      router
    >
      <el-menu-item index="1" @click="navigateTo('')">首页</el-menu-item>
      <el-menu-item index="2" @click="navigateTo('cart')">购物车</el-menu-item>
      <el-menu-item index="3" @click="navigateTo('orders')">订单</el-menu-item>
      <el-menu-item index="4" v-if="isAdmin" @click="navigateTo('manage-products')">药品管理</el-menu-item>
      <el-menu-item index="5" v-if="isAdmin" @click="navigateTo('user-management')">用户管理</el-menu-item>
      <el-menu-item index="6" @click="navigateTo('profile')">个人中心</el-menu-item>
    </el-menu>
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
.menu {
  display: flex; /* 使用 flex 布局 */
  justify-content: flex-start; /* 左对齐 */
  flex-wrap: nowrap; /* 不换行 */
  overflow: auto; /* 允许溢出时滚动 */
  margin-left: 20px; /* 调整左边距 */
  margin-right: 25vw;
}
el-header {
  display: flex;
  justify-content: space-between; /* 让菜单和搜索框分散排列 */
  align-items: center;
  padding: 0 20px; /* 添加内边距 */
  height: 100px;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
  max-width: 40vw;
}
.search-button{
  width: 90px;
  height: 50px;
}
.search-input{
  height: 50px;
}

</style> 