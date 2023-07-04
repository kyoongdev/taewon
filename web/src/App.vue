<template>
  <div>
    <div v-if="loadingInstance" class="loading">
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
    <router-view />
  </div>
</template>

<script>
import {TYPE as TYPE_GROUP} from '@/store/modules/group'
import {TYPE as TYPE_VEHICLE} from '@/store/modules/vehicle'
import { mapMutations, mapGetters, mapActions } from 'vuex'
export default {
  name: "App",
  data(){
    return {
      loadingInstance: false,
    }
  },
  watch:{
    getLoading(val){
      this.loadingInstance = val
    }
  },
  computed:{
    ...mapGetters(['getLoading']),    
  },
  methods:{
    ...mapActions("group", [
      TYPE_GROUP.AC.GET_GROUP_ROUTE_DETAIL
    ]),
    ...mapMutations("group",[
      TYPE_GROUP.MU.SET_DELETE_GROUP_ROUTE_DETAIL,
    ]),
    ...mapMutations("vehicle",[
      TYPE_VEHICLE.AC.SET_UPDATE_VEHICLE,
      TYPE_VEHICLE.AC.SET_DELETE_VEHICLE,
      TYPE_VEHICLE.AC.SET_REGISTER_VEHICLE,
    ])
  },
  mounted(){
    if(!_.isEmpty(socket)) {
      //Command
      socket.on(code.commands, (data) => {
        console.log('----------------->', data)
        const {header, payload} = data
        if(!_.isEmpty(header)) {
          const {Code, VID} = header
          switch(Code) {
            case code.cmd.set_route:
              const {subcmd} = payload
              if(subcmd === 'delete') {
                let ids = []
                payload.data.map(r=>{
                  ids.push(r.id)
                })
                this.SET_DELETE_GROUP_ROUTE_DETAIL(ids)
              }else{
                this.GET_GROUP_ROUTE_DETAIL()
              }
              break;
            case code.cmd.set_self_driving:
              break;  
            case code.cmd.set_cleaning:
              break;  
            case code.cmd.set_emergency:
              break;                  
          }
        }
      })
      //Event
      socket.on(code.events, (data) => {
        // console.log('----------------->', data)
        const {header, payload} = data
        if(!_.isEmpty(header)) {
          const {Code, VID} = header
          switch(Code) {
            case code.evt.update_info:
              break;
            case code.evt.self_driving_start:
              break;  
            case code.evt.self_driving_stop:
              break;
          }
        }
      })
    }
  }
}
</script>

