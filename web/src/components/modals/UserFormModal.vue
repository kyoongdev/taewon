<template>
  <b-modal id="modal_user_form" centered :title="getTitle" :size="getSize" footer-class="justify-content-end" @hide="closeModal" v-model="modalShow">
    <b-row  v-if="!isUser" class="m-2 border rounded bg-light">
      <b-col md="7" class="text-left ">
        <div class="p-3">
          <b-form>
           <b-form-group label="아이디" label-for="uid">
              <b-form-input
                v-if="isUpdate"
                v-model="user.userid"
                name="uid"
                class="mb-2"
                :disabled="true"
                placeholder="아이디 입력하세요"
                size="sm"
              />
              <b-form-input
                autofocus 
                v-else
                v-model="user.userid"
                name="uid"
                class="mb-2"
                placeholder="아이디 입력하세요"
                size="sm"
                :state="validateState('userid')"
              />
            </b-form-group>

            <b-form-group label="이름" label-for="uname">
              <b-form-input
                v-model="user.name"
                name="uname"
                class="mb-2"
                placeholder="이름 입력하세요"
                :state="validateState('name')"
              />
            </b-form-group>

            <b-form-group label="비밀번호" label-for="upwd">
              <b-form-input
                v-model="user.password"
                name="upwd"
                class="mb-2"
                type="password"
                placeholder="비밀번호 입력하세요"
              />
            </b-form-group>

            <b-form-group label="이메일" label-for="uemail">
              <b-form-input
                v-model="user.email"
                name="uemail"
                class="mb-2"
                placeholder="이메일 입력하세요"
                :state="validateState('email')"
              />
            </b-form-group>

            <label for="uphone">연락처</label>
            <b-form-input
              v-model="user.phone"
              name="uphone"
              class="mb-2"
              placeholder="연락처  입력하세요"
            />
          </b-form> 
        </div>
      </b-col>
      <b-col md="5" class="ml-auto text-left border-left">
        <div class="alert mb-0 p-2 rounded-0 border-bottom d-flex justify-content-between align-items-center">
          <div>
            그룹 선택
          </div>
          <b-button class="b-minw rounded-1" variant="success" size="sm" v-b-modal.modal-group-setting><i class="fa fa-cog pr-1" aria-hidden="true"></i>그룹 설정</b-button>
        </div>
        <template v-if="getGroupCount">
        <div class="p-3 overflow-auto" style="max-height:400px">
           <b-form-group v-slot="{ ariaDescribedby }">
            <b-form-checkbox-group
              v-model="user.group"
              :options="grouplist"
              :aria-describedby="ariaDescribedby"
              name="flavour-2a"
              stacked
            ></b-form-checkbox-group>
          </b-form-group>
        </div>  
        </template>
        <div v-else class='w-100 text-center p-4'>그룹을 없습니다</div>
      </b-col>
    </b-row>
    <b-row  v-else class="m-2 border rounded bg-light">
      <b-col md="12" class="text-left ">
        <div class="p-3">
          <b-form>
            <label for="uid">아이디</label>
            <b-form-input
              v-model="user.userid"
              class="mb-2"
              placeholder="아이디 입력하세요"
              size="sm"
              :disabled="true"
            ></b-form-input>

            <label for="uname">이름</label>
            <b-form-input
              autofocus 
              v-model="user.name"
              name="uname"
              class="mb-2"
              placeholder="이름 입력하세요"
            ></b-form-input>

            <label for="uemail">이메일</label>
            <b-form-input
              v-model="user.email"
              name="uemail"
              class="mb-2"
              placeholder="이메일 입력하세요"
            ></b-form-input>

            <label for="uphone">연락처</label>
            <b-form-input
              v-model="user.phone"
              name="uphone"
              class="mb-2"
              placeholder="연락처  입력하세요"
            ></b-form-input>            
          </b-form>
        </div>
      </b-col>
    </b-row>
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">취소</b-button>
    <b-button class="rounded-1 btnPrimary" :disabled="isUserDataChanged" size="sm" @click="applyClick">{{btnApplyName}}</b-button>
    </template>
  </b-modal>
</template>

<script>
const group = 'group'
const user = 'user'
const auth = 'auth'
import {TYPE as GROUP_TYPE} from '@/store/modules/group'
import {TYPE as AUTH_TYPE} from '@/store/modules/auth'
import {TYPE as USER_TYPE} from '@/store/modules/user'
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from "vuelidate"
import { required, email } from "vuelidate/lib/validators"

