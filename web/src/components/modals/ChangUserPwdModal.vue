<template>
  <b-modal id="modal_user_change_pwd" centered :title="$t('txt_change_pwd')" size="md" footer-class="justify-content-end">
    <b-row class="m-2 border rounded bg-light">
      <b-col md="12" class="text-left ">
        <div class="p-3">
          <b-form>
            <label for="cpwd">{{$t('txt_current_pwd')}}</label>
            <b-form-input
              name="cpwd"
              class="mb-2"
              :placeholder="$t('txt_current_pwd_placeholder')"
              size="sm"
              type="password"
              v-model="pwdchange.current_password"
            ></b-form-input>

            <label for="npwd">{{$t('txt_new_pwd')}}</label>
            <b-form-input
              name="npwd"
              class="mb-2"
              :placeholder="$t('txt_new_pwd_placeholder')"
              size="sm"
              type="password"
              v-model="pwdchange.new_password"
            ></b-form-input>

            <label for="repeadpwd">{{$t('txt_new_pwd_confirm')}}</label>
            <b-form-input
              name="repeadpwd"
              class="mb-2"
              :placeholder="$t('txt_new_pwd_confirm_placeholder')"
              type="password"
              v-model="pwdchange.repeat_password"
            ></b-form-input>           
          </b-form>
        </div>
      </b-col>
    </b-row>
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">{{$t('btn_cancel')}}</b-button>
    <b-button class="rounded-1 btnPrimary" size="sm" @click="applyClick" :disabled="checkDisabled">{{$t('btn_change')}}</b-button>
    </template>
  </b-modal>
</template>

<script>
// $2a$10$e/IzFlJDY5DPGRDVmRffUOQl.3x3KTAhKMf.x2vJueAa4KMZ0N1yC
const user = 'user'
import {TYPE} from '@/store/modules/user'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: "ChangUserPwdModal",
  data(){
    return {
      pwdchange : {
        id: 0,
        current_password: '',
        new_password: '',
        repeat_password: ''
      }
    }
  },
  computed:{
     ...mapGetters(user, [
      TYPE.GET.MY_INFO
    ]),
    checkDisabled(){
      return _.isEmpty(this.pwdchange.current_password) && _.isEmpty(this.pwdchange.new_password) && _.isEmpty(this.pwdchange.repeat_password)
    }
  },
  methods:{
    ...mapActions(user, [
      TYPE.AC.CHANGE_USER_PASSWORD
    ]),
    applyClick: function(){
      this.CHANGE_USER_PASSWORD(this.pwdchange).then((res) => {
        const msg = res.message
        if(msg) {
          this.alert(msg, (ok) => {
            if(ok) {
              this.$bvModal.hide('modal_user_change_pwd')
            }
          })

        }
      }).catch((error) => {
        const msg = error.data.message
        if(msg) {
          this.alert(msg)
        }
      });
    }
  },
  mounted(){
    this.pwdchange.id = this.MY_INFO.id
  }
}
</script>