<template>
<div class="add-schedule-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Add Schedule</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <form class="form" @submit.prevent="submitSchedule">
        <div class="field">
            <label>Vehicle</label>
            <select v-model="form.vehicleId" required>
                <option value="" disabled>Select vehicle</option>
                <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ displayName(vehicle) }}
                </option>
            </select>
        </div>
        <div class="field">
            <label>Maintenance Type</label>
            <input
                v-model="form.maintenanceType"
                list="maintenance-options"
                type="text"
                placeholder="Select or type"
            />
            <datalist id="maintenance-options">
                <option value="Oil Change"></option>
                <option value="Brake Pad Replacement"></option>
                <option value="Tire Rotation"></option>
                <option value="Tire Replacement"></option>
                <option value="Battery Replacement"></option>
                <option value="Air Filter Replacement"></option>
                <option value="Transmission Service"></option>
                <option value="Coolant Flush"></option>
                <option value="Spark Plug Replacement"></option>
                <option value="Brake Fluid Change"></option>
                <option value="Alignment"></option>
                <option value="Inspection"></option>
                <option value="Repair"></option>
                <option value="Other"></option>
            </datalist>
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
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceAddSchedule',
    setup() {
        const router = useRouter()
        const { listVehicles } = useCarMaintenance()

        const vehicles = ref([])
        const form = ref({
            vehicleId: '',
            maintenanceType: '',
            dueDate: '',
            dueMileage: '',
            notes: ''
        })
        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')

        const displayName = (vehicle) => {
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const loadVehicles = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                vehicles.value = await listVehicles(token)
                if (vehicles.value.length) {
                    form.value.vehicleId = vehicles.value[0].id
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
                // placeholder save; wire to backend when available
                successMessage.value = 'Schedule saved (placeholder)'
                setTimeout(() => router.push('/car-maintenance/schedules'), 600)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to save schedule'
            } finally {
                submitting.value = false
            }
        }

        const goBack = () => router.back()

        onMounted(() => {
            loadVehicles()
        })

        return {
            vehicles,
            form,
            submitting,
            errorMessage,
            successMessage,
            goBack,
            submitSchedule,
            displayName
        }
    }
}
</script>

<style scoped>
.add-schedule-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 40px;
}

.top-banner {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    padding: 14px 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
}

.icon-btn {
    border: none;
    background: transparent;
    color: inherit;
    padding: 6px;
}

.icon-btn.ghost {
    visibility: hidden;
}

.form {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

label {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

input, textarea, select {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
    font-size: 14px;
    background: white;
}

.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
}

.error {
    color: #dc2626;
    font-size: 13px;
    margin: 0;
}

.success {
    color: #16a34a;
    font-size: 13px;
    margin: 0;
}
</style>
