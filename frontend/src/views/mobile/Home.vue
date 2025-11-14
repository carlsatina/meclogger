<template>
<div class="home-container">
    <!-- Header Section -->
    <div class="header-section">
        <div class="greeting">
            <h1 class="welcome-text">Welcome Back! 👋</h1>
            <p class="subtitle">What would you like to manage today?</p>
        </div>
    </div>

    <!-- Features Grid -->
    <div class="features-wrapper">
        <!-- Medical Records Card -->
        <div class="feature-card medical" @click="navigateTo('/medical-records')">
            <div class="card-content">
                <div class="icon-wrapper">
                    <mdicon name="hospital-box" size="24"/>
                </div>
                <div class="card-text">
                    <h3 class="card-title">Medical Records</h3>
                    <p class="card-description">Health tracking & medications</p>
                </div>
            </div>
            <div class="card-arrow">
                <mdicon name="chevron-right" size="20"/>
            </div>
        </div>

        <!-- Car Maintenance Card -->
        <div class="feature-card vehicle" @click="navigateTo('/car-maintenance')">
            <div class="card-content">
                <div class="icon-wrapper">
                    <mdicon name="car-wrench" size="24"/>
                </div>
                <div class="card-text">
                    <h3 class="card-title">Car Maintenance</h3>
                    <p class="card-description">Service history & reminders</p>
                </div>
            </div>
            <div class="card-arrow">
                <mdicon name="chevron-right" size="20"/>
            </div>
        </div>

        <!-- Expense Tracking Card -->
        <div class="feature-card expense" @click="navigateTo('/expense-tracking')">
            <div class="card-content">
                <div class="icon-wrapper">
                    <mdicon name="cash-multiple" size="24"/>
                </div>
                <div class="card-text">
                    <h3 class="card-title">Expense Tracking</h3>
                    <p class="card-description">Budgets & financial goals</p>
                </div>
            </div>
            <div class="card-arrow">
                <mdicon name="chevron-right" size="20"/>
            </div>
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
    name: "HomeMobile",
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
    background: #f8f9fa;
    padding-bottom: 80px;
}

/* Header Section */
.header-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px 20px 40px;
    border-radius: 0 0 24px 24px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.greeting {
    color: white;
}

.welcome-text {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
}

.subtitle {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
    font-weight: 400;
}

/* Features Wrapper */
.features-wrapper {
    padding: 0 16px;
    margin-top: -24px;
}

/* Feature Cards */
.feature-card {
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    transition: width 0.3s ease;
}

.feature-card.medical::before {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-card.vehicle::before {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.feature-card.expense::before {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.feature-card:active {
    transform: scale(0.97);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.feature-card::before {
    width: 4px;
}

.feature-card:active::before {
    width: 8px;
}

/* Card Content */
.card-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.feature-card.medical .icon-wrapper {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.feature-card.vehicle .icon-wrapper {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.feature-card.expense .icon-wrapper {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-text {
    flex: 1;
}

.card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 2px 0;
    letter-spacing: -0.2px;
}

.card-description {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    line-height: 1.3;
}

.card-arrow {
    color: #9ca3af;
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
}

.feature-card:active .card-arrow {
    transform: translateX(4px);
}

/* Responsive adjustments */
@media (max-width: 375px) {
    .welcome-text {
        font-size: 22px;
    }
    
    .subtitle {
        font-size: 13px;
    }
    
    .card-title {
        font-size: 14px;
    }
    
    .card-description {
        font-size: 11px;
    }
    
    .icon-wrapper {
        width: 40px;
        height: 40px;
    }
    
    .feature-card {
        padding: 12px 14px;
    }
}
</style>