<template>
<div class="add-record-container medical-shell">
    <div class="medical-orb orb-1"></div>
    <div class="medical-orb orb-2"></div>
    <div class="add-record-wrapper glass-card">
        <!-- Header -->
        <div class="header">
            <button class="close-btn" @click="goBack">
                <mdicon name="close" :size="24"/>
            </button>
            <h2 class="page-title">{{ headerTitle }}</h2>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="form-layout">
                <!-- Attachments -->
                <section class="card-section attachments-card">
                    <div class="section-header">
                        <div>
                            <p class="section-label">Attachments</p>
                            <h3 class="section-title">Upload supporting files</h3>
                        </div>
                        <span class="section-hint">PNG, JPG, PDF up to 10MB</span>
                    </div>
                    <div class="image-upload-section">
                        <div class="image-preview" v-if="uploadedImage">
                            <img :src="uploadedImage" alt="Uploaded record" />
                            <button 
                                type="button" 
                                class="remove-image-btn" 
                                @click="clearUpload"
                            >
                                <mdicon name="close" :size="18"/>
                            </button>
                        </div>
                        <div class="add-image-card" @click="triggerFileUpload">
                            <mdicon name="cloud-upload" :size="56" class="plus-icon"/>
                            <p>Upload file</p>
                            <span>Drag & drop or browse</span>
                            <input 
                                type="file" 
                                ref="fileInput" 
                                @change="handleFileUpload" 
                                accept="image/*,application/pdf"
                                style="display: none"
                            />
                        </div>
                    </div>
                </section>

                <!-- Details -->
                <section class="card-section details-card">
                    <div class="section-header">
                        <div>
                            <p class="section-label">Record details</p>
                            <h3 class="section-title">Describe this medical record</h3>
                        </div>
                        <span class="section-hint">All fields are editable later</span>
                    </div>

                    <div class="form-grid two-column">
                        <div class="form-group">
                            <label class="form-label">Record for</label>
                            <div class="select-wrapper">
                                <select 
                                    v-model="recordFor" 
                                    class="form-select"
                                    :disabled="profilesLoading || !profiles.length"
                                >
                                    <option value="" disabled>Select family member</option>
                                    <option 
                                        v-for="profile in profiles" 
                                        :key="profile.id" 
                                        :value="profile.id"
                                    >
                                        {{ profile.name }}
                                    </option>
                                </select>
                                <mdicon name="chevron-down" :size="20" class="select-icon"/>
                            </div>
                            <p v-if="profilesLoading" class="input-hint">Loading profiles...</p>
                            <p v-else-if="!profiles.length" class="input-hint error">
                                Create a profile to start adding records.
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">File name</label>
                            <input 
                                type="text" 
                                v-model="fileName" 
                                placeholder="MRI results - June" 
                                class="form-input"
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Record created on</label>
                            <div class="date-input-wrapper">
                                <input 
                                    type="date" 
                                    v-model="recordDate" 
                                    class="form-input date-input"
                                />
                                <mdicon name="calendar" :size="20" class="date-icon"/>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Provider / Facility</label>
                            <input 
                                type="text" 
                                v-model="providerName" 
                                placeholder="e.g., St. Luke's Medical Center"
                                class="form-input"
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Type of record</label>
                        <div class="record-types">
                            <div 
                                class="record-type-card"
                                v-for="option in recordTypeOptions"
                                :key="option.id"
                                :class="{ active: recordType === option.id }"
                                @click="recordType = option.id"
                            >
                                <mdicon :name="option.icon" :size="34"/>
                                <span>{{ option.label }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tags</label>
                        <div class="tag-editor">
                            <span 
                                v-for="(tag, index) in tags" 
                                :key="`${tag}-${index}`" 
                                class="tag-pill"
                            >
                                {{ tag }}
                                <button type="button" @click="removeTag(index)">
                                    <mdicon name="close" :size="14"/>
                                </button>
                            </span>
                            <input 
                                type="text"
                                v-model="tagInput"
                                class="tag-input"
                                placeholder="Add tag and press Enter"
                                @keyup.enter.prevent="addTagFromInput"
                                @blur="addTagFromInput"
                            />
                        </div>
                        <p class="input-hint">Use tags like “Follow-up”, “Diagnostic”, “Dental”.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea 
                            v-model="notes"
                            rows="4"
                            class="form-input textarea"
                            placeholder="Add additional instructions, doctor’s notes, or follow-up reminders."
                        ></textarea>
                    </div>
                </section>
            </div>

            <!-- Save Button -->
            <div class="actions-bar">
                <p v-if="formError" class="form-error">{{ formError }}</p>
                <button class="save-btn" @click="saveRecord" :disabled="saving || !profiles.length">
                    {{ saving ? 'Saving...' : (isEditing ? 'Update record' : 'Save record') }}
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProfiles } from '@/composables/profiles'
import { useMedicalRecords } from '@/composables/medicalRecords'

const today = () => new Date().toISOString().split('T')[0]

