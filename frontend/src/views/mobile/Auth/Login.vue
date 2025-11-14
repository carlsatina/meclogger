<template>
<div class="container">
    <div class="row">
        <div class="col-md-3"></div>
        <div class="col-md-6  d-flex flex-row justify-content-between align-items-center">
            <div class="d-flex flex-row justify-content-start align-items-center mt-2">
                <mdicon name="chevron-left" @click="router.push('/account')" size="30"/>
                <span class="ms-3">Sign in</span>
            </div>
        </div>
        <div class="col-md-3"></div>
    </div>
    <hr>
    <div class="row mt-5">
        <div class="col-md-3"></div>
        <div class="col-md-6 text-center">
            <h4>Log In to your account Mobile </h4>
        </div>
        <div class="col-md-3"></div>
    </div>
    <div class="row mt-4">
        <div class="col-md-3"></div>
        <div class="col-md-6">
            <button type="button" class="btn btn-primary w-100 fb" @click="handleFbLogin"><mdicon class="me-2" name="facebook" />Login w/ Facebook</button>
            <button type="button" class="btn btn-danger w-100 google mt-2" @click="handleGoogleLogin"><mdicon class="me-2" name="google-plus"/> Login with Google+</button>
        </div>
        <div class="col-md-3"></div>
    </div>
    <div class="row mt-4">
        <div class="col-md-3"></div>
        <div class="col-md-6 text-center">
            --- OR ---
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
import fbLogin from '@/composables/auth/fbLogin'
import googleLogin from '@/composables/auth/googleLogin'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import { googleOneTap, decodeCredential } from 'vue3-google-login'
import Loading from '@/components/Loading.vue'
import { Device } from '@capacitor/device'
import { GoogleAuth, User } from '@codetrix-studio/capacitor-google-auth';

export default {
    name: "LoginMobile",
    components: {
        Loading,
    },
    setup() {
        const router = useRouter()
        const email = ref('')
        const password = ref('')
        const hasError = ref(false)
        const errorMsg = ref('')
        const fbAccesstoken = ref('')
        const loadingModal = ref(false)

        onMounted(async() => {
            // Initialize Android GoogleAuth.
            GoogleAuth.initialize({
                clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
                grantOfflineAccess: true,
                scopes: ['profile', 'email'],
            });
        })

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
                    getProfile(response.value.token)
                    .then((data) => {
                        if (data.error.value === null) {
                            store.methods.setUserAdmin(data.response.value.userInfo.is_admin)
                        }
                    })
                    router.push('/')
                }

            }
        }

        const handleGoogleLogin = async () => {
            const gData = await GoogleAuth.signIn()
            if (gData.id) {
                // There is a console log error for the web which we may need to check in the future.
                // for some reason, response.name is blank for android.
                const name = `${gData.givenName} ${gData.familyName}`
                loadingModal.value = true
                const { response, error } = await googleLogin(gData.email, gData.id, name)
                if (error.value === null) {
                    store.methods.loginUser(response.value.token)
                    const data = await getProfile(response.value.token)
                    if (data.error.value === null) {
                        store.methods.setUserAdmin(data.response.value.userInfo.is_admin)
                    }
                    loadingModal.value = false
                    router.push('/')
                }
            } else {
                console.log("GoogleAuth signIn error..")
            }

        }
        const handleFbLogin = async() => {
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    fbAccesstoken.value = response.authResponse.accessToken
                }
            })


            FB.login(function(loginResponse) {
                if (loginResponse.authResponse) {
                    fbAccesstoken.value = loginResponse.authResponse.accessToken
                    if (loginResponse.status === 'connected') {
                        FB.api('/me', function(meResponse) {
                            loadingModal.value = true
                            fbLogin(meResponse.id, meResponse.name)
                            .then((data) => {
                                loadingModal.value = false
                                if (data.error.value === null) {
                                    store.methods.loginUser(data.response.value.token)
                                    getProfile(data.response.value.token)
                                    .then((data) => {
                                        if (data.error.value === null) {
                                            store.methods.setUserAdmin(data.response.value.userInfo.is_admin)
                                        }
                                    })
                                    router.push('/')
                                } else {
                                    alert("Facebook Login error!")
                                }
                            })
                        })
                    }
                } else {
                    console.log("User cancelled login")
                }
            })

        }

        return {
            router,
            email,
            password,
            handleLogin,
            hasError,
            errorMsg,
            handleFbLogin,
            handleGoogleLogin,
            loadingModal
        }
    }
}
</script>

<style scoped>
.text-label {
    font-size: 14px;
}

.fb {
    background-color: #3b5998;
    color: white;
}

.google {
    background-color: #dd4b39;
    border-color: #dd4b39;
    color: white;
}

.login {
    background-color: #738678;
}
</style>