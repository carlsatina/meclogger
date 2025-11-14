<template>
<div class="home-container">
    <div class="header">
        <h2 class="text-center mt-5 mb-3">Record Keeper</h2>
        <p class="text-center text-muted">Choose a feature to get started</p>
    </div>

    <div class="features-grid">
        <!-- Medical Records Feature -->
        <div class="feature-card" @click="navigateTo('/medical-records')">
            <div class="feature-icon medical">
                <mdicon name="hospital-box" size="64"/>
            </div>
            <h3 class="feature-title">Medical Records</h3>
            <p class="feature-description">Track health records, medications, and vitals for you and your family</p>
        </div>

        <!-- Car Maintenance Feature -->
        <div class="feature-card" @click="navigateTo('/car-maintenance')">
            <div class="feature-icon vehicle">
                <mdicon name="car-wrench" size="64"/>
            </div>
            <h3 class="feature-title">Car Maintenance</h3>
            <p class="feature-description">Manage vehicle service history, reminders, and maintenance logs</p>
        </div>

        <!-- Expense Tracking Feature -->
        <div class="feature-card" @click="navigateTo('/expense-tracking')">
            <div class="feature-icon expense">
                <mdicon name="cash-multiple" size="64"/>
            </div>
            <h3 class="feature-title">Expense Tracking</h3>
            <p class="feature-description">Monitor spending, manage budgets, and track financial goals</p>
        </div>
    </div>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import store from '@/store'
import Datepicker from 'vuejs3-datepicker'

export default {
    name: "HomeWeb",
    components: {
        Modal,
        Loading,
        Datepicker
    },
    setup() {
        const router = useRouter()

        const navigateTo = (path) => {
            router.push(path)
        }

        return {
            navigateTo
        }
    }
}
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
    margin-bottom: 50px;
}

.header h2 {
    color: #2c3e50;
    font-weight: 700;
    font-size: 36px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

@media (min-width: 768px) {
    .features-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.feature-card {
    background: white;
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.feature-card:active {
    transform: translateY(-4px);
}

.feature-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.feature-icon.medical {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-icon.vehicle {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.feature-icon.expense {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.feature-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 15px;
}

.feature-description {
    font-size: 15px;
    color: #7f8c8d;
    margin: 0;
    line-height: 1.6;
}
</style>