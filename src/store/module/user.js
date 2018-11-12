import { login, logout, getUserInfo, getUserMenu, modifySelfPwd } from '@/api/user'
import { setToken, getToken } from '@/libs/util'

export default {
  state: {
    userName: '',
    userId: '',
    avatorImgPath: '',
    token: getToken(),
    access: '',
    hasGetInfo: false,
    userMeuns: []
  },
  mutations: {
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    },
    setUserMenus (state, list) {
      state.userMeuns = list
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, password }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({ userName, password }).then(res => {
          const r = res.data
          if (r.code != '1' || r.data == null) {
            throw r.message
          }
          const data = r.data
          // sessionStorage.setItem('token', 'Bearer ' + data.token)
          commit('setToken', 'Bearer ' + data.token)
          commit('setUserName', data.nickName)
          commit('setUserId', data.id)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        // logout(state.token).then(() => {
        //     commit('setToken', '')
        //     commit('setAccess', [])
        //     resolve()
        // }).catch(err => {
        //     reject(err)
        // })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        commit('setToken', '')
        commit('setAccess', [])
        sessionStorage.clear()
        localStorage.clear()
        resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getUserInfo(state.token).then(res => {
            const r = res.data
            if (r.code != '1' || r.data == null) {
              alert(r.message)
              return false
            }
            let data = r.data
            let arr = []
            data.access.split(',').forEach(e => {
              arr.push(e)
            })
            // console.log(data)
            // console.log(data.access)
            commit('setAvator', 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png')
            commit('setUserName', data.nickName)
            commit('setUserId', data.id)
            commit('setAccess', arr)
            commit('setHasGetInfo', true)
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 修改自己的密码
    modifySelfPwd ({ state, commit }, { oldPwd, newPwd }) {
      return new Promise((resolve, reject) => {
        try {
          modifySelfPwd(oldPwd, newPwd, state.token).then(res => {
            const r = res.data
            if (r.code != '1') {
              reject(r.message)
            } else {
              commit('setToken', '')
              commit('setAccess', [])
              sessionStorage.clear()
              localStorage.clear()
              resolve(110)
            }
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },

    // 获取用户菜单
    getUserMenu ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getUserMenu(state.token).then(res => { // 调用 src/api/user.js
            if (res.data.code != '1' || res.data.data == null) { throw res.data.message }
            let data = res.data.data
            sessionStorage.setItem('userMeuns', JSON.stringify(data))
            commit('setUserMenus', data)
            console.log(state.userMeuns)
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
