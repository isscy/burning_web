<style lang="less">
@import "./login.less";
</style>

<template>
    <div class="login">
        <div class="login-con">
            <Card icon="log-in" title="欢迎登录" :bordered="false">
                <div class="form-con">
                    <login-form ref="loginForm" @on-success-valid="handleSubmit" ></login-form>
                    <p class="login-tip">登陆有效期2小时，操作完成请及时退出</p>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  data () {
    return {
      loginFormLoading: false
    }
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo',
      'getUserMenu'
    ]),
    handleSubmit ({ userName, password }) {
      this.handleLogin({ userName, password }).then(res => {
        // this.getUserInfo().then(res => {
        this.getUserMenu().then(res => {
          this.loginFormLoading = false
          this.$router.push({name: this.$config.homeName})
        }).catch(err => { this.stopLoading(); this.$Message.error('获取菜单错误! ' + err); return false })
      }).catch(err => {
        this.stopLoading()
        this.$Message.error({content: '登陆错误!  ' + err, duration: 5})
      })
    },
    stopLoading () {
      this.$refs.loginForm.stopLoading()
    }
  }
}
</script>

<style>
</style>
