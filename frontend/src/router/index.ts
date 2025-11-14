import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/LandingPage/Home.vue'

// Auth 
import Login from '@/views/LandingPage/Login.vue'
import Register from '@/views/LandingPage/Register.vue'

// Features
import MedicalRecords from '@/views/LandingPage/MedicalRecords.vue'
import AddRecord from '@/views/LandingPage/MedicalRecords/AddRecord.vue'
import CarMaintenance from '@/views/LandingPage/CarMaintenance.vue'
import ExpenseTracking from '@/views/LandingPage/ExpenseTracking.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/medical-records',
    name: 'medical-records',
    component: MedicalRecords
  },
  {
    path: '/medical-records/add-record',
    name: 'add-record',
    component: AddRecord
  },
  {
    path: '/car-maintenance',
    name: 'car-maintenance',
    component: CarMaintenance
  },
  {
    path: '/expense-tracking',
    name: 'expense-tracking',
    component: ExpenseTracking
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
