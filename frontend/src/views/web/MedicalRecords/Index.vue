<template>
<div class="medical-records-container">
    <!-- Side Navigation -->
    <SideNav 
        :active-tab="activeTab"
        @change-tab="handleTabChange"
        @go-back="router.push('/')"
    />

    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Top Bar -->
        <TopBar 
            :title="getTabTitle()"
            :show-back="false"
        >
            <template #actions>
                <mdicon 
                    v-if="activeTab === 'records'"
                    name="magnify" 
                    :size="24" 
                    class="action-icon"
                />
                <mdicon 
                    name="bell-outline" 
                    :size="24" 
                    class="action-icon"
                />
                <mdicon 
                    name="cog-outline" 
                    :size="24" 
                    class="action-icon"
                />
            </template>
        </TopBar>

        <!-- Content Wrapper -->
        <div class="content-wrapper">
            <!-- Home Tab -->
            <div v-if="activeTab === 'home'" class="tab-content">
                <div class="welcome-section">
                    <div class="welcome-card">
                        <h2>Welcome to Medical Records</h2>
                        <p>Track health records, medications, and vitals for you and your family.</p>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <div class="action-card" @click="navigateToAddRecord">
                        <mdicon name="plus-circle" :size="40" class="action-icon-primary"/>
                        <h4>Add Record</h4>
                        <p>Create a new medical record</p>
                    </div>
                    <div class="action-card">
                        <mdicon name="pill" :size="40" class="action-icon-primary"/>
                        <h4>Medications</h4>
                        <p>Manage prescriptions</p>
                    </div>
                    <div class="action-card">
                        <mdicon name="chart-line" :size="40" class="action-icon-primary"/>
                        <h4>Vitals</h4>
                        <p>Track health metrics</p>
                    </div>
                    <div class="action-card">
                        <mdicon name="calendar-clock" :size="40" class="action-icon-primary"/>
                        <h4>Appointments</h4>
                        <p>Schedule visits</p>
                    </div>
                </div>
            </div>

            <!-- Records Tab -->
            <div v-if="activeTab === 'records'" class="tab-content">
                <div class="records-header">
                    <h3 class="records-title">All Medical Records</h3>
                    <button class="add-record-btn" @click="navigateToAddRecord">
                        <mdicon name="plus" :size="20"/>
                        Add Record
                    </button>
                </div>

                <div class="records-grid" v-if="medicalRecords.length > 0">
                    <div class="record-card-web" v-for="record in medicalRecords" :key="record.id">
                        <div class="record-card-content">
                            <div class="record-icon-web">
                                <mdicon :name="record.icon" :size="32"/>
                            </div>
                            <div class="record-details-web">
                                <h4 class="record-title-web">{{ record.title }}</h4>
                                <p class="record-meta-web">{{ record.type }} | {{ record.date }}</p>
                                <p class="record-description-web">{{ record.description }}</p>
                                <div class="record-tags-web">
                                    <span class="record-tag-web" v-for="tag in record.tags" :key="tag">{{ tag }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    <mdicon name="file-document-multiple" :size="80" class="empty-icon"/>
                    <p class="empty-title">No Records Yet</p>
                    <p class="empty-text">Start adding medical records to track your health history</p>
                    <button class="primary-button" @click="navigateToAddRecord">
                        <mdicon name="plus" :size="20"/>
                        Add First Record
                    </button>
                </div>
            </div>

            <!-- My Health Tab -->
            <div v-if="activeTab === 'health'" class="tab-content">
                <div class="empty-state">
                    <mdicon name="heart-pulse" :size="80" class="empty-icon"/>
                    <p class="empty-title">Health Dashboard</p>
                    <p class="empty-text">Track your vitals and health metrics here</p>
                    <button class="primary-button">
                        <mdicon name="plus" :size="20"/>
                        Add Vital Signs
                    </button>
                </div>
            </div>

            <!-- Profile Tab -->
            <div v-if="activeTab === 'profile'" class="tab-content">
                <div class="empty-state">
                    <mdicon name="account-circle" :size="80" class="empty-icon"/>
                    <p class="empty-title">Profile Settings</p>
                    <p class="empty-text">Manage your profile and family members</p>
                    <button class="primary-button">
                        <mdicon name="account-plus" :size="20"/>
                        Add Family Member
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import SideNav from '@/components/MedicalRecords/SideNav.vue'

export default {
    name: "MedicalRecordsWeb",
    components: {
        TopBar,
        SideNav
    },
    setup() {
        const router = useRouter()
        const activeTab = ref('home')

        const handleTabChange = (tab) => {
            activeTab.value = tab
        }

        const getTabTitle = () => {
            const titles = {
                home: 'Medical Records Dashboard',
                records: 'Medical Records',
                health: 'My Health',
                profile: 'Profile Settings'
            }
            return titles[activeTab.value] || 'Medical Records'
        }

        const navigateToAddRecord = () => {
            router.push('/medical-records/add-record')
        }

        // Sample medical records data
        const medicalRecords = ref([
            {
                id: 1,
                title: 'Eye check-up',
                type: 'Prescription',
                date: 'Nov 10, 2025',
                description: 'Regular eye examination with vision test',
                tags: ['Vision', 'Routine'],
                icon: 'file-document'
            },
            {
                id: 2,
                title: 'Blood Test Results',
                type: 'Lab Report',
                date: 'Nov 8, 2025',
                description: 'Complete blood count and lipid profile',
                tags: ['Lab', 'Blood Work'],
                icon: 'file-document'
            },
            {
                id: 3,
                title: 'Annual Physical',
                type: 'Prescription',
                date: 'Nov 5, 2025',
                description: 'Yearly health checkup and consultation',
                tags: ['Checkup', 'General'],
                icon: 'file-document'
            },
            {
                id: 4,
                title: 'Dental Cleaning',
                type: 'Invoice',
                date: 'Nov 1, 2025',
                description: 'Professional teeth cleaning and examination',
                tags: ['Dental', 'Routine'],
                icon: 'receipt'
            },
            {
                id: 5,
                title: 'X-Ray Report',
                type: 'Lab Report',
                date: 'Oct 28, 2025',
                description: 'Chest X-ray for routine checkup',
                tags: ['Radiology', 'Routine'],
                icon: 'file-document'
            },
            {
                id: 6,
                title: 'Vaccination Record',
                type: 'Prescription',
                date: 'Oct 25, 2025',
                description: 'Annual flu vaccination',
                tags: ['Vaccine', 'Prevention'],
                icon: 'file-document'
            }
        ])

        return {
            router,
            activeTab,
            handleTabChange,
            getTabTitle,
            navigateToAddRecord,
            medicalRecords
        }
    }
}
</script>

<style scoped>
.medical-records-container {
    display: flex;
    min-height: 100vh;
    background: #f8f9fa;
}

.main-content {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
}

.action-icon {
    cursor: pointer;
    color: #374151;
    transition: all 0.2s ease;
    padding: 8px;
    border-radius: 8px;
}

.action-icon:hover {
    background: #f3f4f6;
}

.action-icon:active {
    transform: scale(0.95);
}

.content-wrapper {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.tab-content {
    animation: fadeIn 0.3s ease;
    max-width: 1400px;
    margin: 0 auto;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Welcome Section */
.welcome-section {
    margin-bottom: 32px;
}

.welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 40px;
    color: white;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.welcome-card h2 {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
}

.welcome-card p {
    font-size: 16px;
    margin: 0;
    opacity: 0.95;
    line-height: 1.6;
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
}

.action-card {
    background: white;
    border-radius: 16px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
}

.action-card:active {
    transform: translateY(-2px);
}

.action-icon-primary {
    color: #667eea;
}

.action-card h4 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.action-card p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
}

/* Records Header */
.records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.records-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.add-record-btn {
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.add-record-btn:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-record-btn:active {
    transform: translateY(0);
}

/* Records Grid */
.records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
}

.record-card-web {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.record-card-web:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
}

.record-card-web:active {
    transform: translateY(-2px);
}

.record-card-content {
    display: flex;
    gap: 16px;
}

.record-icon-web {
    width: 64px;
    height: 64px;
    background: #f0f4ff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    flex-shrink: 0;
}

.record-details-web {
    flex: 1;
    min-width: 0;
}

.record-title-web {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
}

.record-meta-web {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
}

.record-description-web {
    font-size: 14px;
    color: #374151;
    margin: 0 0 12px 0;
    line-height: 1.6;
}

.record-tags-web {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.record-tag-web {
    background: #f0f4ff;
    color: #667eea;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    text-align: center;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-icon {
    color: #d1d5db;
    margin-bottom: 24px;
}

.empty-title {
    font-size: 24px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px 0;
}

.empty-text {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 24px 0;
    line-height: 1.6;
    max-width: 400px;
}

.primary-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.primary-button:active {
    transform: translateY(0);
}
</style>
