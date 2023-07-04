<template>
  <b-modal id="modal-group-setting" centered title="그룹 설정" size="xxl" v-model="modalShow">
    <b-row class="mb-3">
      <b-col md="7" class="pr-2 pl-3 text-left">
        <div class="alert mb-0 p-1 bg-light border rounded-0">그룹 등록</div>
          <div class="p-2 border">
            <b-form inline>
              <label for="group_Name" class="p-2">이름</label>
              <b-form-input
                autofocus
                name="group_Name"
                class="mb-2 mr-sm-2 mb-sm-0"
                placeholder="그룹이름 입력하세요"
                v-model="newGroup.name"
              ></b-form-input>
              <label for="group_desc" class="p-2">설명</label>
              <b-form-input
                name="group_desc"
                class="mb-2 mr-sm-2 mb-sm-0"
                placeholder="설명  입력하세요"
                v-model="newGroup.desc"
              ></b-form-input>
              <b-button class="b-minw rounded-1 btnPrimary" size="sm" @click="addNewGroup">등록</b-button>
            </b-form>
          </div>
        <div class="alert mt-4 mb-0 p-1 bg-light border rounded-0">
          <div class="alert mb-0 p-0 bg-light rounded-0 d-flex justify-content-between align-items-center">
            <span>그룹 목록</span>
            <div>
              <b-button squared variant="dark" size="sm" :disabled="isGroupSelected" @click="updateGroupInfo" v-b-modal.modal_update_group>
                <i class="fa fa-pencil" aria-hidden="true"></i>
              </b-button>
              <b-button squared class="ml-2" variant="danger" size="sm" :disabled="isGroupSelected" @click="deleteGroup">
                <i class="fa fa-trash-o" aria-hidden="true"></i>
              </b-button>
            </div>
          </div>
        </div>
        <div class="table-box border">
          <el-table :columns="tbhead" :tabledata="tb_group" @selectCheckbox="setckGroups" :cStyle="tbHeight" :h100="true" :showcheckbox="false" :singleSelection="true"/>
        </div>
      </b-col>
      <b-col md="5" class="ml-auto pr-3 pl-2 text-left">
        <div class="h-50 border">
          <div class="alert mb-0 p-1 bg-light rounded-0 d-flex justify-content-between align-items-center">
            <span>충전소 위치</span>
            <div>
              <span id="charge-add-wrapper" class="d-inline-block">
                <b-button squared variant="outline-primary" size="sm" :disabled="isGroupSelected" @click="setShowChargeModal('add')" v-b-modal.modal_charge_station>
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </b-button>
              </span>
              <b-tooltip v-if="isGroupSelected" target="charge-add-wrapper">
                <small>그룹을 먼저 선택하세요.</small>
              </b-tooltip>
              
              <b-button squared class="ml-2" variant="outline-dark" size="sm" :disabled="isChargeSingleSelected" @click="setShowChargeModal('update')" v-b-modal.modal_charge_station>
                <i class="fa fa-pencil" aria-hidden="true"></i>
              </b-button>
              <b-button squared class="ml-2" variant="outline-danger" size="sm" :disabled="isChargeSelected" @click="deleteGroupCharge">
                <i class="fa fa-trash-o" aria-hidden="true"></i>
              </b-button>
            </div>
          </div>
          <div class="table-box mb-2">
            <el-table :columns="tbhead1" :tabledata="tb_charge" @selectCheckbox="setckCharges" :noDataImage="noChargeImg" />
          </div>
        </div>
        <div class="h-50 border">
          <div class="alert mb-0 p-1 bg-light rounded-0 d-flex justify-content-between align-items-center">
            <span>종료 지점</span>
            <div>
              <span id="garage-add-wrapper" class="d-inline-block">
                <b-button squared variant="outline-primary" size="sm" :disabled="isGroupSelected" @click="setShowGarageModal('add')" v-b-modal.modal_garage_station>
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </b-button>
              </span>
              <b-tooltip v-if="isGroupSelected" target="garage-add-wrapper">
                <small>그룹을 먼저 선택하세요.</small>
              </b-tooltip>

              <b-button squared class="ml-2" variant="outline-dark" size="sm" :disabled="isGarageSingleSelected" @click="setShowGarageModal('update')" v-b-modal.modal_garage_station>
                <i class="fa fa-pencil" aria-hidden="true"></i>
              </b-button>
              <b-button squared class="ml-2" variant="outline-danger" size="sm" :disabled="isGarageSelected" @click="deleteGroupGarage">
                <i class="fa fa-trash-o" aria-hidden="true"></i>
              </b-button>
            </div>
          </div>
          <div class="table-box">
            <el-table :columns="tbhead1" :tabledata="tb_garage" @selectCheckbox="setckGarages" :noDataImage="noGarageImg" :cStyle="garage_style"/>
          </div>
        </div>
      </b-col>
    </b-row>
    <template #modal-footer="{ ok, cancel, hide }">
    <b-button class="rounded-1 btnPrimary" size="sm" @click="hide('forget')">닫기</b-button>
    <update-group-modal v-if="showUpdateGroupModal" :group="updateGroup" @closeGroupUpdate="closeGroupUpdate" />
    <charge-modal v-if="showChargeModal" :updateObject="chargeUpdate" :selectgroup="updateGroup" @closeGroupCharge="closeGroupCharge" />
    <garage-modal v-if="showGarageModal" :updateObject="garageUpdate" :selectgroup="updateGroup" @closeGroupGarage="closeGroupGarage" />
    </template>
  </b-modal>
