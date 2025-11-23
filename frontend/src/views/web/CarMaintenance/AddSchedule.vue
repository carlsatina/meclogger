<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <button class="icon-btn" @click="router.back()">
                <mdicon name="chevron-left" :size="22"/>
            </button>
            <h2 class="title">Add Schedule</h2>
        </div>
    </header>
    <main class="content">
        <form class="panel form" @submit.prevent="submitSchedule">
            <div class="field">
                <label>Vehicle</label>
                <select v-model="form.vehicleId" required>
                    <option value="" disabled>Select vehicle</option>
                    <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ displayName(v) }}</option>
                </select>
            </div>

            <div class="field">
                <label>Maintenance Type</label>
                <div class="type-input">
                    <input v-model="form.maintenanceType" type="text" placeholder="Select or type" />
                    <button type="button" class="type-toggle" @click="showTypeDropdown = !showTypeDropdown">
                        <mdicon name="menu-down" :size="20"/>
                    </button>
                </div>
                <div v-if="showTypeDropdown" class="type-list">
                    <button
                        v-for="option in typeOptions"
                        :key="option"
                        type="button"
                        class="type-option"
                        @click="chooseType(option)"
                    >
                        {{ option }}
                    </button>
                </div>
            </div>

            <div class="two-col">
                <div class="field">
                    <label>Due Date</label>
                    <input v-model="form.dueDate" type="date" required />
                </div>
                <div class="field">
                    <label>Due Mileage</label>
                    <input v-model="form.dueMileage" type="number" min="0" placeholder="100000" />
                </div>
            </div>
            <div class="field">
                <label>Notes</label>
                <textarea v-model="form.notes" rows="3" placeholder="Add details"></textarea>
            </div>

            <button class="primary-btn" type="submit" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Save Schedule' }}
            </button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </form>
    </main>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
    name: 'CarMaintenanceAddScheduleWeb',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { listVehicles, createReminder, getPreferences } = useCarMaintenance()

        const vehicles = ref([])
        const form = ref({
            vehicleId: '',
            maintenanceType: '',
            dueDate: '',
            dueMileage: '',
            notes: ''
        })
        const typeOptions = ref([...defaultTypes])
        const showTypeDropdown = ref(false)
        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const loadPreferences = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const prefs = await getPreferences(token)
                if (Array.isArray(prefs?.maintenanceTypes) && prefs.maintenanceTypes.length) {
                    typeOptions.value = prefs.maintenanceTypes
                }
            } catch (err) {
                // ignore
            }
        }

        const loadVehicles = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
                if (vehicles.value.length) {
                    form.value.vehicleId = vehicles.value[0].id
                }
                const vehicleId = route.query.vehicleId
                if (vehicleId) {
                    const match = vehicles.value.find(v => v.id === vehicleId)
                    if (match) form.value.vehicleId = match.id
                }
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicles'
                vehicles.value = []
            }
        }

        const submitSchedule = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await createReminder(token, {
                    vehicleId: form.value.vehicleId,
                    maintenanceType: form.value.maintenanceType,
                    title: form.value.maintenanceType,
                    description: form.value.notes,
                    dueDate: form.value.dueDate,
                    dueMileage: form.value.dueMileage ? Number(form.value.dueMileage) : null
                })
                successMessage.value = 'Schedule saved'
                setTimeout(() => router.push('/web/car-maintenance'), 400)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to save schedule'
            } finally {
                submitting.value = false
            }
        }

        const toggleTypeDropdown = () => {
            showTypeDropdown.value = !showTypeDropdown.value
        }

        const chooseType = (option) => {
            form.value.maintenanceType = option
            showTypeDropdown.value = false
        }

        onMounted(() => {
            loadPreferences()
            loadVehicles()
        })

        return {
            router,
            vehicles,
            form,
            typeOptions,
            showTypeDropdown,
            toggleTypeDropdown,
            chooseType,
            submitSchedule,
            submitting,
            errorMessage,
            successMessage,
            displayName
        }
    }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
.hero {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #6f6cf7, #f093fb);
    color: white;
    box-shadow: 0 8px 18px rgba(0,0,0,0.12);
}
.title { margin: 0; font-weight: 800; }
.icon-btn { border: none; background: transparent; color: inherit; }
.content { padding: 20px 24px 40px; max-width: 900px; margin: 0 auto; }
.panel {
    background: white;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.06);
}
.form { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
label { font-weight: 700; color: #374151; }
input, select, textarea {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
    font-size: 14px;
    background: #fff;
}
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.type-input { position: relative; display: flex; align-items: center; }
.type-input input { flex: 1; padding-right: 40px; }
.type-toggle {
    position: absolute;
    right: 6px;
    top: 6px;
    bottom: 6px;
    width: 34px;
    border: none;
    border-radius: 10px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
}
.type-list {
    margin-top: 6px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}
.type-option {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 12px;
    text-align: left;
    font-size: 14px;
    color: #111827;
}
.type-option + .type-option { border-top: 1px solid #f3f4f6; }
.primary-btn {
    border: none;
    background: linear-gradient(135deg, #f093fb, #6f6cf7);
    color: white;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
}
.error { color: #dc2626; margin: 0; }
.success { color: #16a34a; margin: 0; }

@media (max-width: 720px) {
    .two-col { grid-template-columns: 1fr; }
}
</style>
