<template>
  <div class="vcard p-1 mb-2 mt-1 shadow">
    <b-list-group class="h-100 w-100">
      <b-list-group-item class="p-0">
        <div class="d-flex align-items-center p-1 justify-content-between">
          <span>
            <div class="btn btnctrl shadow" v-b-tooltip.hover :title="$i18n.t('VH.status')" :class="{active: btnActive===1}" @click="clickActive(1)">
              <i class="fa fa-car"></i>
            </div>
            <div class="btn btnctrl shadow" v-b-tooltip.hover :title="$i18n.t('Dash.txt_event_log')" :class="{active: btnActive===2}" @click="clickActive(2)">
              <i class="fa fa-bell" aria-hidden="true"></i>
            </div>
          </span>
          <div class="h-100 d-flex align-items-center">
            <b-button variant="primary" @click="showDetail">
              <small>
                {{$i18n.t('VH.no')}}:
              </small>
              <b-badge variant="light">{{data.vcode}} <span class="sr-only">{{data.vcode}}</span></b-badge>
            </b-button>
          </div>
        </div>
      </b-list-group-item>
      <b-list-group-item class="w-100 m-0 p-0 bg-dark" v-if="btnActive>0">
        <div v-if="btnActive===1" class="contentdiv">
          <table class="table table-dark table-sm mb-0">
            <colgroup>
              <col width="40%">
            </colgroup>
            <tbody>
              <tr>
                <th class="align-middle" scope="row">{{$i18n.t('VH.speed')}}</th>
                <td>{{data.speed}} km/h</td>
              </tr>
              <tr>
                <th class="align-middle" scope="row">{{$i18n.t('VH.sys_mode')}}</th>
                <td>{{getSystemStatus}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="btnActive===2" class="contentdiv cscrollbar" v-autoscroll="{ smooth: true}" id="event_container">
          <template v-if="eventlist.length">
            <div v-for="(e,idx) in eventlist" :key="idx">
               <b-list-group-item href="#" class="flex-column align-items-start bg-light rounded mt-1">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">{{e.payload.idx}}-{{getEventName(e.header.Code)}}</h6>
                  <small class="text-muted">{{getDateTime(e.header.Datetime)}}</small>
                </div>
                <small class="text-muted">
                  {{e.payload}}
                </small>
              </b-list-group-item>
            </div>
          </template>
          <template v-else>
            <div class="text-center">{{$i18n.t('Dash.txt_no_event')}}</div>
          </template>
        </div>
      </b-list-group-item>      
    </b-list-group>
  </div>
</template>

<script>
var testIdx = 1;
const vehicle = 'vehicle'
import {TYPE as VH_TYPE} from '@/store/modules/vehicle'
import { mapGetters } from 'vuex'
export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  name: "VehiclePopup",
  data(){
    return{
      btnActive: 1,
      vehicleState: 0,
      eventlist:[],
      isRemoveEvent: false,     
      eventNames: {}
    }
  },
  computed:{
    ...mapGetters(['getUILang']),
    ...mapGetters(vehicle, [
      VH_TYPE.GET.VEHICLE_LIST
    ]),
    getSystemStatus() {
      let ret = ''
      const vehicle_state = code.vehicle.state
      const state = this.vehicleState
      if(state & vehicle_state.on) {
        ret = this.$i18n.t('VH.mode.on')+'  '
      } else {
        ret = this.$i18n.t('VH.mode.off')+'  '
      }
      if(state & vehicle_state.clean_mode) {
        ret += this.$i18n.t('VH.mode.clean')+'  '
      }
      if(state & vehicle_state.autonomous_mode) {
        ret += this.$i18n.t('VH.mode.auto')+'  '
      }
      if(state & vehicle_state.charge_mode) {
        ret += this.$i18n.t('VH.mode.charge')+'  '
      }
      if(state & vehicle_state.parking_mode) {
        ret += this.$i18n.t('VH.mode.parking')
      }
      return ret
    },
  },
  watch:{
    vehicleState(v){
      if(this.data.state !== v) {
        this.data.state = v
      }
    },
    VEHICLE_LIST(v){
      v.map(vh => {
        if(this.data.id === vh.id) {
          this.vehicleState = vh.state
        }
      })
    },
    eventlist(v){
      if(v.length> 100 && this.isRemoveEvent === false) {
        setTimeout(()=>{
          this.isRemoveEvent = true
          for(let i=0;i<30;i++){
            v.shift()
          }
          this.isRemoveEvent = false
        },1000);
      }
    },
    getUILang(v){
      this.eventNames = this.getComEventList()
    }
  },
  methods: {
    clickActive(val){
      if(this.data) {
        this.vehicleState = this.data.state
      }
      if(this.btnActive !== val){
        this.btnActive = val
      }
    },
    showDetail(){
      this.$emit('showDetail', this.data)
    },
    updateData(d) {
      this.data = d
    },
    getEventName(evtCode){
      return this.eventNames[evtCode]
    },
    getDateTime(Datetime) {
      return this.moment(Datetime,'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD A hh:mm:ss')
    },
    getComEventList(){
      return {
        //Command
        [code.cmd.set_login]: this.$i18n.t('ComEvent.c_login'),
        [code.cmd.set_logout]: this.$i18n.t('ComEvent.c_logout'),
        [code.cmd.set_route]: this.$i18n.t('ComEvent.c_route'),      
        [code.cmd.set_charge]: this.$i18n.t('ComEvent.c_charge'),
        [code.cmd.set_garage]: this.$i18n.t('ComEvent.c_garage'),
        [code.cmd.set_streaming_info]: this.$i18n.t('ComEvent.c_stream_info'),
        [code.cmd.set_streaming_start]: this.$i18n.t('ComEvent.c_stream_start'),
        [code.cmd.set_streaming_stop]: this.$i18n.t('ComEvent.c_stream_stop'),
        [code.cmd.set_clean_route]: this.$i18n.t('ComEvent.c_clean_route'),
        [code.cmd.set_self_driving]: this.$i18n.t('ComEvent.c_autonomous'),
        [code.cmd.set_cleaning]: this.$i18n.t('ComEvent.c_cleaning'),
        [code.cmd.set_emergency]: this.$i18n.t('ComEvent.c_emergency'),
        //Event
        [code.evt.update_info]: this.$i18n.t('ComEvent.e_update_info'),
      }
    }
  },
  created(){
    this.eventNames = this.getComEventList()
  },
  mounted(){
    socket.on(code.commands, (data) => {
      const {Code, VID} = data.header
      switch(Code) {
        case code.cmd.set_clean_route:
        case code.cmd.set_login:
        case code.cmd.set_logout:
        case code.cmd.set_self_driving:
        case code.cmd.set_cleaning:
        case code.cmd.set_charge:
        case code.cmd.set_emergency:
          if(VID === this.data.id){
            data.payload = {...data.payload, idx:testIdx++}
            this.eventlist.push(data)
          }
          break;
        default:
          break;
      }
    })
    socket.on(code.events, (data) => {
      const {Code, VID} = data.header
      // switch(Code) {        
      //   case code.evt.update_info:
      //     if(VID === this.data.id){
      //       data.payload = {...data.payload, idx:testIdx++}
      //       this.eventlist.push(data)
      //     }
      //     break;
      //   default:
      //     break
      // }
    })
  }
}
</script>

<style lang="scss" scoped>
.vcard {    
  border-radius: 3px;
  .list-group-item{
    background: #8fc12b;
  }
}
.btnctrl {
  height: 40px;
  width: 40px;
  padding: 5px;
  margin: 2px 3px;
  border-radius: 50%;
  color: #343a40;
  background: #cddc39;
  background-image: linear-gradient(310deg, #d7f5a0 0%, #90d900 100%);
  border: 4px solid #b1f32e;
  &.active,
  &:hover{
    color: rgb(255, 255, 255);
    background: rgb(53, 114, 4);;
    border: 4px solid #aaee23;
  }
}
.contentdiv{
  color: #FFF;
  min-width:300px;
  max-width: 400px;
  // min-height:160px;
  max-height: 200px;
  padding: 10px;
  overflow: auto;
}
</style>
