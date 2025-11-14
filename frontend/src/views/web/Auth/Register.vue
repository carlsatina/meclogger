<template>
    <div class="container">
        <div class="row mt-5">
            <div class="col-md-3"></div>
            <div class="col-md-6 text-center">
                <h4>Register an account </h4>
            </div>
            <div class="col-md-3"></div>
        </div>
        <form @submit.prevent="handleRegister">
            <div class="row mt-4">
                <div class="col-md-3"></div>
                <div class="col-md-6 d-flex flex-column align-items-start">
                    <span class="text-label">Fullname</span>
                    <input type="text" class="form-control shadow-sm" placeholder="Enter Full Name" v-model="userInfo.full_name" required/>
                </div>
                <div class="col-md-3"></div>
            </div>
            <!-- <div class="row mt-4">
                <div class="col-md-3"></div>
                <div class="col-md-6 d-flex flex-column align-items-start">
                    <span class="text-label">Contact Number</span>
                    <input type="text" class="form-control shadow-sm" placeholder="Enter Contact Number" v-model="userInfo.contact_number" required/>
                </div>
                <div class="col-md-3"></div>
            </div> -->
            <div class="row mt-4">
                <div class="col-md-3"></div>
                <div class="col-md-6 d-flex flex-column align-items-start">
                    <span class="text-label">Email</span>
                    <input type="text" class="form-control shadow-sm" :class="isValidEmailFormat ? 'is-valid' : 'is-invalid'" placeholder="Enter email address" v-model="userInfo.email" required/>
                    <div v-if="hasError" class="error-message small text-danger"><strong>{{errorMsg.email}}</strong></div>
                </div>
                <div class="col-md-3"></div>
            </div>
            <div class="row mt-4">
                <div class="col-md-3"></div>
                <div class="col-md-6  d-flex flex-column align-items-start">
                    <span class="text-label">Password</span>
                    <input type="password" class="form-control shadow-sm" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" v-model="userInfo.password" requied/>
                </div>
                <div class="col-md-3"></div>
            </div>
            <div class="row mt-4">
                <div class="col-md-3"></div>
                <div class="col-md-6  d-flex flex-column align-items-start">
                    <span class="text-label">Confirm Password</span>
                    <input type="password" class="form-control shadow-sm" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" v-model="userInfo.verifyPassword" required/>
                    <div v-if="hasError" class="error-message small text-danger"><strong>{{errorMsg.password}}</strong></div>

                    <div class="text-start mt-1" style="font-size: 13px;">
                        <div class="password-text small" :class="{'password-accepted': hasMinimumChar}"><mdicon name="check" size="12"/> Your
                            password should be 8 to 20 characters long. </div>
                        <div class="password-text small mt-1" :class="{'password-accepted': isStrongPassword}"><mdicon name="check" size="12"/>
                            Combine uppercase and lowercase letters, number, and special characters (e.g., ! @ # ?
                            ], etc.) </div>
                    </div>
                </div>
                <div class="col-md-3"></div>
            </div>
            <div class="row mt-5">
                <div class="col-md-3"></div>
                <div class="col-md-6  d-flex flex-column align-items-start">
                    <button type="submit" class="btn btn-secondary w-100">Register</button>
                </div>
                <div class="col-md-3"></div>
            </div>
            <div class="row mt-3">
                <div class="col-md-3"></div>
                <div class="col-md-6  d-flex flex-column align-items-center">
                    <span>Already have an acocunt? Login <span style="cursor: pointer; font-weight: 700;" @click="router.push('/login')">here</span></span>
                </div>
                <div class="col-md-3"></div>    
            </div>
        </form>
    </div>
</template>
    
 <script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import register from '@/composables/auth/register'
import store from '@/store'

export default {
    name: "RegisterWeb",
    setup() {
        const router = useRouter()
        const validated = ref(null)
        const userInfo = ref({
            full_name: '',
            contact_number: '',
            email: '',
            password: '',
            verifyPassword: ''
        })
        const errorMsg = ref({email: '', password: ''})
        const hasError = ref(false)

        const handleRegister = async() => {
            hasError.value = false
            errorMsg.value.email = ''
            errorMsg.value.password = ''

            if (!validated.value) {
                hasError.value = true
                errorMsg.value.email = "Invalid Email Format!"
            } else { 
                const { response, error } = await register(userInfo.value)
                if (error.value === null) {
                    console.log("register response: ", response.value)
                    if (response.value.status > 201) {
                        console.log("response.value: ", response.value.message)
                        hasError.value = true
                        errorMsg.value.password = response.value.message
                    } else {
                        router.push('/login')
                    }
                }
            }
        }
        
        const isStrongPassword = computed(() => {
            return store.methods.isStrongPassword(userInfo.value.password)
        })

        const hasMinimumChar = computed(() => {
            return store.methods.hasMinimumChar(userInfo.value.password)
        })
        const isValidEmailFormat = computed(() => {
            hasError.value = false
            validated.value = store.methods.isValidEmailFormat(userInfo.value.email)
            return validated.value
        })
        return {
            router,
            userInfo,
            handleRegister,
            isStrongPassword,
            hasMinimumChar,
            isValidEmailFormat,
            errorMsg,
            hasError
        }
    }
}
</script>
    
<style scoped>
.password-accepted {
    color: darkgreen
}

.text-label {
    font-size: 14px;
}
</style>