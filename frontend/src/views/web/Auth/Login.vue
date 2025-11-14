<template>
<div class="container">
    <!-- <div class="row">
        <div class="col-md-3"></div>
        <div class="col-md-6  d-flex flex-row justify-content-between align-items-center">
            <div class="d-flex flex-row justify-content-start align-items-center mt-2">
                <mdicon name="chevron-left" @click="router.push('/account')" size="30"/>
                <span class="ms-3">Sign in</span>
            </div>
        </div>
        <div class="col-md-3"></div>
    </div>
    <hr> -->
    <div class="row mt-5">
        <div class="col-md-3"></div>
        <div class="col-md-6 text-center">
            <h4>Log In to your account Web </h4>
        </div>
        <div class="col-md-3"></div>
    </div>
    <div class="row mt-3">
        <div class="col-md-3"></div>
        <div class="col-md-6 d-flex flex-column align-items-start">
            <input type="email" class="form-control shadow-sm" placeholder="Email address" v-model="email"/>
        </div>
        <div class="col-md-3"></div>
    </div>
    <div class="row mt-2">
        <div class="col-md-3"></div>
        <div class="col-md-6  d-flex flex-column align-items-start">
            <input type="password" class="form-control shadow-sm" placeholder="Password" v-model="password" @keypress.enter="handleLogin"/>
            <div v-if="hasError" class="error-message small text-danger"><strong>{{errorMsg}}</strong></div>
        </div>
        <div class="col-md-3"></div>
    </div>
    <div class="row mt-4">
        <div class="col-md-3"></div>
        <div class="col-md-6  d-flex flex-column align-items-start">
            <button type="button" class="btn btn-success w-100 login fw-bold" @click="handleLogin">Log In</button>
        </div>
        <div class="col-md-3"></div>
    </div>
    <div class="row mt-2">
        <div class="col-md-3"></div>
        <div class="col-md-6  d-flex flex-row justify-content-between">
            <span style="cursor: pointer;">Forgot Password?</span>
            <span style="cursor: pointer; font-weight: 700; color: #c8ae7d" @click="router.push('/register')">Sign up</span>
        </div>
        <div class="col-md-3"></div>
    </div>

    <Loading v-if="loadingModal"/>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import login from '@/composables/auth/login'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import Loading from '@/components/Loading.vue'
import { Role } from '@/constants/enums'

export default {
    name: "LoginWeb",
    components: {
        Loading,
    },
    setup() {
        const router = useRouter()
        const email = ref('')
        const password = ref('')
        const hasError = ref(false)
        const errorMsg = ref('')
        const loadingModal = ref(false)

        console.log("Login from web")

        const handleLogin = async() => {
            hasError.value = false
            if (email.value === '' && password.value === '') {
                return
            }
            loadingModal.value = true
            const { response, error } = await login(email.value, password.value)
            loadingModal.value = false

            if (error.value === null) {
                if (response.value.status > 201) {
                    hasError.value = true
                    errorMsg.value = response.value.message
                } else {
                    store.methods.loginUser(response.value.token)
                    const profileData = await getProfile(response.value.token)
                    if (profileData.error.value === null) {
                        store.methods.setUserAdmin(profileData.response.value.userInfo.role === Role.ADMIN)
                    }
                    router.push('/')
                }

            }
        }


        return {
            router,
            email,
            password,
            handleLogin,
            hasError,
            errorMsg,
            loadingModal
        }
    }
}
</script>

<style scoped>
.text-label {
    font-size: 14px;
}

.login {
    background-color: #738678;
}
</style>