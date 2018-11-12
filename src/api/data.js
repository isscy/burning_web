import axios from '@/libs/api.request'
import {getToken} from '@/libs/util'

export const getTableData = () => {
    return axios.request({
        url: 'get_table_data',
        method: 'get'
    })
}

export const getDragList = () => {
    return axios.request({
        url: 'get_drag_list',
        method: 'get'
    })
}

export const errorReq = () => {
    return axios.request({
        url: 'error_url',
        method: 'post'
    })
}

export const saveErrorLogger = info => {
    return axios.request({
        url: 'save_error_logger',
        data: info,
        method: 'post'
    })
}

export const getRequst = (url, param, token) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json;charset=UTF-8',
        },
        params: param,
        
        method: 'get'
    })
}
export const igetRequst = (url, param) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/json;charset=UTF-8',
        },
        params: param,
        
        method: 'get'
    })
}

export const postRequst = (url, data) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/json;charset=UTF-8',
        },
        data:data,
        method: 'post'
    })
}

export const putRequst = (url, data) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/json;charset=UTF-8',
        },
        data:data,
        method: 'put'
    })
}

export const deleteRequst = (url, data) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/json;charset=UTF-8',
        },
        data:data,
        method: 'delete'
    })
}

export const igetDownload = (url, param) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/json;charset=UTF-8',
        },
        params: param,
        responseType: 'arraybuffer',
        method: 'get'
    })
}

export const postUpload = (url, data) => {
    return axios.request({
        url: url,
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'multipart/form-data',
        },
        data:data,
        method: 'post'
    })
}

export const localSave = (key, value) => {
    localStorage.setItem(key, value)
  }