export default {
  name: "UserFormModal",
  mixins: [validationMixin],
  props:{
    isUpdate:{
      type: Boolean,
      required: false,
      default: false
    },
    isUser:{
      type: Boolean,
      required: false,
      default: false
    },
    userdata:{
      type: Object,
      required: false,
      default: () => { return {} }
    }
  },
  data(){
    return {
      user: {},
      orgData:{},
      modalShow: false,
      tbhead: ["이름","설명"],
      selected: [], // Must be an array reference!
      grouplist: []
    }
  },
  validations: {
    user: {
      userid: {
        required
      },
      name: {
        required
      },
      email: {
        required,
        email
      },
    }
  },
  computed:{
    ...mapGetters(group, [
      GROUP_TYPE.GET.GROUP_LIST
    ]),
    ...mapGetters(user,[
      USER_TYPE.GET.MY_INFO
    ]),
    getTitle(){
      if(this.isUser) return "정보 수정"
      if(this.isUpdate) {
        return "사용자 수정"
      }
      return "사용자 등록"
    },
    btnApplyName(){
      if(this.isUpdate) {
        return "수정"
      }
      return "등록"
    },
    getSize(){
      return this.isUser?"md":"lg"
    },
    isUserDataChanged(){
      return _.isEqual(this.user, this.orgData)
    },
    getGroupCount(){
      return _.size(this.grouplist)? true : false
    },
    isUpdateGroup() {
      return !_.isEqual(this.user.group, this.orgData.group)
    },
  },
  watch:{
    GROUP_LIST(list){
      this.setGroupOption(list)
    },
    modalShow(v) {
      if(v && !this.isUser) {
        this.GET_GROUP_LIST()
      }
    },
  },
  methods:{
    ...mapActions(group, [
      GROUP_TYPE.AC.GET_GROUP_LIST,
      GROUP_TYPE.AC.SET_USER_GROUP
    ]),
    ...mapActions(user, [
      USER_TYPE.AC.SET_INFO,
      USER_TYPE.AC.GET_USER_GROUP,
      USER_TYPE.AC.GET_USER_LIST,
      USER_TYPE.AC.SET_UPDATE_USER,
    ]),
    ...mapActions(auth, [
      AUTH_TYPE.AC.SET_REGISTER_USER
    ]),
    closeModal: function(){
      this.$emit('closeModal')
    },
    validateState: function(name) {
      const { $dirty, $error } = this.$v.user[name];
      return $dirty ? !$error : null;
    },
    applyClick: function(){
      if(this.isUpdate) {
        if(this.updateUserGroup()) {
          this.SET_UPDATE_USER(this.user).then((res) => {
            const msg = res.message
            if(this.isUser && this.MY_INFO.id === res.data.id) {
              this.SET_INFO({userinfo: res.data})
              this.orgData = _.cloneDeep(this.user, true)
            }
            if(msg) {
              this.alert(msg, (ok) =>{
                if(ok) {
                  this.closeModal()
                  this.GET_USER_LIST()
                }
              })
            }
          }).catch((error) => {
            this.alert(error.data.message)
          });
        }
      }else {
        this.$v.user.$touch();
        if (this.$v.user.$anyError) {
          return;
        }
        this.SET_REGISTER_USER(this.user).then((res) => {
          const backup_group = _.cloneDeep(this.user.group, true)
          this.user = _.cloneDeep(res.data, true)
          this.user.group = backup_group
          this.updateUserGroup(true)
          this.alert( res.message, (ok) =>{
            if(ok) {
              this.GET_USER_LIST().then(() =>{
                this.closeModal()
              })
            }
          })
        }).catch((error) => {
          this.alert(error.data.message)
        });
      }
    },
    updateUserGroup: async function(new_user){
      if(this.isUpdateGroup || new_user) {
        const send_data = []
        const uid = this.user.id
        if(!new_user) {      
          //delete
          this.orgData.group.map(item => {
            if(!_.includes(this.user.group, item)) {
              send_data.push({
                cmd:200,
                ...this.orgData.groupset[item]
              })
            }
          })
          //add
          this.user.group.map(item => {
            if(!_.includes(this.orgData.group, item)) {
              const g = this.GROUP_LIST.find(g => g.id === item)
              if(g) {
                send_data.push({
                  cmd:100,
                  id: 0,
                  gid: g.id,
                  uid
                })
              }
            }
          })
        } else {
          //add
          this.user.group.map(item => {
            const g = this.GROUP_LIST.find(g => g.id === item)
            if(g) {
              send_data.push({
                cmd:100,
                id: 0,
                gid: g.id,
                uid
              })
            }
          })
        }        
        await this.SET_USER_GROUP(send_data).then(() => {
          return true
        }).catch((error) => {
          this.alert(error.data.message)
          return false
        });
      }else{
        return true
      }
    },
    setGroupOption(list){
      this.grouplist = []
      list.map(i => {
        if(i.id>0) {
          this.grouplist.push({text: i.name, value: i.id})
        }
      })
    },
    
    resetData: function(){
      this.user = {
        id: 0,
        userid: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        group: [],
        groupset: []
      }
    }
  },
  created(){
    this.resetData()
  },
  mounted() {
    if(!_.isEmpty(this.userdata)){
      const obj = _.cloneDeep(this.userdata, true)
      Object.assign(this.user, obj)
      obj.UserGroup.map( g => {
        this.user.group.push(g.gid)
        this.user.groupset[g.gid] = g
      })
    }
    this.orgData = _.cloneDeep(this.user, true)
  }
}
</script>
