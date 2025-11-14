<template>
<div class="car-maintenance-container">
    <div class="header">
        <div class="d-flex align-items-center mb-4">
            <mdicon name="chevron-left" size="30" @click="router.push('/')" style="cursor: pointer;"/>
            <h2 class="ms-3 mb-0">Car Maintenance</h2>
        </div>
    </div>

    <div class="content">
        <p class="text-center text-muted">Car Maintenance feature coming soon...</p>
        <p class="text-center">Manage vehicle service history, reminders, and maintenance logs.</p>
    </div>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: "CarMaintenanceWeb",
    setup() {
        const router = useRouter()

        return {
            router
        }
    }
}
</script>

<style scoped>
.car-maintenance-container {
    padding: 30px;
    min-height: 80vh;
}

.header h2 {
    color: #2c3e50;
    font-weight: 600;
}

.content {
    margin-top: 50px;
}
</style>
