<template>
  <div>
    <Header />
    <main>
      <div class="b1">
        <b-tabs pills card vertical :nav-wrapper-class="{IconOnly: showIconOnly, setting_submenu: true}" v-model="selectSubMenu" lazy>
          <b-tab v-for="(m, idx) in sideSubMenu" :key="idx">
            <template slot="title">
              <i :class="[m.icon,{'fa-lg': showIconOnly}]" aria-hidden="true"></i> 
              <span class="title">
                {{m.text}}
              </span>
            </template>
            <keep-alive>
            <component :crud="getCRUD" v-bind:is="currentTabComponent" :sadmin="IS_SADMIN"></component>
            </keep-alive>
          </b-tab>
          <template #tabs-end>
            <li role="presentation" class="nav-item w-100 text-center" @click="sideMenuToggle">
              <i v-if="showIconOnly" class="fa fa-angle-double-right p-1" aria-hidden="true"></i>
              <i v-else class="fa fa-angle-double-left p-1" aria-hidden="true"></i>
            </li>
          </template>
        </b-tabs>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script>
const user = 'user'
import {TYPE} from '@/store/modules/user'
import { mapGetters } from 'vuex'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
export default {
  name: 'Setting',
  components:{
    Header,
    Footer,
  },
  data(){
    return {   
      user:{},
      getCRUD:{},
      selectSubMenu: 0,
      showIconOnly: true,
      sideSubMenu:[],
      currentTabComponent: null
    }
  },
  watch:{
    selectSubMenu(v){
      if(v>=0) {
        this.setCurrentComponent();
      }
    },
    getUILang(v){
      this.sideSubMenu = this.USER_MENU_SETTING
    }
  },
  computed:{
    ...mapGetters(['getUILang']),
    ...mapGetters(user, [
      TYPE.GET.MY_INFO,
      TYPE.GET.IS_SADMIN,
      TYPE.GET.USER_MENU_SETTING
    ]),
  },
  methods:{
    sideMenuToggle: function(){
      this.showIconOnly = !this.showIconOnly
    },
    setCurrentComponent: function(){
      if(_.size(this.sideSubMenu)) {
        this.getCRUD = this.sideSubMenu[this.selectSubMenu].state
        this.currentTabComponent = this.sideSubMenu[this.selectSubMenu].component
      }else{
        
      }
    }
  },
  mounted(){
    this.user = this.MY_INFO
    this.selectSubMenu = 0
    this.sideSubMenu = this.USER_MENU_SETTING
    this.setCurrentComponent();
  }
}
</script>

<style lang="scss">
$nav-item-color: #20639b;
$nav-item-active-bg: #F6D55C;
.b1{
  // border: 1px solid #f0f1f2;
  .tabs{
    background: #f8f9fa;
    background: linear-gradient(#e9ecef, #f9f9f9);
    .setting_submenu{
      height: calc(100vh - 115px);
      &.IconOnly{
        .nav-item{
          .nav-link{
            span{
              display: none;
            }
          }
        }
      }
      .nav{
        padding: 0.75rem 0.5rem;
        padding-top: 50px;
        background: linear-gradient(#ffffff, #f9f9f9);
        .nav-item{
          a.nav-link {
            color: #20639b;
            &.active {
              color: #444;
              background: $nav-item-active-bg;
              box-shadow: 0 0 0 0.2rem rgb(255 238 175);
              &:hover{
                color: $nav-item-color;
              }
            }
          }
          &:last-child{
            position: absolute;
            top: 1px;
            right: 0;
            height: 35px;
            width: 100%;
            i{
              color: #c3c3c3;
              font-size: x-large;
              cursor: pointer;
            }
          }          
        }
      }
    }
    .tab-content{
      overflow: hidden;
      height: calc(100vh - 115px);
      .container-fluid{
        padding: 0px;
        overflow: auto;
        background: #f8f9fa;
        border-radius: 0.6rem;
        height: calc(100vh - 155px);
        .alert{
          border: none;
          color: #000;
          background: #FFF;
          font-weight: bold;
          border-bottom-left-radius: 0px;
          border-bottom-right-radius: 0px;
          border-bottom: 1px solid #d6d8db;
          margin-bottom: 0px;
          i.fa{
            color: #0055e6;
            font-size: 1.1rem;
          }
          button.btn{
            height: 28px;
            line-height: 1;
            padding: 0px 16px;
            border-radius: 1.2rem;
            i{
              font-size: 0.9rem;
              padding-right: 5px;
            }
            &:not(:first-child) {
              margin-left: 6px;
            }
          }
          input.form-control{
            height: 30px;
            padding-left: 1rem;
          }
        }
      }
    }
  }
}
.gensetting{
  left: 10px;
  bottom: 10px;
  border: none;
  position: absolute;
  color:$nav-item-color;
  background: #f8f9fa;
  z-index: 10;
}
</style>
