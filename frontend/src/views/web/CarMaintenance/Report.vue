<template>
<div class="car-maintenance-report-web">
    <div class="header">
        <div class="d-flex align-items-center mb-3">
            <mdicon name="chevron-left" size="28" @click="router.push('/car-maintenance')" style="cursor: pointer;"/>
            <h3 class="ms-3 mb-0">Report</h3>
        </div>
    </div>

    <div class="content">
        <p class="text-center text-muted mt-5">Report (web) coming soon.</p>
    </div>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: 'CarMaintenanceReportWeb',
    setup() {
        const router = useRouter()
        return { router }
    }
}
</script>

<style scoped>
.car-maintenance-report-web {
    padding: 24px;
}
</style>
