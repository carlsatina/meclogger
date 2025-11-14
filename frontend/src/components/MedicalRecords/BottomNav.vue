<template>
<div class="bottom-nav">
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'home' }"
        @click="$emit('change-tab', 'home')"
    >
        <mdicon name="home" :size="24"/>
        <span class="nav-label">Home</span>
    </div>
    
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'records' }"
        @click="$emit('change-tab', 'records')"
    >
        <mdicon name="file-document-multiple" :size="24"/>
        <span class="nav-label">Records</span>
    </div>
    
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'health' }"
        @click="$emit('change-tab', 'health')"
    >
        <mdicon name="heart-pulse" :size="24"/>
        <span class="nav-label">My Health</span>
    </div>
    
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'profile' }"
        @click="$emit('change-tab', 'profile')"
    >
        <mdicon name="account-circle" :size="24"/>
        <span class="nav-label">Profile</span>
    </div>
</div>
</template>

<script>
export default {
    name: "MedicalRecordsBottomNav",
    props: {
        activeTab: {
            type: String,
            default: 'home'
        }
    },
    emits: ['change-tab']
}
</script>

<style scoped>
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 8px 0 12px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
    z-index: 1000;
    border-top: 1px solid #f0f0f0;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #9ca3af;
    flex: 1;
    max-width: 100px;
}

.nav-item:active {
    transform: scale(0.95);
}

.nav-item.active {
    color: #667eea;
}

.nav-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2px;
}

.nav-item.active .nav-label {
    font-weight: 600;
}

/* Add animation for icon */
.nav-item.active :deep(svg) {
    animation: bounce 0.3s ease;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-4px);
    }
}
</style>
