<template>
<div class="page">
    <div class="page-header">
        <button class="ghost-btn" @click="goBack">
            <mdicon name="arrow-left" :size="20"/>
            Back
        </button>
        <div class="header-text">
            <p class="eyebrow">Medicine reminders</p>
            <h2 class="title">{{ weekLabel }}</h2>
            <p class="year-label">{{ calendarYear }}</p>
        </div>
        <div class="header-actions">
            <button class="pill-btn" @click="previousWeek">
                <mdicon name="chevron-left" :size="18"/>
                Previous
            </button>
            <button class="pill-btn" @click="nextWeek">
                Next
                <mdicon name="chevron-right" :size="18"/>
            </button>
            <button class="primary-btn" @click="navigateToAddReminder">
                <mdicon name="plus" :size="18"/>
                Add reminder
            </button>
        </div>
    </div>

    <div class="calendar-strip">
        <button
            v-for="day in weekDays"
            :key="day.iso"
            class="day-chip"
            :class="{ active: day.isSelected, today: day.isToday }"
            @click="selectDay(day.dateObj)"
        >
            <span class="day-name">{{ day.label }}</span>
            <span class="day-number">{{ day.date }}</span>
        </button>
    </div>

    <div class="day-reminders">
        <div class="day-summary">
            <div>
                <p class="summary-label">Selected day</p>
                <h3 class="summary-date">{{ selectedDayLabel }}</h3>
            </div>
            <span v-if="selectedDayIsToday" class="tag">Today</span>
        </div>

        <div v-if="loading" class="day-empty">Loading reminders...</div>
        <div v-else-if="!dayReminders.length" class="day-empty">No reminders for this day.</div>
        <div v-else class="reminder-list">
            <div 
                class="reminder-card"
                v-for="reminder in dayReminders"
                :key="reminder.id"
            >
                <div class="reminder-header">
                    <div>
                        <h4 class="reminder-name">{{ reminder.medicineName }}</h4>
                        <p class="reminder-meta">{{ reminder.intakeMethod || 'Anytime' }}</p>
                    </div>
                    <span class="reminder-frequency">{{ formatFrequency(reminder) }}</span>
                </div>
                <div class="reminder-slots">
                    <button
                        class="slot-chip"
                        v-for="slot in reminder.slots"
                        :key="slot.id"
                        :class="{ checked: slot.status === 'taken' }"
                        @click="toggleReminder(reminder, slot, selectedDate)"
                    >
                        {{ slot.label }}
                        <span class="slot-status" v-if="slot.status">
                            {{ slot.status === 'taken' ? '☑︎' : '✖︎' }}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicineReminders } from '@/composables/medicineReminders'

