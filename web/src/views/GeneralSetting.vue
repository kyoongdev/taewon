<template>
  <div class="container-fluid shadow">
    <div class="alert d-flex justify-content-between align-items-center">
      <div>
        <i class="fa fa-cog pr-2" aria-hidden="true"></i> 일반 설정
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-6">
          <label>header</label>
          <textarea style="width:100%;height:100px" v-model="header"></textarea>
          <label>payload</label>
          <textarea style="width:100%;height:100px" v-model="payload"></textarea>
          <div>
            <input type="radio" id="command" name="drone" value="0" v-model="type">
            <label for="command">Command</label>
          </div>

          <div>
            <input type="radio" id="event" name="drone" value="1" v-model="type">
            <label for="event">Event</label>
          </div>
          <button type="button" class="btn btn-sm btnPrimary rounded-1 b-minw mr-2" :disabled="!isConnected" @click="sendloop">{{loop>0?'stop loop':'start loop'}}</button>
          <button type="button" class="btn btn-sm btnPrimary rounded-1 b-minw mr-2" :disabled="!isConnected" @click="send">send</button>
          <button type="button" class="btn btn-sm btnPrimary rounded-1 b-minw mr-2" :disabled="isConnected" @click="conn">connect</button>
          <button type="button" class="btn btn-sm btnPrimary rounded-1 b-minw mr-2" :disabled="!isConnected" @click="disconn">disconnect</button>
          <span>status: {{socket.connected?'connected':'disconnected'}}</span>
        </div>
        <div class="pl-3 col-6">
            <label>server's msg</label>
            <textarea style="width:100%;height:400px" v-model="result" v-auto-scroll-bottom></textarea>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
           <label>경로 이름</label>
            <b-form-select v-model="selectdCode" :options="codeOptions" size="sm" class="mb-2" @change="setCodeOption" ></b-form-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

const g_system_error = [
  "0000",
  1100,
  1110,
  1120,
  1130,
  1140,
  1150,
  1200,
  1300,
  1400,
  1500,
  1400,
  1500,
  1600,
]

