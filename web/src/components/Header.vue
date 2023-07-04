<template>    
  <header>
    <b-navbar toggleable="lg" class="bg-light shadow" :class="{'navbarheight':!showMenu}">
      <b-navbar-brand href="#">
        <router-link class="navbar-brand p-2" :to="$url.DASHBOARD.path">
          <img src="@/assets/img/common/logo.png" />
        </router-link>
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" @click="toggleClick=!toggleClick"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <div class="navbar-collapse bg-light" id="navbarCollapse" style="margin-top:1px;" :class="{'shadow':toggleClick}">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">&nbsp;</li>
          </ul>
          <div class="locale-switcher mr-2 mb-1 d-none">
            <img src="@/assets/img/lang/en.png" class="en mr-1" v-if="user_language==='en'" />
            <img src="@/assets/img/lang/ko.png" class="ko mr-1" v-if="user_language==='ko'" />
            <b-form-select v-model="user_language" :options="lang_options" size="sm" style="font-size:0.7rem;height:24px"></b-form-select>
          </div>
          <div class="head-user"><span>{{getUserName}}</span><img src="@/assets/img/common/user_icon.png"></div>
          <button class="btn head-logout" @click="setLogout">{{$t('btn_logout')}}</button>
        </div>
      </b-collapse>
    </b-navbar>
  </header>
</template>

<script>
const auth = 'auth'
const user = 'user'
import {TYPE as AUTH_TYPE} from '@/store/modules/auth'
import {TYPE as USER_TYPE} from '@/store/modules/user'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: "Header",
  props:{
    showMenu: {
      type: Boolean,
      required: false,
      default: true
    },
    noSelectMenu: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data(){
    return{
      user: {},
      toggleClick: false,
      user_language: '',
      lang_options: [
        { value: 'en', text: 'English' },
        { value: 'ko', text: '한국어' },
      ]
    }
  },
  computed:{
    ...mapGetters(['getUILang']),
    ...mapGetters(user, [
      USER_TYPE.GET.MY_INFO
    ]),
    getUserName(){
      if(_.isEmpty(this.user)) return ""
      return this.user.name
    }
  },
  watch:{
    MY_INFO(u) {
      this.user = _.cloneDeep(u, true)
    },
    user_language(lang){
      this.$i18n.locale = lang
      this.setLanguage(lang)
    }
  },
  methods:{
    ...mapActions(auth, [
      AUTH_TYPE.AC.SET_LOGOUT
    ]),
    setLogout: function() {
      this.confirm(this.$i18n.t('txt_logout_msg'),(v)=>{
        if(v) {
          this.setLoading(true)
          this.SET_LOGOUT().then(res => {
            setTimeout(() => {        
              this.setLoading(false)
              this.$router.push(this.$url.LOGIN);
            }, 100);
          })  
        }
      })
    },
    setMenu: function(idx){
      this.selectMenu = idx
    }
  },
  created(){
    this.user_language = this.getUILang;    
    this.user = this.MY_INFO
  },
}
</script>

<style lang="scss">
$primary-color: #00569b;
.head-logout{
  font-size:0.8rem;
  background-color:$primary-color;
  color:#fff;
  padding:2px 15px;
  border-radius: 30px;
}
.head-logout:hover{
  color:#fff;
}
.head-user{
  color:$primary-color;
  font-size:0.9rem;
  transform: rotate(0.1deg);
}
.head-user > img{
  padding: 10px 20px 10px 5px;
  height: 2.7rem;
}
.navbarheight{
height: 58px;
}
@import url(https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@1.0/nanumsquare.css);
.navbar {
  z-index: 10;
  padding: 0rem 1rem;
}
.dropdown, .dropup {
  position: unset;
}
.dropdown-menu{
  width:300px;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  float: left;
  max-height: 0;
  min-width: 10rem;
  padding:unset;
  display:block;
  font-size:0.8rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border:unset;
  border-radius: .25rem;
  overflow: hidden;
  // transition: 0.3s max-height;
}
.dropdown-menu.show{
  max-height:60px;
  border-radius: 0px;
  display: flex;
  /* justify-content: center; */
  width: 100% !important;
}
.dropdown-item{
  display:inline-block;
  width:auto;
  clear:unset;
  padding-top:0px;
  padding-bottom:0px;
  line-height:60px;
}
.head-title{
  font-size:0.8rem;
  font-weight: bold;
  color: #fff;
  // background: linear-gradient(#0055E6,$primary-color);
  border-radius: 13px;
  padding: 2px 20px;
  transform: rotate(0.1deg);
  margin-right:52px;
}
@media (min-width: 992px){
  .navbar-expand-lg .navbar-nav .dropdown-menu-right {
    top:55px;
    left:0;
    width:100%;
    height:60px;
  }
}
@media (max-width:991px){
  .navbar-collapse{
    top: 60px;
  }
  .navbar{
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1030;
    height:60px;
    padding:0px 15px;
  }
  .head-title{
    margin:unset;
  }
  .dropdown-menu{
    width:auto;
  }
  .dropdown-menu.show{
    max-height:300px;
    display:block;
    .head-user {
      display: block;
    }
  }
  .dropdown-item{
    display:block;
    width:auto;
    clear:both;
    line-height: 40px;
  }
  .dropdown-menu > .dropdown-item{
    padding-left:10px;
  }
  .vehicle-table-wrapper{
    padding:0px 15px;
  }
}

.nav-item .nav-link{
  color:#000;
  font-size:0.8rem;
  font-weight:bold;
  transform: rotate(0.1deg);
}
.nav-link{
  // transition:0.3s color;
}
.nav-item.active > .nav-link{
  color:#0055E6 !important;
}
.nav-link > img{
  padding:10px;
}
.navbar-light .navbar-nav .nav-link{
  color:#000;
}
.navbar-light .navbar-brand{
  padding-top: 0px;
  margin-right: 0px;
}
.dropdown-menu{
  background-color:#F5F5F5;
  box-shadow: 0px 2px 4px 0px #888;
}
.dropdown-item::before{
  content:" ";
  display:inline-block;
  width:8px;
  height:8px;
  border-radius:8px;
  background-color:#0055E6;
  margin-right:10px;
}
.dropdown-item:focus, .dropdown-item:hover{
  background-color:unset;
}
</style>