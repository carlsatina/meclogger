<template>
<div class="page">
    <header class="hero">
        <div class="brand">
            <button class="icon-btn" @click="router.back()">
                <mdicon name="chevron-left" :size="22"/>
            </button>
            <h2 class="title">Add Vehicle</h2>
        </div>
    </header>
    <main class="content">
        <form class="panel form" @submit.prevent="submitVehicle">
            <div class="two-col">
                <div class="field">
                    <label>Make</label>
                    <input v-model="form.make" type="text" required />
                </div>
                <div class="field">
                    <label>Model</label>
                    <input v-model="form.model" type="text" required />
                </div>
            </div>
            <div class="two-col">
                <div class="field">
                    <label>Year</label>
                    <input v-model="form.year" type="number" min="1900" placeholder="2020" />
                </div>
                <div class="field">
                    <label>Vehicle Type</label>
                    <select v-model="form.vehicleType">
                        <option value="CAR">Car</option>
                        <option value="SUV">SUV</option>
                        <option value="TRUCK">Truck</option>
                        <option value="MOTORCYCLE">Motorcycle</option>
                        <option value="VAN">Van</option>
                    </select>
                </div>
            </div>
            <div class="two-col">
                <div class="field">
                    <label>Color</label>
                    <input v-model="form.color" type="text" placeholder="Blue" />
                </div>
                <div class="field">
                    <label>License Plate</label>
                    <input v-model="form.licensePlate" type="text" placeholder="ABC1234" />
                </div>
            </div>
            <div class="two-col">
                <div class="field">
                    <label>VIN</label>
                    <input v-model="form.vin" type="text" placeholder="VIN" />
                </div>
                <div class="field">
                    <label>Registration Expiry</label>
                    <input v-model="form.registrationExpiryDate" type="date" />
                </div>
            </div>
            <div class="two-col">
                <div class="field">
                    <label>Odometer</label>
                    <input v-model="form.currentMileage" type="number" min="0" placeholder="50000" />
                </div>
                <div class="field">
                    <label>Notes</label>
                    <textarea v-model="form.notes" rows="2" placeholder="Notes..."></textarea>
                </div>
            </div>

            <div class="field">
                <label>Image</label>
                <div class="upload-box" @click="triggerFile">
                    <mdicon name="image-multiple" :size="20"/>
                    <span>{{ imagePreview ? 'Change image' : 'Tap to upload image' }}</span>
                </div>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                <div v-if="imagePreview" class="preview">
                    <img :src="imagePreview" alt="Preview" />
                </div>
            </div>

            <button class="primary-btn" type="submit" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Save Vehicle' }}
            </button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </form>
    </main>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarMaintenance } from '@/composables/carMaintenance'

export default {
    name: 'CarMaintenanceAddVehicleWeb',
    setup() {
        const router = useRouter()
        const { createVehicle } = useCarMaintenance()
        const form = ref({
            make: '',
            model: '',
            year: '',
            vehicleType: 'CAR',
            color: '',
            licensePlate: '',
            vin: '',
            registrationExpiryDate: '',
            currentMileage: '',
            notes: ''
        })
        const fileInput = ref(null)
        const imageFile = ref(null)
        const imagePreview = ref('')
        const submitting = ref(false)
        const errorMessage = ref('')
        const successMessage = ref('')

        const triggerFile = () => {
            fileInput.value?.click()
        }

        const handleFileChange = (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            imageFile.value = file
            imagePreview.value = URL.createObjectURL(file)
        }

        const submitVehicle = async() => {
            errorMessage.value = ''
            successMessage.value = ''
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('You must be logged in.')
                const payload = new FormData()
                Object.entries(form.value).forEach(([key, val]) => {
                    if (val !== null && val !== undefined && val !== '') {
                        payload.append(key, val)
                    }
                })
                if (imageFile.value) {
                    payload.append('image', imageFile.value)
                }
                await createVehicle(token, payload)
                successMessage.value = 'Vehicle saved'
                setTimeout(() => router.push('/web/car-maintenance/vehicles'), 500)
            } catch (err) {
                errorMessage.value = err?.message || 'Unable to save vehicle'
            } finally {
                submitting.value = false
            }
        }

        onMounted(() => {
            // no-op
        })

        return {
            router,
            form,
            fileInput,
            imagePreview,
            triggerFile,
            handleFileChange,
            submitVehicle,
            submitting,
            errorMessage,
            successMessage
        }
    }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
.hero {
    padding: 18px 22px;
    background: linear-gradient(135deg, #6f6cf7, #f093fb);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 8px 18px rgba(0,0,0,0.12);
}
.brand { display: flex; align-items: center; gap: 10px; }
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
.upload-box {
    border: 1px dashed #cbd5e1;
    padding: 10px 12px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #4b5563;
    cursor: pointer;
}
.hidden { display: none; }
.preview img {
    margin-top: 8px;
    width: 100%;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    object-fit: cover;
}
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
