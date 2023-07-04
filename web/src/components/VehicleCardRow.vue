<template>
  <div class="vcard p-1 mb-2 mt-1" style="cursor: pointer" :class="{selected: getSelection}">
    <b-list-group @click="rowClick" class="pn">
      <div class="title pl-4">{{data.vcode}}</div>
      <b-list-group-item class="d-flex align-items-center p-0 pl-2 pr-2 justify-content-between">
        <div>
          <div :class="data.status">
            <span class="blink"></span>
          </div>
          <b-img :src="data.image" rounded="circle" :alt="data.vcode" width="50px"></b-img> 
          {{data.name}}
        </div>
        <b-button @click="showDetail"  size='sm' variant="primary">{{$t('Dash.txt_detail')}}</b-button>
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
    isSelected: {
      type: Number,
      required: true,
      default: 0
    },
  },
  name: "VehicleCardRow",
  data(){
    return{
    }
  },
  computed:{
    getSelection() {
      return this.isSelected === this.data.id
    },
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
    },
  },
  methods: {
    rowClick: function(e){
      if(e.srcElement.nodeName!=='BUTTON'){
        this.$emit('rowClick', this.data)
      }
    },
    showDetail(){
      if(!this.getSelection){
        this.$emit('rowClick', this.data)
      }
      this.$emit('showDetail', this.data)
    },
    setEngineOff: function() {
      this.confirm("엔진을 끄시겠습니까?", (v)=>{
        if(v) {
          this.vehicleState |= code.vehicle.state.on
          this.$emit('setEngine', this.data.id)
        }
      }, {title:'<i class="fa fa-exclamation-triangle text-warning" aria-hidden="true"></i>경고'})      
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
  },
  mounted(){
    
  }
}
</script>

<style lang="scss" scoped>
.vcard {
  color: black;
  border-radius: 3px;
  background: #2196f3;
  border: 3px solid #2196f3;
  .pn {
    border-radius: 3px;
    border: 2px solid #d9e6ff;
  }
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
.selected{
  border: 3px solid #ffe500
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
</style>
