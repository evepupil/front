<template>
  <div>
    <h1 class="page-title">爱康网上购药系统</h1>
    <Navbar />
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';

export default {
  name: 'UserHome',
  components: {
    Navbar,
  },
};
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0;
  text-align: left;
}
</style>