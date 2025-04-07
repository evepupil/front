<template>
  <div>
    <h2>购物车</h2>
    <template v-if="cartItems.length > 0">
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
    </template>
    <div v-else class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/')">去选购药品</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElCheckbox, ElButton, ElMessage, ElCard, ElInputNumber, ElEmpty } from 'element-plus'; // 引入 Element Plus 组件

export default {
  name: 'UserCart',
  components: {
    ElCheckbox,
    ElButton,
    ElCard,
    ElInputNumber,
    ElEmpty,
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
.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.cart-container {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 32px;
  padding: 24px;
  margin-bottom: 80px;
}

.cart-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid #edf2f7;
}

.cart-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.cart-item-body {
  display: flex;
  padding: 24px;
  gap: 32px;
  align-items: center;
}

.medicine-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.medicine-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.medicine-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1a202c;
  line-height: 1.4;
}

.medicine-info p {
  margin: 0;
  color: #4a5568;
  font-size: 15px;
  line-height: 1.6;
}

.medicine-info .el-input-number {
  margin: 8px 0;
  width: 120px;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 32px;
  padding: 20px 40px;
  background-color: #ffffff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.total-price, .total-quantity {
  font-size: 20px;
  font-weight: 600;
  color: #2563eb;
}

@media (max-width: 768px) {
  .cart-container {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 20px;
  }

  .cart-item-body {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    text-align: center;
  }

  .medicine-image {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }

  .medicine-info {
    text-align: center;
  }

  .medicine-info .el-input-number {
    margin: 8px auto;
  }

  .cart-footer {
    flex-wrap: wrap;
    padding: 16px 20px;
    gap: 16px;
    justify-content: space-between;
  }

  .total-price, .total-quantity {
    font-size: 18px;
  }
}
</style>
