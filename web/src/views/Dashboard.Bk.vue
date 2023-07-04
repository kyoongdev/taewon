<template>
  <div style="background: aliceblue;height: 100vh">
    <Header />
    <main class="dashboard shadow" style="align-items-center">
      <div id="realtime__map"></div>

      <transition name="slide-fade">
        <div class="panel__list" v-if="!isShowDetail">
          <div class="header">
            <div> 
              <b-avatar variant="" icon="info-circle">
              </b-avatar>
              <span>{{$t('Dash.txt_list')}}</span>
            </div>
            <div class="input-group input-group-sm mb-3">
              <input type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" :placeholder="$t('txt_search')" v-model="txtsearch_vh">
              <div class="input-group-append">
                <span class="input-group-text" id="inputGroup-sizing-sm"><i class="fa fa-search" aria-hidden="true"></i></span>
              </div>
            </div>
          </div>
          <div class="body p-2 cscrollbar">
            <div v-for="v in vhTable" :key="v.id" class="shadow">
              <VehicleCardRow :isSelected="selectedVH" :data="v" 
                @rowClick="listSelectedVehicle" 
                @showDetail="showDetail"
              />
            </div>
          </div>
        </div>
      </transition>
      <transition name="slide-fade">
        <div class="panel__list details" v-if="isShowDetail">
          <div class="header d-flex justify-content-between">
            <div class="bg-white p-1">
              <b-button variant="light" size="small" @click="isShowDetail=false" pill>
                <i class="fa fa-chevron-left" aria-hidden="true"></i>
              </b-button>
            </div>
            <div> 
              <b-avatar variant="" icon="info-circle"></b-avatar>
              <small>{{$t('txt_info')}}</small>
                <b-badge variant="light">{{selectedVehicle.vcode}} <span class="sr-only">{{selectedVehicle.vcode}}</span></b-badge>
            </div>
          </div>
          <div class="body p-2 cscrollbar">
            <VehicleCardRowDetail 
              :cameraOn="selectedVHCamera"
              :data="selectedVehicle" 
              @setEngine="setEngine" 
              @setAutoMode="setAutoMode" 
              @setCleanMode="setCleanMode" 
              @setCharge="setCharge"
              @setStreamStatus="setStreamStatus"
              @setCameraStreamURL="setCameraStreamURL"
              @setRoute="setRoute"
            />
          </div>
        </div>
      </transition>
    </main>
    <!-- <Footer /> -->
  </div>
</template>

<script>
import Vue from 'vue'
const vehicle = 'vehicle'
import {TYPE as VH_TYPE} from '@/store/modules/vehicle'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import VehiclePopup from '@/components/VehiclePopup.vue'
import VehicleCardRow from '@/components/VehicleCardRow.vue'
import VehicleCardRowDetail from '@/components/VehicleCardRowDetail.vue'

//images
import vImage from '@/assets/img/control/vehicle.png'

