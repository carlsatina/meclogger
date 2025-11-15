<template>
<div class="add-medicine-page">
    <header class="header">
        <button class="icon-btn" @click="goBack">
            <mdicon name="arrow-left" :size="22"/>
        </button>
        <h2 class="title">Add medicine</h2>
        <div class="spacer"></div>
    </header>

    <div class="content">
        <section class="input-card">
            <label class="input-label">Medicine Name</label>
            <input
                type="text"
                v-model="medicineName"
                placeholder="e.g., Pantoprazole"
                class="input-field"
            />
        </section>

        <section class="input-card">
            <label class="input-label">Unit</label>
            <div class="select-field" @click="toggleUnit">
                <span>{{ unit }}</span>
                <mdicon name="chevron-down" :size="20"/>
            </div>
            <div v-if="showUnitOptions" class="option-list">
                <button
                    v-for="option in unitOptions"
                    :key="option"
                    class="option-item"
                    @click="selectUnit(option)"
                >
                    {{ option }}
                </button>
            </div>
        </section>

        <section class="input-card">
            <p class="section-label">Schedule</p>
            <div class="schedule-grid">
                <div class="schedule-row">
                    <span>Dosage</span>
                    <div class="dosage-controls">
                        <button @click="decrementDosage">-</button>
                        <span>{{ dosage }}</span>
                        <button @click="incrementDosage">+</button>
                    </div>
                </div>
                <div class="schedule-row select-row">
                    <label>Frequency</label>
                    <div class="styled-select">
                        <select v-model="frequency">
                            <option v-for="option in frequencyOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="schedule-row select-row">
                    <label>Time</label>
                    <div class="styled-select">
                        <input type="time" v-model="time"/>
                    </div>
                </div>
                <div class="schedule-row select-row">
                    <label>Duration</label>
                    <div class="styled-select">
                        <select v-model="duration">
                            <option v-for="option in durationOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <mdicon name="chevron-down" :size="18"/>
                    </div>
                </div>
                <div class="schedule-row select-row">
                    <label>Intake method</label>
                    <div class="styled-select">
                        <select v-model="intakeMethod">
                            <option v-for="option in intakeOptions" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                        <mdicon name="chevron-down" :size="18"/>
                    </div>
                </div>
            </div>
        </section>

        <button class="primary-btn" @click="saveReminder">
            Save
        </button>
    </div>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicineReminders } from '@/composables/medicineReminders'

export default {
    name: 'AddMedicineReminder',
    setup() {
        const router = useRouter()
        const medicineName = ref('')
        const unit = ref('Tablet')
        const dosage = ref(1)
        const frequency = ref('Once daily')
        const time = ref('08:00')
        const duration = ref('5 days')
        const intakeMethod = ref('Before meal')
        const showUnitOptions = ref(false)
        const unitOptions = ['Tablet', 'Capsule', 'Syrup', 'Drops']
        const frequencyOptions = ['Once daily', 'Twice daily', 'Thrice daily', 'Weekly']
        const durationOptions = ['3 days', '5 days', '7 days', '14 days', '30 days']
        const intakeOptions = ['Before meal', 'After meal']

        const { createReminder } = useMedicineReminders()

        const goBack = () => router.back()
        const toggleUnit = () => (showUnitOptions.value = !showUnitOptions.value)
        const selectUnit = (value) => {
            unit.value = value
            showUnitOptions.value = false
        }
        const incrementDosage = () => (dosage.value = Math.min(10, dosage.value + 1))
        const decrementDosage = () => (dosage.value = Math.max(1, dosage.value - 1))
        const saveReminder = async () => {
            const token = localStorage.getItem('token')
            const profileId = localStorage.getItem('selectedProfileId')
            if (!token || !profileId) {
                alert('Please select a profile first.')
                return
            }
            try {
                await createReminder(token, {
                    profileId,
                    medicineName: medicineName.value.trim(),
                    unit: unit.value,
                    dosage: dosage.value,
                    frequency: frequency.value,
                    time: time.value,
                    duration: duration.value,
                    intakeMethod: intakeMethod.value
                })
                router.back()
            } catch (err) {
                alert(err.message || 'Unable to save reminder.')
            }
        }

        return {
            goBack,
            medicineName,
            unit,
            unitOptions,
            showUnitOptions,
            selectUnit,
            toggleUnit,
            dosage,
            incrementDosage,
            decrementDosage,
            frequency,
            frequencyOptions,
            time,
            durationOptions,
            duration,
            intakeMethod,
            intakeOptions,
            saveReminder
        }
    }
}
</script>

<style scoped>
.add-medicine-page {
    min-height: 100vh;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid #f1f5f9;
}

.icon-btn {
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 12px;
}

.icon-btn:active {
    background: #f3f4f6;
}

.title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
}

.spacer {
    width: 32px;
}

.content {
    flex: 1;
    padding: 20px 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.input-card {
    background: white;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 15px 30px rgba(15, 23, 42, 0.05);
}

.input-label {
    display: block;
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 8px;
}

.input-field {
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 14px;
    background: #f5f6fb;
    font-size: 16px;
    font-weight: 500;
}

.select-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f5f6fb;
    padding: 14px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}

.option-list {
    margin-top: 8px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 20px rgba(15, 23, 42, 0.08);
}

.option-item {
    width: 100%;
    border: none;
    background: white;
    padding: 12px 16px;
    text-align: left;
    font-size: 15px;
}

.option-item:active {
    background: #eef2ff;
}

.section-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 12px;
}

.schedule-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.schedule-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 500;
    color: #0f172a;
}

.dosage-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f5f6fb;
    padding: 8px 12px;
    border-radius: 999px;
}

.dosage-controls button {
    border: none;
    background: #4f46e5;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 18px;
}

.value {
    color: #4f46e5;
}

.primary-btn {
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    margin-top: auto;
}

.primary-btn:active {
    opacity: 0.9;
}

.select-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
}

.styled-select {
    width: 100%;
    position: relative;
    background: #eef2ff;
    border-radius: 12px;
    border: 1px solid #dbe2ff;
    padding: 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: inset 0 1px 3px rgba(79, 70, 229, 0.08);
}

.styled-select select,
.styled-select input[type="time"] {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 500;
    appearance: none;
    color: #0f172a;
}

.styled-select select:focus,
.styled-select input[type="time"]:focus {
    outline: none;
}

</style>
