<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <button class="logo-circle" @click="goLanding">
                <mdicon name="home" :size="22"/>
            </button>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Keep every ride in peak shape</h1>
            </div>
        </div>
        <nav class="tabs">
            <button :class="{ active: currentTab === 'home' }" @click="setTab('home')">Home</button>
            <button :class="{ active: currentTab === 'schedules' }" @click="setTab('schedules')">Schedules</button>
            <button :class="{ active: currentTab === 'report' }" @click="setTab('report')">Report</button>
            <button :class="{ active: currentTab === 'vehicles' }" @click="setTab('vehicles')">Vehicles</button>
            <button :class="{ active: currentTab === 'settings' }" @click="setTab('settings')">Settings</button>
        </nav>
    </header>

    <main class="content">
        <section v-if="currentTab === 'home'" class="panel">
            <div class="panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <div class="select-wrapper">
                        <select v-model="selectedVehicleId" @change="handleVehicleChange">
                            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                        </select>
                    </div>
                </div>
                <button class="primary-btn" @click="openSchedule">
                    <mdicon name="plus" :size="18"/><span>Add Maintenance</span>
                </button>
            </div>

            <div class="search-bar">
                <mdicon name="magnify" :size="20"/>
                <input v-model="searchTerm" type="text" placeholder="Search maintenance..." @input="debouncedSearch">
            </div>

            <div v-if="loading" class="empty">Loading maintenance...</div>
            <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
            <div v-else-if="!maintenanceRecords.length" class="empty">No maintenance records yet. Add one to get started.</div>

            <div v-else class="records">
                <div class="record-card" v-for="item in maintenanceRecords" :key="item.id" @click="openRecordDetail(item.id)">
                    <div class="record-top">
                        <div>
                            <p class="record-title">{{ item.maintenanceType || 'Maintenance' }}</p>
                            <p class="record-date">{{ formatDate(item.serviceDate) }}</p>
                        </div>
                        <span class="pill">{{ formatMileage(item.mileageAtService) }}</span>
                    </div>
                    <div class="record-bottom">
                        <div class="meta">
                            <mdicon name="cash" :size="18"/>
                            <span>{{ formatCurrency(item.cost, item.currency || defaultCurrency) }}</span>
                        </div>
                        <div class="meta">
                            <mdicon name="map-marker" :size="18"/>
                            <span>{{ item.location || '—' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section v-else-if="currentTab === 'schedules'" class="panel">
            <div class="panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <div class="select-wrapper">
                        <select v-model="selectedVehicleId" @change="handleVehicleChange">
                            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                        </select>
                    </div>
                </div>
                <button class="primary-btn" @click="goAddSchedule">
                    <mdicon name="plus" :size="18"/><span>Add Schedule</span>
                </button>
            </div>

            <div class="search-bar">
                <mdicon name="magnify" :size="20"/>
                <input v-model="scheduleSearch" type="text" placeholder="Search schedules..." @input="debouncedScheduleSearch">
            </div>

            <div v-if="loadingReminders" class="empty">Loading schedules...</div>
            <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredReminders.length" class="empty">No schedules found.</div>
            <div class="schedule-grid" v-else>
                <div class="schedule-card" v-for="item in filteredReminders" :key="item.id" @click="openScheduleDetail(item.id)">
                    <div class="record-top">
                        <div>
                            <p class="record-title">{{ item.maintenanceType || 'Schedule' }}</p>
                            <p class="record-date">{{ formatDate(item.dueDate) }}</p>
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
        </section>

        <section v-else-if="currentTab === 'report'" class="panel">
            <div class="panel-header">
                <div class="vehicle-select">
                    <label>Vehicle</label>
                    <div class="select-wrapper">
                        <select v-model="selectedVehicleId" @change="handleVehicleChange">
                            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div v-if="!chartData.length" class="empty">No maintenance records to show.</div>
            <div v-else class="chart-card">
                <div class="donut">
                    <svg viewBox="0 0 42 42">
                        <circle class="donut-ring" cx="21" cy="21" r="15.91549431" fill="transparent" stroke-width="5"></circle>
                        <circle
                            v-for="(slice, idx) in chartSlices"
                            :key="idx"
                            class="donut-segment"
                            cx="21" cy="21" r="15.91549431"
                            fill="transparent"
                            stroke-width="5"
                            :stroke="slice.color"
                            :stroke-dasharray="slice.dash"
                            :stroke-dashoffset="slice.offset"
                        ></circle>
                    </svg>
                    <div class="donut-center">
                        <p class="total">Total: {{ formatCurrency(totalCost, defaultCurrency) }}</p>
                        <p class="range">Across {{ chartData.length }} types</p>
                    </div>
                </div>
                <div class="legend">
                    <div class="legend-item" v-for="item in chartData" :key="item.type">
                        <span class="dot" :style="{ background: item.color }"></span>
                        <div class="legend-meta">
                            <p class="label">{{ item.type }}</p>
                            <p class="value">{{ formatCurrency(item.cost, defaultCurrency) }} ({{ item.percent }}%)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section v-else-if="currentTab === 'vehicles'" class="panel">
            <div class="panel-header">
                <h3 class="section-title">Vehicles</h3>
                <button class="primary-btn" @click="addVehicle">
                    <mdicon name="plus" :size="18"/><span>Add Vehicle</span>
                </button>
            </div>
            <div class="search-bar">
                <mdicon name="magnify" :size="20"/>
                <input v-model="vehicleSearch" type="text" placeholder="Search vehicle..." />
            </div>
            <div v-if="loading" class="empty">Loading vehicles...</div>
            <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
            <div v-else-if="!filteredVehicles.length" class="empty">No vehicles yet. Add your first vehicle.</div>
            <div class="vehicle-grid" v-else>
                <div class="vehicle-card" v-for="v in filteredVehicles" :key="v.id" @click="openVehicle(v.id)">
                    <div class="thumb">
                        <img v-if="v.imageUrl" :src="v.imageUrl.startsWith('http') ? v.imageUrl : `${API_BASE_URL}${v.imageUrl}`" alt="vehicle" />
                        <mdicon v-else name="clipboard-list-outline" :size="28"/>
                    </div>
                    <div class="info">
                        <p class="name">{{ displayName(v) }}</p>
                        <p class="sub">License: {{ v.licensePlate || '—' }}</p>
                        <p class="sub">VIN: {{ v.vin || '—' }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section v-else-if="currentTab === 'settings'" class="panel">
            <div class="profile">
                <div class="avatar"><mdicon name="account-circle" :size="36"/></div>
                <div>
                    <p class="name">{{ userName }}</p>
                    <p class="email">{{ userEmail }}</p>
                </div>
            </div>
            <div class="pref-grid">
                <div class="pref-card">
                    <p class="label">Distance Unit</p>
                    <div class="inline-row">
                        <label><input type="radio" value="km" v-model="distanceUnit" @change="persistPreferences"> Kilometers</label>
                        <label><input type="radio" value="mi" v-model="distanceUnit" @change="persistPreferences"> Miles</label>
                    </div>
                </div>
                <div class="pref-card">
                    <p class="label">Currency</p>
                    <select v-model="defaultCurrency" @change="persistPreferences">
                        <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
                <div class="pref-card span-2">
                    <p class="label">Maintenance Types</p>
                    <div class="type-row">
                        <input v-model="newMaintenanceType" type="text" placeholder="Add type" />
                        <button class="add-btn" @click="addType">Add</button>
                    </div>
                    <div class="chip-row">
                        <span v-for="t in maintenanceTypes" :key="t" class="chip">
                            {{ t }}
                            <button class="chip-remove" @click="removeType(t)">
                                <mdicon name="close" :size="14"/>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'

const palette = ['#f472b6', '#6f6cf7', '#34d399', '#f59e0b', '#60a5fa', '#9ca3af']

export default {
    name: "CarMaintenanceWeb",
    setup() {
        const router = useRouter()
        const {
            listVehicles,
            listMaintenanceRecords,
            listReminders,
            updateReminder,
            getPreferences,
            savePreferences
        } = useCarMaintenance()

        const vehicles = ref([])
        const selectedVehicleId = ref('')
        const maintenanceRecords = ref([])
        const reminders = ref([])
        const searchTerm = ref('')
        const scheduleSearch = ref('')
        const vehicleSearch = ref('')
        const loading = ref(false)
        const loadingReminders = ref(false)
        const errorMessage = ref('')
        const distanceUnit = ref('km')
        const defaultCurrency = ref('USD')
        const maintenanceTypes = ref([])
        const newMaintenanceType = ref('')
        const userName = ref('User')
        const userEmail = ref('user@example.com')
        const currencyOptions = ref(['USD', 'PHP', 'EUR', 'JPY', 'SGD'])
        let searchTimer = null
        let scheduleTimer = null

        const currentTab = ref('home')

        const setTab = (tab) => {
            currentTab.value = tab
        }

        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            const assembled = parts.join(' ').trim()
            return assembled || vehicle.licensePlate || vehicle.vin || 'Vehicle'
        }

        const formatDate = (value) => {
            if (!value) return '—'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '—'
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

        const formatMileage = (value) => {
            if (value === null || value === undefined) return '—'
            const num = Number(value) || 0
            const converted = distanceUnit.value === 'mi' ? num * 0.621371 : num
            const unitLabel = distanceUnit.value === 'mi' ? 'mi' : 'km'
            return `${converted.toLocaleString()} ${unitLabel}`
        }

        const formatCurrency = (value, currency = 'USD') => {
            if (value === null || value === undefined) return '—'
            try {
                return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${currency}`
            }
        }

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                if (prefs?.currency) defaultCurrency.value = prefs.currency
                if (Array.isArray(prefs?.maintenanceTypes) && prefs.maintenanceTypes.length) {
                    maintenanceTypes.value = prefs.maintenanceTypes
                }
            } catch (err) {
                distanceUnit.value = 'km'
                defaultCurrency.value = 'USD'
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
                    maintenanceRecords.value = []
                    reminders.value = []
                    return
                }
                const stored = localStorage.getItem('selectedVehicleId')
                const preferred = vehicles.value.find(v => v.id === stored) || vehicles.value[0]
                selectedVehicleId.value = preferred.id
                await loadMaintenanceRecords()
                await loadReminders()
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            } finally {
                loading.value = false
            }
        }

        const loadMaintenanceRecords = async() => {
            if (!selectedVehicleId.value) {
                maintenanceRecords.value = []
                return
            }
            loading.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const params = new URLSearchParams()
                params.append('vehicleId', selectedVehicleId.value)
                if (searchTerm.value.trim()) params.append('search', searchTerm.value.trim())
                maintenanceRecords.value = await listMaintenanceRecords(token, selectedVehicleId.value, params)
            } catch (err) {
                maintenanceRecords.value = []
            } finally {
                loading.value = false
            }
        }

        const loadReminders = async() => {
            if (!selectedVehicleId.value) {
                reminders.value = []
                return
            }
            loadingReminders.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                reminders.value = await listReminders(token, selectedVehicleId.value)
            } catch (err) {
                reminders.value = []
            } finally {
                loadingReminders.value = false
            }
        }

        const handleVehicleChange = async() => {
            localStorage.setItem('selectedVehicleId', selectedVehicleId.value)
            await loadMaintenanceRecords()
            await loadReminders()
        }

        const debouncedSearch = () => {
            if (searchTimer) clearTimeout(searchTimer)
            searchTimer = setTimeout(() => {
                loadMaintenanceRecords()
            }, 250)
        }

        const debouncedScheduleSearch = () => {
            if (scheduleTimer) clearTimeout(scheduleTimer)
            scheduleTimer = setTimeout(() => {
                // filter is computed; no extra fetch needed
            }, 250)
        }

        const goAddMaintenance = () => {
            const query = selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            router.push({ path: '/web/car-maintenance/maintenance/add', query })
        }

        const openRecordDetail = (id) => {
            if (!id) return
            router.push(`/web/car-maintenance/maintenance/${id}`)
        }

        const goAddSchedule = () => {
            const query = selectedVehicleId.value ? { vehicleId: selectedVehicleId.value } : {}
            router.push({ path: '/web/car-maintenance/schedules/add', query })
        }

        const goLanding = () => router.push('/')

        const filteredReminders = computed(() => {
            const term = scheduleSearch.value.toLowerCase().trim()
            if (!term) return reminders.value
            return reminders.value.filter(r => {
                return [r.maintenanceType, r.title, r.description].filter(Boolean).some(f => String(f).toLowerCase().includes(term))
            })
        })

        const statusFor = (reminder) => {
            const now = new Date()
            if (reminder?.completed) return { class: 'done', icon: 'check-circle', label: 'Done' }
            const due = reminder?.dueDate ? new Date(reminder.dueDate) : null
            if (due && due.getTime() < now.getTime()) return { class: 'missed', icon: 'close-circle', label: 'Missed' }
            return { class: 'upcoming', icon: 'clock-outline', label: 'Upcoming' }
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

        const filteredVehicles = computed(() => {
            const term = vehicleSearch.value.toLowerCase().trim()
            if (!term) return vehicles.value
            return vehicles.value.filter(v => {
                const name = `${v.make || ''} ${v.model || ''} ${v.year || ''}`.trim().toLowerCase()
                const plate = (v.licensePlate || '').toLowerCase()
                return name.includes(term) || plate.includes(term)
            })
        })

        const openSchedule = (id) => router.push(`/web/car-maintenance/schedules/add/${id}`)
        const addSchedule = () => router.push('/web/car-maintenance/schedules/add');

        const openVehicle = (id) => router.push(`/web/car-maintenance/vehicles/${id}`)
        const addVehicle = () => router.push('/web/car-maintenance/vehicles/add')
        const openScheduleDetail = (id) => router.push(`/web/car-maintenance/schedules/${id}`)

        const chartData = computed(() => {
            if (!maintenanceRecords.value.length) return []
            const totals = {}
            maintenanceRecords.value.forEach(r => {
                const type = r.maintenanceType || 'Other'
                const cost = Number(r.cost) || 0
                totals[type] = (totals[type] || 0) + cost
            })
            const sum = Object.values(totals).reduce((a, b) => a + b, 0)
            return Object.entries(totals).map(([type, cost], idx) => ({
                type,
                cost,
                percent: sum ? Math.round((cost / sum) * 100) : 0,
                color: palette[idx % palette.length]
            }))
        })

        const totalCost = computed(() => chartData.value.reduce((acc, item) => acc + item.cost, 0))

        const chartSlices = computed(() => {
            let cumulative = 0
            return chartData.value.map(item => {
                const dash = `${item.percent} ${100 - item.percent}`
                const offset = 25 - cumulative
                cumulative += (item.percent / 100) * 100
                return { dash, offset, color: item.color }
            })
        })

        const persistPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    await savePreferences(token, {
                        distanceUnit: distanceUnit.value,
                        currency: defaultCurrency.value,
                        maintenanceTypes: maintenanceTypes.value
                    })
                }
            } catch (err) {
                // fallback to local storage if backend fails
                localStorage.setItem('distanceUnit', distanceUnit.value)
                localStorage.setItem('currencyPreference', defaultCurrency.value)
                localStorage.setItem('maintenanceTypes', JSON.stringify(maintenanceTypes.value))
            }
        }

        const addType = () => {
            const value = newMaintenanceType.value.trim()
            if (!value) return
            if (!maintenanceTypes.value.includes(value)) {
                maintenanceTypes.value.push(value)
                persistPreferences()
            }
            newMaintenanceType.value = ''
        }

        const removeType = (val) => {
            maintenanceTypes.value = maintenanceTypes.value.filter(t => t !== val)
            persistPreferences()
        }

        onMounted(async() => {
            await loadPreferences()
            await loadVehicles()
        })

        // const userName = computed(() => store.state.userProfile?.fullName || 'there')
        userName.value = (store.state.userProfile?.fullName)
        userEmail.value = (store.state.userProfile?.email)
        return {
            router,
            API_BASE_URL,
            vehicles,
            filteredVehicles,
            vehicleSearch,
            selectedVehicleId,
            maintenanceRecords,
            searchTerm,
            scheduleSearch,
            loading,
            loadingReminders,
            errorMessage,
            displayName,
            formatDate,
            formatMileage,
            formatCurrency,
            currentTab,
            setTab,
            handleVehicleChange,
            debouncedSearch,
            debouncedScheduleSearch,
            goAddMaintenance,
            goAddSchedule,
            goLanding,
            openRecordDetail,
            defaultCurrency,
            reminders,
            filteredReminders,
            statusFor,
            deadlineText,
            toggleStatus,
            distanceUnit,
            chartData,
            chartSlices,
            totalCost,
            addVehicle,
            openVehicle,
            openScheduleDetail,
            userName,
            userEmail,
            maintenanceTypes,
            currencyOptions,
            vehicleSearch,
            persistPreferences,
            setTab,
            newMaintenanceType,
            addType,
            removeType
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    background: #f6f7fb;
    color: #111827;
}

.hero {
    padding: 28px;
    background: linear-gradient(135deg, #f093fb 0%, #6f6cf7 50%, #4f46e5 100%);
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.18);
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}
.logo-circle {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;

    /* shadow */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

    /* remove any borders/outlines */
    outline: none;
    border: none;
}


.eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 12px;
    opacity: 0.85;
}

.headline {
    margin: 2px 0 0;
    font-weight: 800;
    font-size: 24px;
}

.tabs {
    margin-top: 18px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.tabs button {
    border: none;
    background: rgba(255,255,255,0.15);
    color: white;
    padding: 10px 14px;
    border-radius: 12px;
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

.select-wrapper select {
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

.records {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
}

.record-card {
    background: #f9fafb;
    border: 1px solid #eef2f7;
    border-radius: 14px;
    padding: 12px;
}

.record-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.record-title {
    margin: 0;
    font-weight: 800;
    font-size: 16px;
    color: #111827;
}

.record-date {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
}

.pill {
    background: #eef2ff;
    color: #4338ca;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 12px;
}

.record-bottom {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
    color: #4b5563;
}

.meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
}

.empty {
    padding: 14px;
    text-align: center;
    color: #6b7280;
}

/* Schedules tab */
.schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
}
.schedule-card {
    background: linear-gradient(145deg, #f9fafb, #f1f5f9);
    border: 1px solid #eef2f7;
    border-radius: 16px;
    padding: 14px;
    box-shadow: 0 8px 18px rgba(0,0,0,0.05);
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

/* Report tab */
.chart-card {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 18px;
    align-items: center;
}
.donut {
    position: relative;
    width: 260px;
    height: 260px;
}
.donut svg {
    transform: rotate(-90deg);
    width: 260px;
    height: 260px;
}
.donut-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 2px;
}
.donut-center .total { margin: 0; font-weight: 700; color: #6b7280; font-size: 14px; }
.donut-center .value { margin: 0; font-weight: 800; font-size: 18px; }
.donut-center .range { margin: 0; color: #9ca3af; font-size: 12px; }
.legend { display: flex; flex-direction: column; gap: 10px; }
.legend-item { display: flex; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 10px; background: #f9fafb; border: 1px solid #eef2f7; }
.dot { width: 12px; height: 12px; border-radius: 6px; display: inline-block; }
.label { margin: 0; font-weight: 700; }
.value { margin: 0; color: #4b5563; font-size: 13px; }

/* Vehicles tab */
.vehicle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
}
.vehicle-card {
    background: white;
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 10px;
    cursor: pointer;
    border: 1px solid #eef2f7;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.vehicle-card:hover { transform: translateY(-2px); box-shadow: 0 14px 26px rgba(0,0,0,0.12); }
.thumb {
    width: 88px;
    height: 82px;
    border-radius: 12px;
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.info { display: flex; flex-direction: column; gap: 4px; }
.name { margin: 0; font-weight: 800; color: #111827; }
.sub { margin: 0; color: #6b7280; font-size: 13px; }

/* Settings tab */
.profile {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;
    margin-bottom: 12px;
}
.avatar { width: 52px; height: 52px; border-radius: 14px; background: #e0e7ff; display: flex; align-items: center; justify-content: center; }
.pref-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.pref-card { background: #f9fafb; border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; }
.pref-card.span-2 { grid-column: span 2; }
.inline-row { display: flex; gap: 14px; }
.pref-card select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background: #eef2ff; color: #4338ca; padding: 6px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; }
.chip-remove { border: none; background: transparent; color: #6b7280; display: inline-flex; align-items: center; cursor: pointer; }
.type-row { display: flex; gap: 8px; margin-bottom: 8px; }
.type-row input { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 10px; }
.add-btn { border: none; background: linear-gradient(135deg, #f093fb, #6f6cf7); color: white; padding: 8px 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }

@media (max-width: 900px) {
    .chart-card { grid-template-columns: 1fr; }
    .donut, .donut svg { width: 220px; height: 220px; }
}
</style>
