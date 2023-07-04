<template>
  <div class="container-fluid shadow">
    <div class="alert d-flex justify-content-between align-items-center">
      <div>
        <i class="fa fa-cog pr-2" aria-hidden="true"></i> 사용자 관리
      </div>
      <b-form inline>   
        <b-form-input
          v-model="txtSearchBox"
          @keypress="searchUser"
          class="rounded-1"
          placeholder="사용자 검색"
        ></b-form-input> 
        <b-button size="sm" class="btnPrimary" variant="primary" @click="clickAddUser" v-b-modal.modal_user_form>
          <i class="fa fa-pencil-square-o text-white" aria-hidden="true"></i>추가
        </b-button>
        <b-button size="sm" variant="dark" :disabled="editBtnState" @click="clickUpdateUser" v-b-modal.modal_user_form>
          <i class="fa fa-pencil text-white" aria-hidden="true"></i>수정
        </b-button>
        <b-button size="sm" variant="danger" :disabled="deleteBtnState" @click="deleteUser">
          <i class="fa fa-trash-o text-white" aria-hidden="true"></i>삭제
        </b-button>
      </b-form>
    </div>
    <el-table :columns="tbColumns" :tabledata="tabledata" @selectCheckbox="selectCheckbox" :cStyle="tbHeight" />
    <user-form-modal v-if="showUserModal" :is-update="isUpdateUser" :userdata="userFormData" @closeModal="closeModal"/>
     <group-setting />
  </div>
</template>

<script>
const user = 'user'
const group = 'group'
import {TYPE as GROUP_TYPE} from '@/store/modules/group'
import {TYPE as USER_TYPE} from '@/store/modules/user'
import { mapActions, mapGetters } from 'vuex'
import UserFormModal from '@/components/modals/UserFormModal.vue'
import GroupSetting from '@/components/modals/GroupSettingModal.vue'
import ElTable from '@/components/ElTable.vue'
export default {
  name: 'UserSetting',
  props:{
    sadmin:{
      type: Boolean,
      required: true,
      default: false
    },
    crud: {
      type: Object,
      required: true,
      default: () => {return { read: false, update: false, delete: false, create: false}}
    }
  },
  // YYYYMMDDhhmmss
  components:{
    UserFormModal,
    GroupSetting,
    ElTable
  },
  data() {
    return {
      tbHeight: "height: calc(100vh - 210px)",
      showUserModal: false,
      userFormData: {},
      txtSearchBox: '',
      selectedCheckbox: [],
      tabledata: [],
      tbColumns: [
        {width: "3%", text: "목록"},
        {text: "아이디"},
        {text: "이름"},
        {text: "이메일"},
        {text: "연력처"},
        {width: "20%", text: "그룹"},
      ],
    }
  },
  computed:{
    ...mapGetters(group, [
      GROUP_TYPE.GET.GROUP_LIST
    ]),
    ...mapGetters(user, [
      USER_TYPE.GET.USER_LIST
    ]),
    deleteBtnState(){
      return _.size(this.selectedCheckbox)?false: true
    },
    editBtnState(){
      return _.size(this.selectedCheckbox)===1?false: true
    },
    isUpdateUser(){
      return !_.isEmpty(this.userFormData)
    }
  },
  watch:{
    txtSearchBox(v) {
      let data = []
      if(_.isEmpty(v)) {
        data = _.cloneDeep(this.USER_LIST, true)
      }else{
        data = this.USER_LIST.filter(u => {
          if( u.name.indexOf(v) != -1 || 
              u.userid.indexOf(v) != -1 ||
              u.email.indexOf(v) != -1 ||
              u.phone.indexOf(v) != -1 
          ){
            return u
          }
        })
      }
      this.rendTableData(data)
    },
    USER_LIST(list) {
      this.rendTableData(list)
    },
  },
  methods:{
    ...mapActions(group, [
      GROUP_TYPE.AC.GET_GROUP_LIST,
    ]),
    ...mapActions(user, [
      USER_TYPE.AC.GET_USER_LIST,
      USER_TYPE.AC.SET_DELETE_USER
    ]),
    selectCheckbox: function(data){
      this.selectedCheckbox = _.cloneDeep(data,true)
    },
    deleteUser: function(){
      this.confirm("선택한 사용자계정을 삭제하시겠습니까?", (v)=>{
        if(v) {
          this.setLoading(true)
          const selectedIds = this.selectedCheckbox.map((userid) => {
            return {userid}
          })
          this.SET_DELETE_USER(selectedIds).then(res=>{
            this.setLoading(false)
            this.selectedCheckbox = []
            this.GET_USER_LIST().then((data) => {
              this.rendTableData(data)
            })
          }).catch(error =>{
            this.setLoading(false)
            const data = error && error.data
            if(data){
              this.alert(data.message);
            }
          })
        }
      }, {title:'경고'})
    },
    closeModal: function(){
      this.showUserModal = false
    },
    clickAddUser: function(){
      this.userFormData = {}
      this.showUserModal = true
    },
    clickUpdateUser: function(){
      if(_.size(this.selectedCheckbox)===1) {
        const selected_id = this.selectedCheckbox[0]
        const u = this.USER_LIST.filter(u => selected_id===u.id)
        if(!_.isEmpty(u)) {
          this.userFormData = _.cloneDeep(u[0],true)
        }
      }else{
        this.userFormData = {}
      }
      this.showUserModal = true
    },
    searchUser: function(e) {
      if(!_.size(this.USER_LIST)) {
        return e.preventDefault()
      }
    },
    rendTableData: function(raw_data) {
      const userlist = _.cloneDeep(raw_data,true)
      this.tabledata = []
      this.userFormData = {}
      this.selectedCheckbox = []
      if(!_.isEmpty(userlist)) {
        userlist.map((user,idx) => {
          let glabel = []
          let group = user.UserGroup || []
          if(_.size(group)) {
            group = group.map(g => {
              const ret = this.GROUP_LIST.find(gg => gg.id === g.gid)
              if(_.size(ret)) {
                g.gname =  ret.name
                glabel.push(ret.name)
              }
              return {...g}
            })
          }
          const data = {
            id: user.id,
            data: {
              index: idx+1,
              userid: user.userid,
              name: user.name,
              email: user.email,
              phone: user.phone,
              group: '<p class="wrap_text">'+glabel+'</p>',
            }
          }
          this.tabledata.push(data)
        })
      }
    },
  },  
  async created(){
    await this.GET_GROUP_LIST().then(()=>{
      this.GET_USER_LIST();
    })
  }
}
</script>