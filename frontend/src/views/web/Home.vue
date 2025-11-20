<template>
<div class="home-container">
    <div class="header">
        <div class="user-bar">
            <div class="user-info">
                <span class="user-label">Signed in as</span>
                <h2 class="user-name">{{ userName }}</h2>
            </div>
            <button class="logout-btn" @click="logout">
                <mdicon name="logout" size="20"/>
                <span>Logout</span>
            </button>
        </div>
        <h2 class="text-center mt-4 mb-3">Record Keeper</h2>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import store from '@/store'
import Datepicker from 'vuejs3-datepicker'
import getProfile from '@/composables/getProfile'
import { useMedicineReminders } from '@/composables/medicineReminders'
import { Role } from '@/constants/enums'

export default {
    name: "HomeWeb",
    components: {
        Modal,
        Loading,
        Datepicker
    },
    setup() {
        const router = useRouter()
        const activeProfileId = ref(localStorage.getItem('selectedProfileId') || null)

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
                } else {
                    logout()
                }
            }
        }

        const {
            reminders: reminderSource,
            loading: remindersLoading,
            error: remindersError,
            fetchReminders
        } = useMedicineReminders()

        const formatReminderTime = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour), Number(minute), 0, 0)
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        const todaysReminders = computed(() => {
            return reminderSource.value.slice(0, 3).map(reminder => {
                const reminderSlots = Array.isArray(reminder.slots) && reminder.slots.length
                    ? reminder.slots
                    : [{ time: reminder.time, status: reminder.status }]
                const slots = reminderSlots
                    .map((slot, index) => {
                        const rawTime = typeof slot === 'string' ? slot : slot.time
                        if (!rawTime) return null
                        return {
                            id: `${reminder.id}-${rawTime}-${index}`,
                            reminderId: reminder.id,
                            rawTime,
                            status: slot.status || null,
                            label: formatReminderTime(rawTime)
                        }
                    })
                    .filter(Boolean)
                return {
                    id: reminder.id,
                    medicineName: reminder.medicineName,
                    intakeMethod: reminder.intakeMethod,
                    slots
                }
            })
        })

        const loadReminders = async () => {
            const token = localStorage.getItem('token')
            activeProfileId.value = localStorage.getItem('selectedProfileId')
            if (!token || !activeProfileId.value) {
                reminderSource.value = []
                return
            }
            await fetchReminders(token, activeProfileId.value, { date: new Date() })
        }

        onMounted(() => {
            ensureProfile()
            loadReminders()
        })

        const userName = computed(() => store.state.userProfile?.fullName || 'there')

        return {
            navigateTo,
            logout,
            userName,
            todaysReminders,
            remindersLoading,
            remindersError,
            activeProfileId
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
    margin-bottom: 40px;
}

.reminders-section {
    max-width: 1200px;
    margin: 0 auto 40px;
    padding: 0 20px;
}

.reminders-card {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.reminders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.reminders-header h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 10px;
}

.view-all-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: color 0.2s ease;
}

.view-all-link:hover {
    color: #5568d3;
}

.reminders-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reminder-item {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px 20px;
    background: #f8fafc;
    transition: all 0.2s ease;
}

.reminder-item:hover {
    border-color: #667eea;
    transform: translateY(-2px);
}

.reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.reminder-name {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.reminder-method {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
}

.reminder-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.time-slot {
    background: white;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    padding: 6px 12px;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #374151;
}

.time-slot.taken {
    border-color: #22c55e;
    color: #15803d;
    background: #f0fdf4;
}

.time-slot.missed {
    border-color: #f97316;
    color: #c2410c;
    background: #fff7ed;
}

.slot-status-icon {
    font-size: 12px;
}

.reminders-empty {
    text-align: center;
    padding: 30px;
    color: #94a3b8;
}

.reminders-error {
    text-align: center;
    padding: 20px;
    color: #dc2626;
    font-size: 14px;
}

.reminders-loading {
    text-align: center;
    padding: 30px;
    color: #6b7280;
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


.user-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-label {
    font-size: 13px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #6b7280;
}

.user-name {
    margin: 4px 0 0;
    font-size: 28px;
    color: #1f2937;
}

.logout-btn {
    border: none;
    border-radius: 999px;
    padding: 10px 18px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: white;
    background: linear-gradient(135deg, #4c51bf 0%, #764ba2 100%);
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(71, 79, 184, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    margin-left: auto;
}

.logout-btn:hover {
    box-shadow: 0 14px 24px rgba(71, 79, 184, 0.3);
}

.logout-btn:active {
    transform: translateY(1px);
}


</style>
