<template>
  <b-modal id="modal_vehicle_form" centered :title="getTitle" size="lg" footer-class="justify-content-end"  @hide="closeModal" v-model="modalShow">
    <b-row class="m-2 border rounded bg-light">
      <b-col md="7" class="text-left">
        <div class="p-3">
          <b-form>
            <label for="vcode">차량번호</label>
            <b-form-input
              autofocus 
              name="vcode"
              class="mb-2"
              placeholder="차량번호 입력하세요"
              size="sm"
              v-model="vehicle.vcode"
              :state="validateState('vcode')"
            ></b-form-input>

            <label for="vname">차량 이름</label>
            <b-form-input
              name="vname"
              class="mb-2"
              placeholder="차량ID 입력하세요"
              v-model="vehicle.name"
              :state="validateState('name')"
            ></b-form-input>

            <label for="vtype">차종</label>
            <b-form-select  
              name="vtype" 
              v-model="vehicle.type" 
              :options="vhTypeOptions" 
              :state="validateState('type')"
              size="sm" class="mb-2">
            </b-form-select>

            <label for="vmodel">모델명</label>
            <b-form-input
              name="vmodel"
              class="mb-2"
              placeholder="모델명 입력하세요"
              v-model="vehicle.model" 
            ></b-form-input>

            <label for="uphone">연식</label>
            <b-form-input
              name="uphone"
              class="mb-2"
              placeholder="연식 입력하세요"
              v-model="vehicle.myear" 
            ></b-form-input>            
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
              v-model="vehicle.group"
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
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">취소</b-button>
    <b-button class="rounded-1 btnPrimary" size="sm" :disabled="isDataChanged" @click="applyClick">{{btnApplyName}}</b-button>
    </template>
  </b-modal>
</template>

<script>
const group = 'group'
const vehicle = 'vehicle'
import {TYPE as GROUP_TYPE} from '@/store/modules/group'
import {TYPE as VH_TYPE} from '@/store/modules/vehicle'
import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from "vuelidate"
import { required } from "vuelidate/lib/validators"
export default {
  name: "VehicleFormModal",
  mixins: [validationMixin],
  props:{
    isUpdate:{
      type: Boolean,
      required: false,
      default: false
    },    
    vehicledata:{
      type: Object,
      required: false,
      default: () => { return {} }
    }
  },
  data(){
    return {
      vehicle: {},
      orgData:{},
      modalShow: false,
      selected: [],
      grouplist: [],
      tbhead: ["이름","설명"],
      vhTypeOptions: [
        { value: null, text: '차종 선택하세요' }
      ],
    }
  },
  validations: {
    vehicle: {
      vcode: {
        required
      },
      name: {
        required
      },
      type: {
        required
      }
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
    getTitle(){
      if(this.isUpdate) {
        return "청소차 수정"
      }
      return "청소차 등록"
    },
    btnApplyName(){
      if(this.isUpdate) {
        return "수정"
      }
      return "등록"
    },
    isDataChanged(){
      return _.isEqual(this.vehicle, this.orgData)
    },
    getGroupCount(){
      return _.size(this.grouplist)? true : false
    },
    isUpdateGroup() {
      return !_.isEqual(this.vehicle.group, this.orgData.group)
    },
  },
   watch:{
    GROUP_LIST(list){
      this.setGroupOption(list)
    },
    modalShow(v) {
      if(v) {
        this.GET_GROUP_LIST()
      }
    },
  },
  methods:{
    ...mapActions(group, [
      GROUP_TYPE.AC.GET_GROUP_LIST,
      GROUP_TYPE.AC.SET_VEHICLE_GROUP
    ]),
    ...mapActions(vehicle, [
      VH_TYPE.AC.GET_VEHICLE_GROUP,
      VH_TYPE.AC.GET_VEHICLE_LIST,
      VH_TYPE.AC.SET_UPDATE_VEHICLE,
      VH_TYPE.AC.SET_REGISTER_VEHICLE,
    ]),
    validateState: function(name) {
      const { $dirty, $error } = this.$v.vehicle[name];
      return $dirty ? !$error : null;
    },
    closeModal: function(){
      this.$emit('closeModal')
    },
    applyClick: function(){
      if(this.isUpdate) {
        if(this.updateVehicleGroup()) {
          this.SET_UPDATE_VEHICLE(this.vehicle).then((res) => {
            this.alert(res.message, (ok) =>{
              if(ok) {
                this.$emit('closeModal')
                  this.GET_VEHICLE_LIST()
              }
            })
          }).catch((error) => {
            this.alert(error.data.message)
          });
        }
      }else {
        this.$v.vehicle.$touch();
        if (this.$v.vehicle.$anyError) {
          return;
        }
        this.SET_REGISTER_VEHICLE(this.vehicle).then((res) => {
          const backup_group = _.cloneDeep(this.vehicle.group, true)
          this.vehicle = _.cloneDeep(res.data, true)
          this.vehicle.group = backup_group
          this.updateVehicleGroup(true)
          this.alert( res.message, (ok) =>{
            if(ok) {
              this.GET_VEHICLE_LIST().then(() =>{
                this.$emit('closeModal')
              })
            }
          })
        }).catch((error) => {
          this.alert(error.data.message)
        });
      }
    },
    updateVehicleGroup: async function(new_vehicle){
      if(this.isUpdateGroup || new_vehicle) {
        const send_data = []
        const vid = this.vehicle.id
        if(!new_vehicle) {      
          //delete
          this.orgData.group.map(item => {
            if(!_.includes(this.vehicle.group, item)) {
              send_data.push({
                cmd:200,
                ...this.orgData.groupset[item]
              })
            }
          })
          //add
          this.vehicle.group.map(item => {
            if(!_.includes(this.orgData.group, item)) {
              const g = this.GROUP_LIST.find(g => g.id === item)
              if(g) {
                send_data.push({
                  cmd:100,
                  id: 0,
                  gid: g.id,
                  vid
                })
              }
            }
          })
        }else {
          //add
          this.vehicle.group.map(item => {
            const g = this.GROUP_LIST.find(g => g.id === item)
            if(g) {
              send_data.push({
                cmd:100,
                id: 0,
                gid: g.id,
                vid
              })
            }
          })
        }        
        await this.SET_VEHICLE_GROUP(send_data).then(() => {
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
      this.grouplist = list.map(i => {
        return {text: i.name, value: i.id}
      })
    },
    resetData: function(){
      this.vehicle = {
        id: 0,
        vcode: '',
        name: '',
        type: null,
        model: '',
        myear: '',
        group: [],
        groupset: []
      }
    }
  },
  created(){
    this.resetData();
    this.VEHICLE_TYPES.map(type => {
      this.vhTypeOptions.push({value: type.id, text: type.name})
    })
  },
  mounted(){
    if(!_.isEmpty(this.vehicledata)){
      const obj = _.cloneDeep(this.vehicledata, true)
      Object.assign(this.vehicle, obj)
      obj.VehicleGroup.map( g => {
        this.vehicle.group.push(g.gid)
        this.vehicle.groupset[g.gid] = g
      })
    }
    this.orgData = _.cloneDeep(this.vehicle, true)
  }
}
</script>
