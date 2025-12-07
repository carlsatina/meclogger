<template>
<div class="vital-detail-container">
    <div class="vital-detail-wrapper">
        <div class="detail-header">
            <button class="back-btn" @click="goBack">
                <mdicon name="arrow-left" :size="20"/>
            </button>
            <div class="header-text">
                <p class="header-label">Vitals · Illness</p>
                <h2>{{ activeProfileName || 'Select profile' }}</h2>
            </div>
            <div class="header-actions">
                <button class="icon-btn" @click="loadRecords">
                    <mdicon name="refresh" :size="18"/>
                </button>
                <button class="add-btn" @click="goToAdd">
                    <mdicon name="plus" :size="18"/>
                    <span>Add entry</span>
                </button>
            </div>
        </div>

        <div v-if="loading" class="state-card">Loading illness records...</div>
        <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>

        <div v-else class="detail-content">
            <section class="measurement-panel illness">
                <div class="measurement-header">
                    <div class="measurement-icon">
                        <mdicon name="stethoscope" :size="32"/>
                    </div>
                    <div>
                        <p class="measurement-label">Latest diagnosis</p>
                        <p class="measurement-status" :class="latestStatusClass">
                            {{ latestStatusLabel }}
                        </p>
                    </div>
                </div>
                <div v-if="latestRecord" class="measurement-value illness">
                    <h3>{{ latestRecord.diagnosis }}</h3>
                    <p class="illness-meta">
                        <span class="pill subtle">{{ latestRecord.severity }}</span>
                        <span v-if="latestRecord.temperature" class="pill subtle">{{ latestRecord.temperature }}</span>
                    </p>
                    <p class="measurement-date">{{ latestRecord.date }} · {{ latestRecord.time }}</p>
                    <div v-if="latestRecord.symptoms.length" class="symptom-row">
                        <span class="chip tiny" v-for="symptom in latestRecord.symptoms" :key="symptom">{{ symptom }}</span>
                    </div>
                </div>
                <p v-else class="empty-hint">No illness records yet.</p>
            </section>

            <section class="history-panel">
                <div class="history-header">
                    <h3>Recent history</h3>
                </div>
                <div v-if="history.length" class="history-list">
                    <div class="history-row" v-for="entry in history" :key="entry.id" @click="editRecord(entry.id)">
                        <div class="history-date">
                            <p class="history-day">{{ entry.date }}</p>
                            <p class="history-time">{{ entry.time }}</p>
                        </div>
                        <div class="history-reading">
                            <p class="reading-value">{{ entry.diagnosis }}</p>
                            <p class="reading-sub">
                                <span class="pill tiny" :class="entry.statusClass">{{ entry.status }}</span>
                                <span class="pill tiny subtle">{{ entry.severity }}</span>
                                <span v-if="entry.temperature" class="pill tiny subtle">{{ entry.temperature }}</span>
                            </p>
                            <div v-if="entry.symptoms.length" class="symptom-row">
                                <span class="chip tiny" v-for="symptom in entry.symptoms" :key="symptom">{{ symptom }}</span>
                            </div>
                        </div>
                        <button class="ghost-btn" @click.stop="editRecord(entry.id)">Edit</button>
                    </div>
                </div>
                <p v-else class="empty-hint">Recent illness entries will appear here.</p>
            </section>
        </div>
    </div>
</div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIllness } from '@/composables/vitals/illness'