</template>

<script>
const group = 'group'
import {TYPE} from '@/store/modules/group'
import { mapActions, mapGetters } from 'vuex'
import ChargeModal from './ChargeModal.vue'
import GarageModal from './GarageModal.vue'
import ElTable from '@/components/ElTable.vue'
import UpdateGroupModal from './UpdateGroupModal.vue'
export default {
  name: "GroupSetting",
  data(){
    return {
      modalShow: false,
      chargeUpdate: {},
      garageUpdate: {},
      newGroup:{
        name: '',
        desc: ''
      },
      tbhead: [
        {text: "이름"},
        {text: "설명"},
        {text: "관련 정보"}
      ],
      tbhead1: [
        {text: "이름"},
        {text: "주소"}
      ],
      tbHeight: "min-height: 50vh",
      garage_style: "height: 40%",
      tb_group: [],
      tb_garage: [],
      tb_charge: [],
      sckGroups: [],
      sckGarages: [],
      sckCharges: [],

      groups: [],
      garages: [],
      charges: [],
      updateGroup: {},
      showUpdateGroupModal: false,
      showChargeModal: false,
      showGarageModal: false,
      noChargeImg: require('@/assets/img/settings/charging_route_register.png'),
      noGarageImg: require('@/assets/img/settings/return_route_register.png')
    }
  },
  components:{
    ElTable,
    UpdateGroupModal,
    ChargeModal,
    GarageModal
  },
  computed: {
    ...mapGetters(group, [
      TYPE.GET.GROUP_LIST,
      TYPE.GET.GROUP_GARAGE,
      TYPE.GET.GROUP_CHARGE,
      TYPE.GET.GROUP_GARAGE_MAP,
      TYPE.GET.GROUP_CHARGE_MAP,
    ]),
    isNoGroup(){
      return !_.size(this.groups)
    },
    isNoGroupGarage(){
      return !_.size(this.garages)
    },
    isNoGroupCharge(){
      return !_.size(this.charges)
    },
    isGroupSelected() {
      return !_.size(this.sckGroups)
    },
    isChargeSingleSelected() {
      if(_.size(this.sckCharges) === 1){
        return false        
      }else{
        return true
      }
    },
    isChargeSelected() {
      return !_.size(this.sckCharges)
    },
    isGarageSingleSelected() {
      if(_.size(this.sckGarages) === 1){
        return false        
      }else{      
        this.garageUpdate = {}
        return true
      }
    },
    isGarageSelected() {
      return !_.size(this.sckGarages)
    }
  },
  watch:{
    GROUP_LIST:{
      handler(v){
        this.setGroupData(v)
      },
      deep: true
    },
    GROUP_GARAG: {
      handler(v){
        this.setGarageData(v)
      },
      deep: true
    },
    GROUP_CHARGE: {
      handler(v){
        this.setChargeData(v)
      },
      deep: true
    },
    async modalShow(v) {
      if(v) {
        await this.loadGroupInfo()
      }
    }
  },
  methods:{
    ...mapActions(group, [
      TYPE.AC.GET_GROUP_LIST,
      TYPE.AC.ADD_NEW_GROUP,
      TYPE.AC.DELETE_GROUP,
      TYPE.AC.SET_GROUP_CHARGE_STATION,
      TYPE.AC.SET_GROUP_GARAGE
    ]),
    loadGroupInfo: async function(){
      await this.GET_GROUP_LIST().then(() => {
        if(!_.isEqual(this.garages, this.GROUP_GARAGE)){
          this.setGarageData(this.GROUP_GARAGE)
        }
        if(!_.isEqual(this.charges, this.GROUP_CHARGE)){
          this.setChargeData(this.GROUP_CHARGE)
        }
      })
    },
    closeGroupUpdate: function(){
      this.updateGroup = {}
      this.showUpdateGroupModal = false
    },
    closeGroupCharge: async function(){
      this.updateGroup = {}
      this.chargeUpdate = {}
      this.showChargeModal = false
    },
    closeGroupGarage: async function(){
      this.updateGroup = {}
      this.garageUpdate = {}
      this.showGarageModal = false
    },
    setShowChargeModal(subcmd){
      this.updateGroupInfo()
      if(_.size(this.sckCharges) === 1 && subcmd === 'update'){
        const obj = this.GROUP_CHARGE.filter(i=>i.id === this.sckCharges[0])
        this.chargeUpdate = obj[0]
      }else{
        this.chargeUpdate = null
      }
      this.showChargeModal = true
    },
    setShowGarageModal(subcmd) {
      this.updateGroupInfo()
      if(_.size(this.sckGarages) === 1 && subcmd === 'update'){
        const obj = this.GROUP_GARAGE.filter(i=>i.id === this.sckGarages[0])
        this.garageUpdate = obj[0]
      }else{
        this.garageUpdate = null
      }
      this.showGarageModal = true
    },
    updateGroupInfo() {
      if(_.size(this.sckGroups)) {
        this.showUpdateGroupModal = true      
        const obj = this.GROUP_LIST.filter(i=>i.id === this.sckGroups[0])
        const {id,name,desc} = obj[0]
        this.updateGroup = {id,name,desc}
      }
    },
    setGroupData: function(v) {
      this.garages = v
      this.tb_group = []
      v.map(o => {
        const {id,name,desc} = o
        let other = ''
        let n = 0
        if(_.has(o,'CleanRoute') && _.size(o.CleanRoute)) {
          n = _.size(o.CleanRoute)
          other+=' <i class="fa fa-map" aria-hidden="true"></i> : '+n
        }
        if(_.has(o,'UserGroup') && _.size(o.UserGroup)) {
          n = _.size(o.UserGroup)
          other+=' <i class="fa fa-user" aria-hidden="true"></i> : '+n
        }
        if(_.has(o,'VehicleGroup') && _.size(o.VehicleGroup)) {
          n = _.size(o.VehicleGroup)
          other+=' <i class="fa fa-train" aria-hidden="true"></i> : '+n
        }
        const data = {
            id,
            data: {
              name: '<p class="wrap_text">'+name+'</p>',
              desc: '<p class="wrap_text">'+desc+'</p>',
              other: '<p class="wrap_text w-100 text-right">'+other+'</p>',
            }
          }
        this.tb_group.push(data)
      })
    },
    setChargeData: function(v) {
      this.charges = v
      this.tb_charge = []
      v.map(o => {
        const {id,name,address} = o
        const data = {
            id,
            data: {
              name: '<p class="wrap_text">'+name+'</p>',
              address: '<p class="wrap_text">'+address+'</p>',
            }
          }
        this.tb_charge.push(data)
      })
    },
    setGarageData: function(v) {
      this.garages = v
      this.tb_garage = []
      v.map(o => {
        const {id,name,address} = o
        const data = {
            id,
            data: {
              name: '<p class="wrap_text">'+name+'</p>',
              address: '<p class="wrap_text">'+address+'</p>',
            }
          }
        this.tb_garage.push(data)
      })
    },
    setckGroups: function(d){  
      this.newGroup = {name:'', desc: ''}
      this.sckGroups = _.cloneDeep(d,true)
      let c = [] //charge
      let g = [] //garage
      if(_.size(d) == 1) {
        c = this.GROUP_CHARGE_MAP[d[0]]
        g = this.GROUP_GARAGE_MAP[d[0]]
      }else{
        c = this.GROUP_CHARGE
        g = this.GROUP_GARAGE
      }
      this.setChargeData(c)
      this.setGarageData(g)
    },
    setckGarages: function(d){
      this.sckGarages = _.cloneDeep(d,true)
    },
    setckCharges: function(d){
      this.sckCharges = _.cloneDeep(d,true)
    },
    deleteGroupGarage: function() {
      this.confirm("선택한 종료 지점를 삭제하시겠습니까?", (v)=>{
        if(v) {
          const selection = this.GROUP_GARAGE.filter(gc => this.sckGarages.includes(gc.id))
          let deletelist = []
          selection.map(g => {
            const {id,gid} = g
            const d = { id, gid, cmd: 200}
            deletelist.push(d)
          })
          if(_.size(deletelist)) {
            this.setLoading(true)
            this.SET_GROUP_GARAGE(deletelist).then(res=>{
              this.setLoading(false)
              this.sckCharges = []
              this.loadGroupInfo()
            }).catch(error =>{
              this.setLoading(false)
              const data = error && error.data
              if(data){
                this.alert(data.message);
              }
            })
          }
        }
      }, {title:'경고',})
    },
    deleteGroupCharge: function() {
      this.confirm("선택한 충전소를 삭제하시겠습니까?", (v)=>{
        if(v) {
          const selection = this.GROUP_CHARGE.filter(gc => this.sckCharges.includes(gc.id))
          let deletelist = []
          selection.map(g => {
            const {id,gid} = g
            const d = { id, gid, cmd: 200}
            deletelist.push(d)
          })
          if(_.size(deletelist)) {
            this.setLoading(true)
            this.SET_GROUP_CHARGE_STATION(deletelist).then(res=>{
              this.setLoading(false)
              this.sckCharges = []
              this.loadGroupInfo()
            }).catch(error =>{
              this.setLoading(false)
              const data = error && error.data
              if(data){
                this.alert(data.message);
              }
            })
          }
        }
      }, {title:'경고',})
    },
    deleteGroup: function(){
      this.confirm("그롭의 관련 정보를 삭제할겁니다. 선택한 그롭를 삭제하시겠습니까?", (v)=>{
        if(v) {
          this.setLoading(true)
          const l = this.sckGroups.map(id => {
            return {groupid: id}
          })
          this.DELETE_GROUP(l).then(res=>{
            this.setLoading(false)
            this.sckGroups = []
          }).catch(error =>{
            this.setLoading(false)
            const data = error && error.data
            if(data){
              this.alert(data.message);
            }
          })
        }
      }, {title:'<i class="fa fa-exclamation-triangle text-warning" aria-hidden="true"></i>경고', size:'md'})
    },
    addNewGroup: function(){
      const data = _.cloneDeep(this.newGroup, true)
      this.ADD_NEW_GROUP(data).then((res) =>{
        this.newGroup = {name:'', desc: ''}
        $("input[name=group_Name]").focus()
      }).catch((error) => {
        const msg = error.data.message
        if(msg) {
          this.alert(msg, (ok) => {
            if(ok) {
              setTimeout(() => {
                $("input[name=group_Name]").focus().select()
              }, 500);
            }
          })
        }
      });
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-xl{
  .modal-footer{
    justify-content: end;
    button{
      width: auto;
      min-width: 80px;
    }
  }
  .modal-body{
    .row{
      // min-height: 400px;
      margin-bottom: 0px !important;
      .table {
        thead th{
          font-weight: bold;
          vertical-align: middle;
        }
        tbody {
          tr.noData{
            &:hover{
              background: #FFF;
            }
          }
        }
      } 
    }
  }
}
</style>