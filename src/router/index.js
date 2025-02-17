import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import MedicineList from '../components/MedicineList.vue';
import Cart from '../components/Cart.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import OrderList from '../components/OrderList.vue';
import UserProfile from '../components/UserProfile.vue';
import ManageProducts from '../components/ManageProducts.vue';

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        name: 'MedicineList',
        component: MedicineList,
      },
      {
        path: 'cart',
        name: 'Cart',
        component: Cart,
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: OrderList,
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile,
      },
      {
        path: 'manage-products',
        name: 'ManageProducts',
        component: ManageProducts,
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;