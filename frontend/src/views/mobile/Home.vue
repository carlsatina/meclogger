<template>
<div class="home-shell">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>

    <header class="hero">
        <div class="hero-top">
            <div class="brand">
                <div class="logo-mark">M</div>
                <div>
                    <p class="brand-chip">MEC LOGGER</p>
                    <h1>Control your universe</h1>
                    <p class="eyebrow">Hi, {{ userName }}</p>
                </div>
            </div>
            <button class="ghost-btn" @click="logout">
                <mdicon name="logout" size="18" />
                <span>Logout</span>
            </button>
        </div>
        <p class="hero-sub">Health, maintenance, and finances—unified in a sleek console.</p>
    </header>

    <section class="feature-stack">
        <div class="glass-card medical" @click="navigateTo('/medical-records')">
            <div class="chip">Health</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="hospital-box" size="24"/>
                </div>
                <div>
                    <h3>Medical Records</h3>
                    <p>Vitals, prescriptions, and scans at light speed.</p>
                </div>
            </div>
        </div>

        <div class="glass-card vehicle" @click="navigateTo('/car-maintenance')">
            <div class="chip">Auto</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="car-wrench" size="24"/>
                </div>
                <div>
                    <h3>Car Maintenance</h3>
                    <p>Service history, reminders, and costs—always synced.</p>
                </div>
            </div>
        </div>

        <div class="glass-card expense" @click="navigateTo('/expense-tracking')">
            <div class="chip">Finance</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="cash-multiple" size="24"/>
                </div>
                <div>
                    <h3>Expense Tracking</h3>
                    <p>Budgets, insights, and subscriptions in one feed.</p>
                </div>
            </div>
        </div>

        <div v-if="isAdmin" class="glass-card admin" @click="navigateTo('/admin/users')">
            <div class="chip">Admin</div>
            <div class="card-row">
                <div class="icon-hex">
                    <mdicon name="shield-account" size="24"/>
                </div>
                <div>
                    <h3>User Approvals</h3>
                    <p>Review pending registrations and elevate roles.</p>
                </div>
            </div>
        </div>
    </section>
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
.home-shell {
    position: relative;
    min-height: 100vh;
    padding: 18px 16px 80px;
    background: radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.25), transparent 25%), 
                radial-gradient(circle at 80% 0%, rgba(6, 182, 212, 0.25), transparent 22%),
                #05060a;
    color: #e5e7eb;
    overflow: hidden;
}

.bg-orb {
    position: absolute;
    filter: blur(50px);
    opacity: 0.35;
    z-index: 0;
}
.orb-1 {
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    top: -100px;
    left: -80px;
}
.orb-2 {
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #8b5cf6);
    bottom: -80px;
    right: -60px;
}

.hero {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 10px;
    padding: 14px 12px 6px;
}

.hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.brand {
    display: flex;
    gap: 12px;
    align-items: center;
}

.logo-mark {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    color: #0b1020;
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 18px;
    box-shadow: 0 10px 28px rgba(6, 182, 212, 0.4);
}

.brand-chip {
    margin: 0;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #a5b4fc;
    font-weight: 700;
}

.hero h1 {
    margin: 2px 0 2px;
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(135deg, #a5b4fc, #67e8f9);
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: -0.3px;
}

.eyebrow {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
}

.hero-sub {
    margin: 0;
    color: #cbd5e1;
    font-size: 14px;
}

.ghost-btn {
    border: 1px solid rgba(226, 232, 240, 0.3);
    background: rgba(255, 255, 255, 0.06);
    color: #e2e8f0;
    border-radius: 12px;
    padding: 10px 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-weight: 700;
    backdrop-filter: blur(6px);
}

.feature-stack {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 12px;
    margin-top: 10px;
}

.glass-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 16px;
    padding: 14px;
    box-shadow: 0 18px 36px rgba(0,0,0,0.25);
    cursor: pointer;
    display: grid;
    gap: 10px;
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.glass-card:hover {
    transform: translateY(-4px);
    border-color: rgba(94, 234, 212, 0.5);
}

.glass-card .chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 11px;
    color: #0b1020;
    background: linear-gradient(135deg, #67e8f9, #a855f7);
    box-shadow: 0 6px 14px rgba(6, 182, 212, 0.3);
    width: fit-content;
}

.glass-card.admin .chip {
    background: linear-gradient(135deg, #f97316, #ec4899);
    box-shadow: 0 6px 14px rgba(236, 72, 153, 0.3);
}

.card-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-hex {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    display: grid;
    place-items: center;
    color: #0b1020;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
}

.glass-card.admin .icon-hex {
    background: linear-gradient(135deg, #f97316, #ec4899);
}

.glass-card h3 {
    margin: 0;
    font-size: 16px;
    color: #e2e8f0;
    letter-spacing: -0.2px;
}

.glass-card p {
    margin: 2px 0 0;
    font-size: 13px;
    color: #cbd5e1;
    line-height: 1.4;
}

@media (max-width: 375px) {
    .hero h1 {
        font-size: 20px;
    }
    .glass-card h3 {
        font-size: 15px;
    }
    .glass-card p {
        font-size: 12px;
    }
    .logo-mark {
        width: 42px;
        height: 42px;
        font-size: 16px;
    }
}
</style>