export default {
    name: 'MedicineReminderCalendarWeb',
    setup() {
        const router = useRouter()
        const selectedDate = ref(new Date())
        const activeProfileId = ref(localStorage.getItem('selectedProfileId') || null)

        const {
            reminders,
            loading,
            fetchReminders,
            setReminderStatus
        } = useMedicineReminders()

        const navigateToAddReminder = () => {
            router.push('/medical-records/medicine-reminders/add')
        }

        const goBack = () => {
            router.back()
        }

        const weekStart = computed(() => {
            const start = new Date(selectedDate.value)
            start.setHours(0, 0, 0, 0)
            start.setDate(start.getDate() - start.getDay())
            return start
        })

        const weekLabel = computed(() => {
            const start = weekStart.value
            const end = new Date(start)
            end.setDate(start.getDate() + 6)
            const format = (date, withYear = false) => date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                ...(withYear ? { year: 'numeric' } : {})
            })
            return `${format(start, start.getFullYear() !== end.getFullYear())} – ${format(end, true)}`
        })

        const calendarYear = computed(() => selectedDate.value.getFullYear())

        const weekDays = computed(() => {
            const today = new Date()
            return Array.from({ length: 7 }).map((_, idx) => {
                const day = new Date(weekStart.value)
                day.setDate(weekStart.value.getDate() + idx)
                return {
                    label: day.toLocaleDateString(undefined, { weekday: 'short' }),
                    date: day.getDate(),
                    fullDate: day.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
                    isSelected: day.toDateString() === selectedDate.value.toDateString(),
                    isToday: day.toDateString() === today.toDateString(),
                    dateObj: day,
                    iso: day.toISOString()
                }
            })
        })

        const formatReminderTime = (timeString) => {
            if (!timeString) return '—'
            const [hour, minute] = timeString.split(':')
            const date = new Date()
            date.setHours(Number(hour), Number(minute), 0, 0)
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        const formatFrequency = (reminder) => {
            if (reminder.slots && reminder.slots.length) {
                return `${reminder.slots.length}x`
            }
            const durationMatch = reminder.frequency?.match?.(/(\d+)/)
            if (durationMatch) {
                return `${durationMatch[1]}x`
            }
            return reminder.frequency || ''
        }

        const normalizeReminder = (reminder) => {
            const reminderSlots = reminder.slots && reminder.slots.length
                ? reminder.slots
                : [{ time: reminder.time, status: reminder.status }]
            const slots = reminderSlots
                .map((slot, index) => {
                    const rawTime = typeof slot === 'string' ? slot : slot.time
                    if (!rawTime) return null
                    return {
                        id: `${reminder.id}-${rawTime}-${index}`,
                        reminderId: reminder.id,
                        rawTime,
                        status: slot.status || null,
                        label: formatReminderTime(rawTime)
                    }
                })
                .filter(Boolean)
            return {
                ...reminder,
                slots
            }
        }

        const selectedDayLabel = computed(() => selectedDate.value.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }))

        const selectedDayIsToday = computed(() => selectedDate.value.toDateString() === new Date().toDateString())

        const dayReminders = computed(() => reminders.value.map(normalizeReminder))

        const loadSelectedDay = async() => {
            const token = localStorage.getItem('token')
            if (!token || !activeProfileId.value) {
                reminders.value = []
                return
            }
            await fetchReminders(token, activeProfileId.value, { date: selectedDate.value })
        }

        const selectDay = (dateObj) => {
            if (!dateObj) return
            selectedDate.value = new Date(dateObj)
            loadSelectedDay()
        }

        const previousWeek = () => {
            const updated = new Date(selectedDate.value)
            updated.setDate(updated.getDate() - 7)
            selectedDate.value = updated
            loadSelectedDay()
        }

        const nextWeek = () => {
            const updated = new Date(selectedDate.value)
            updated.setDate(updated.getDate() + 7)
            selectedDate.value = updated
            loadSelectedDay()
        }

        const applyStatusLocally = (reminderId, rawTime, newStatus) => {
            const statusValue = newStatus === 'pending' ? null : newStatus
            const target = reminders.value.find(r => r.id === reminderId)
            if (!target) return
            if (Array.isArray(target.slots) && target.slots.length) {
                const slot = target.slots.find(s => s.time === rawTime)
                if (slot) slot.status = statusValue
            } else if (target.time === rawTime) {
                target.status = statusValue
            }
        }

        const toggleReminder = async(reminder, reminderSlot, forDate) => {
            const token = localStorage.getItem('token')
            if (!token || !activeProfileId.value) return
            const newStatus = reminderSlot.status === 'taken' ? 'pending' : 'taken'
            try {
                await setReminderStatus(token, reminderSlot.reminderId, newStatus, forDate, reminderSlot.rawTime)
                applyStatusLocally(reminderSlot.reminderId, reminderSlot.rawTime, newStatus)
                reminderSlot.status = newStatus === 'pending' ? null : newStatus
            } catch (err) {
                console.error(err)
            }
        }

        onMounted(() => {
            loadSelectedDay()
        })

        return {
            weekDays,
            weekLabel,
            calendarYear,
            loading,
            goBack,
            previousWeek,
            nextWeek,
            selectDay,
            dayReminders,
            selectedDayLabel,
            selectedDayIsToday,
            toggleReminder,
            formatFrequency,
            selectedDate,
            navigateToAddReminder
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4ebf5 100%);
    padding: 24px;
}

.page-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.ghost-btn {
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 12px;
    padding: 10px 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #374151;
    width: fit-content;
}

.header-text {
    text-align: center;
}

.eyebrow {
    margin: 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #6b7280;
}

.title {
    margin: 6px 0;
    font-size: 26px;
    color: #111827;
}

.year-label {
    margin: 0;
    color: #6b7280;
    font-weight: 600;
}

.header-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
}

.pill-btn {
    border: none;
    background: white;
    color: #4f46e5;
    padding: 10px 14px;
    border-radius: 14px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.15);
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    padding: 10px 14px;
    border-radius: 14px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}

.calendar-strip {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 16px;
}

.day-chip {
    border: 1px solid transparent;
    background: white;
    border-radius: 12px;
    padding: 12px 6px;
    text-align: center;
    color: #475569;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.day-chip.today {
    border-color: rgba(79, 70, 229, 0.25);
    background: #eef2ff;
}

.day-chip.active {
    background: #4f46e5;
    color: white;
    border-color: transparent;
}

.day-name {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
}

.day-number {
    font-size: 16px;
    font-weight: 700;
}

.day-reminders {
    background: white;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    margin-top: 12px;
}

.day-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.summary-label {
    margin: 0;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 12px;
}

.summary-date {
    margin: 4px 0 0;
    font-size: 20px;
    color: #111827;
}

.tag {
    background: #ecfeff;
    color: #0ea5e9;
    padding: 6px 10px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 12px;
}

.day-empty {
    color: #9ca3af;
    text-align: center;
    padding: 20px 8px;
    margin: 0;
}

.reminder-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reminder-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px;
    background: #f9fafb;
}

.reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    gap: 12px;
}

.reminder-name {
    margin: 0;
    font-size: 15px;
    color: #111827;
}

.reminder-frequency {
    background: #eef2ff;
    color: #4338ca;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 12px;
    white-space: nowrap;
}

.reminder-meta {
    margin: 4px 0 8px;
    color: #6b7280;
    font-size: 13px;
}

.reminder-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.slot-chip {
    border: 1px solid #e5e7eb;
    background: white;
    color: #1f2937;
    padding: 6px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.slot-chip.checked {
    border-color: #22c55e;
    background: #ecfdf3;
    color: #15803d;
}

.slot-status {
    font-size: 14px;
}

@media (max-width: 900px) {
    .page-header {
        grid-template-columns: 1fr;
        text-align: left;
    }

    .header-text {
        text-align: left;
    }

    .header-actions {
        justify-content: flex-start;
    }
}
</style>