export default {
  name: 'Dashboard',
  components:{
    Header,
    Footer,
    VehiclePopup,
    VehicleCardRow,
    VehicleCardRowDetail
  },
  data(){
    return {
      selectedVH: 0,
      map: Object,
      currentMarkers: [],
      mapCenter: [127.36855814055015, 36.52965449036096], 
      toastCount: 0,
      vehicleList: Object,
      vTableData: [],
      vhTable: [],
      allMarkerBounds : [],
      selectedVehicle:{},
      selectedVHCamera: 0,
      isShowDetail: false,
      txtsearch_vh:''
    }
  },
  computed: {
    ...mapGetters(['mapConfig']),
    ...mapGetters(vehicle, [
      VH_TYPE.GET.VEHICLE_LIST,
      VH_TYPE.GET.VEHICLE_TYPES
    ]),
  },
  watch:{
    txtsearch_vh(v){
      if(!_.isEmpty(this.txtsearch_vh)){
        this.vhTable = this.vTableData.filter(i => i.vcode.search(this.txtsearch_vh)!==-1)
      }else{
        this.vhTable = _.cloneDeep(this.vTableData, true)
      }
    },
    vTableData:{
      handler(tb){
        if(_.isEmpty(this.txtsearch_vh)){
          this.vhTable = _.cloneDeep(tb, true)
        }
        if(!_.isEmpty(this.selectedVehicle)){
          tb.map(v => {
            if (v.id === this.selectedVehicle.id) {
              this.selectedVehicle = v
            }
          })
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapActions(vehicle, [
      VH_TYPE.AC.GET_VEHICLE_LIST,
    ]),
    ...mapMutations(vehicle, [
      VH_TYPE.AC.SET_UPDATE_VEHICLE
    ]),
    makeToast(msg, title="ALERT", variant = null) {
      this.$bvToast.toast(msg, {
        title: `${title}`,
        variant: variant,
        solid: true,
        autoHideDelay: 5000,
        appendToast: true
      })
    },
    createMap: function({token, zoom, minZoom,style}){
      let mapcenter = _.cloneDeep(this.mapCenter, true)
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
          container: 'realtime__map', // container id
          center: mapcenter,
          zoom: zoom,
          style: style,
          minZoom: minZoom
      });
      return map;
    },
    initMap: async function(){
      //Create Map
      this.map = this.createMap(this.mapConfig)
      // Add the controls to the map.
      // const fscreen = new mapboxgl.FullscreenControl()
      // this.map.addControl(fscreen, 'top-left');
      const nav = new mapboxgl.NavigationControl();
      this.map.addControl(nav, 'top-left');
      const scale = new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric'});
      this.map.addControl(scale, 'top-left');
      await this.map.on('load', () => {  
        this.setLoading(true) 
        this.GET_VEHICLE_LIST(true).then(res => {
          res.map(v => {
            if(v && v.latitude && v.longitude) {
              this.createVehicleMarker(v)
              this.allMarkerBounds.push([v.longitude, v.latitude]);
            }
          })
          this.fitToPoint(this.allMarkerBounds)
          this.setLoading(false)
        }).catch(err => {
          this.setLoading(false)
        })
  
        const mapid = $('#route__map')
        if(!mapid.hasClass('resizeFull')){
          mapid.addClass('resizeFull')
        }
        $('.mapboxgl-canvas').height($(mapid).height())
        $('.mapboxgl-canvas').width($(mapid).width())
        this.map.resize();
      });
      this.map.on('click',(e) => {    
        console.log(e.lngLat)
      });
      $('.mapboxgl-ctrl-logo').hide();
      $('.mapboxgl-ctrl-attrib-inner').hide();
      $('.mapboxgl-ctrl-bottom-left').hide();
      $('.mapboxgl-ctrl-bottom-right').hide();
    },
    fitToPoint: function(bounds) {
      this.map.fitBounds(bounds, {padding:200})
    },
    listSelectedVehicle: function(v) {
      this.isShowDetail = false
      this.selectedVehicle = {}
      if(this.selectedVH !== v.id) {
        this.selectedVH = v.id
        this.map.flyTo({
          center: [v.longitude, v.latitude],
          zoom: 15,
          // bearing: 1, 
          // // These options control the flight curve, making it move
          // // slowly and zoom out almost completely before starting
          // // to pan.
          // speed: 3, // make the flying slow
          // curve: 3, // change the speed at which it zooms out
          // This can be any easing function: it takes a number between
          // 0 and 1 and returns another number between 0 and 1.
          // easing: (t) => t,
          essential: true
        });
      }else{
        this.selectedVH = 0
        this.fitToPoint(this.allMarkerBounds)
      }
    },
    createVehicleMarker: function(v){
      const key = 'VH'+v.id;
      if(!this.vehicleList[key]) {
        this.vehicleList[key] = {gps: {}, marker: {}, clean_route: {}, elMarker:{}}
      }
      this.vehicleList[key].gps = {lng: parseFloat(v.longitude), lat: parseFloat(v.latitude)}
      if(_.isEmpty(this.vehicleList[key].marker)) {
        const el = document.createElement('div');
        el.classList.add('vehicle-marker');
        if(v.state & code.vehicle.state.on) {
          el.classList.add('run','active');
        }else if(v.state & (code.vehicle.state.clean_prepare | code.vehicle.state.clean_sweeping | code.vehicle.state.clean_sweeping_pause)) {
          el.classList.add('run','active','clean');
        }else {
          el.classList.add('off');
        }
        // create the popup
        const vPopup = new Vue({
          ...VehiclePopup,
          parent: this,
          propsData: { data: v }
        }).$mount()
        vPopup.$on('showDetail', (data) =>{
          this.showDetail(data)
        })
        const popup = new AnimatedPopup({
          closeButton: false,
          closeOnClick: true,
          focusAfterOpen: false,
          closeOnMove: false,
          offset: 25,
          openingAnimation: {
            duration: 800,
            easing: 'easeOutElastic'
          },
          closingAnimation: {
            duration: 200,
            easing: 'easeInBack'
          }
        })
        .setDOMContent(vPopup.$el)
        popup.on('close', function(e) {
          vPopup.clickActive(1)
        })
        const marker = new mapboxgl.Marker(el).setLngLat(this.vehicleList[key].gps).setPopup(popup).addTo(this.map); 
        this.vehicleList[key].marker = marker
        this.vehicleList[key].elMarker = el
        this.refreshStatus(v)
        this.vTableData.push(v)
        if(v.clean_route_id>0) {
          const payload = {route_id: v.clean_route_id}
          const command = this.genData('command', code.cmd.get_clean_route, v.id, payload)
          this.sendSocket(command)
        }
      }
    },   
    showDetail(data){
      this.isShowDetail = true
      this.selectedVehicle = data
      this.selectedVHCamera = 0
    },
    setEngine(vid) {
      const payload = {engin: 0}
      const command = this.genData('command', code.cmd.set_emergency, vid, payload)
      this.sendSocket(command)
    },
    setAutoMode(vid,value) {
      const payload = {data: value?1:0}
      const command = this.genData('command', code.cmd.set_self_driving, vid, payload)
      this.sendSocket(command)
    },
    setCleanMode(vid,value) {
      const payload = {data: value?1:0}
      const command = this.genData('command', code.cmd.set_cleaning, vid, payload)
      this.sendSocket(command)
    },
    setCharge(vid,value) {
      const payload = {data: value?1:0}
      const command = this.genData('command', code.cmd.set_charge, vid, payload)
      this.sendSocket(command)
    },
    setRoute(vid,value){
      const payload = {data: value}
      const command = this.genData('command', code.cmd.set_route_yt, vid, payload)
      this.sendSocket(command)
    },
    setCameraStreamURL(vh){
      const payload = {url: vh.camera_stream}
      const command = this.genData('command', code.cmd.set_streaming_info, vh.id, payload)
      this.sendSocket(command)
      if(this.selectedVHCamera === -1){
        this.setStreamStatus(vh.id,true, vh.camera_stream)
      }else{
        this.selectedVHCamera = 0
      }
    },
    setStreamStatus(vid,state,url){
      this.selectedVHCamera = 0
      const payload = {streamUrl: url}
      let command = {}
      if(state) {
        command = this.genData('command', code.cmd.set_streaming_start, vid, payload)
      }else{
        command = this.genData('command', code.cmd.set_streaming_stop, vid, payload)
      }
      this.sendSocket(command)
    },
    refreshStatus: function(v){
      if(!v['blink']) v['blink'] = true
      if(!v['image']) v['image'] = vImage

      if(v.state & code.vehicle.state.on) {
        v['status'] = 'online'
      }else if(v.state & (code.vehicle.state.clean_prepare | code.vehicle.state.clean_sweeping | code.vehicle.state.clean_sweeping_pause)) {
        v['status'] = 'online'
      }else {
        v['blink'] = false
        v['status'] = 'offline'
      }
    },
    setCleanRouteSelection(route) {
      if(!_.isEmpty(route)) {
        const area = route.area.replace(/\\/g, "")
        const i = route.id
        if (this.map.getSource('route'+i)) {
          this.map.removeLayer('route'+i)
          this.map.removeSource('route'+i)
        }  
        this.map.addSource('route'+i, {
          type: 'geojson',
          lineMetrics: true,
          data: JSON.parse(area)
        });
        const pathColor = ['#0045bc','#6e0e97']
        this.map.addLayer({
          id: 'route'+i,
          type: 'line',
          source: 'route'+i,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': pathColor[0],
            'line-width': 4,
            // 'line-gradient' must be specified using an expression
            // with the special 'line-progress' property
            'line-gradient': [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0,
              pathColor[0],
              1,
              pathColor[1]
            ]
          }
        });
        const coords = JSON.parse(area).features[0].geometry.coordinates
        var startCoords = coords[0];
        var endCoords = coords[coords.length-1];
  
        var dot = document.createElement('div');
        var dot2 = document.createElement('div');
        dot.className='numMarker path'+i;
        dot.innerHTML = 'S';
        this.currentMarkers.push(new mapboxgl.Marker(dot).setLngLat([startCoords[0], startCoords[1]]).addTo(this.map));
  
        dot2.className='numMarker numMarkerE path'+i;
        dot2.innerHTML = 'E';
        this.currentMarkers.push(new mapboxgl.Marker(dot2).setLngLat([endCoords[0], endCoords[1]]).addTo(this.map));      
        this.map.resize(); 
      }
    },
    procEvents: function({header, payload}){
      const {Code, VID} = header
      switch(Code) {
        case code.evt.update_info:
          const key = 'VH'+VID;
          if(this.vehicleList[key]) {
            const {lon, lat, speed, water, garbage, battery, cleanning, system_mode }  = payload
            this.vehicleList[key].gps = {lng: parseFloat(lon), lat: parseFloat(lat)}
            const el = this.vehicleList[key].elMarker
            if(el) {
              el.classList.remove('off');
              el.classList.add('run', 'active');
              this.vehicleList[key].marker.setLngLat(this.vehicleList[key].gps)
              for(let i=0; i< this.vTableData.length; i++) {
                const vh = this.vTableData[i];
                if(vh.id === VID) {
                  vh.state |= code.vehicle.state.on
                  vh.longitude = lon 
                  vh.latitude = lat
                  if(speed>=0) vh.speed = speed
                  if(water>=0) vh.water = water
                  if(garbage>=0) vh.garbage = garbage
                  if(battery>=0) vh.battery = battery

                  if(cleanning && (vh.state & code.vehicle.state.clean_mode)==0)  
                    vh.state |= code.vehicle.state.clean_mode
                  else if(cleanning == 0 && (vh.state & code.vehicle.state.clean_mode))
                    vh.state &= ~code.vehicle.state.clean_mode
                  
                  if(system_mode && (vh.state & code.vehicle.state.autonomous_mode)==0)  
                    vh.state |= code.vehicle.state.autonomous_mode
                  else if(system_mode == 0 && (vh.state & code.vehicle.state.autonomous_mode))
                    vh.state &= ~code.vehicle.state.autonomous_mode

                  this.refreshStatus(vh)
                  this.SET_UPDATE_VEHICLE(vh)
                  break;
                }
              }
            }
          }
          break;
        case code.evt.video_stream_start:
          if(!_.isEmpty(this.selectedVehicle) && VID === this.selectedVehicle.id){
            if(payload.status === 200) {
              this.selectedVHCamera = 1
            }else{
              this.selectedVHCamera = -1
              this.makeToast(payload.msg, `EROOR`, 'danger')
            }
          }
          break;
        default:
          break;
      }
    },
    procCommands: function({header, payload}){
      const {Code, VID} = header
      const key = "VH"+VID
      let el;
      switch(Code) {
        case code.cmd.get_clean_route:
        case code.cmd.set_clean_route:
          if(!this.vehicleList[key]) {
            this.vehicleList[key] = {gps: {}, marker: {}, clean_route: {}}
          }
          this.vehicleList[key].clean_route = payload
          this.setCleanRouteSelection(payload) 
          break;
        case code.cmd.set_login:
          for(let i=0; i< this.vTableData.length; i++) {
            const vh = this.vTableData[i];
            if(vh.id == VID) {
              vh.state = payload.state
              el = this.vehicleList[key].elMarker
              if(el) {
                el.classList.remove('off')
                el.classList.add('run', 'active');
              }
              this.refreshStatus(vh)
              this.SET_UPDATE_VEHICLE(vh)
              break;
            }
          }
          break;
        case code.cmd.set_logout:
          for(let i=0; i< this.vTableData.length; i++) {
            const vh = this.vTableData[i];
            if(vh.id === VID) {
              vh.state &= ~code.vehicle.state.on
              el = this.vehicleList[key].elMarker
              if(el) {
                el.classList.remove('run','active')
                if(!el.classList.contains('off')) {
                  el.classList.add('off')
                }
              }
              this.refreshStatus(vh)
              this.SET_UPDATE_VEHICLE(vh)
              break;
            }
          }
          break;
        case code.cmd.set_self_driving:
          this.vTableData.map(v =>{
            if(v.id === VID) {
              if(payload.data) v.state |= code.vehicle.state.autonomous_mode
              else v.state &= ~code.vehicle.state.autonomous_mode
              this.SET_UPDATE_VEHICLE(v)
            }
          })
          break;
        case code.cmd.set_cleaning:
          this.vTableData.map(v =>{
            if(v.id === VID) {
              if(payload.data) v.state |= code.vehicle.state.clean_mode
              else v.state &= ~code.vehicle.state.clean_mode
              this.SET_UPDATE_VEHICLE(v)
            }
          })
          break;
        case code.cmd.set_charge:
          this.vTableData.map(v =>{
            if(v.id === VID) {
              if(payload.data){
                v.state &= ~code.vehicle.state.clean_mode
                v.state |= code.vehicle.state.charge_mode
              } 
              else v.state &= ~code.vehicle.state.charge_mode
              this.SET_UPDATE_VEHICLE(v)
            }
          })
          break;
        case code.cmd.set_emergency:
          this.vTableData.map(v =>{
            if(v.id === VID) {
              if(payload.engin === 0){
                v.state &= ~code.vehicle.state.on
              }else{
                v.state |= code.vehicle.state.on
              }
              this.SET_UPDATE_VEHICLE(v)
            }
          })
          break;

        default:
          break;
      }
    },
    windowResize: function(){
      if(this.map){
        this.map.resize()
      }
    }
  },
  created(){
    this.vehicleList = {}
    window.addEventListener("resize", this.windowResize);
  },
  destroyed(){
    window.removeEventListener("resize", this.windowResize);
  },
  mounted(){
    this.vehicleList = {}
    this.initMap()
    const mapcanvas = $('.mapboxgl-canvas')
    if(!mapcanvas.hasClass('resizeFull')){
      mapcanvas.addClass('resizeFull')
    } 
    socket.on(code.commands, (data) => {
      // console.log('----------------->', data)
      this.procCommands(data)
    })
    socket.on(code.events, (data) => {
      // console.log('----------------->', data)
      this.procEvents(data)
    })
  }
}
</script>