const formatDateTime = (value) => {
    if (!value) return { date: 'Unknown', time: '' }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return { date: 'Unknown', time: '' }
    return {
        date: parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
}

export default {
    name: 'IllnessDetailWeb',
    setup() {
        const router = useRouter()
        const { records, fetchRecords } = useIllness()
        const activeProfileId = ref(localStorage.getItem('selectedProfileId') || '')
        const activeProfileName = ref(localStorage.getItem('selectedProfileName') || 'Select profile')
        const loading = ref(false)
        const errorMessage = ref('')

        const loadRecords = async () => {
            const token = localStorage.getItem('token')
            activeProfileId.value = localStorage.getItem('selectedProfileId') || ''
            activeProfileName.value = localStorage.getItem('selectedProfileName') || 'Select profile'
            if (!token || !activeProfileId.value) {
                records.value = []
                return
            }
            loading.value = true
            errorMessage.value = ''
            try {
                await fetchRecords(token, activeProfileId.value)
            } catch (err) {
                errorMessage.value = err.message || 'Unable to load illness records.'
            } finally {
                loading.value = false
            }
        }

        const sortedRecords = computed(() => {
            return [...records.value].sort((a, b) => new Date(b.recordedAt || b.createdAt) - new Date(a.recordedAt || a.createdAt))
        })

        const latestIllness = computed(() => sortedRecords.value[0] || null)

        const listItems = computed(() => sortedRecords.value.map(entry => {
            const { date, time } = formatDateTime(entry.recordedAt || entry.createdAt)
            return {
                id: entry.id,
                diagnosis: entry.diagnosis,
                status: entry.status || 'ONGOING',
                statusClass: (entry.status || 'ONGOING').toLowerCase(),
                severity: entry.severity || 'MILD',
                temperature: entry.bodyTemperature ? `${entry.bodyTemperature}°${entry.temperatureUnit || 'C'}` : '',
                date,
                time,
                symptoms: entry.symptoms || []
            }
        }))

        const latestRecord = computed(() => {
            if (!latestIllness.value) return null
            const { date, time } = formatDateTime(latestIllness.value.recordedAt || latestIllness.value.createdAt)
            return {
                diagnosis: latestIllness.value.diagnosis,
                severity: latestIllness.value.severity || 'MILD',
                temperature: latestIllness.value.bodyTemperature ? `${latestIllness.value.bodyTemperature}°${latestIllness.value.temperatureUnit || 'C'}` : '',
                date,
                time,
                symptoms: latestIllness.value.symptoms || []
            }
        })

        const latestStatusLabel = computed(() => latestIllness.value?.status || 'No status')
        const latestStatusClass = computed(() => (latestIllness.value?.status || 'ongoing').toLowerCase())

        const history = computed(() => listItems.value.slice(0, 8))

        const goBack = () => {
            router.back()
        }

        const goToAdd = () => {
            router.push({
                path: '/medical-records/web/illness/add',
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        const editRecord = (id) => {
            router.push({
                path: `/medical-records/web/illness/${id}`,
                query: {
                    profileId: activeProfileId.value,
                    profileName: activeProfileName.value
                }
            })
        }

        onMounted(() => {
            loadRecords()
        })

        return {
            activeProfileName,
            latestRecord,
            latestStatusLabel,
            latestStatusClass,
            history,
            loadRecords,
            goToAdd,
            editRecord,
            goBack,
            loading,
            errorMessage
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
    max-width: 1100px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

.header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon-btn {
    width: 42px;
    height: 42px;
    border: 1px solid var(--text-primary);
    border-radius: 12px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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

.state-card {
    background: white;
    border-radius: 16px;
    padding: 14px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    color: #475569;
}

.state-card.error {
    color: #dc2626;
}

.detail-content {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 16px;
}

.measurement-panel,
.history-panel {
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
    border: 1px solid #e5e7eb;
}

.measurement-panel.illness {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.measurement-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.measurement-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: #f3e8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c3aed;
}

.measurement-label {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
}

.measurement-status {
    margin: 2px 0 0;
    font-weight: 700;
    color: #374151;
    text-transform: capitalize;
}

.measurement-status.ongoing,
.measurement-status.chronic {
    color: #ea580c;
}

.measurement-status.recovered,
.measurement-status.resolved {
    color: #16a34a;
}

.measurement-status.severe,
.measurement-status.critical {
    color: #dc2626;
}

.measurement-value h3 {
    margin: 4px 0 0;
    font-size: 22px;
    color: #0f172a;
}

.measurement-date {
    margin: 4px 0 0;
    color: #6b7280;
}

.illness-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 6px 0;
}

.pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    background: #eef2ff;
    color: #4f46e5;
}

.pill.subtle {
    background: #f1f5f9;
    color: #475569;
}

.pill.tiny {
    padding: 5px 8px;
    font-size: 11px;
}

.pill.ongoing,
.pill.chronic {
    background: #fff7ed;
    color: #ea580c;
}

.pill.recovered,
.pill.resolved {
    background: #ecfdf3;
    color: #16a34a;
}

.pill.severe,
.pill.critical {
    background: #fef2f2;
    color: #dc2626;
}

.symptom-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
}

.chip {
    background: #f3f4f6;
    color: #111827;
    padding: 6px 10px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 12px;
}

.chip.tiny {
    padding: 5px 8px;
    font-size: 11px;
}

.history-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.history-header h3 {
    margin: 0;
    color: #0f172a;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.history-row {
    display: grid;
    grid-template-columns: 140px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
    cursor: pointer;
}

.history-date {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #6b7280;
}

.history-day {
    margin: 0;
    font-weight: 700;
    color: #0f172a;
}

.history-time {
    margin: 0;
    font-size: 12px;
}

.reading-value {
    margin: 0;
    font-weight: 700;
    color: #0f172a;
}

.reading-sub {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
    margin: 4px 0 0;
}

.empty-hint {
    margin: 0;
    color: #6b7280;
}

.ghost-btn {
    border: none;
    background: transparent;
    color: #4f46e5;
    font-weight: 700;
    cursor: pointer;
}

.placeholder {
    text-align: center;
    color: var(--text-muted);
    padding: 20px 0;
}

.chart-wrapper {
    display: flex;
    gap: 12px;
}

.chart-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: var(--text-muted);
    font-size: 12px;
}

.chart-area {
    flex: 1;
    position: relative;
}

.line-chart {
    width: 100%;
    height: 160px;
}

.chart-x-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    color: var(--text-muted);
    font-size: 12px;
}

.chart-unit {
    position: absolute;
    top: 0;
    right: 0;
    color: var(--text-muted);
    font-size: 12px;
}

@media (max-width: 1100px) {
    .detail-content {
        grid-template-columns: 1fr;
    }
    .history-row {
        grid-template-columns: 1fr;
        gap: 8px;
    }
    .header-text h2 {
        font-size: 18px;
    }
}
</style>
