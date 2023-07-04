<template>
  <div class="vcard p-1 mb-2 mt-1" style="cursor: pointer">
    <b-list-group class="pn">
      <b-list-group-item class="d-flex align-items-center p-2 border-bottom-0">
        <div :class="data.status">
          <span class="blink"></span>
        </div>
        <b-img :src="data.image" rounded="circle" :alt="data.vcode" width="50px"></b-img>
        <span class="pl-2 text-primary font-weight-bold">
          {{$t('Dash.txt_op_man')}}
        </span>
      </b-list-group-item>
      <b-list-group-item class="d-flex align-items-center p-0 pl-2 pr-3">     
        <table class="table table-sm mb-0">
          <colgroup>
            <col>
            <col width="60%">
          </colgroup>
          <tbody>
            <tr>
              <td class="text-center">
                <b-badge pill class="py-2 badge1" :class="{on:isAutoMode}">
                {{isAutoMode===true?$t('txt_on'):$t('txt_off')}}
                </b-badge>
              </td>
              <th class="align-middle" scope="row">{{$t('Dash.txt_autonomous')}}</th>        
              <td>
                <b-button @click="setAutoMode(!isAutoMode)" :disabled="!isEngineOn" class="rounded-1 ssm btnPrimary outline" size='sm' variant="primary">{{isAutoMode===true?$t('Dash.btn_set_off'):$t('Dash.btn_set_on')}}</b-button>
              </td>
            </tr>

            <tr>
              <th class="align-middle w-100" colspan="3">
                <div class="d-flex align-items-center">
                  ROUTE
                  <b-form-input class="ml-1" v-model="data.clean_route_id" type="number" placeholder="Enter Number"></b-form-input>
                  <b-button  @click="setRoute()" class="rounded-1 ssm btnPrimary outline ml-2" size='sm' variant="primary">SET</b-button>
                </div>              
              </th>
            </tr>
          </tbody>
        </table>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => {}
    },
    cameraOn: {
      type: Number,
      required: true,
      default: 0
    }
  },
  name: "VehicleCardRowDetail",
  data(){
    return{
      btnActive: 1,
      vehicleState: 0,
      currentTimeout: -1,
      isShowCtrlBtn: false,
      txtRoute: 0,
    }
  },
  computed:{
    isEngineOn(){
      return (this.data.state & code.vehicle.state.on)?true:false
    },
    isAutoMode(){
      return (this.data.state & code.vehicle.state.autonomous_mode)?true:false
    },
    isCleanMode(){
      return (this.data.state & code.vehicle.state.clean_mode)?true:false
    },
    isChargeMode(){
      return (this.data.state & code.vehicle.state.charge_mode)?true:false
    },
    isParkMode(){
      return (this.data.state & code.vehicle.state.parking_mode)?true:false
    }
  },
  watch:{
    data:{
      handler(v) {
        if((v.state & code.vehicle.state.on) == 0){
          this.$emit('setStreamStatus', this.data.id, false, this.data.camera_stream)
        }
      },
      deep: true
    },
  },
  methods: {
    setEngineOff: function() {
      this.confirm(this.$i18n.t('Dash.txt_dgl_engine_off_msg'), (v)=>{
        if(v) {
          this.vehicleState |= code.vehicle.state.on
          this.$emit('setEngine', this.data.id)
        }
      }, {title:'<i class="fa fa-exclamation-triangle text-warning" aria-hidden="true"></i>'+this.$i18n.t('txt_alert_warning')})      
    },
    setAutoMode: function(flag) {
      if(flag) this.vehicleState |= code.vehicle.state.autonomous_mode
      else this.vehicleState &= ~code.vehicle.state.autonomous_mode
      this.$emit('setAutoMode', this.data.id, flag)
    },
    setCleanMode: function(flag) {
      if(flag) this.vehicleState |= code.vehicle.state.clean_mode
      else this.vehicleState &= ~code.vehicle.state.clean_mode
      this.$emit('setCleanMode', this.data.id, flag)
    },
    setChargeMode: function(flag) {
      this.setCleanMode(false)
      if(flag) this.vehicleState |= code.vehicle.state.charge_mode
      else this.vehicleState &= ~code.vehicle.state.charge_mode
      this.$emit('setCharge', this.data.id, flag)
    },
    setRoute: function() {
      this.$emit('setRoute', this.data.id, this.data.clean_route_id);
    },
  },
  beforeDestroy(){
    this.$emit('setStreamStatus', this.data.id, false, this.data.camera_stream)
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .9s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.vcard {
  color: black;
  border-radius: 3px;
  // background: #2196f3;
  // border: 3px solid #2196f3;
}
div.offline {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 4px;
  background-color: #292929;
  border-radius: 50%;  
  position: relative;
}
div.online {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 4px;
  background-color: #0fcc45;
  border-radius: 50%;  
  position: relative;
  .blink {
    background-color: #0fcc45;
    animation: blink 1s linear infinite;
  }
}
span.blink {
  display: block;
  width: 15px;
  height: 15px;  
  opacity: 0.7;
  border-radius: 50%;
}
/*Animations*/
@keyframes blink {
  100% { 
    transform: scale(2, 2); 
    opacity: 0;
  }
}
.badge1{
  width:50px;
  &.on{
    color: #000;
    background: #d8ff00;
  }
}
.ssm{
  height: 24px;
  padding: 0px;
  font-size: 13px;
  width: 80px;
}
.frameWrapper{
  border-radius: 8px;
  border: 8px solid #00569b;
  .videopanel{
    max-width: 400px;
    min-height:240px;
    z-index: 1000;
    canvas{
      max-width: 400px;
      min-height:240px;
    }
    &.no-signal{
      background-image:url('~@/assets/img/common/no_signal.gif');
      // background: url(/img/vehicle.2ed2981a.png) no-repeat;
      background-size: contain;
      background-position: center;
    }
  }
  .videoButton{
    left: 45%;
    bottom: 36%;
    border: none;
    position: absolute;
    background: transparent;  
  }
  .livetext{
    position: absolute;
    left: 6px;
    color: red;
    margin-top: 6px;
    padding: 1px 6px;
    font-size: 13px;
    background: white;
    border-radius: 4px;
    font-weight: bold;
  }
  .btnRecord{
    position: absolute;
    right: 6px;
    color: red;
    margin-top: 3px;
    padding: 3px 2px 0px 2px;
    font-size: 13px;
    background: white;
    border-radius: 4px;
    font-weight: bold;
  }
}
</style>
