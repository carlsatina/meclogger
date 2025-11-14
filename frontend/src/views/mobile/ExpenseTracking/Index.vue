<template>
<div class="expense-tracking-container">
    <div class="header">
        <div class="d-flex align-items-center mb-3">
            <mdicon name="chevron-left" size="28" @click="router.push('/')" style="cursor: pointer;"/>
            <h3 class="ms-3 mb-0">Expense Tracking</h3>
        </div>
    </div>

    <div class="content">
        <p class="text-center text-muted mt-5">Expense Tracking feature coming soon...</p>
        <p class="text-center">Monitor spending, manage budgets, and track financial goals.</p>
    </div>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: "ExpenseTrackingMobile",
    setup() {
        const router = useRouter()

        return {
            router
        }
    }
}
</script>

<style scoped>
.expense-tracking-container {
    padding: 15px;
    min-height: 80vh;
}

.header h3 {
    color: #2c3e50;
    font-weight: 600;
    font-size: 20px;
}

.content {
    margin-top: 30px;
}
</style>