<style lang="scss">
.numMarkerE{
  background: #6e0e97;
  border-color: #6e0e97;
}
main.dashboard{
  height:calc(100vh - 130px) !important;
  display: flex;
  justify-content: center;
  align-content: center;
  border-radius: 10px;
  border: 10px solid #FFF;
  margin: 2rem;
}
#realtime__map{
  width: 100% !important;
  height: 100% !important;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.btnlist {
  position: absolute;
  top: 80px;
  right: 20px;
  height: 40px;
  width: 40px;
  padding: 5px;
  z-index: 1000;
  border-radius: 50%;
  color: rgb(255, 255, 255);
  background: rgb(120, 180, 0);
  border: 4px solid yellowgreen;
  &:hover{
    color: #000;
    background: rgb(180, 247, 47);;
    border: 4px solid yellowgreen;
  }
  &.shown{
    color: #FFF;
    background: #000;
    &:hover{
      color: #FFF;
      background: #000;
    }
  }
}
.panel__list{
  width: 22%;
  z-index: 999;
  position: absolute;
  background: #FFF;
  right: 2.5rem;
  height: calc(100% - 150px);
  .header{
    padding:1px 10px;
    background: #FFF;    
  }
  .body{
    .title{
      color: white;
      width: 100%;
      padding: 2px;
      background: #0061af;
    }
    color: rgb(0, 0, 0);
    overflow: auto;
    margin: 3px;
    height: calc(100% - 94px);
    border-bottom-left-radius: 0.7rem;
    border-bottom-right-radius: 0.7rem;
  }
}
@media (min-width: 1601px) {
  .panel__list{
    max-width: 17% !important;
    &.details{
      overflow: auto;
    }
  }
}
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
