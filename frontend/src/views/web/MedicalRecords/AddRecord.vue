<template>
<div class="add-record-container">
    <div class="add-record-wrapper">
        <!-- Header -->
        <div class="header">
            <button class="close-btn" @click="goBack">
                <mdicon name="close" :size="24"/>
            </button>
            <h2 class="page-title">Add Record</h2>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Image Upload Section -->
            <div class="image-upload-section">
                <div class="image-preview" v-if="uploadedImage">
                    <img :src="uploadedImage" alt="Uploaded record" />
                </div>
                <div class="add-image-card" @click="triggerFileUpload">
                    <mdicon name="plus" :size="64" class="plus-icon"/>
                    <p>Add more images</p>
                    <input 
                        type="file" 
                        ref="fileInput" 
                        @change="handleFileUpload" 
                        accept="image/*"
                        style="display: none"
                    />
                </div>
            </div>

            <!-- Form Fields -->
            <div class="form-section">
                <!-- Record For -->
                <div class="form-group">
                    <label class="form-label">Record for</label>
                    <div class="select-wrapper">
                        <select v-model="recordFor" class="form-select">
                            <option value="">Select family member</option>
                            <option value="self">Myself</option>
                            <option value="spouse">Spouse</option>
                            <option value="child1">Child 1</option>
                            <option value="child2">Child 2</option>
                        </select>
                        <mdicon name="chevron-down" :size="20" class="select-icon"/>
                    </div>
                </div>

                <!-- File Name -->
                <div class="form-group">
                    <label class="form-label">File name</label>
                    <input 
                        type="text" 
                        v-model="fileName" 
                        placeholder="Add file name"
                        class="form-input"
                    />
                </div>

                <!-- Record Created On -->
                <div class="form-group">
                    <label class="form-label">Record created on</label>
                    <div class="date-input-wrapper">
                        <input 
                            type="date" 
                            v-model="recordDate" 
                            placeholder="Add record date"
                            class="form-input date-input"
                        />
                        <mdicon name="calendar" :size="20" class="date-icon"/>
                    </div>
                </div>

                <!-- Type of Record -->
                <div class="form-group">
                    <label class="form-label">Type of record</label>
                    <div class="record-types">
                        <div 
                            class="record-type-card"
                            :class="{ active: recordType === 'lab-report' }"
                            @click="recordType = 'lab-report'"
                        >
                            <mdicon name="file-document" :size="40"/>
                            <span>Lab Report</span>
                        </div>
                        <div 
                            class="record-type-card"
                            :class="{ active: recordType === 'prescription' }"
                            @click="recordType = 'prescription'"
                        >
                            <mdicon name="file-document-edit" :size="40"/>
                            <span>Prescription</span>
                        </div>
                        <div 
                            class="record-type-card"
                            :class="{ active: recordType === 'invoice' }"
                            @click="recordType = 'invoice'"
                        >
                            <mdicon name="receipt" :size="40"/>
                            <span>Invoice</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <button class="save-btn" @click="saveRecord">
                Save record
            </button>
        </div>
    </div>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: 'AddRecordWeb',
    setup() {
        const router = useRouter()
        const fileInput = ref(null)
        const uploadedImage = ref(null)
        const recordFor = ref('')
        const fileName = ref('')
        const recordDate = ref('')
        const recordType = ref('')

        const goBack = () => {
            router.back()
        }

        const triggerFileUpload = () => {
            fileInput.value.click()
        }

        const handleFileUpload = (event) => {
            const file = event.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    uploadedImage.value = e.target.result
                }
                reader.readAsDataURL(file)
            }
        }

        const saveRecord = () => {
            // TODO: Implement save logic
            console.log('Saving record:', {
                recordFor: recordFor.value,
                fileName: fileName.value,
                recordDate: recordDate.value,
                recordType: recordType.value,
                image: uploadedImage.value
            })
            router.back()
        }

        return {
            fileInput,
            uploadedImage,
            recordFor,
            fileName,
            recordDate,
            recordType,
            goBack,
            triggerFileUpload,
            handleFileUpload,
            saveRecord
        }
    }
}
</script>

<style scoped>
.add-record-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.add-record-wrapper {
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    max-width: 700px;
    width: 100%;
    overflow: hidden;
}

/* Header */
.header {
    background: white;
    padding: 24px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 1px solid #f3f4f6;
}

.close-btn {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 8px;
}

.close-btn:hover {
    background: #f3f4f6;
}

.close-btn:active {
    transform: scale(0.95);
}

.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

/* Content */
.content {
    padding: 32px;
}

/* Image Upload Section */
.image-upload-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 40px;
}

.image-preview {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 1;
    border: 2px solid #e5e7eb;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.add-image-card {
    background: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 16px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-image-card:hover {
    border-color: #667eea;
    background: #f0f4ff;
}

.add-image-card:active {
    transform: scale(0.98);
}

.plus-icon {
    color: #9ca3af;
}

.add-image-card:hover .plus-icon {
    color: #667eea;
}

.add-image-card p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    font-weight: 500;
}

/* Form Section */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-bottom: 40px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-label {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
}

.form-input {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px 18px;
    font-size: 15px;
    color: #1a1a1a;
    transition: all 0.2s ease;
}

.form-input::placeholder {
    color: #9ca3af;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Select Wrapper */
.select-wrapper {
    position: relative;
}

.form-select {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px 45px 16px 18px;
    font-size: 15px;
    color: #1a1a1a;
    width: 100%;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.form-select option:first-child {
    color: #9ca3af;
}

.form-select:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-icon {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
}

/* Date Input */
.date-input-wrapper {
    position: relative;
}

.date-input {
    padding-right: 45px;
}

.date-icon {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
}

/* Record Types */
.record-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.record-type-card {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #6b7280;
}

.record-type-card:hover {
    border-color: #667eea;
    background: #f0f4ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.record-type-card:active {
    transform: translateY(0);
}

.record-type-card.active {
    border-color: #667eea;
    background: #f0f4ff;
    color: #667eea;
}

.record-type-card span {
    font-size: 14px;
    font-weight: 500;
    text-align: center;
}

/* Save Button */
.save-btn {
    width: 100%;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 18px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.save-btn:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.save-btn:active {
    transform: translateY(0);
}
</style>
