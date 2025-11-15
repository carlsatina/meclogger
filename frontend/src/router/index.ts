import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/LandingPage/Home.vue'

// Auth 
import Login from '@/views/LandingPage/Login.vue'
import Register from '@/views/LandingPage/Register.vue'

// Features
import MedicalRecords from '@/views/LandingPage/MedicalRecords.vue'
import AddRecord from '@/views/LandingPage/MedicalRecords/AddRecord.vue'
import BloodPressure from '@/views/mobile/MedicalRecords/BloodPressure.vue'
import BloodSugar from '@/views/mobile/MedicalRecords/BloodSugar.vue'
import BodyWeight from '@/views/mobile/MedicalRecords/BodyWeight.vue'
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
    path: '/medical-records/blood-pressure',
    name: 'blood-pressure',
    component: BloodPressure
  },
  {
    path: '/medical-records/blood-sugar',
    name: 'blood-sugar',
    component: BloodSugar
  },
  {
    path: '/medical-records/body-weight',
    name: 'body-weight',
    component: BodyWeight
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
