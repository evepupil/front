<template>
  <el-header>
    <div class="logo">药品管理系统</div>
    <el-menu
      :default-active="activeMenu"
      class="menu"
      mode="horizontal"
      router
    >
      <el-menu-item index="1" @click="navigateTo('')">首页</el-menu-item>
      <el-menu-item index="2" @click="navigateTo('cart')">购物车</el-menu-item>
      <el-menu-item index="3" @click="navigateTo('orders')">订单</el-menu-item>
      <el-menu-item index="4" v-if="isAdmin" @click="navigateTo('manage-products')">商品管理</el-menu-item>
      <el-menu-item index="5" @click="navigateTo('profile')">个人中心</el-menu-item>
    </el-menu>
  </el-header>
</template>

<script>
export default {
  name: 'UserNavbar',
  data() {
    return {
      activeMenu: '1', // 默认选中的菜单项为首页
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
  methods: {
    navigateTo(route) {
      this.$router.push(`/${route}`); // 使用 Vue Router 进行导航
    },
    setActiveMenu() {
      const path = this.$route.path;
      if (path.includes('cart')) {
        this.activeMenu = '2';
      } else if (path.includes('orders')) {
        this.activeMenu = '3';
      } else if (path.includes('manage-products')) {
        this.activeMenu = '4';
      } else if (path.includes('profile')) {
        this.activeMenu = '5';
      } else {
        this.activeMenu = '1';
      }
    },
  },
};
</script>

<style scoped>
.logo {
  float: left;
  color: white;
  font-size: 24px;
  padding: 15px;
}

.menu {
  display: flex; /* 使用 flex 布局 */
  justify-content: flex-start; /* 左对齐 */
  flex-wrap: nowrap; /* 不换行 */
  overflow: auto; /* 允许溢出时滚动 */
  margin-left: 20px; /* 调整左边距 */
}
</style> 