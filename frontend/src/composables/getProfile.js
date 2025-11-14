import { ref } from 'vue'

const getProfile = async(token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        const reqOptions = {
            method: "GET",
            headers: {"Content-Type":"application/json", "Authorization":bearer}
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(process.env.VUE_APP_BACKEND_API + '/api/v1/auth/profile', reqOptions)
        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default getProfile