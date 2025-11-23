<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <div class="logo-circle">
                <mdicon name="car" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Vehicles</h1>
            </div>
        </div>
        <nav class="tabs">
            <button @click="goHome">Home</button>
            <button @click="goSchedules">Schedules</button>
            <button @click="goReport">Report</button>
            <button class="active">Vehicles</button>
            <button @click="goSettings">Settings</button>
        </nav>
    </header>

    <main class="content">
        <div class="toolbar">
            <div class="search-bar">
                <mdicon name="magnify" :size="20"/>
                <input v-model="search" type="text" placeholder="Search Vehicle" />
            </div>
            <button class="primary-btn" @click="addVehicle">
                <mdicon name="plus" :size="18"/><span>Add Vehicle</span>
            </button>
        </div>

        <div v-if="loading" class="empty">Loading vehicles...</div>
        <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
        <div v-else-if="!filteredVehicles.length" class="empty">No vehicles yet. Add your first vehicle.</div>

        <div class="vehicle-grid" v-else>
            <div class="vehicle-card" v-for="v in filteredVehicles" :key="v.id" @click="openDetail(v.id)">
                <div class="thumb">
                    <img v-if="v.imageUrl" :src="v.imageUrl.startsWith('http') ? v.imageUrl : `${API_BASE_URL}${v.imageUrl}`" alt="vehicle" />
                    <mdicon v-else name="clipboard-list-outline" :size="28"/>
                </div>
                <div class="info">
                    <p class="name">{{ displayName(v) }}</p>
                    <p class="sub">License: {{ v.licensePlate || '—' }}</p>
                    <p class="sub">VIN: {{ v.vin || '—' }}</p>
                    <p class="sub">Reg. Exp.: {{ formatExpiry(v.registrationExpiryDate) }}</p>
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
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'CarMaintenanceVehiclesWeb',
    setup() {
        const router = useRouter()
        const { listVehicles } = useCarMaintenance()
        const vehicles = ref([])
        const loading = ref(false)
        const errorMessage = ref('')
        const search = ref('')

        const loadVehicles = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            } finally {
                loading.value = false
            }
        }

        const filteredVehicles = computed(() => {
            const term = search.value.toLowerCase()
            return vehicles.value.filter(v => {
                const name = `${v.make || ''} ${v.model || ''} ${v.year || ''}`.trim().toLowerCase()
                const plate = (v.licensePlate || '').toLowerCase()
                return name.includes(term) || plate.includes(term)
            })
        })

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const formatExpiry = (value) => {
            if (!value) return '(No date set)'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '(No date set)'
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

        const openDetail = (id) => router.push(`/car-maintenance/vehicles/${id}`)
        const addVehicle = () => router.push('/car-maintenance/vehicles/add')
        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goReport = () => router.push('/car-maintenance/report')
        const goSettings = () => router.push('/car-maintenance/settings')

        onMounted(() => {
            loadVehicles()
        })

        return {
            vehicles,
            filteredVehicles,
            loading,
            errorMessage,
            search,
            displayName,
            formatExpiry,
            openDetail,
            addVehicle,
            goHome,
            goSchedules,
            goReport,
            goSettings,
            API_BASE_URL
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
    padding: 22px;
    background: linear-gradient(135deg, #6f6cf7, #f093fb);
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}
.search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 12px;
    min-width: 240px;
}
.search-bar input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 14px;
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
.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.name {
    margin: 0;
    font-weight: 800;
    color: #111827;
}
.sub {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
}
.empty {
    padding: 16px;
    text-align: center;
    color: #6b7280;
}
</style>
