<template>
<div class="vital-detail-container">
    <div class="vital-detail-wrapper">
        <div class="detail-header">
            <button class="back-btn" @click="goBack">
                <mdicon name="arrow-left" :size="20"/>
            </button>
            <div class="header-text">
                <p class="header-label">Vitals · Illness</p>
                <h2>{{ isEdit ? 'Edit illness entry' : 'Add illness entry' }}</h2>
            </div>
        </div>

        <div class="form-card">
            <form class="form" @submit.prevent="submit">
                <div class="form-grid">
                    <label>
                        <span>Diagnosis *</span>
                        <input v-model="form.diagnosis" type="text" required placeholder="e.g., Influenza"/>
                    </label>
                    <label>
                        <span>Date & Time</span>
                        <input v-model="form.recordedAt" type="datetime-local"/>
                    </label>
                </div>

                <label>
                    <span>Symptoms (comma separated)</span>
                    <input v-model="symptomsInput" type="text" placeholder="Fever, Cough, Fatigue"/>
                </label>

                <div class="form-grid">
                    <label>
                        <span>Body Temperature</span>
                        <input v-model="form.bodyTemperature" type="number" step="0.1" min="30" max="45" placeholder="37.5"/>
                    </label>
                    <label>
                        <span>Unit</span>
                        <select v-model="form.temperatureUnit">
                            <option value="C">°C</option>
                            <option value="F">°F</option>
                        </select>
                    </label>
                </div>

                <div class="form-grid">
                    <label>
                        <span>Severity</span>
                        <select v-model="form.severity">
                            <option value="MILD">Mild</option>
                            <option value="MODERATE">Moderate</option>
                            <option value="SEVERE">Severe</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </label>
                    <label>
                        <span>Status</span>
                        <select v-model="form.status">
                            <option value="ONGOING">Ongoing</option>
                            <option value="RECOVERED">Recovered</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CHRONIC">Chronic</option>
                        </select>
                    </label>
                </div>

                <label>
                    <span>Medications (comma separated)</span>
                    <input v-model="medicationsInput" type="text" placeholder="Ibuprofen, Paracetamol"/>
                </label>

                <label>
                    <span>Notes</span>
                    <textarea v-model="form.notes" rows="4" placeholder="Add observations or advice"></textarea>
                </label>

                <div class="form-actions">
                    <button class="secondary-btn" type="button" @click="goBack">Cancel</button>
                    <button class="add-btn" type="submit" :disabled="submitting">
                        {{ submitting ? 'Saving...' : (isEdit ? 'Update entry' : 'Save entry') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIllness } from '@/composables/vitals/illness'

export default {
    name: 'IllnessFormWeb',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const { addRecord, fetchRecordById, updateRecord } = useIllness()
        const recordId = ref(route.params.id)
        const isEdit = ref(Boolean(recordId.value))
        const submitting = ref(false)
        const symptomsInput = ref('')
        const medicationsInput = ref('')

        const toLocalDateTime = (value) => {
            const date = new Date(value)
            if (Number.isNaN(date.getTime())) return ''
            const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
            return iso.slice(0, 16)
        }

        const form = ref({
            diagnosis: '',
            bodyTemperature: '',
            temperatureUnit: 'C',
            severity: 'MILD',
            status: 'ONGOING',
            notes: '',
            recordedAt: toLocalDateTime(new Date()),
            profileId: Array.isArray(route.query.profileId) ? route.query.profileId[0] : route.query.profileId || localStorage.getItem('selectedProfileId') || ''
        })

        const goBack = () => {
            router.back()
        }

        const parseList = (input) => input.split(',').map(item => item.trim()).filter(Boolean)

        const loadExisting = async () => {
            if (!recordId.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const existing = await fetchRecordById(token, recordId.value)
                if (existing) {
                    form.value = {
                        diagnosis: existing.diagnosis || '',
                        bodyTemperature: existing.bodyTemperature ?? '',
                        temperatureUnit: existing.temperatureUnit || 'C',
                        severity: existing.severity || 'MILD',
                        status: existing.status || 'ONGOING',
                        notes: existing.notes || '',
                        recordedAt: existing.recordedAt ? toLocalDateTime(existing.recordedAt) : '',
                        profileId: existing.profileId || form.value.profileId
                    }
                    symptomsInput.value = (existing.symptoms || []).join(', ')
                    medicationsInput.value = (existing.medications || []).join(', ')
                }
            } catch (err) {
                alert(err.message || 'Failed to load entry')
            }
        }

        const submit = async () => {
            if (!form.value.diagnosis) {
                alert('Diagnosis is required.')
                return
            }
            if (!form.value.profileId) {
                alert('Profile is required.')
                return
            }
            submitting.value = true
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('No auth token found.')
                const payload = {
                    ...form.value,
                    symptoms: parseList(symptomsInput.value),
                    medications: parseList(medicationsInput.value)
                }
                if (isEdit.value) {
                    await updateRecord(token, recordId.value, payload)
                } else {
                    await addRecord(token, payload)
                }
                router.push({
                    path: '/medical-records/web/illness',
                    query: {
                        profileId: form.value.profileId,
                        profileName: route.query.profileName || localStorage.getItem('selectedProfileName') || ''
                    }
                })
            } catch (err) {
                alert(err.message || 'Failed to save illness record')
            } finally {
                submitting.value = false
            }
        }

        onMounted(() => {
            loadExisting()
        })

        return {
            form,
            symptomsInput,
            medicationsInput,
            isEdit,
            submitting,
            submit,
            goBack
        }
    }
}
</script>

<style scoped>
.vital-detail-container {
    background: #f8fafc;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    padding: 24px 16px 40px;
}

.vital-detail-wrapper {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.back-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid var(--text-primary);
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.header-text {
    flex: 1;
}

.header-label {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
}

.header-text h2 {
    margin: 2px 0 0;
    font-size: 22px;
    color: #0f172a;
}

.form-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    border: 1px solid #e5e7eb;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: #475569;
}

input,
textarea,
select {
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--text-primary);
    font-size: 14px;
}

textarea {
    resize: vertical;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

.secondary-btn {
    border: 1px solid var(--text-primary);
    background: #f8fafc;
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 700;
}

.add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    border-radius: 12px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    color: white;
    font-weight: 700;
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.25);
    cursor: pointer;
}

.add-btn:disabled {
    opacity: 0.7;
}

@media (max-width: 820px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
    .header-text h2 {
        font-size: 18px;
    }
}
</style>
