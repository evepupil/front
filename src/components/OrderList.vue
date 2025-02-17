<template>
  <div>
    <h2>我的订单</h2>
    <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
    <el-collapse v-model="activeOrderIds">
      <el-collapse-item v-for="order in orders" :key="order.id" :title="'订单号: ' + order.id">
        <div class="order-header">
          <el-checkbox v-model="order.selected" @change="updateSelectedOrders"></el-checkbox>
          <span class="order-status">{{ getStatusText(order.status) }}</span>
          <span class="order-total">总价: {{ order.total_price }}元</span>
          <span class="order-created">创建时间: {{ order.created_at }}</span>
        </div>
        <div class="order-details">
          <el-card v-for="item in order.items" :key="item.medicine_id" class="medicine-card">
            <div class="medicine-info">
              <img v-if="item.image" :src="item.image" alt="药品图片" class="medicine-image" />
              <div>
                <h3>{{ item.name }}</h3>
                <p>描述: {{ item.description }}</p>
                <p>数量: {{ item.quantity }}</p>
                <p>价格: {{ item.price }}元</p>
              </div>
            </div>
          </el-card>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div class="order-actions">
      <el-button type="danger" @click="deleteSelectedOrders">删除</el-button>
      <el-button type="warning" @click="cancelSelectedOrders">取消</el-button>
      <el-button type="primary" @click="checkoutSelectedOrders">结算</el-button>
    </div>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElCollapse, ElCollapseItem, ElCard, ElButton, ElCheckbox, ElMessage } from 'element-plus'; // 引入 Element Plus 组件

export default {
  name: 'OrderList',
  components: {
    ElCollapse,
    ElCollapseItem,
    ElCard,
    ElButton,
    ElCheckbox,
  },
  data() {
    return {
      orders: [], // 存储订单列表
      activeOrderIds: [], // 控制展开的订单
      selectAll: false, // 全选状态
    };
  },
  async created() {
    await this.fetchOrders(); // 获取订单列表
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await http.get('/orders');
        if (response.data.code === 0) {
          const orders = response.data.orders.map(order => ({
            ...order,
            selected: false, // 初始化未选中状态
            created_at: new Date(order.created_at).toLocaleString(), // 格式化创建时间
          }));

          if (orders.length === 0) {
            this.orders = []; // 如果没有订单，确保 orders 为空数组
            return;
          }

          // 提取所有药品ID
          const medicineIds = orders.flatMap(order => order.items.map(item => item.medicine_id));

          // 获取药品详细信息
          const medicineResponse = await http.post('/medicines/ids', { ids: medicineIds });
          if (medicineResponse.data.code === 0) {
            const medicines = medicineResponse.data.medicines.reduce((acc, medicine) => {
              acc[medicine.id] = medicine;
              return acc;
            }, {});

            // 更新订单中的药品信息
            this.orders = orders.map(order => ({
              ...order,
              items: order.items.map(item => ({
                ...item,
                price: medicines[item.medicine_id]?.price || 0,
                name: medicines[item.medicine_id]?.name || '未知药品',
                image: medicines[item.medicine_id]?.image ? 'data:image/jpeg;base64,' + medicines[item.medicine_id].image : require('@/assets/default_image.jpg'),
                description: medicines[item.medicine_id]?.description || '无描述',
              })),
            }));
          } else {
            console.error('获取药品信息失败:', medicineResponse.data.message);
          }
        } else {
          console.error('获取订单失败:', response.data.message);
          this.orders = []; // 确保 orders 为空数组
        }
      } catch (error) {
        console.error('获取订单失败:', error);
        this.orders = []; // 确保 orders 为空数组
      }
    },
    toggleSelectAll() {
      this.orders.forEach(order => {
        order.selected = this.selectAll;
      });
      this.updateSelectedOrders();
    },
    updateSelectedOrders() {
      this.selectAll = this.orders.every(order => order.selected);
    },
    async deleteSelectedOrders() {
      const selectedOrders = this.orders.filter(order => order.selected);
      const orderIds = selectedOrders.map(order => order.id);

      try {
        const response = await http.delete('/orders/batch_delete', { data: { order_ids: orderIds } });
        if (response.data.code === 0) {
          ElMessage.success('选中订单已成功删除');
        } else {
          ElMessage.error(`删除失败: ${response.data.message}`);
        }
      } catch (error) {
        ElMessage.error(`删除失败: ${error.message}`);
      } finally {
        this.fetchOrders(); // 无论成功与否，刷新订单列表
      }
    },
    async cancelSelectedOrders() {
      const selectedOrders = this.orders.filter(order => order.selected);
      const failedOrders = [];

      for (const order of selectedOrders) {
        try {
          const response = await http.post(`/orders/${order.id}/cancel`);
          if (response.data.code !== 0) {
            failedOrders.push({ id: order.id, message: response.data.message });
          }
        } catch (error) {
          failedOrders.push({ id: order.id, message: error.message });
        }
      }

      if (failedOrders.length === 0) {
        ElMessage.success('所有选中订单已成功取消');
      } else {
        failedOrders.forEach(failedOrder => {
          ElMessage.error(`订单 ${failedOrder.id} 取消失败: ${failedOrder.message}`);
        });
      }
      this.fetchOrders(); // 无论成功与否，刷新订单列表
    },
    async checkoutSelectedOrders() {
      const selectedOrders = this.orders.filter(order => order.selected);
      const failedOrders = [];

      for (const order of selectedOrders) {
        try {
          const response = await http.post(`/orders/${order.id}/complete`);
          if (response.data.code !== 0) {
            failedOrders.push({ id: order.id, message: response.data.message });
          }
        } catch (error) {
          failedOrders.push({ id: order.id, message: error.message });
        }
      }

      if (failedOrders.length === 0) {
        ElMessage.success('所有选中订单已成功结算');
      } else {
        failedOrders.forEach(failedOrder => {
          ElMessage.error(`订单 ${failedOrder.id} 结算失败: ${failedOrder.message}`);
        });
      }
      this.fetchOrders(); // 无论成功与否，刷新订单列表
    },
    getStatusText(status) {
      switch (status) {
        case 'Pending':
          return '待支付';
        case 'Completed':
          return '已完成';
        case 'Canceled':
          return '已取消';
        default:
          return status;
      }
    },
  },
};
</script>

<style scoped>
.order-header {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 左右对齐 */
  margin-bottom: 10px; /* 标题和详情之间的间距 */
}

.order-status {
  color: green; /* 默认状态颜色 */
}

.order-status.pending {
  color: orange; /* 待处理状态颜色 */
}

.order-status.completed {
  color: blue; /* 完成状态颜色 */
}

.medicine-card {
  margin-bottom: 10px; /* 卡片之间的间距 */
}

.medicine-info {
  display: flex;
  align-items: center; /* 垂直居中 */
}

.medicine-image {
  width: 50px; /* 设置药品图片的宽度 */
  height: auto; /* 自适应高度 */
  margin-right: 10px; /* 图片与文本之间的间距 */
}

.order-actions {
  margin-top: 20px; /* 按钮组与订单列表之间的间距 */
  display: flex;
  justify-content: space-around; /* 按钮均匀分布 */
}
</style>
