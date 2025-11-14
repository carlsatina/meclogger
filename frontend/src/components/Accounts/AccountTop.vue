<template>
<nav class="navbar sticky-top navbar-expand-lg" style="background-color: lightslategray;">
    <div class="container-fluid" v-if="isPlatformMobile">
        <div class="d-flex flex-row justify-content-start align-items-center mt-5">
            <img src="@/assets/female-avatar.png" width="60" style="border-radius: 50%;">
            <div class="d-flex flex-column justify-content-start align-items-start ms-3 text-light">
                <div v-if="!store.state.isUserLoggedIn">
                    <span class="fw-bold" >Guest</span><br>
                    <span style="font-size: 14px;">Welcome to Quickworks</span>
                </div>
                <div v-else>
                    <span class="fw-bold">rc</span>
                </div>
            </div>
        </div>
        <div class="app-version text-light me-3" style="font-size: 12px;">version 0.0.3</div>
    </div>

    <!-- Platform is web here -->
    <div class="container-fluid" v-else>
        <div class="d-flex flex-row justify-content-start align-items-center mt-5">
            <img src="@/assets/female-avatar.png" width="60" style="border-radius: 50%;">
            <div class="d-flex flex-column justify-content-start align-items-start ms-3 text-light">
                <div v-if="!store.state.isUserLoggedIn">
                    <span class="fw-bold" >Guest</span><br>
                    <span style="font-size: 14px;">Welcome to Quickworksssss</span>
                </div>
                <div v-else>
                    <span class="fw-bold">rc</span>
                </div>
            </div>
        </div>
        <div class="app-version text-light me-3" style="font-size: 12px;">version 0.0.3</div>
    </div>
</nav>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import { googleLogout } from 'vue3-google-login'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Device } from '@capacitor/device'

export default {
    name: "AccountTop",
    setup () {
        const router = useRouter()
        const route = useRoute()
        const userToken = localStorage.getItem('token')

        if (userToken) {
            store.methods.loginUser(userToken)
            getProfile(userToken)
            .then((data) => {
                if (data.error.value === null) {
                    store.methods.setUserAdmin(data.response.value.userInfo.is_admin)
                }
            })
        }
        provide('store', store)
        const logout = async () => {
            store.methods.logoutUser()
            FB.logout(function(reponse) {
                console.log("FB Logout")
            })
            googleLogout()
            const device = await Device.getInfo()
            if (device.platform === 'android') {
                GoogleAuth.signOut()
            }
            router.push('/')
        }

        const isPlatformMobile = async () => {
            const device = await Device.getInfo()
            if (device.platform === 'android' || device.platform === 'ios') {
                return true;
            }
            return false;
        }
        return {
            route,
            router,
            store,
            logout,
            isPlatformMobile
        }
    }
}

</script>

<style scoped>
.signout:hover {
    background-color: #c8dbbe;
    border-radius: 5px;
}

.signout {
    color: white;
    font-weight: bold;
}
.app-version {
    position: absolute;
    top: 0;
    right:0;
}
</style>