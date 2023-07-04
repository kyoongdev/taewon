<template>
  <div>
    <Header :no-select-menu="true"/>
    <main>
      <div class="MyPage">
        <div class="container-fluid shadow">
          <div class="alert m-0"><i class="fa fa-user-circle-o fa-lg pr-2" aria-hidden="true"></i>{{$t('MyPage.txt_title')}}</div>
          <div class="u-info">
            <b-row class="text-center p-4 m-0">
              <div class="col-md-2 text-center mt-3">
                <b-avatar rounded variant="dark" size="6rem" class="shadow"></b-avatar>
                <div class="mt-3 text-primary">{{getUserName}}</div>
              </div>  
              <div class="col-md-5 border rounded bg-white text-left m-2 p-4">
                <b-row class="p-2 m-0">
                  <div class="col-2">
                    <div>{{$t('txt_id')}}</div>
                  </div>
                  <div class="col-1">:</div>
                  <div class="col">
                    <div>{{user.userid}}</div>
                  </div>
                </b-row>
                <b-row class="p-2 m-0">
                  <div class="col-2">
                    <div>{{$t('txt_name')}}</div>
                  </div>
                  <div class="col-1">:</div>
                  <div cols="10">
                    <div>{{user.name}}</div>
                  </div>
                </b-row>
                <b-row class="p-2 m-0">
                   <div class="col-2">
                    <div>{{$t('txt_email')}}</div>
                  </div>
                  <div class="col-1">:</div>
                  <div cols="10">
                    <div>{{user.email}}</div>
                  </div>
                </b-row>
                <b-row class="p-2 m-0">
                   <div class="col-2">
                    <div>{{$t('txt_phone')}}</div>
                  </div>
                  <div class="col-1">:</div>
                  <div cols="10">
                    <div>{{user.phone}}</div>
                  </div>
                </b-row>
              </div>
              <div class="col-md-4 border rounded bg-white text-left m-2 p-4">
                <b-row class="p-2 m-0">
                  <div class="col-2">
                    <div>{{$t('txt_role')}}</div>
                  </div>
                  <div class="col-1">:</div>
                  <div cols="10">
                    <div>{{user.UserRole.name}}</div>
                  </div>
                </b-row>
              </div>
            </b-row>         
            <div class="row m-0 pl-4">
              <div class="col-md-2"></div>
              <div class="col pl-1">
                <b-button size="sm" variant="warning" @click="modifyInfo" v-b-modal.modal_user_form>
                  <i class="fa fa-info-circle pr-2" aria-hidden="true"></i>{{$t('btn_update')}}
                </b-button>
                <b-button size="sm" class="btnPrimary ml-2" variant="primary" v-b-modal.modal_user_change_pwd>
                  <i class="fa fa-key text-white pr-2" aria-hidden="true"></i>{{$t('txt_change_pwd')}}
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <chang-user-pwd />
    <user-form-modal v-if="showModal" :is-user="true" :is-update="true" :userdata="user" @closeModal="closeModal"/>
    <Footer />
  </div>
</template>

<script>
const user = 'user'
import {TYPE} from '@/store/modules/user'
import { mapGetters } from 'vuex'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import UserFormModal from '@/components/modals/UserFormModal.vue'
import ChangUserPwd from '@/components/modals/ChangUserPwdModal.vue'
export default {
  name: 'MyPage',
  components:{
    Header,
    Footer,
    UserFormModal,
    ChangUserPwd
  },
  data(){
    return {
      showModal: false,
      user: {}
    }
  },
   computed:{
    ...mapGetters(user, [TYPE.GET.MY_INFO]),
    getUserName(){
      if(_.isEmpty(this.user)) return ""
      return this.user.name
    }
  },
  watch:{
    MY_INFO(u) {
      this.user = _.cloneDeep(u, true)
    }
  },
  methods:{
    closeModal: function(){
      this.showModal = false
    },
    modifyInfo: function() {
      this.showModal = true
    }
  },
  created(){
    this.user = _.cloneDeep(this.MY_INFO, true)
  }
}
</script>

<style lang="scss">
.MyPage{
  padding: 1.3rem 1.2rem;
  background: #f8f9fa;
  background: linear-gradient(#e9ecef, #f9f9f9);
  .container-fluid{
    padding: 0px;
    overflow: auto;
    background: #f8f9fa;
    border-radius: 0.6rem;
    height: calc(100vh - 155px);
    .alert{
      border: none;
      color: #000;
      background: rgb(255, 255, 255);
      font-weight: bold;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      border-bottom: 1px solid #d6d8db;
      i.fa{
        color: #0055e6;
        font-size: 1.1rem;
      }
    }
    .u-info{
      height: calc(100% - 50px);
    }
  }
}
</style>
