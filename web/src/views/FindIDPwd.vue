<template>
  <div class="container-fluid">
    <div class="position-absolute locale-switcher" style="top:1rem;right:1rem;z-index:1">
        <img src="@/assets/img/lang/en.png" class="en mr-1" v-if="user_language==='en'" />
        <img src="@/assets/img/lang/ko.png" class="ko mr-1" v-if="user_language==='ko'" />
      <b-form-select v-model="user_language" :options="lang_options" size="sm" style="font-size:0.7rem;height:24px"></b-form-select>
    </div>
    <div class="row">
      <div class="col-12 intro-right-wrapper">
        <div class="wrapper">
          <div class="intro-right-login-wrapper">
            <div class="wrapperbox">
              <div class="col-xs-6 findIdPwd shadow">
                <div class="pb-3 text-center">
                  <router-link :to="$url.LOGIN">
                    <img src="@/assets/img/intro/intro_logo.png" />
                  </router-link>
                  <div class="text-center text-dark pb-2">{{$t('app_title')}}</div>
                </div>
                <b-tabs fill justified nav-wrapper-class="nav-pills pb-2" lazy v-model="tabIndex">
                  <b-tab :title="$t('findidpwd.txt_opt_id')" active>
                    <FindID @btnClick="sendRequest" />
                  </b-tab>
                  <b-tab :title="$t('findidpwd.txt_opt_pwd')"> 
                    <FindPwd @btnClick="sendRequest" /> 
                  </b-tab>
                </b-tabs>
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
import FindID from '@/components/FindID.vue'
import FindPwd from '@/components/FindPwd.vue'
export default {
  name: "FindIDPwd",
  data(){
    return {
      tabIndex: 0,
      user_language: '',
      lang_options: [
        { value: 'en', text: 'English' },
        { value: 'ko', text: '한국어' },
      ]
    }
  },
  components:{
    FindID,
    FindPwd
  },
  computed:{
    ...mapGetters(['getUILang']),
    ...mapGetters(auth, [
      TYPE.GET.LOGIN_STATUS
    ])
  },
  watch:{
    user_language(lang){
      this.$i18n.locale = lang
      this.setLanguage(lang)
    }
  },
  methods:{
     ...mapActions(auth, [
      TYPE.AC.SET_LOGIN,
      TYPE.AC.FIND_USER_ID,
      TYPE.AC.FIND_USER_PWD
    ]),
    redirectPage(){
      if(this.LOGIN_STATUS) {
        this.gotoDashbaord()
      }else{
        this.$router.push(this.$url.LOGIN);
      }
    },
    gotoDashbaord: function(){
      const dashboard = this.$url.DASHBOARD
      this.$router.push(dashboard);
    },
    sendRequest: function(data){
      this.setLoading(true)
      if(!this.tabIndex) {
        this.FIND_USER_ID(data).then((res) => {
          this.setLoading(false)
          this.alert(res.message,(ok) =>{
            if(ok) {
              this.redirectPage()
            }
          })
        }).catch((error) => {
          this.setLoading(false)
          const msg = error.data.message
          if(msg) {
            this.alert(msg)
          }
        });
      }
      else{
        this.FIND_USER_PWD(data).then((res) => {
          this.setLoading(false)
          this.alert(res.message,(ok) =>{
            if(ok) {
              this.redirectPage()
            }
          })
        }).catch((error) => {
            this.setLoading(false)
            const msg = error.data.message
            if(msg) {
              this.alert(msg)
            }
          }
        )
      }
    }
  },
  created(){
    this.user_language = this.getUILang; 
    if(this.LOGIN_STATUS) {
      this.gotoDashbaord()
    }
  }
}
</script>

<style lang="scss">
$radius: 0.6rem;
.findIdPwd{  
  background: #FFF;
  padding: 10px 30px;
  border-radius:$radius;
  img{
    padding: 1rem 10px;
    height: 4.5rem;
  }
  .tabs{
    min-width: 300px;
    border-top: none;
    border-bottom-left-radius: $radius;
    border-bottom-right-radius: $radius;
    li.nav-item {
      border-radius:0px;
      border-left: none;
      &:first-child{
        a {
          &.nav-link{
            color: #888;
            border-radius:0px;
            background: #f9fcff;
            border: 1px solid #f9fcff !important;
            border-top-left-radius: $radius;
            &.active{
              color: #FFF;
              background: #0045bc !important;
            }
          }
        }
      }
      &:last-child{
        a {
          &.nav-link{
            color: #888;
            border-radius:0px;
            background: #f9fcff;
            border: 1px solid #f9fcff !important;
            border-top-right-radius: $radius;
            &.active{
              color: #FFF;
              background: #0045bc !important;
            }
          }
        }
      }
    }
  }  
}
</style>