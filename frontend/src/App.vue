<template>
    <TopNav/>
    <router-view/>
    <!-- <BottomNav v-if="!route.path.includes('serviceDetails') && route.path != '/search'" /> -->
</template>


<script>
import { ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import BottomNav from '@/components/Navigation/BottomNav.vue'
import TopNav from '@/components/Navigation/TopNav.vue'

export default {
    name: "App",
    components: {
        BottomNav,
        TopNav
    },
    setup () {
        const route = useRoute()
        const router = useRouter()
        provide('store', store)


        document.querySelector('body').style.height = '60%'
        return {
            store,
            route,
            router
        }
    }
}
</script>

<style>
@font-face {
    /* font-family: "Montserrat";
    src: local("Montserrat"),
        url(@/assets/fonts/Montserrat/Montserrat-VariableFont_wght.ttf) format("truetype"); */
}
/* html, body {
    font-family: "Montserrat", "Poppins";
} */
#app {
    /* font-family: Montserrat, Avenir, Helvetica, Arial, sans-serif; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 88vh;
    overflow: scroll;
}


</style>
