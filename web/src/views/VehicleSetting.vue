<template>
  <div class="container-fluid shadow">
    <div class="alert d-flex justify-content-between align-items-center">
      <div>
        <i class="fa fa-cog pr-2" aria-hidden="true"></i>청소차 관리
      </div>
      <b-form inline>   
        <b-form-input
          v-if="crud.read"
          class="rounded-1"
          v-model="txtSearchBox"
          @keypress="searchVehicle"
          placeholder="차량번호 검색"
        ></b-form-input> 
        <b-button v-if="crud.create" size="sm" class="btnPrimary" @click="clickAdd" v-b-modal.modal_vehicle_form>
          <i class="fa fa-plus text-white" aria-hidden="true"></i>추가
        </b-button>
        <b-button v-if="crud.update" size="sm" variant="dark" :disabled="editBtnState" @click="clickUpdate" v-b-modal.modal_vehicle_form>
          <i class="fa fa-pencil text-white" aria-hidden="true"></i>수정
        </b-button>
        <b-button v-if="crud.delete" size="sm" class="btn-danger" @click="deleteVehicle" :disabled="deleteBtnState">
          <i class="fa fa-trash-o text-white" aria-hidden="true"></i>삭제
        </b-button>
      </b-form>
    </div>
    <el-table :columns="tbColumns" :tabledata="tabledata" @selectCheckbox="selectCheckbox" :cStyle="tbHeight" :showcheckbox="(crud.update || crud.delete)"/>

    <vehicle-form-modal v-if="(crud.create || crud.update) && showVehicleModal" :is-update="isUpdateVehicle" :vehicledata="vehicleFormData" @closeModal="closeModal" />
     <group-setting v-if="crud.create && crud.update" />
  </div>
</template>

<script>
const user = 'user'
const group = 'group'
const vehicle = 'vehicle'
import {TYPE as GROUP_TYPE} from '@/store/modules/group'
import {TYPE as VH_TYPE} from '@/store/modules/vehicle'
import {TYPE as USER_TYPE} from '@/store/modules/user'
import { mapActions, mapGetters } from 'vuex'
import VehicleFormModal from '@/components/modals/VehicleFormModal.vue'
import GroupSetting from '@/components/modals/GroupSettingModal.vue'
import ElTable from '@/components/ElTable.vue'
export default {
  name: 'VehicleSetting',
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
  components:{
    ElTable,
    VehicleFormModal,
    GroupSetting
  },
  data() {
    return {
      tbHeight: "height: calc(100vh - 210px)",
      showVehicleModal: false,
      vehicleFormData: {},
      txtSearchBox: '',
      selectedCheckbox: [],
      tabledata: [],
      tbColumns: [
        {width: "3%", text: "목록"},
        {text: "차량 아이디"},
        {text: "차량 이름"},
        {text: "차종"},
        {text: "모델명"},
        {text: "연식"},
        {width: "20%", text: "그룹"},
      ],
    }
  },
  computed:{
    ...mapGetters(group, [
      GROUP_TYPE.GET.GROUP_LIST
    ]),
    ...mapGetters(vehicle, [
      VH_TYPE.GET.VEHICLE_LIST,
      VH_TYPE.GET.VEHICLE_TYPES
    ]),
    ...mapGetters(user,[
      USER_TYPE.GET.MY_INFO
    ]),
    deleteBtnState(){
      return _.size(this.selectedCheckbox)?false: true
    },
    editBtnState(){
      return _.size(this.selectedCheckbox)===1?false: true
    },
    isUpdateVehicle(){
      return !_.isEmpty(this.vehicleFormData)
    }
  },
  watch:{
    txtSearchBox(search) {
      let data = []
      if(_.isEmpty(search)) {
        data = _.cloneDeep(this.VEHICLE_LIST, true)
      }else{
        data = this.VEHICLE_LIST.filter(v => {
          if( v.name.indexOf(search) != -1 || 
              v.vcode.indexOf(search) != -1 
          ){
            return v
          }
        })
      }
      this.rendTableData(data)
    },
    VEHICLE_LIST(list) {
      this.rendTableData(list)
    }
  },
  methods:{
    ...mapActions(group, [
      GROUP_TYPE.AC.GET_GROUP_LIST,
    ]),
    ...mapActions(vehicle, [
      VH_TYPE.AC.GET_VEHICLE_LIST,
      VH_TYPE.AC.SET_DELETE_VEHICLE,
      VH_TYPE.AC.GET_VEHICLE_TYPES,
    ]),
    ...mapActions(user, [
      USER_TYPE.AC.GET_USER_GROUP,
    ]),
    selectCheckbox: function(data){
      this.selectedCheckbox = _.cloneDeep(data,true)
    },
    deleteVehicle: function(){
      this.confirm("선택한 청소차를 삭제하시겠습니까?", (v)=>{
        if(v) {
          this.setLoading(true)
          const selectedIds = this.selectedCheckbox.map((vehicleid) => {
            return {vehicleid}
          })
          this.SET_DELETE_VEHICLE(selectedIds).then(res=>{
            this.setLoading(false)
            this.selectedCheckbox = []
            this.GET_VEHICLE_LIST().then((data) => {
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
      this.showVehicleModal = false
    },
    clickAdd: function(){
      this.vehicleFormData = {}
      this.showVehicleModal = true
    },
    clickUpdate: function(){
      if(_.size(this.selectedCheckbox)===1) {
        const selected_id = this.selectedCheckbox[0]
        const v = this.VEHICLE_LIST.filter(v => selected_id===v.id)
        if(!_.isEmpty(v)) {
          this.vehicleFormData = _.cloneDeep(v[0],true)
        }
      }else{
        this.vehicleFormData = {}
      }
      this.showVehicleModal = true
    },
    searchVehicle: function(e) {
      if(!_.size(this.VEHICLE_LIST)) {
        return e.preventDefault()
      }
    },
    rendTableData: function(raw_data) {
      const vlist = _.cloneDeep(raw_data,true)
      this.tabledata = []
      this.vehicleFormData = {}
      this.selectedCheckbox = []
      if(!_.isEmpty(vlist)) {
        vlist.map((vehicle,idx) => {
          let glabel = []
          let group = vehicle.VehicleGroup || []
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
            id: vehicle.id,
            data: {
              index: idx+1,
              vcode: vehicle.vcode,
              name: vehicle.name,
              typeName: vehicle.VehicleType.name,
              model: vehicle.model,
              myear: vehicle.myear,
              group: '<p class="wrap_text">'+glabel+'</p>',
            }
          }
          this.tabledata.push(data)
        })
      }
    },
  },
  async created(){
    if(this.sadmin) {
      await this.GET_GROUP_LIST().then(()=>{
        this.GET_VEHICLE_TYPES();
        this.GET_VEHICLE_LIST();
      })
    } else {
      await this.GET_USER_GROUP({userid: this.MY_INFO.id}).then(()=>{
        this.GET_VEHICLE_TYPES();
        this.GET_VEHICLE_LIST();
      })
    }
  }
}
</script>
