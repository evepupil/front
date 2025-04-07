<template>
  <div>
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
  mounted() {
    document.title = '在线购药商城' 
  }
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