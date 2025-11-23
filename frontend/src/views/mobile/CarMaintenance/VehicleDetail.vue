<template>
<div class="vehicle-detail-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Vehicle Details</h2>
        <span class="icon-btn ghost"></span>
    </div>

    <div v-if="loading" class="empty">Loading...</div>
    <div v-else-if="errorMessage" class="empty">{{ errorMessage }}</div>
    <div v-else-if="vehicle" class="content">
        <div class="hero">
            <div class="hero-thumb">
                <img v-if="vehicle.imageUrl" :src="vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`" alt="Vehicle" />
                <mdicon v-else name="car-sports" :size="42"/>
            </div>
            <div class="hero-meta">
                <p class="name">{{ displayName(vehicle) }}</p>
                <p class="type">{{ vehicle.vehicleType }}</p>
                <p class="mileage" v-if="vehicle.currentMileage">Odometer: {{ vehicle.currentMileage.toLocaleString() }} km</p>
            </div>
        </div>

        <div class="detail-card">
            <div class="row">
                <span class="label">License Plate</span>
                <span class="value">{{ vehicle.licensePlate || 'No data' }}</span>
            </div>
            <div class="row">
                <span class="label">VIN</span>
                <span class="value">{{ vehicle.vin || 'No data' }}</span>
            </div>
            <div class="row">
                <span class="label">Reg. Exp. Date</span>
                <span class="value">{{ formatExpiry(vehicle.registrationExpiryDate) }}</span>
            </div>
            <div class="row">
                <span class="label">Color</span>
                <span class="value">{{ vehicle.color || 'No data' }}</span>
            </div>
            <div class="row" v-if="vehicle.notes">
                <span class="label">Notes</span>
                <span class="value">{{ vehicle.notes }}</span>
            </div>
        </div>

        <div class="actions">
            <button class="danger" @click="showDelete = true">Delete</button>
            <button class="primary" @click="editVehicle">Edit</button>
        </div>
    </div>

    <div v-if="showDelete" class="modal-backdrop" @click="showDelete = false">
        <div class="modal" @click.stop>
            <p class="modal-title">Delete vehicle?</p>
            <p class="modal-text">This cannot be undone.</p>
            <div class="modal-actions">
                <button class="cancel" @click="showDelete = false">Cancel</button>
                <button class="confirm" :disabled="deleting" @click="confirmDelete">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'CarMaintenanceVehicleDetail',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getVehicle, deleteVehicle } = useCarMaintenance()
        const vehicle = ref(null)
        const loading = ref(false)
        const deleting = ref(false)
        const errorMessage = ref('')
        const showDelete = ref(false)

        const goBack = () => router.back()

        const loadVehicle = async() => {
            loading.value = true
            errorMessage.value = ''
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const data = await getVehicle(token, route.params.id)
                vehicle.value = data
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to load vehicle'
            } finally {
                loading.value = false
            }
        }

        const displayName = (v) => {
            const parts = [v?.make, v?.model, v?.year].filter(Boolean)
            return parts.join(' ').trim() || 'Vehicle'
        }

        const formatExpiry = (value) => {
            if (!value) return '(No date set)'
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return '(No date set)'
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }

        const confirmDelete = async() => {
            if (!vehicle.value?.id) return
            deleting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                await deleteVehicle(token, vehicle.value.id)
                showDelete.value = false
                router.push('/car-maintenance/vehicles')
            } catch (err) {
                alert(err?.message || 'Unable to delete vehicle')
            } finally {
                deleting.value = false
            }
        }

        const editVehicle = () => {
            if (!vehicle.value?.id) return
            router.push(`/car-maintenance/vehicles/${vehicle.value.id}/edit`)
        }

        onMounted(() => {
            loadVehicle()
        })

        return {
            vehicle,
            loading,
            errorMessage,
            displayName,
            formatExpiry,
            goBack,
            API_BASE_URL,
            showDelete,
            confirmDelete,
            deleting,
            editVehicle
        }
    }
}
</script>

<style scoped>
.vehicle-detail-page {
    min-height: 100vh;
    background: #f2f4f8;
    padding-bottom: 60px;
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

.empty {
    padding: 24px 16px;
    color: #6b7280;
}

.content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.hero {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    padding: 12px;
    border-radius: 14px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.hero-thumb {
    width: 86px;
    height: 76px;
    border-radius: 12px;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.hero-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.name {
    margin: 0;
    font-weight: 800;
    font-size: 16px;
    color: #111827;
}

.type, .mileage {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
}

.detail-card {
    background: white;
    border-radius: 14px;
    padding: 12px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
    color: #111827;
}

.row:last-child {
    border-bottom: none;
}

.label {
    color: #6b7280;
}

.actions {
    display: flex;
    gap: 10px;
}

.actions button {
    flex: 1;
    border: none;
    border-radius: 12px;
    padding: 12px;
    font-weight: 700;
    font-size: 14px;
}

.primary {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
}

.danger {
    background: #fee2e2;
    color: #b91c1c;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 3000;
}

.modal {
    display: block;
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 360px;
    height: auto;
}

.modal-title {
    margin: 0 0 4px;
    font-weight: 800;
    font-size: 16px;
    color: #1f2937;
}

.modal-text {
    margin: 0 0 12px;
    color: #6b7280;
    font-size: 14px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.modal-actions button {
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 700;
    border: none;
}

.cancel {
    background: #f3f4f6;
    color: #374151;
}

.confirm {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
}
</style>
