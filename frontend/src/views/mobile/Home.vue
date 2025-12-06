<template>
<div class="home-container">
    <!-- Header Section -->
<div class="header-section">
    <div class="header-top">
        <div class="greeting">
            <p class="welcome-chip">Welcome back 👋</p>
            <h1 class="welcome-text">{{ userName }}</h1>
        </div>
        <button class="logout-btn" @click="logout">
            <mdicon name="logout" size="18"/>
            <span>Logout</span>
        </button>
    </div>
    <p class="subtitle">What would you like to manage today?</p>
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

        <div v-if="isAdmin" class="feature-card admin" @click="navigateTo('/admin/users')">
            <div class="card-content">
                <div class="icon-wrapper">
                    <mdicon name="shield-account" size="24"/>
                </div>
                <div class="card-text">
                    <h3 class="card-title admin-title">User Approvals</h3>
                    <p class="card-description admin-desc">Review new registrations & set roles</p>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import store from '@/store'
import Datepicker from 'vuejs3-datepicker'
import getProfile from '@/composables/getProfile'
import { Role } from '@/constants/enums'

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

        const logout = () => {
            store.methods.logoutUser()
            router.push('/login')
        }

        const ensureProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                logout()
                return
            }
            store.methods.loginUser(token)
            if (!store.state.userProfile) {
                const { response, error } = await getProfile(token)
                if (error.value === null && response.value?.userInfo) {
                    const profile = response.value.userInfo
                    store.methods.setUserAdmin(profile.role === Role.ADMIN)
                    store.methods.setUserProfile(profile)
                    if (profile.role === Role.GUEST) {
                        router.push('/pending-approval')
                    }
                } else {
                    logout()
                }
            }
        }

        onMounted(() => {
            ensureProfile()
        })

        const userName = computed(() => store.state.userProfile?.fullName || 'there')
        const isAdmin = computed(() => store.state.userProfile?.role === Role.ADMIN || store.state.isUserAdmin)

        return {
            navigateTo,
            logout,
            userName,
            isAdmin
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

.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: white;
}

.greeting {
    flex: 1;
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

.welcome-chip {
    margin: 0 0 6px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
}

.logout-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 999px;
    color: white;
    font-weight: 600;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
}

.logout-btn:active {
    transform: scale(0.97);
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

.feature-card.admin::before {
    background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
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

.feature-card.admin .icon-wrapper {
    background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
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

.feature-card.admin .card-title {
    color: #312e81;
}
.feature-card.admin .card-description {
    color: #4338ca;
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
