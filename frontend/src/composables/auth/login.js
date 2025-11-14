import { ref } from 'vue'

const login = async(email, password) => {
    const response = ref(null)
    const error = ref(null)

    try {
        const reqOptions = {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(process.env.VUE_APP_BACKEND_API + '/api/v1/auth/login', reqOptions)
        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default login