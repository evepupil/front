<template>
  <div>
    <h2>购物车</h2>
    <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
    <div class="cart-container">
      <el-card v-for="item in cartItems" :key="item.medicine_id" class="cart-item">
        <div class="cart-item-header">
          <el-checkbox v-model="item.selected" @change="updateSelectedItems"></el-checkbox>
        </div>
        <div class="cart-item-body">
          <img v-if="item.image" :src="item.image" alt="药品图片" class="medicine-image" />
          <div class="medicine-info">
            <h3 class="medicine-name">{{ item.name }}</h3>
            <p>描述: {{ item.description }}</p>
            <p>单价: {{ item.price }}元</p>
            <el-input-number v-model="item.quantity" @change="updateTotalPrice" :min="1"></el-input-number>
            <p>总价: {{ (item.price * item.quantity).toFixed(2) }}元</p>
          </div>
        </div>
      </el-card>
    </div>
    <div class="cart-footer">
      <span class="total-price">总价: {{ totalPrice.toFixed(2) }}元</span>
      <span class="total-quantity">总数量: {{ totalQuantity }}</span>
      <el-button type="danger" @click="deleteSelectedItems">删除</el-button>
      <el-button type="primary" @click="checkoutSelectedItems">结算</el-button>
    </div>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElCheckbox, ElButton, ElMessage, ElCard, ElInputNumber } from 'element-plus'; // 引入 Element Plus 组件

export default {
  name: 'UserCart',
  components: {
    ElCheckbox,
    ElButton,
    ElCard,
    ElInputNumber,
  },
  data() {
    return {
      cartItems: [],
      selectAll: false,
      totalPrice: 0,
      totalQuantity: 0,
    };
  },
  async created() {
    await this.fetchCartItems();
  },
  methods: {
    async fetchCartItems() {
      try {
        const response = await http.get('/cart');
        if (response.data.code === 0) {
          const cartItems = response.data.cart_items.map(item => ({
            ...item,
            selected: false,
          }));

          const medicineIds = cartItems.map(item => item.medicine_id);

          const medicineResponse = await http.post('/medicines/ids', { ids: medicineIds });
          if (medicineResponse.data.code === 0) {
            const medicines = medicineResponse.data.medicines.reduce((acc, medicine) => {
              acc[medicine.id] = medicine;
              return acc;
            }, {});

            this.cartItems = cartItems.map(item => ({
              ...item,
              name: medicines[item.medicine_id]?.name || '未知药品',
              image: medicines[item.medicine_id]?.image ? 'data:image/jpeg;base64,' + medicines[item.medicine_id].image : require('@/assets/default_image.jpg'),
              description: medicines[item.medicine_id]?.description || '无描述',
              price: medicines[item.medicine_id]?.price || 0,
            }));
            this.updateTotalPrice();
          } else {
            console.error('获取药品信息失败:', medicineResponse.data.message);
          }
        } else {
          console.error('获取购物车失败:', response.data.message);
        }
      } catch (error) {
        console.error('获取购物车失败:', error);
      }
    },
    toggleSelectAll() {
      this.cartItems.forEach(item => {
        item.selected = this.selectAll;
      });
      this.updateSelectedItems();
    },
    updateSelectedItems() {
      this.selectAll = this.cartItems.every(item => item.selected);
      this.updateTotalPrice();
    },
    updateTotalPrice() {
      this.totalPrice = this.cartItems.reduce((total, item) => {
        return total + (item.selected ? item.price * item.quantity : 0);
      }, 0);
      this.totalQuantity = this.cartItems.reduce((total, item) => {
        return total + (item.selected ? item.quantity : 0);
      }, 0);
    },
    async deleteSelectedItems() {
      const selectedItems = this.cartItems.filter(item => item.selected);
      const itemIds = selectedItems.map(item => item.id);

      try {
        const response = await http.delete('/cart', { data: { item_ids: itemIds } });
        if (response.data.code === 0) {
          ElMessage.success('选中商品已成功删除');
          await this.fetchCartItems();
        } else {
          ElMessage.error(`商品删除失败: ${response.data.message}`);
        }
      } catch (error) {
        ElMessage.error(`商品删除失败: ${error.message}`);
      }
    },
    async checkoutSelectedItems() {
      const selectedItems = this.cartItems.filter(item => item.selected);
      const itemsToCheckout = selectedItems.map(item => ({
        id: item.id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
      }));

      try {
        const response = await http.post('/cart/checkout', { items: itemsToCheckout });
        if (response.data.code === 0) {
          ElMessage.success('所有选中商品已成功结算');
          await this.fetchCartItems();
        } else {
          ElMessage.error(`结算失败: ${response.data.message}`);
        }
      } catch (error) {
        ElMessage.error(`结算失败: ${error.message}`);
      }
    },
  },
};
</script>

<style scoped>
.cart-container {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.cart-item {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f5f5;
}

.cart-item-body {
  display: flex;
  padding: 10px;
}

.medicine-image {
  width: 200px;
  height: auto;
  margin-right: 10px;
}

.medicine-info {
  display: flex;
  flex-direction: column;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
}

.total-quantity {
  font-size: 18px;
  font-weight: bold;
}
.medicine-name {
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 省略号 */
  max-width: 80%; /* 限制名称的最大宽度 */
}
</style>
