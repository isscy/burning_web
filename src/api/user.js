import axios from '@/libs/api.request'

export const login = ({ userName, password }) => {
    const data = {
        'userName': userName,
        'password': password,
        'loginSource': '$2a$10$MhbAAOPMyOdubhQ7b55'
    }
    return axios.request({
        url: 'authorize/login/password',
        data,
        method: 'post'
    })
}

export const getUserInfo = (token) => {
    return axios.request({
        url: 'sysUser/userInfo',
        headers: {
            'Authorization':token,
            'Content-Type': 'application/json;charset=UTF-8',
        },
        method: 'get'
    })
}
/*
params: {},
headers:{
    'Authorization':token,
    'Content-Type': 'application/json;charset=UTF-8'
},
*/
export const logout = (token) => {
    return axios.request({
        url: 'logout',
        method: 'post'
    })
}

export const getUserMenu = (token) => {
    return axios.request({
        //url: 'noAuth/sysMenu/menusByUser',
        url: 'sysMenu/menusByUser',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json;charset=UTF-8',
        },
        // params: {
        //     'userId':'10000'
        // },
        method: 'get'
    })
}

export const modifySelfPwd = (oldPwd, newPwd, token) => {
    const data = {
        'oldPwd': oldPwd,
        'newPwd': newPwd,
    }
    return axios.request({
        url: 'bkm-home/modifySelfPwd',
        headers: {
            'Authorization':token,
            'Content-Type': 'application/json;charset=UTF-8',
        },
        data,
        method: 'post'
    })
}