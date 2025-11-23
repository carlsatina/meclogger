<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <div class="logo-circle">
                <mdicon name="calendar-clock" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Schedules</h1>
            </div>
        </div>
        <nav class="tabs">
            <button @click="goHome">Home</button>
            <button class="active">Schedules</button>
            <button @click="goReport">Report</button>
            <button @click="goVehicles">Vehicles</button>
            <button @click="goSettings">Settings</button>
        </nav>
    </header>

    <main class="content">
        <div class="panel">
            <div class="panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <select v-model="selectedVehicleId" @change="handleVehicleChange">
                        <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                    </select>
                </div>
                <button class="primary-btn" @click="goAddSchedule">
                    <mdicon name="plus" :size="18"/><span>Add Schedule</span>
                </button>
            </div>

            <div class="search-bar">
                <mdicon name="magnify" :size="20"/>
                <input v-model="searchTerm" type="text" placeholder="Search schedules..." @input="debouncedSearch">
            </div>

            <div v-if="loading" class="empty">Loading schedules...</div>
            <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredReminders.length" class="empty">No schedules found.</div>

            <div class="schedule-grid" v-else>
                <div class="schedule-card" v-for="item in filteredReminders" :key="item.id">
                    <div class="top">
                        <div>
                            <p class="title">{{ item.maintenanceType || 'Schedule' }}</p>
                            <p class="date">{{ formatDate(item.dueDate) }}</p>
                        </div>
                        <button class="status-pill" :class="statusFor(item).class" @click="toggleStatus(item)">
                            <mdicon :name="statusFor(item).icon" :size="18"/>
                            <span>{{ statusFor(item).label }}</span>
                        </button>
                    </div>
                    <div class="meta-row">
                        <div class="meta">
                            <mdicon name="counter" :size="18"/>
                            <span>{{ formatMileage(item.dueMileage) }}</span>
                        </div>
                        <div class="meta">
                            <mdicon name="timer-sand" :size="18"/>
                            <span>{{ deadlineText(item) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceSchedulesWeb',
    setup() {
        const router = useRouter()
        const { listVehicles, listReminders, updateReminder, getPreferences } = useCarMaintenance()
        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const reminders = ref([])
        const searchTerm = ref('')
        const loading = ref(false)
        const errorMessage = ref('')
        const distanceUnit = ref('km')
        let searchTimer = null

        const formatDate = (value) => {
            if (!value) return 'No date'
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) return 'No date'
            return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }
        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }
        const formatMileage = (value) => {
            if (value === null || value === undefined) return '—'
            const num = Number(value) || 0
            const converted = distanceUnit.value === 'mi' ? num * 0.621371 : num
            return `${converted.toLocaleString()} ${distanceUnit.value === 'mi' ? 'mi' : 'km'}`
        }
        const daysLeft = (reminder) => {
            if (!reminder?.dueDate) return null
            const due = new Date(reminder.dueDate)
            if (Number.isNaN(due.getTime())) return null
            const now = new Date()
            return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }
        const deadlineText = (reminder) => {
            if (reminder?.completed) return 'Completed'
            const d = daysLeft(reminder)
            if (d === null) return 'No due date'
            if (d < 0) return 'Missed'
            if (d === 0) return 'Due today'
            if (d === 1) return 'Due tomorrow'
            return `${d} days left`
        }
        const statusFor = (reminder) => {
            const now = new Date()
            if (reminder?.completed) return { class: 'done', icon: 'check-circle', label: 'Done' }
            const due = reminder?.dueDate ? new Date(reminder.dueDate) : null
            if (due && due.getTime() < now.getTime()) return { class: 'missed', icon: 'close-circle', label: 'Missed' }
            return { class: 'upcoming', icon: 'clock-outline', label: 'Upcoming' }
        }

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
            } catch (err) {
                distanceUnit.value = 'km'
            }
        }

        const loadVehicles = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
                if (!vehicles.value.length) {
                    selectedVehicleId.value = ''
                    reminders.value = []
                    return
                }
                const stored = localStorage.getItem('selectedVehicleId')
                const preferred = vehicles.value.find(v => v.id === stored) || vehicles.value[0]
                selectedVehicleId.value = preferred.id
                await loadReminders()
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            } finally {
                loading.value = false
            }
        }

        const loadReminders = async() => {
            if (!selectedVehicleId.value) {
                reminders.value = []
                return
            }
            loading.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                reminders.value = await listReminders(token, selectedVehicleId.value)
            } catch (err) {
                reminders.value = []
            } finally {
                loading.value = false
            }
        }

        const filteredReminders = computed(() => {
            const term = searchTerm.value.toLowerCase().trim()
            if (!term) return reminders.value
            return reminders.value.filter(r => {
                return [r.maintenanceType, r.title, r.description].filter(Boolean).some(f => String(f).toLowerCase().includes(term))
            })
        })

        const handleVehicleChange = async() => {
            localStorage.setItem('selectedVehicleId', selectedVehicleId.value)
            await loadReminders()
        }

        const debouncedSearch = () => {
            if (searchTimer) clearTimeout(searchTimer)
            searchTimer = setTimeout(() => loadReminders(), 250)
        }

        const toggleStatus = async(reminder) => {
            if (!reminder?.id) return
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const updated = await updateReminder(token, reminder.id, { completed: !reminder.completed })
                reminders.value = reminders.value.map(r => r.id === reminder.id ? updated : r)
            } catch (err) {
                alert(err?.message || 'Unable to update status')
            }
        }

        const goHome = () => router.push('/car-maintenance')
        const goReport = () => router.push('/car-maintenance/report')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')
        const goAddSchedule = () => {
            const query = selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            router.push({ path: '/car-maintenance/schedules/add', query })
        }

        onMounted(async() => {
            await loadPreferences()
            await loadVehicles()
        })

        return {
            goHome,
            goReport,
            goVehicles,
            goSettings,
            vehicles,
            selectedVehicleId,
            handleVehicleChange,
            maintenanceRecords: reminders,
            reminders,
            filteredReminders,
            searchTerm,
            debouncedSearch,
            statusFor,
            formatDate,
            formatMileage,
            deadlineText,
            toggleStatus,
            loading,
            errorMessage,
            goAddSchedule,
            distanceUnit,
            displayName
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    background: #f6f7fb;
}
.hero {
    padding: 24px;
    background: linear-gradient(135deg, #6f6cf7, #f093fb);
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}
.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}
.logo-circle {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
}
.eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 12px;
    opacity: 0.8;
}
.headline {
    margin: 0;
    font-weight: 800;
    font-size: 22px;
}
.tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.tabs button {
    border: none;
    background: rgba(255,255,255,0.15);
    color: white;
    padding: 10px 12px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
}
.tabs button.active {
    background: white;
    color: #4f46e5;
}
.content {
    padding: 20px 24px 40px;
    max-width: 1100px;
    margin: 0 auto;
}
.panel {
    background: white;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.06);
}
.panel-header {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    align-items: center;
}
.vehicle-select label {
    font-weight: 700;
    color: #374151;
}
.vehicle-select select {
    margin-top: 6px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    min-width: 240px;
}
.primary-btn {
    border: none;
    background: linear-gradient(135deg, #f093fb, #6f6cf7);
    color: white;
    padding: 10px 14px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    cursor: pointer;
}
.search-bar {
    margin: 14px 0;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.search-bar input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 14px;
    background: transparent;
}
.schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
}
.schedule-card {
    background: #f9fafb;
    border: 1px solid #eef2f7;
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 8px 18px rgba(0,0,0,0.05);
}
.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}
.title {
    margin: 0;
    font-weight: 800;
}
.date {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
}
.status-pill {
    border: none;
    border-radius: 18px;
    padding: 8px 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.status-pill:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(0,0,0,0.12); }
.status-pill.upcoming { background: #eef2ff; color: #4f46e5; }
.status-pill.done { background: #e7f8ef; color: #059669; }
.status-pill.missed { background: #fee2e2; color: #dc2626; }
.meta-row {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    gap: 8px;
}
.meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #4b5563;
    font-size: 13px;
}
.empty {
    padding: 16px;
    text-align: center;
    color: #6b7280;
}
</style>