export default {
    name: 'AddRecordWeb',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const fileInput = ref(null)
        const uploadedImage = ref('')
        const uploadedFile = ref(null)
        const recordFor = ref(localStorage.getItem('selectedProfileId') || '')
        const fileName = ref('')
        const recordDate = ref(today())
        const providerName = ref('')
        const recordType = ref('LAB_RESULT')
        const tags = ref([])
        const tagInput = ref('')
        const notes = ref('')
        const profiles = ref([])
        const profilesLoading = ref(false)
        const saving = ref(false)
        const formError = ref('')
        const { fetchProfiles } = useProfiles()
        const { createRecord, fetchRecordById, updateRecord } = useMedicalRecords()
        const recordTypeOptions = [
            { id: 'LAB_RESULT', label: 'Lab Report', icon: 'file-document' },
            { id: 'PRESCRIPTION', label: 'Prescription', icon: 'file-document-edit' },
            { id: 'INVOICE', label: 'Invoice', icon: 'receipt' },
            { id: 'OTHER', label: 'Other', icon: 'file-question' }
        ]
        const recordId = computed(() => typeof route.query.recordId === 'string' ? route.query.recordId : null)
        const isEditing = computed(() => Boolean(recordId.value))
        const headerTitle = computed(() => (isEditing.value ? 'Edit Record' : 'Add Record'))

        const goBack = () => {
            router.back()
        }

        const triggerFileUpload = () => {
            fileInput.value?.click()
        }

        const handleFileUpload = (event) => {
            const [file] = event.target.files || []
            if (!file) return
            uploadedFile.value = file
            const reader = new FileReader()
            reader.onload = (e) => {
                uploadedImage.value = typeof e.target?.result === 'string' ? e.target.result : ''
            }
            reader.readAsDataURL(file)
            event.target.value = ''
        }

        const clearUpload = () => {
            uploadedImage.value = ''
            uploadedFile.value = null
            if (fileInput.value) {
                fileInput.value.value = ''
            }
        }

        const addTagFromInput = () => {
            const value = tagInput.value.trim()
            if (value && !tags.value.includes(value)) {
                tags.value.push(value)
            }
            tagInput.value = ''
        }

        const removeTag = (index) => {
            tags.value.splice(index, 1)
        }

        const resetForm = () => {
            recordFor.value = localStorage.getItem('selectedProfileId') || ''
            fileName.value = ''
            recordDate.value = today()
            providerName.value = ''
            recordType.value = 'LAB_RESULT'
            tags.value = []
            tagInput.value = ''
            notes.value = ''
            uploadedImage.value = ''
            uploadedFile.value = null
        }

        const loadProfiles = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                profiles.value = []
                recordFor.value = ''
                return
            }
            profilesLoading.value = true
            const { response, error } = await fetchProfiles(token)
            if (error.value === null && response.value?.profiles) {
                profiles.value = response.value.profiles.map(profile => ({
                    id: profile.id,
                    name: profile.displayName || 'Profile'
                }))
                const savedId = localStorage.getItem('selectedProfileId')
                if (savedId && profiles.value.some(profile => profile.id === savedId)) {
                    recordFor.value = savedId
                } else if (!recordFor.value && profiles.value.length) {
                    recordFor.value = profiles.value[0].id
                }
            } else if (error.value) {
                formError.value = 'Unable to load profiles. Please try again.'
            }
            profilesLoading.value = false
        }

        const loadRecordDetails = async () => {
            if (!recordId.value) {
                resetForm()
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            try {
                const data = await fetchRecordById(token, recordId.value)
                recordFor.value = data.profileId
                fileName.value = data.title || ''
                recordDate.value = data.recordDate ? new Date(data.recordDate).toISOString().split('T')[0] : today()
                providerName.value = data.providerName || ''
                recordType.value = data.recordType || 'LAB_RESULT'
                notes.value = data.notes || ''
                tags.value = Array.isArray(data.tags) ? data.tags : []
                uploadedImage.value = ''
                uploadedFile.value = null
            } catch (err) {
                formError.value = err.message || 'Unable to load record details.'
            }
        }

        const saveRecord = async () => {
            formError.value = ''
            if (!recordFor.value) {
                formError.value = 'Please select a profile for this record.'
                return
            }
            if (!fileName.value.trim()) {
                formError.value = 'Please enter a file name.'
                return
            }
            if (!recordDate.value) {
                formError.value = 'Please select the record date.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const formData = new FormData()
            formData.append('profileId', recordFor.value)
            formData.append('title', fileName.value.trim())
            formData.append('recordType', recordType.value)
            formData.append('recordDate', recordDate.value)
            if (uploadedFile.value) {
                formData.append('files', uploadedFile.value)
            }
            if (providerName.value.trim()) {
                formData.append('providerName', providerName.value.trim())
            }
            if (notes.value.trim()) {
                formData.append('notes', notes.value.trim())
            }
            formData.append('tags', JSON.stringify(tags.value))

            try {
                saving.value = true
                if (isEditing.value && recordId.value) {
                    await updateRecord(token, recordId.value, formData)
                } else {
                    await createRecord(token, formData)
                }
                router.replace({ path: '/medical-records', query: { tab: 'records' } })
            } catch (err) {
                formError.value = err.message || 'Unable to save record. Please try again.'
            } finally {
                saving.value = false
            }
        }

        onMounted(() => {
            loadProfiles().then(() => {
                if (recordId.value) {
                    loadRecordDetails()
                }
            })
        })

        watch(
            () => recordId.value,
            (val) => {
                if (val) {
                    loadRecordDetails()
                } else {
                    resetForm()
                }
            }
        )

        return {
            fileInput,
            uploadedImage,
            recordFor,
            fileName,
            recordDate,
            providerName,
            recordType,
            tags,
            tagInput,
            notes,
            profiles,
            profilesLoading,
            saving,
            formError,
            isEditing,
            headerTitle,
            recordTypeOptions,
            goBack,
            triggerFileUpload,
            handleFileUpload,
            clearUpload,
            addTagFromInput,
            removeTag,
            saveRecord
        }
    }
}
</script>
