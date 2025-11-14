<template>
    <div class="card border-0 home-container" @scroll="onScroll">
        <!-- New UI starts here -->
        <div class="card-body home-inner" style="background-color: aliceblue;">

            <div class="row p-1">
                <div class="col-md-2"></div>
                <div class="col-md-8 bg-white border border-radius rounded pt-2 pb-2" @click="router.push('/')">
                    <div class="d-flex persons align-center">
                        <div><img src="@/assets/wallpaper.png" width="60" style="border-radius: 80%;"/></div>
                        <div class="d-flex flex-column w-100">
                            <div>RC Satina</div>
                            <div>Phone no: 12341234</div>
                            <div>email: rc@email.com</div>
                        </div>
                        <div class="align-items-center">
                            <mdicon name="dots-vertical"  size="30"/><br>
                        </div>
                    </div>
                </div>
                <div class="col-md-2"></div>
            </div>

            <div class="row p-1">
                <div class="col-md-2"></div>
                <div class="col-md-8 bg-white border border-radius rounded pt-2 pb-2" @click="router.push('/')">
                    <div class="d-flex persons align-center">
                        <div><img src="@/assets/wallpaper.png" width="60" style="border-radius: 80%;"/></div>
                        <div class="d-flex flex-column w-100">
                            <div>RC Satina</div>
                            <div>Phone no: 12341234</div>
                            <div>email: rc@email.com</div>
                        </div>
                        <div class="align-items-center">
                            <mdicon name="dots-vertical"  size="30"/><br>
                        </div>
                    </div>
                </div>
                <div class="col-md-2"></div>
            </div>

            <div class="position-absolute bottom-0 end-0">
                <mdicon name="plus-circle-outline"  size="50"/><br>
            </div>
        </div>
        <!-- New UI ends here -->

        <!-- Loading Modal -->
        <Loading v-if="loading"/>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import Loading from '@/components/Loading.vue'
import store from '@/store'
import Datepicker from 'vuejs3-datepicker'

export default {
    name: "HomeWeb",
    components: {
        Modal,
        Loading,
        Datepicker
    },
    setup() {
        const services = ref(null)
        const modalActive = ref(false)
        const serviceDetails = ref(null)
        const filteredData = ref({})
        const router = useRouter()
        const viewResults = ref(false)
        const loading = ref(false)

        const toggleModal = () => {
            modalActive.value = !modalActive
            serviceDetails.value = null
        }

        const onScroll = ({target: {scrollTop, clientHeight, scrollHeight}}) => {
            if (scrollTop > 60) {
                store.methods.setSearchIcon(true)
            } else {
                store.methods.setSearchIcon(false)
            }
        }
        return {
            router,
            services,
            toggleModal,
            modalActive,
            serviceDetails,
            filteredData,
            viewResults,
            loading,
            onScroll
        }
    }
}
</script>

<style scoped>
.suggestions {
    padding: 3px;
    border-radius: 5px;
    cursor: pointer;
    transition: .2s all;
}

.suggestions:hover{
    transform: scale(1.2)
}

.service-info {
    font-size: 14px;
}
.contact-info {
    font-size: 14px
}
.service-label {
    font-size: 12px;
}

.service-value {
    font-size: 14px;
}
.addr {
    white-space: nowrap;
    width: calc(100% - 20px);
    overflow: hidden;
    text-overflow: ellipsis;
}.serv {
    white-space: nowrap;
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.persons {
    display: grid;
    grid-template-columns: 100px 1fr 50px;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
}

.service-table:hover {
    background-color: #F1F0E8;
}

.home-container {
    height: 80vh;
    overflow: scroll;
}

.home-inner {
    height: 90vh;
    font-family: Arial, Helvetica, sans-serif;
}

.popular-services-container::-webkit-scrollbar {
    display: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>