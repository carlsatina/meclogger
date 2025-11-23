<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <div class="logo-circle">
                <mdicon name="chart-pie" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Report</h1>
            </div>
        </div>
        <nav class="tabs">
            <button @click="goHome">Home</button>
            <button @click="goSchedules">Schedules</button>
            <button class="active">Report</button>
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
            </div>

            <div v-if="loading" class="empty">Loading report...</div>
            <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
            <div v-else-if="!chartData.length" class="empty">No maintenance records to show.</div>
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
                        <p class="total">Total</p>
                        <p class="value">{{ formatCurrency(totalCost, defaultCurrency) }}</p>
                        <p class="range">{{ chartData.length }} types</p>
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
        </div>
    </main>
</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

const palette = ['#f472b6', '#6f6cf7', '#34d399', '#f59e0b', '#60a5fa', '#9ca3af']

export default {
    name: 'CarMaintenanceReportWeb',
    setup() {
        const router = useRouter()
        const { listVehicles, listMaintenanceRecords, getPreferences } = useCarMaintenance()

        const vehicles = ref([])
        const selectedVehicleId = ref(localStorage.getItem('selectedVehicleId') || '')
        const records = ref([])
        const loading = ref(false)
        const errorMessage = ref('')
        const defaultCurrency = ref('USD')

        const displayName = (vehicle) => {
            if (!vehicle) return 'Vehicle'
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }
        const formatCurrency = (value, currency = 'USD') => {
            if (value === null || value === undefined) return '—'
            try {
                return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${currency}`
            }
        }

        const chartData = computed(() => {
            if (!records.value.length) return []
            const totals = {}
            records.value.forEach(r => {
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

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.currency) defaultCurrency.value = prefs.currency
            } catch (err) {
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
                    records.value = []
                    return
                }
                const stored = localStorage.getItem('selectedVehicleId')
                const preferred = vehicles.value.find(v => v.id === stored) || vehicles.value[0]
                selectedVehicleId.value = preferred.id
                await loadRecords()
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            } finally {
                loading.value = false
            }
        }

        const loadRecords = async() => {
            if (!selectedVehicleId.value) {
                records.value = []
                return
            }
            loading.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const params = new URLSearchParams()
                params.append('vehicleId', selectedVehicleId.value)
                records.value = await listMaintenanceRecords(token, selectedVehicleId.value, params)
            } catch (err) {
                records.value = []
            } finally {
                loading.value = false
            }
        }

        const handleVehicleChange = async() => {
            localStorage.setItem('selectedVehicleId', selectedVehicleId.value)
            await loadRecords()
        }

        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goSettings = () => router.push('/car-maintenance/settings')

        onMounted(async() => {
            await loadPreferences()
            await loadVehicles()
        })

        return {
            goHome,
            goSchedules,
            goVehicles,
            goSettings,
            vehicles,
            selectedVehicleId,
            handleVehicleChange,
            chartData,
            chartSlices,
            formatCurrency,
            totalCost,
            loading,
            errorMessage,
            displayName,
            defaultCurrency
        }
    }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
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
.brand { display: flex; align-items: center; gap: 12px; }
.logo-circle {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
}
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-size: 12px; opacity: 0.8; }
.headline { margin: 0; font-weight: 800; font-size: 22px; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.tabs button {
    border: none;
    background: rgba(255,255,255,0.15);
    color: white;
    padding: 10px 12px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
}
.tabs button.active { background: white; color: #4f46e5; }
.content { padding: 20px 24px 40px; max-width: 1100px; margin: 0 auto; }
.panel {
    background: white;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.06);
}
.panel-header {
    display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: center;
}
.vehicle-select label { font-weight: 700; color: #374151; }
.vehicle-select select {
    margin-top: 6px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    min-width: 240px;
}
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
.donut-ring {
    stroke: #f3f4f6;
}
.donut-segment {
    transition: stroke-dasharray 0.3s ease;
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
.total { margin: 0; font-weight: 700; color: #6b7280; font-size: 14px; }
.value { margin: 0; font-weight: 800; font-size: 18px; }
.range { margin: 0; color: #9ca3af; font-size: 12px; }
.legend { display: flex; flex-direction: column; gap: 10px; }
.legend-item { display: flex; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 10px; background: #f9fafb; border: 1px solid #eef2f7; }
.dot { width: 12px; height: 12px; border-radius: 6px; display: inline-block; }
.label { margin: 0; font-weight: 700; }
.value { margin: 0; color: #4b5563; font-size: 13px; }
.empty { padding: 16px; text-align: center; color: #6b7280; }

@media (max-width: 900px) {
    .chart-card { grid-template-columns: 1fr; }
    .donut, .donut svg { width: 260px; height: 260px; }
}
</style>