export default {
  name: 'GeneralSetting',
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
  data() {
    return {
      header:`{
          "Code": 10000,
          "VID": "1234",
          "Datetime": "2022-02-04T05:15:26.220Z"
          }`,
      payload:'{}',
      type: 0,
      result: '',
      loop: 0,
      socket: Object,
      info: {},
      routes: [],
      codeOptions: [],
      indexPoint: 0,
      cleanRoute: [],
      direction: false,
      selectdCode: 0,
    }
  },
  computed:{
    isConnected(){
      return this.socket && this.socket.connected
    },
    autoMode(){
      if(this.info){
        return (this.info.state & code.vehicle.state.autonomous_mode)?1:0
      }
      return 0
    },
    cleanMode(){
      if(this.info){
        return (this.info.state & code.vehicle.state.clean_mode)?1:0
      }
      return 0
    }
  },
  watch:{
    selectdCode(c){
      switch(c) {
        //command
        case code.cmd.set_login:
          this.setLogin()
          break;
        case code.cmd.set_logout:
          this.setLogout()
          break;
        case code.cmd.set_clean_route:
          this.setCleanRoute()
          break;
        case code.cmd.get_charge:
          this.getCharge()
          break;
        case code.cmd.get_garage:
          this.getGarage()
          break;
        case code.cmd.get_route:
          this.getRoute()
          break;

        // //event
        // case code.events.io:
        //   break;
      }
    }
  },
  methods:{
    send: function(){
      const header = JSON.parse(this.header)
      const payload = JSON.parse(this.payload)
      const data = {header, payload}
      if(parseInt(this.type) === 0) {
        this.socket.emit(code.commands, data)
      }else if(parseInt(this.type) === 1) {
        this.socket.emit(code.events, data)
      }
    },
    conn: function(){
      this.socket = io.connect(process.env.VUE_APP_BASE_SERVER_SOCKET, { 
        path: "/webio/",
        transports: ["websocket"],
        query: 'api_key='+process.env.VUE_APP_BASE_SOCKET_KEY
      }).on('connect', ()  => {
        this.socket.on(code.commands, (data) => {
          const {header, payload} = data
          switch(header.Code) {
            case code.cmd.set_login:
              if(!_.isEmpty(payload)) {
                this.info = _.cloneDeep(payload,true)
              }else{
                this.info = {}
              }
              break;
            case code.cmd.get_route:
              if(_.size(payload)) {
                this.routes = _.cloneDeep(payload,true)
              }else{
                this.routes = []
              }
              break;  
            case code.cmd.set_self_driving:
              this.sendloop()
              if(payload.data) 
                this.info.state |= code.vehicle.state.autonomous_mode
              else 
                this.info.state &= ~code.vehicle.state.autonomous_mode
              this.sendloop()
              break;
            case code.cmd.set_cleaning:
              this.sendloop()
              if(payload.data) 
                this.info.state |= code.vehicle.state.clean_mode
              else 
                this.info.state &= ~code.vehicle.state.clean_mode
              this.sendloop()
              break;
            default:
              break;
          }
          this.result+='\n\nCommand:::\n'+JSON.stringify(data, null, 2);
        }).on(code.events, (data)=>{
          this.result+='\n\nEvent::::\n'+JSON.stringify(data, null, 2);
          const {header, payload} = data
          switch(header.Code) {  
            default:
              break;
          }
        })
      }).on('disconnect', (reason) => {
        console.log('server is down!', reason)
        this.socket.disconnect();
      }).on("connect_error", err => {
        console.log(err instanceof Error);
        console.log(err.message);
        console.log(err.data); 
      });
    },
    disconn: async function(){
      await this.setLogout()
      clearInterval(this.loop)
        this.loop = 0
      if(this.socket.connected) {
        this.socket.disconnect();
      }
    },
    sendloop: function(){
      if(!this.loop) {
        this.loop = setInterval(()=>{
          this.updateInfomation()
        },400)
      }else{
        clearInterval(this.loop)
        this.loop = 0
      }
    },
    setLogin: async function(){
      if(this.header==="") {
        const header = {
         Code: code.cmd.set_login,
         VID : '1234',
         Datetime : new Date()
       }
       this.header = JSON.stringify(header)
      }
      this.payload = '{}'
      this.type = 0
      this.send()
    },
    setLogout: async function(){
      const header = {
        Code: code.cmd.set_logout,
        VID : ''+this.info.id,
        Datetime : new Date()
      }
      this.header = JSON.stringify(header)
      this.payload = '{}'
      this.type = 0
      await this.send()
    },
    getCharge: function(){
      const header = {
        Code: code.cmd.get_charge,
        VID : ''+this.info.id,
        Datetime : new Date()
      }
      this.header = JSON.stringify(header)
      this.payload = '{}'
      this.send()
    },
    getGarage: function(){
      const header = {
        Code: code.cmd.get_garage,
        VID : ''+this.info.id,
        Datetime : new Date()
      }
      this.header = JSON.stringify(header)
      this.payload = '{}'
      this.send()
    },
    getRoute: function(){
      const header = {
        Code: code.cmd.get_route,
        VID : ''+this.info.id,
        Datetime : new Date()
      }
      this.header = JSON.stringify(header)
      this.payload = '{}'
      this.send()
    },
    setCleanRoute: function(){
      const header = {
        Code: code.cmd.set_clean_route,
        VID : ''+this.info.id,
        Datetime : new Date()
      }
      this.header = JSON.stringify(header)
      const {id} = this.routes[0]
      this.payload = JSON.stringify({route_id:id})
      this.send()
    },
    sendOffLine: function(){

    },
    sendCleanPrepare: function(){

    },
    sendCleanStart: function(){
      
    },
    sendCleanStop: function(){
      
    },
    updateInfomation: function(){
      if(!_.size(this.cleanRoute)){
        this.type = 1
        this.indexPoint = 0;
        this.cleanRoute = this.routes[0].path_point
      }
      const header = {
        Code: code.evt.update_info,
        VID : ''+this.info.id,
        Datetime : new Date()
      }
      if(this.indexPoint < _.size(this.cleanRoute) - 2 && this.direction == false) {
        this.indexPoint+=2;
        if(this.indexPoint >= _.size(this.cleanRoute)- 2) {
          this.indexPoint = _.size(this.cleanRoute) - 1
          this.direction = true
        }
      }
      else {
        this.indexPoint-=2;  
        if(this.indexPoint <0){
          this.direction = false
          this.indexPoint = 0
        } 
      }

      this.header = JSON.stringify(header)
      const data = {
        ...this.cleanRoute[this.indexPoint],
        water: Math.floor(Math.random() * 70),
        garbage : Math.floor(Math.random() * 30),
        speed : Math.floor(Math.random() * 40)+ 10,
        battery : Math.floor(Math.random() * 90)+ 20,
        cleaning: this.cleanMode, // 0 : Non-Cleaning | 1 : Cleaning
        clean_completion: Math.floor(Math.random() * 100), // percentage (%)
        clean_remain_time: Math.floor(Math.random() * 40)+ 10, // mins
        system_mode: Math.floor(Math.random() * 6)+ 1, // 0 : Driving | 1 : Self-Drivng 
        error: g_system_error[Math.floor(Math.random() * 14)], 
      }
      this.payload = JSON.stringify(data)
      this.send()
    },
    setCodeOption: function(e){
      console.log('------------->', e)
    },
  },
  mounted(){
    this.conn()
    this.codeOptions = [
      { value: 0, text: 'Select Command' },
      { value: code.cmd.set_login, text: 'Set Login' },
      { value: code.cmd.set_clean_route, text: 'Set clean route' },
      { value: code.cmd.set_logout, text: 'Set Logout' },
      // { value: code.cmd.set_route, text: 'Set clean prepare' },
      // { value: code.cmd.set_clean_start, text: 'Set clean start' },
      // { value: code.cmd.set_clean_stop, text: 'Set clean start' },
      // { value: 0, text: 'Select Command' },
      // { value: 0, text: 'Select Command' },
      // { value: 0, text: 'Select Command' },
      // { value: 0, text: 'Select Command' },
      // { value: 0, text: 'Select Command' },
      // { value: 0, text: 'Select Command' },
      // { value: 0, text: 'Select Command' },
      { value: code.cmd.get_charge, text: 'Get Charge' },
      { value: code.cmd.get_garage, text: 'Get Garage' },
      { value: code.cmd.get_route, text: 'Get Route' },
    ]
  },
  beforeDestroy(){
    clearInterval(this.loop)
    this.loop = 0
    this.socket.disconnect()
  }  
}
</script>
<style lang="scss" scoped>

</style>