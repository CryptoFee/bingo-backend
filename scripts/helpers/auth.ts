
import axios from "axios"

const instance = axios.create({
    baseURL: 'http://localhost:3030',
});
export const getHttpClient = () => {
    return instance
}

export const getAccessToken = async () => {
   const client = getHttpClient()

    const {data : {accessToken}} = await client.post('/authentication' , {
        email : "admin@admin.com",
        password : "123456",
        strategy : "local"
    })

    return accessToken
}


export const createUser = async () => {

    const client = getHttpClient()

    const {data : {accessToken}} = await client.post('/users' , {
        email : "admin@admin.com",
        password : "123456",
    })

    return accessToken
}