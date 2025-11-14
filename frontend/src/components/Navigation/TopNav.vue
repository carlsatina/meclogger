<template>
<nav class="navbar sticky-top navbar-expand-lg" style="background-color: white;">
        <div class="container-fluid">
            <!-- <router-link to="/" class="navbar-brand" href="#">
                 <span>Medical Records : {{ full_name }}</span>
            </router-link>

            <div v-if="!store.state.isUserLoggedIn">
                <button type="button" class="btn btn-outline fw-bold text-light" @click="router.push('/login')" v-if="route.path != '/login'">Login</button>
            </div>

            <div>
                <mdicon name="logout"  size="30"/>
            </div> -->
        </div>
    </nav>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import { googleLogout } from 'vue3-google-login'

export default {
    name: "TopNav",
    setup () {
        const router = useRouter()
        const route = useRoute()
        const userToken = localStorage.getItem('token')
        const full_name = ref()

        if (userToken) {
            store.methods.loginUser(userToken)
            getProfile(userToken)
            .then((data) => {
                if (data.error.value === null) {
                    store.methods.setUserAdmin(data.response.value.userInfo.is_admin)
                    full_name.value = data.response.value.userInfo.full_name
                }
            })
        }
        provide('store', store)
        const logout = () => {
            store.methods.logoutUser()
            FB.logout(function(reponse) {
                console.log("FB Logout")
            })
            googleLogout()
            router.push('/login')
        }
        return {
            route,
            router,
            store,
            logout,
            full_name
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
</style>