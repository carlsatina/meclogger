<template>
<div class="maintenance-detail-page">
    <div class="top-banner">
        <button class="icon-btn" @click="goBack">
            <mdicon name="chevron-left" :size="22"/>
        </button>
        <h2 class="title">Maintenance Detail</h2>
        <button class="icon-btn" @click="editRecord">
            <mdicon name="pencil" :size="20"/>
        </button>
    </div>

    <div class="card">
        <div class="hero-image">
            <img v-if="vehicleImage" :src="vehicleImage" alt="Vehicle" />
            <mdicon v-else name="car" :size="48"/>
        </div>
        <p class="title-text center">{{ record?.title }}</p>
        <p class="meta center">{{ vehicleName }}</p>

        <div class="info-grid">
            <div class="info-item full">
                <span class="label">Type</span>
                <span class="value">{{ record?.maintenanceType }}</span>
            </div>
            <div class="info-item full">
                <span class="label">Location</span>
                <span class="value">{{ record?.location || '—' }}</span>
            </div>
            <div class="info-item inline">
                <span class="label">Service Date</span>
                <span class="value">{{ formatDate(record?.serviceDate) }}</span>
            </div>
            <div class="info-item inline">
                <span class="label">Serviced By</span>
                <span class="value">{{ record?.servicedBy || '—' }}</span>
            </div>
            <div class="info-item">
                <span class="label">Mileage</span>
                <span class="value">{{ formatMileage(record?.mileageAtService) }}</span>
            </div>
            <div class="info-item">
                <span class="label">Cost</span>
                <span class="value">{{ formatCurrency(record?.cost, record?.currency) }}</span>
            </div>
        </div>

        <div class="notes" v-if="record?.description">
            <p class="label">Notes</p>
            <p class="value">{{ record.description }}</p>
        </div>
    </div>

    <div class="actions">
        <button class="delete-btn" @click="confirmDelete = true">Delete</button>
        <button class="edit-btn" @click="editRecord">Edit</button>
    </div>

    <div v-if="confirmDelete" class="modal-backdrop" @click.self="confirmDelete = false">
        <div class="modal">
            <p class="modal-title">Delete maintenance record?</p>
            <p class="modal-text">This action cannot be undone.</p>
            <div class="modal-actions">
                <button class="cancel" @click="confirmDelete = false">Cancel</button>
                <button class="danger" @click="deleteRecord">Delete</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL } from '@/constants/config'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'MaintenanceDetailMobile',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { getMaintenanceRecord, listVehicles, deleteMaintenanceRecord } = useCarMaintenance()

        const record = ref(null)
        const vehicles = ref([])
        const confirmDelete = ref(false)

        const vehicleName = computed(() => {
            if (!record.value) return ''
            const vehicle = vehicles.value.find(v => v.id === record.value.vehicleId)
            if (!vehicle) return ''
            const parts = [vehicle.make, vehicle.model, vehicle.year].filter(Boolean)
            return parts.join(' ').trim()
        })

        const vehicleImage = computed(() => {
            const vehicle = vehicles.value.find(v => v.id === record.value?.vehicleId)
            if (!vehicle || !vehicle.imageUrl) return ''
            return vehicle.imageUrl.startsWith('http') ? vehicle.imageUrl : `${API_BASE_URL}${vehicle.imageUrl}`
        })

        const formatDate = (value) => {
            if (!value) return ''
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return ''
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
        }

        const formatMileage = (value) => {
            if (value === null || value === undefined) return '—'
            return `${value.toLocaleString()} km`
        }

        const formatCurrency = (value, currency = 'USD') => {
            if (value === null || value === undefined) return '—'
            try {
                return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency
                }).format(value)
            } catch (e) {
                return `${value.toLocaleString()} ${currency}`
            }
        }

        const loadData = async() => {
            const token = localStorage.getItem('token')
            const id = route.params.id
            if (!token || !id) return router.back()
            try {
                const [rec, veh] = await Promise.all([
                    getMaintenanceRecord(token, id),
                    listVehicles(token)
                ])
                record.value = rec
                vehicles.value = veh
            } catch (err) {
                router.back()
            }
        }

        const goBack = () => router.back()
        const editRecord = () => {
            if (!record.value) return
            router.push({ path: '/car-maintenance/maintenance/add', query: { edit: 'true', id: record.value.id, vehicleId: record.value.vehicleId } })
        }
        const deleteRecord = async() => {
            if (!record.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                await deleteMaintenanceRecord(token, record.value.id)
                router.push('/car-maintenance')
            } catch (err) {
                console.error(err)
            }
        }

        onMounted(() => {
            loadData()
        })

        return {
            record,
            vehicleName,
            vehicleImage,
            formatDate,
            formatMileage,
            formatCurrency,
            goBack,
            editRecord,
            deleteRecord,
            confirmDelete
        }
    }
}
</script>

<style scoped>
.maintenance-detail-page {
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

.card {
    margin: 16px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    padding: 16px;
}

.hero-image {
    width: 100%;
    min-height: 160px;
    max-height: 240px;
    border-radius: 16px;
    overflow: hidden;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
}

.hero-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.title-text {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
}

.title-text.center {
    text-align: center;
}

.meta.center {
    text-align: center;
}

.meta {
    margin: 2px 0 0;
    color: #6b7280;
    font-size: 13px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 8px;
}

.info-item {
    background: #f8fafc;
    border-radius: 12px;
    padding: 10px;
}

.info-item.inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-item.full {
    grid-column: span 2;
}

.label {
    display: block;
    color: #6b7280;
    font-size: 12px;
}

.value {
    color: #111827;
    font-weight: 700;
}

.notes {
    margin-top: 12px;
    background: #f8fafc;
    border-radius: 12px;
    padding: 12px;
}

.actions {
    display: flex;
    justify-content: space-between;
    padding: 0 16px 16px;
    gap: 10px;
}

.delete-btn {
    flex: 1;
    border: none;
    background: #ef4444;
    color: white;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
}

.edit-btn {
    flex: 1;
    border: none;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
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
    margin: 0 0 6px;
    font-weight: 800;
    color: #111827;
}

.modal-text {
    margin: 0 0 12px;
    color: #4b5563;
    font-size: 14px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.modal-actions .cancel {
    border: 1px solid #e5e7eb;
    background: white;
    color: #111827;
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 700;
}

.modal-actions .danger {
    border: none;
    background: #ef4444;
    color: white;
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 700;
}
</style>
