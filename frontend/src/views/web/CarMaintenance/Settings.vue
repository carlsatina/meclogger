<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <div class="logo-circle">
                <mdicon name="cog-outline" :size="24"/>
            </div>
            <div>
                <p class="eyebrow">Car Maintenance</p>
                <h1 class="headline">Settings</h1>
            </div>
        </div>
        <nav class="tabs">
            <button @click="goHome">Home</button>
            <button @click="goSchedules">Schedules</button>
            <button @click="goReport">Report</button>
            <button @click="goVehicles">Vehicles</button>
            <button class="active">Settings</button>
        </nav>
    </header>

    <main class="content">
        <div class="panel">
            <div class="profile">
                <div class="avatar">
                    <mdicon name="account-circle" :size="36"/>
                </div>
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
                    <select v-model="currency" @change="persistPreferences">
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
        </div>
    </main>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

const defaultTypes = [
    'Oil Change',
    'Brake Pad Replacement',
    'Tire Rotation',
    'Tire Replacement',
    'Battery Replacement',
    'Air Filter Replacement',
    'Transmission Service',
    'Coolant Flush',
    'Spark Plug Replacement',
    'Brake Fluid Change',
    'Alignment',
    'Inspection',
    'Repair',
    'Other'
]

export default {
    name: 'CarMaintenanceSettingsWeb',
    setup() {
        const router = useRouter()
        const { getPreferences, savePreferences } = useCarMaintenance()

        const userName = ref('User')
        const userEmail = ref('user@example.com')
        const distanceUnit = ref('km')
        const currency = ref('USD')
        const currencyOptions = ref(['USD', 'PHP', 'EUR', 'JPY', 'SGD'])
        const maintenanceTypes = ref([...defaultTypes])
        const newMaintenanceType = ref('')

        const goHome = () => router.push('/car-maintenance')
        const goSchedules = () => router.push('/car-maintenance/schedules')
        const goVehicles = () => router.push('/car-maintenance/vehicles')
        const goReport = () => router.push('/car-maintenance/report')

        const persistPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                await savePreferences(token, {
                    distanceUnit: distanceUnit.value,
                    currency: currency.value,
                    maintenanceTypes: maintenanceTypes.value
                })
            } catch (err) {
                // ignore persistence errors for now
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

        const loadProfile = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const res = await fetch(`${window.location.origin}/api/v1/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                if (res.ok && data?.userInfo) {
                    userName.value = data.userInfo.fullName || data.userInfo.displayName || data.userInfo.name || userName.value
                    userEmail.value = data.userInfo.email || userEmail.value
                }
            } catch (err) {
                // ignore profile errors
            }
        }

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (prefs?.distanceUnit) distanceUnit.value = prefs.distanceUnit
                if (prefs?.currency) currency.value = prefs.currency
                if (Array.isArray(prefs?.maintenanceTypes) && prefs.maintenanceTypes.length) {
                    maintenanceTypes.value = prefs.maintenanceTypes
                }
            } catch (err) {
                // ignore
            }
        }

        onMounted(async() => {
            await loadProfile()
            await loadPreferences()
        })

        return {
            goHome,
            goSchedules,
            goVehicles,
            goReport,
            userName,
            userEmail,
            distanceUnit,
            currency,
            currencyOptions,
            maintenanceTypes,
            newMaintenanceType,
            addType,
            removeType,
            persistPreferences
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
.logo-circle { width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; }
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-size: 12px; opacity: 0.8; }
.headline { margin: 0; font-weight: 800; font-size: 22px; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.tabs button { border: none; background: rgba(255,255,255,0.15); color: white; padding: 10px 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.tabs button.active { background: white; color: #4f46e5; }
.content { padding: 20px 24px 40px; max-width: 1000px; margin: 0 auto; }
.panel { background: white; border-radius: 16px; padding: 18px; box-shadow: 0 10px 24px rgba(0,0,0,0.06); }
.profile { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px; }
.avatar { width: 52px; height: 52px; border-radius: 14px; background: #e0e7ff; display: flex; align-items: center; justify-content: center; }
.name { margin: 0; font-weight: 800; color: #111827; }
.email { margin: 2px 0 0; color: #6b7280; }
.pref-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.pref-card { background: #f9fafb; border: 1px solid #eef2f7; border-radius: 12px; padding: 12px; }
.pref-card.span-2 { grid-column: span 2; }
.label { margin: 0 0 8px; font-weight: 700; color: #374151; }
.inline-row { display: flex; gap: 14px; }
.pref-card select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; }
.type-row { display: flex; gap: 8px; margin-bottom: 8px; }
.type-row input { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 10px; }
.add-btn { border: none; background: linear-gradient(135deg, #f093fb, #6f6cf7); color: white; padding: 8px 12px; border-radius: 10px; font-weight: 700; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background: #eef2ff; color: #4338ca; padding: 6px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; }
.chip-remove { border: none; background: transparent; color: #6b7280; display: inline-flex; align-items: center; cursor: pointer; }

@media (max-width: 720px) {
    .pref-card.span-2 { grid-column: span 1; }
}
</style>
