<template>
  <div class="container-fluid">
      <div class="position-absolute locale-switcher d-none" style="top:1rem;right:1rem;z-index:1">
        <img src="@/assets/img/lang/en.png" class="en mr-1" v-if="user_language==='en'" />
        <img src="@/assets/img/lang/ko.png" class="ko mr-1" v-if="user_language==='ko'" />
        <b-form-select v-model="user_language" :options="lang_options" size="sm" style="font-size:0.7rem;height:24px"></b-form-select>
      </div>
      <div class="row">
        <div class="col-12 intro-right-wrapper">
          <div class="wrapper">
            <!-- <h6 class="d-none d-md-block badge badge-primary shadow position-absolute mt-3 ml-4">Version 1.0</h6> -->
            <div class="intro-right-login-wrapper">
              <div class="wrapperbox  shadow rounded-1">
                <div class="d-none d-md-block col-xs-6 text-center">
                  <img src="@/assets/img/intro/bg.png" style="width:90%"/>
                </div>
                <div class="col-xs-6 box1 pb-3">
                  <b-form @submit.stop.prevent="setLogin">
                  <div class="pb-3 text-center">
                    <router-link :to="$url.LOGIN">
                      <img src="@/assets/img/intro/intro_logo.png" class="logo"/>
                    </router-link>
                    <div class="text-center text-dark pt-2 font-weight-bold">{{$t('app_title')}}</div>
                  </div>
                  <b-form-group id="input-group-1" :label="$t('txt_id')" label-for="txtuserid">
                    <b-form-input
                      autofocus
                      name="txtuserid"
                      v-model="form.userid"
                      :placeholder="$t('txt_id_placeholder')" @keypress.enter="setLogin"
                      :state="validateState('userid')"
                      aria-describedby="userid-feedback"
                    ></b-form-input>
                    <b-form-invalid-feedback id="userid-feedback">
                      아이디 must be at least 3 characters.
                    </b-form-invalid-feedback>
                  </b-form-group>

                  <b-form-group id="input-group-1" :label="$t('txt_pwd')" label-for="txtuserpwd">
                    <div class="position-relative">
                        <b-form-input
                        name="txtuserpwd"
                        :type="inputPwdType"
                        v-model="form.pwd"
                        :placeholder="$t('txt_pwd_placeholder')" @keypress.enter="setLogin"
                        :state="validateState('pwd')"
                        aria-describedby="pwd-feedback"
                      ></b-form-input>
                      <div class="eyes" @click="togglePwd()">
                        <img v-if="inputPwdType=='password'" src="@/assets/img/intro/hide.png">
                        <img v-else src="@/assets/img/intro/eye.png">
                      </div>
                      <b-form-invalid-feedback id="pwd-feedback">
                        비밀번호 must be at least 6 characters.
                      </b-form-invalid-feedback>
                    </div>                    
                  </b-form-group>
                  <div class="form-group pt-4">
                    <b-button type="button" class="btn btn-primary login-btn rounded-1" :disabled="isDisabled" @click="setLogin">
                      {{$t('btn_login')}}
                    </b-button>
                  </div>
                  <template v-if="false">
                  <div class="form-group pt-2">
                    <div class="d-flex justify-content-between">
                        <b-form-checkbox
                        id="checkbox-1"
                        v-model="isRememberedMe"
                        name="checkbox-1"
                        value="accepted"
                        unchecked-value="not_accepted"
                      >
                        <small>{{$t('login.txt_remember')}}</small>
                      </b-form-checkbox>&nbsp;&nbsp;
                      <router-link class="text-primary" :to="$url.FIND_ID">
                        <small>{{$t('login.txt_findidpwd')}}</small>
                      </router-link>
                    </div>
                  </div>
                  </template>
                  </b-form>
                </div>
              </div>
            </div>
            <div class="copyright">
              <span>{{$t('copyright')}}</span>
            </div>
          </div>
        </div>
      </div> 
  </div>

</template>

<script>
const auth = 'auth'
import {TYPE} from '@/store/modules/auth'
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from "vuelidate"
import { required, minLength } from "vuelidate/lib/validators"

export default {
  name: "Login",
  mixins: [validationMixin],
  data(){
    return {
      form:{
        userid: '',
        pwd: '',
      },
      showInputPwd: false,
      inputPwdType: 'password',
      eyeURL: '',
      isRememberedMe: false,
      user_language: '',
      lang_options: [
        { value: 'en', text: 'English' },
        { value: 'ko', text: '한국어' },
      ]
    }
  },
  validations: {
    form: {
      userid: {
        required,
        minLength: minLength(3)
      },
      pwd: {
        required,
        minLength: minLength(6)
      }
    }
  },
  computed:{
    ...mapGetters(['getUILang']),
    ...mapGetters(auth, [
      TYPE.GET.LOGIN_STATUS
    ]),
    isDisabled(){
      const id = this.form.userid.trim()
      const pwd = this.form.pwd.trim()
      if(!_.isEmpty(id) && !_.isEmpty(pwd)) return false
      else return true
    },    
  },
  watch:{    
    showInputPwd(v){
      if(v) {
        this.inputPwdType = 'text'
      }else{
        this.inputPwdType = 'password'
      }
    },
    user_language(lang){
      this.$i18n.locale = lang
      this.setLanguage(lang)
    }
  },
  methods:{
     ...mapActions(auth, [
      TYPE.AC.SET_LOGIN
    ]),
    togglePwd: function(){
      this.showInputPwd = !this.showInputPwd
    },
    validateState: function(name) {
      const { $dirty, $error } = this.$v.form[name];
      return $dirty ? !$error : null;
    },
    setLogin: function() {
      this.$v.form.$touch();
      if (this.$v.form.$anyError) {
        return;
      }
      this.setLoading(true)
      this.SET_LOGIN({userid: this.form.userid, password: this.form.pwd}).then(res => {
        setTimeout(()=>{
          this.setLoading(false)
          this.gotoDashbaord()
        },100)
      }).catch(error => {
        this.setLoading(false)
        const data = error && error.data
        if(data){
          this.alert(data.message);
        }
      })
    },
    gotoDashbaord: function(){
      this.$router.push(this.$url.DASHBOARD)
    },
  },
  created(){
    this.user_language = this.getUILang; 
    if(this.LOGIN_STATUS) {
      this.gotoDashbaord()
    }
  }
}
</script>

<style lang="scss" scoped>
$radius: 0.6rem;
.box1{  
  img.logo{
    padding: 1rem 10px;
    height: 4.5rem;
  }
  form{
    padding: 0.5rem 2rem;
    border-top: none;
    border-bottom-left-radius: $radius;
    border-bottom-right-radius: $radius;
  }
}
.wrapperbox{
  background: url('~@/assets/img/intro/gbg.jpg');
}
</style>
