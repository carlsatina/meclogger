<template>
    <CarMaintenanceReportWeb v-if="!platformIsMobile"/>
    <CarMaintenanceReportMobile v-else/>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import CarMaintenanceReportWeb from '@/views/web/CarMaintenance/Report.vue'
import CarMaintenanceReportMobile from '@/views/mobile/CarMaintenance/Report.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "CarMaintenanceReport",
    components: {
        CarMaintenanceReportWeb,
        CarMaintenanceReportMobile
    },
    setup() {
        const router = useRouter()
        provide('store', store)
        const platformIsMobile = ref(false)

        isPlatformMobile().then((data) => {
            platformIsMobile.value = data
        })

        const token = localStorage.getItem('token')
        if (!token) {
            router.replace('/login')
        } else {
            store.methods.loginUser(token)
        }

        return {
            router,
            platformIsMobile
        }
    }
}
</script>

<style scoped>
</style>
