<template>
  <div class="order-list-container">
    <h2 class="page-title">我的订单</h2>
    <div v-if="orders.length === 0" class="empty-orders">
      <el-empty description="暂无订单" />
    </div>
    <template v-else>
      <div class="select-all-container">
        <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
      </div>
      <el-collapse v-model="activeOrderIds">
        <el-collapse-item v-for="order in orders" :key="order.id" :title="'订单号: ' + order.id">
          <div class="order-header">
            <el-checkbox v-model="order.selected" @change="updateSelectedOrders"></el-checkbox>
            <span :class="['order-status', order.status.toLowerCase()]">
              {{ getStatusText(order.status) }}
            </span>
            <span class="order-info">
              <span class="order-id">订单号: {{ order.id }}</span>
              <span class="order-total">总价: ¥{{ order.total_price }}</span>
              <span class="order-created">{{ order.created_at }}</span>
            </span>
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
        <el-button type="warning" @click="cancelSelectedOrders" :disabled="!hasValidOrdersForCancel">取消</el-button>
        <el-button type="primary" @click="checkoutSelectedOrders" :disabled="!hasValidOrdersForPayment">支付</el-button>
      </div>
    </template>
  </div>
</template>

<script>
import http from '@/http'; // 引入配置好的 Axios 实例
import { ElCollapse, ElCollapseItem, ElCard, ElButton, ElCheckbox, ElMessage, ElMessageBox } from 'element-plus'; // 引入 Element Plus 组件

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
  computed: {
    hasValidOrdersForCancel() {
      return this.orders.some(order => order.selected && order.status === 'Pending');
    },
    hasValidOrdersForPayment() {
      return this.orders.some(order => order.selected && order.status === 'Pending');
    }
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
      if (selectedOrders.length === 0) {
        ElMessage.warning('请先选择要删除的订单');
        return;
      }

      try {
        await ElMessageBox.confirm('确定要删除选中的订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const orderIds = selectedOrders.map(order => order.id);
        const response = await http.delete('/orders/batch_delete', { data: { order_ids: orderIds } });
        
        if (response.data.code === 0) {
          ElMessage.success('订单删除成功');
          await this.fetchOrders();
        } else {
          ElMessage.error(`删除失败: ${response.data.message}`);
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(`删除失败: ${error.message || '未知错误'}`);
        }
      }
    },
    async cancelSelectedOrders() {
      const selectedOrders = this.orders.filter(order => order.selected);
      if (selectedOrders.length === 0) {
        ElMessage.warning('请先选择要取消的订单');
        return;
      }

      const invalidOrders = selectedOrders.filter(order => order.status !== 'Pending');
      if (invalidOrders.length > 0) {
        ElMessage.warning('只能取消待支付状态的订单');
        return;
      }

      try {
        await ElMessageBox.confirm('确定要取消选中的订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const failedOrders = [];
        let hasSuccess = false;

        for (const order of selectedOrders) {
          try {
            const response = await http.post(`/orders/${order.id}/cancel`);
            if (response.data.code === 0) {
              hasSuccess = true;
            } else {
              failedOrders.push({ id: order.id, message: response.data.message });
            }
          } catch (error) {
            failedOrders.push({ id: order.id, message: error.message });
          }
        }

        if (hasSuccess) {
          ElMessage.success('订单取消成功');
        }

        if (failedOrders.length > 0) {
          failedOrders.forEach(failedOrder => {
            ElMessage.error(`订单 ${failedOrder.id} 取消失败: ${failedOrder.message}`);
          });
        }

        await this.fetchOrders();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('取消订单失败');
        }
      }
    },
    async checkoutSelectedOrders() {
      const selectedOrders = this.orders.filter(order => order.selected);
      if (selectedOrders.length === 0) {
        ElMessage.warning('请先选择要支付的订单');
        return;
      }

      const invalidOrders = selectedOrders.filter(order => order.status !== 'Pending');
      if (invalidOrders.length > 0) {
        ElMessage.warning('只能支付待支付状态的订单');
        return;
      }

      try {
        await ElMessageBox.confirm('确定要支付选中的订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const failedOrders = [];
        let hasSuccess = false;

        for (const order of selectedOrders) {
          try {
            const response = await http.post(`/orders/${order.id}/complete`);
            if (response.data.code === 0) {
              hasSuccess = true;
            } else {
              failedOrders.push({ id: order.id, message: response.data.message });
            }
          } catch (error) {
            failedOrders.push({ id: order.id, message: error.message });
          }
        }

        if (hasSuccess) {
          ElMessage.success('订单支付成功');
        }

        if (failedOrders.length > 0) {
          failedOrders.forEach(failedOrder => {
            ElMessage.error(`订单 ${failedOrder.id} 支付失败: ${failedOrder.message}`);
          });
        }

        await this.fetchOrders();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('支付订单失败');
        }
      }
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
.order-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.empty-orders {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 10px;
}

.select-all-container {
  margin: 15px 0;
  padding: 0 10px;
  display: flex;
  justify-content: flex-end;
}

.order-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.order-info {
  display: flex;
  gap: 20px;
  margin-left: auto;
}

.order-id {
  font-weight: 500;
  color: #303133;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.order-status.pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.order-status.completed {
  background-color: #f0f9eb;
  color: #67c23a;
}

.order-status.canceled {
  background-color: #f4f4f5;
  color: #909399;
}

.order-total, .order-created {
  color: #606266;
  font-size: 14px;
}

.medicine-card {
  margin: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.medicine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.medicine-info {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  padding: 15px;
  text-align: right;
}

.medicine-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.medicine-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #303133;
}

.medicine-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  text-align: right;
}

.order-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -2px 12px 0 rgba(0,0,0,0.1);
}

.order-actions .el-button {
  min-width: 90px;
}
</style>
