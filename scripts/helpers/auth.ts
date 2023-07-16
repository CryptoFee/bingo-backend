
import axios from "axios"

const instance = axios.create({
    baseURL: process.env.BACKEND_MASTER_URL
});
export const getHttpClient = () => {
    return instance
}

export const getAccessToken = async () => {
   const client = getHttpClient()

    const {data : {accessToken}} = await client.post('/authentication' , {
        email : process.env.ADMIN_USER_NAME,
        password : process.env.ADMIN_PASSWORD,
        strategy : "local"
    })

    return accessToken
}


export const createUser = async () => {

    const client = getHttpClient()

    const {data : {accessToken}} = await client.post('/users' , {
        email : process.env.ADMIN_USER_NAME,
        password : process.env.ADMIN_PASSWORD,
    })

    return accessToken
}