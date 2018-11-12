<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar :src="userAvator"/>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="modifyPwd">修改密码</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <!-- - - - - - - - - -  修改密码弹出框  - -->
    <Modal v-model="modifyPwdVisibility" title="修改密码" width="600" >
        <Form ref="modifyPwdForm" :model="entity" :label-width="120">
            <FormItem label="旧密码" prop="oldPwd">
                <Input type="password" v-model="entity.oldPwd" />
            </FormItem>
            <FormItem label="新密码" prop="newPwd">
                <Input type="password" v-model="entity.newPwd" />
            </FormItem>
            <FormItem label="确认密码" prop="newPwd2">
                <Input type="password" v-model="entity.newPwd2" />
            </FormItem>
        </Form>
        <div slot="footer">
            <Button @click="modifyPwdDialogCancel">取消</Button>
            <Button type="primary" @click="modifyPwdSumbit">提交</Button>
        </div>
    </Modal>

    
  </div>
</template>

<script>
import './user.less'

import { mapActions } from 'vuex'

export default {
  name: 'User',
  props: {
    userAvator: {
      type: String,
      default: ''
    }
  },
  data() {
        return {
          modifyPwdVisibility : false,
          entity: {}
        }
  },
  methods: {
    ...mapActions([
      'handleLogOut',
      'modifySelfPwd'
    ]),
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.handleLogOut().then(() => {
            this.$router.push({
              name: 'login'
            })
          })
          break;
          case 'modifyPwd': 
          this.openModifyPwdDialog();
          break;
      }
    },
    openModifyPwdDialog(){
      this.modifyPwdVisibility = true;
    },
    modifyPwdDialogCancel(){
      this.entity = {}
      this.modifyPwdVisibility = false;
    },
    modifyPwdSumbit(){
      if(!this.hadVal(this.entity.oldPwd) || !this.hadVal(this.entity.newPwd) || !this.hadVal(this.entity.newPwd2)){
        this.$Message.error('必填项缺失! '); return false;
      }
      if(this.entity.newPwd != this.entity.newPwd2){
        this.$Message.error('新密码和确认密码不相同! '); return false;
      }
      if(this.entity.newPwd.length < 6){
            this.$Message.error('新密码长度不够! '); return false;
      }
        let obj = {
            oldPwd : this.entity.oldPwd,
            newPwd: this.entity.newPwd
        }
        this.modifySelfPwd(obj).then(
            (data) => {
                this.$Message.success("修改成功！请重新登陆");
                this.$router.push({name: 'login'})
            }, (err) =>{
                this.$Message.error(err); return false;
            }
        );
      


    },
    hadVal(val){
        if(val == null || val == '' || val == undefined)
            return false;
        return true;
    }
  }
}
</script>
