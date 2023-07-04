<template>
  <b-modal id="modal_route_setting" centered :title="getTitle" size="xxl" footer-class="justify-content-end" v-model="visible" @hide="closeModal">
    <div class="position-absolute w-100 h-100 pb-4 pl-5 pr-5" style="right:0;">
      <b-row class="border rounded h-100">
        <b-col md="12" class="text-left">
          <div id="route__map"></div>
          <div id="geocoder" class="p-2 searchBox"></div>
          <div class="calcbox d-flex justify-content-between bg-white p-2 rounded shadow">
            <span class="text-info">{{$t('ROUTE.REG.total_distance')}}&nbsp;:&nbsp;</span>
            <span><strong>{{distance_line}} km</strong></span>
          </div>
          <button class="btn btn-control shadow" @click="zoomToBoound" :disabled="isEmptyRouteData">
            <i class="fa fa-compress" aria-hidden="true"></i>
          </button>
        </b-col>
        <b-col md="3" class="ml-auto text-left position-absolute" style="right:1.5rem;top:-0.6rem;">
          <div class="p-3">
            <b-row class="m-2 rounded">
              <b-col md="12" class="text-left">
                <b-card class="rounded shadow text-white" body-class="pt-1" style="background:#00569b !important">
                  <template #header>
                    <label for="gname">{{$t('ROUTE.table.group')}}</label>
                    <b-form-input
                      name="gname"
                      size="sm"
                      type="text"
                      class="bg-white text-dark rounded-0"
                      :disabled="true"
                      v-model="group.name"
                    ></b-form-input>
                    <label for="gname">{{$t('ROUTE.table.vh_name')}}</label>
                    <b-form-input
                      name="gname"
                      size="sm"
                      type="text"
                      class="bg-white text-dark rounded-0"
                      :disabled="true"
                      v-model="vehicle.name"
                    ></b-form-input>
                  </template>
                  <b-form>
                    <label>{{$t('ROUTE.table.route_name')}}</label>
                    <b-form-select v-if="select_existing_route" v-model="route.rid" :options="routesoptions" size="sm" class="mb-2" @change="setSelectRoute" ></b-form-select>
                    <b-form-input v-else
                      class="mb-2"
                      :placeholder="$t('ROUTE.route_name_placeholder')"
                      size="sm"
                      type="text"
                      v-model="route.name"
                    ></b-form-input>
                    <label>{{$t('ROUTE.table.charge_name')}}</label>  
                    <b-form-select v-model="route.charge_id" :options="chargeoptions" size="sm" class="mb-2"></b-form-select>
                    <label>{{$t('ROUTE.table.garage_name')}}</label>  
                    <b-form-select v-model="route.garage_id" :options="garageoptions" size="sm" class="mb-2"></b-form-select>
                    <b-form-checkbox v-model="select_existing_route" name="check-button" switch class="mt-2">
                      {{$t('ROUTE.REG.existing_route')}}
                    </b-form-checkbox>
                  </b-form>
                </b-card>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </div>
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">{{$t('btn_cancel')}}</b-button>
    <b-button class="rounded-1 btnPrimary" size="sm" :disabled="isApplyDisabled" @click="applyClick">{{btnApplyName}}</b-button>
    </template>
  </b-modal>
</template>

<script>
const group = 'group'
import {TYPE} from '@/store/modules/group'
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'RouteModal',
  props:{
    group:{
      type: Object,
      required: true
    },
    vehicle:{
      type: Object,
      required: true
    }
  },
  data(){
    return {
      map: Object,
      geocoder: Object,
      drawControl: Object,
      routePathData: Object,
      currentMarkers:[],
      visible: false,
      select_existing_route:false,
      distance_line: 0,
      chargeoptions:[],
      garageoptions:[],
      routesoptions:[],
      selected_charge_marker: null,
      selected_garage_marker: null,
      route:{
        cmd:0,
        id:0,
        gid:0,
        rid:0,
        vid:0,
        name:'',
        charge_id: 0,
        garage_id: 0,
        start_point: '',
        end_point: '',
        area: '',
        path_point: ''
      },
      mapCenter: [127.33198394015267, 36.53732260394233],
    }
  },
  computed:{
    ...mapGetters(['mapConfig']),
    ...mapGetters(group,[
      TYPE.GET.GROUP_CHARGE_MAP,
      TYPE.GET.GROUP_GARAGE_MAP,
      TYPE.GET.GROUP_ROUTE_MAP,
    ]),
    getTitle(){
      if(this.isUpdate) {
        return this.$i18n.t('ROUTE.REG.title_update')
      }
      return this.$i18n.t('ROUTE.REG.title_register')
    },
    btnApplyName(){
      if(this.isUpdate) {
        return this.$i18n.t('btn_update')
      }
      return this.$i18n.t('ROUTE.REG.btn_add')
    },
    isEmptyRouteData(){
      return _.isEmpty(this.routePathData)
    },
    isApplyDisabled(){
      return _.isEmpty(this.routePathData) || _.isEmpty(this.route.name) || this.route.charge_id===0 || this.route.garage_id===0
    }
  },
  watch: {
    visible(v){
      if(v) {
        this.initMap()
      }
    },
    select_existing_route(v){
      this.resetRouteId()
      this.removeAllMarkers()
      this.setChargeGarageOptions(4)
      this.drawControl.onRemove(this.map)
      this.map.addControl(this.drawControl, 'top-left');
      if(v){
        this.drawControl.onRemove(this.map)
        this.map.addControl(this.drawControl, 'top-left');
        $(".mapbox-gl-draw_line").parent().hide()
      }else{
        this.route.name = ''
        $(".mapbox-gl-draw_line").parent().show()
      }
    },
    GROUP_CHARGE_MAP(v){
      this.setChargeGarageOptions(1)
    },
    GROUP_GARAGE_MAP(v){
      this.setChargeGarageOptions(2)
    },
    route:{
      deep: true,
      handler(v) {
        if(v.charge_id) {
          const charge = this.GROUP_CHARGE_MAP[this.group.id].filter(i => i.id === v.charge_id)[0]
          if(charge) {
            const geojson = JSON.parse(charge.location.replace(/\\/g, ""))
            if(geojson) {
              if(this.selected_charge_marker) this.selected_charge_marker.remove()
              const el = document.createElement('div');
              el.className = 'charging-marker';
              this.selected_charge_marker = new mapboxgl.Marker(el).setLngLat(geojson.features[0].geometry.coordinates).addTo(this.map); 
            }
          }
        }else if(this.selected_charge_marker){
          this.selected_charge_marker.remove()
          this.selected_garage_marker = null
        }

        if(v.garage_id) {
          const garage = this.GROUP_GARAGE_MAP[this.group.id].filter(i => i.id === v.garage_id)[0]
          if(garage) {
            const geojson = JSON.parse(garage.location.replace(/\\/g, ""))
            if(geojson) {
              if(this.selected_garage_marker) this.selected_garage_marker.remove()
              const el = document.createElement('div');
              el.className = 'return-marker';
              this.selected_garage_marker = new mapboxgl.Marker(el).setLngLat(geojson.features[0].geometry.coordinates).addTo(this.map); 
            }
          }
        }else if(this.selected_garage_marker){
          this.selected_garage_marker.remove();
          this.selected_garage_marker = null
        }
      }
    }
  },
  methods:{
    ...mapActions(group, [
      TYPE.AC.GET_GROUP_LIST,
      TYPE.AC.ADD_GROUP_ROUTE,
      TYPE.AC.GET_GROUP_BY_ID,
      TYPE.AC.GET_GROUP_ROUTE_LIST,
      TYPE.AC.GET_GROUP_ROUTE_DETAIL,
      TYPE.AC.SET_GROUP_ROUTE_DETAIL,
    ]),
    closeModal: function(){
      this.$emit('closeRouteModal')
    },
    setSelectRoute: function(e){
      this.removeAllMarkers()
      if(e) {
        this.drawExistRoute(e)
      }
    },
    resetRouteId: function() {
      this.route.rid = 0
    },
    applyClick: function(){
      this.route.gid = this.group.id
      this.route.vid = this.vehicle.id
      this.route.area = JSON.stringify(this.routePathData)
      const coord = this.routePathData.features[0].geometry.coordinates; 
      this.route.start_point = JSON.stringify(coord[0])
      this.route.end_point = JSON.stringify(coord[_.size(coord) - 1])
      this.setPathPoint()
      this.setLoading(true)
      if(this.select_existing_route) {
        this.route.cmd = 100
        this.SET_GROUP_ROUTE_DETAIL(this.route).then(res => {
          this.setLoading(false)
          if(res.message) {
            this.alert(res.message, async (ok) => {
              if(ok) {
                await this.GET_GROUP_ROUTE_DETAIL()
                this.closeModal()
              }
            })
          }
        }).catch(error =>{
          this.setLoading(false)
          const data = error && error.data
          if(data){
            this.alert(data.message);
          }
        })
      }else{
        // this.route.path_point = this.route.area
        this.ADD_GROUP_ROUTE(this.route).then(res=>{
          this.route.cmd = 100
          this.route.rid = res.data.id
          this.GET_GROUP_BY_ID({groupid:this.group.id})
          this.SET_GROUP_ROUTE_DETAIL(this.route).then(res => {
            this.setLoading(false)
            if(res.message) {
              this.alert(res.message, async (ok) => {
                if(ok) {
                  await this.GET_GROUP_ROUTE_DETAIL()
                  this.closeModal()
                }
              })
            }
          }).catch(error =>{
            this.setLoading(false)
            const data = error && error.data
            if(data){
              this.alert(data.message);
            }
          })
        })
        .catch(error =>{
          this.setLoading(false)
          const data = error && error.data
          if(data){
            this.alert(data.message);
          }
        })
      }
    },
    setPathPoint: function(){
      //값 초기화
      this.route.path_point = ''

      //1m단위로 포인터 끊기
      const pathData = this.routePathData
      if(pathData !== undefined && pathData.features[0] !== undefined){
        var pointLength = pathData.features[0].geometry.coordinates.length;
        var coordinatesArr = pathData.features[0].geometry.coordinates;
        var turfOptions = {units:'kilometers'};
        var changedLine = [];
        
        //계산에 사용될 변수
        var interval = 0.001;
        var steps = this.distance_line/interval;
        
        //실제 사용자가 찍은 포인트 출력
        // console.log(coordinatesArr);
        for(var i=0, j=1; i<pointLength-1; i++,j++) {
          //현재 포인트 그려진 모든 라인 체크
          var tempLine = turf.lineString(Array(coordinatesArr[i],coordinatesArr[j]));
          //console.log(tempLine);
          var tempDistance = turf.length(tempLine, {units: 'kilometers'}).toLocaleString();
          //var segment = turf.along();
          //console.log(tempDistance);
          for(var position=0; position<=tempDistance; position+=interval){
              //console.log(tempLine);
              var segment = turf.along(tempLine,position,turfOptions);
              //시작과 끝의 지점에서 해당하는 경로로의 거리 계산
              this.addWayPoint(segment.geometry.coordinates[0], segment.geometry.coordinates[1]);
              //데이터를 미터 기반으로 띄우도록 변경
              //console.log(segment);//interval km사이의 점 좌표를 전부 출력
          }
        }
        this.addWayPoint(coordinatesArr[j - 1][0], coordinatesArr[j - 1][1]);
      }
    },
    addWayPoint: function(a, b) {
        if (this.route.path_point != "") {
            this.route.path_point += "|";
        }
        this.route.path_point += a + ',' + b;
    }, 
    setChargeLocation: function(point) {
      this.reverseGeocoding(point.lat,point.lng);
    },
    setSearchLocation: function(e) {
      const c = e.currentTarget.value
      console.log('need to implement forward geocoder next time.', c)
    },
    reverseGeocoding:function (latitude, longitude) {
      var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
            + longitude + ', ' + latitude
            + '.json?access_token=' + this.mapConfig.token;
      axios.get(url).then(response=>{
        if (response.data.features.length == 0) {
          this.charge.address = ''
        } else {
          this.charge.address = response.data.features[0].place_name
        }
      }).catch(error =>{
        console.log('Unable to connect to Geocode API', error);
      })
    },
    createMapboxDraw: function () {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          trash: true,
          line_string: true,
          polygon: false
        },
        //defaultMode: 'draw_line_string',
        styles:[
          // ACTIVE (being drawn)
          // line stroke
          {
            'id': 'gl-draw-line',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#0055E6',
              'line-width': 4,
              'line-opacity': 1
            }
          },
          // vertex point halos
          {
            'id': 'gl-draw-polygon-and-line-vertex-halo-active',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            'paint': {
              'circle-radius': 10,
              'circle-color': '#0055E6'
            }
          },
          // vertex point halos(select)
          {
            'id': 'gl-draw-polygon-and-line-vertex-halo-active-select',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['==', 'active', 'true']],
            'paint': {
              'circle-radius': 28,
              'circle-color': '#0055E6',
              'circle-opacity':0.3
            }
          },
          //mid points
          {
            'id': 'gl-draw-polygon-midpoint',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#0055E6'
            }
          }
        ]            
      });
      return draw
    },
    createGeocoder: function({token, closeZoom}){
      const geocoder = new MapboxGeocoder({ 
        accessToken: token, 
        mapboxgl: mapboxgl,
        marker: false,
        zoom:closeZoom,
        placeholder: this.$i18n.t('txt_search_location')
      });
      return geocoder
    },
    createMap: function({token, zoom, minZoom,style}){
      let mapcenter = []
      const s = _.size(this.markers)
      if(s){
        mapcenter = _.cloneDeep(this.markers[s-1], true)
      }else{
        mapcenter = _.cloneDeep(this.mapCenter, true)
      }
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
          container: 'route__map', // container id
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
      const fscreen = new mapboxgl.FullscreenControl()
      this.map.addControl(fscreen, 'top-left');
      const nav = new mapboxgl.NavigationControl();
      this.map.addControl(nav, 'top-left');
      this.drawControl = this.createMapboxDraw()
      this.map.addControl(this.drawControl, 'top-left');
      const scale = new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric'});
      this.map.addControl(scale);
      this.geocoder = this.createGeocoder(this.mapConfig)      
      $('#geocoder').append(this.geocoder.onAdd(this.map));

      this.map.on('draw.create', this.updateLine);
      this.map.on('draw.update', this.updateLine);
      this.map.on('draw.delete', this.updateDelete);
      this.map.on('draw.modechange', this.drawModeChange);

      this.map.on('load', () => {    
        const mapid = $('#route__map')
        if(!mapid.hasClass('resizeFull')){
          mapid.addClass('resizeFull')
        }
        $('.mapboxgl-canvas').height($(mapid).height())
        $('.mapboxgl-canvas').width($(mapid).width())
        this.map.resize();
        this.geocoder.on('result', (event) => {
          const coordinates = event.result.geometry.coordinates
          this.setChargeLocation({lng : coordinates[0], lat:coordinates[1]})
        })
      });
      this.map.on('click',function(e){});

      $('.mapboxgl-ctrl-logo').hide();
      $('.mapboxgl-ctrl-attrib-inner').hide();
      $('.mapboxgl-ctrl-bottom-left').hide();
      $('.mapboxgl-ctrl-bottom-right').hide();
    },
    zoomToBoound: function() {
      if(!_.isEmpty(this.routePathData)) {
        const coordinates = this.routePathData.features[0].geometry.coordinates; 
        // Create a 'LngLatBounds' with both corners at the first coordinate.
        const bounds = new mapboxgl.LngLatBounds(
          coordinates[0],
          coordinates[0]
        );
        // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
        for (const coord of coordinates) {
          bounds.extend(coord);
        }
        if(this.selected_charge_marker) {
          bounds.extend(_.values(this.selected_charge_marker._lngLat));
        }
        if(this.selected_garage_marker) {
          bounds.extend(_.values(this.selected_garage_marker._lngLat));
        }
        this.map.fitBounds(bounds, {
          maxZoom: 18,
          padding: 100
        });
      }
    },
    updateDelete: function(e){
      this.removeAllMarkers()
    },
    drawModeChange: function(e){
      const data = this.drawControl.getAll();
      if(data && _.size(data.features)) {
        const last = data.features[data.features.length - 1]
        if(last) {
          let pids = []
          const lid = last.id
          data.features.forEach((f) => {
            if (f.geometry.type === 'LineString' && f.id !== lid) {
              pids.push(f.id)
            }
          })
          if(_.size(pids)) {
            this.drawControl.delete(pids)
            if (_.size(this.currentMarkers)) {
              for (let i = this.currentMarkers.length - 1; i >= 0; i--) {
                this.currentMarkers[i].remove();
              }
              this.routePathData = []
            }
          }
        }
      }else{
        this.removeAllMarkers()
      }
    },
    removeAllMarkers: function(){
      this.drawControl.deleteAll()
      if (_.size(this.currentMarkers)) {
        for (let i = this.currentMarkers.length - 1; i >= 0; i--) {
          this.currentMarkers[i].remove();
        }
      }
      this.routePathData = []
    },
    updateLine: function(e){
      for (let i = this.currentMarkers.length - 1; i >= 0; i--) {
        this.currentMarkers[i].remove();
      }
      this.routePathData = this.drawControl.getAll();
      if(this.routePathData !== undefined && this.routePathData.features[0] !== undefined){
        //거리 출력 -> 해당 내용 div박스에 출력을 하여 사용자가 알 수 있도록 
        //할것units : ‘miles’ for either ‘degrees’, ‘radians’, or ‘kilometers’
        var linestring = this.routePathData.features[0];
        this.distance_line = turf.length(linestring, {units: 'kilometers'}).toLocaleString();//전체 거리
        //사용자가 그린 경로 위에 marker올리기
        this.drawMarker(this.routePathData.features[0].geometry.coordinates);
      }
    },
    drawMarker: function (e) {
      var coords = e;
      //create other path marker
      for(var i=0, dotIndex=1; i < coords.length; i++,dotIndex++){
        if(i == 1000) break;
        var lat = coords[i][1];
        var lng = coords[i][0];
        //기존 마커
        //애초에 마커가 그려지지 않고 해결
        var dot = document.createElement('div');
        dot.id= 'dot_' + dotIndex;
        dot.alt= 'dot_' + dotIndex;
        dot.className='numMarker numMarker-index';
        //dot.innerHTML = dotIndex;
        this.currentMarkers[i] = new mapboxgl.Marker({
            element : dot,
            //draggable:true
        }).setLngLat([lng, lat]).addTo(this.map);//기록된 마커 저장      
      }
      //create start and end marker
      var startCoords = coords[0];
      var endCoords = coords[coords.length-1];

      var dot = document.createElement('div');
      var dot2 = document.createElement('div');

      dot.id= 'dot_start';
      dot.alt= 'dot_start';
      dot.className='numMarker';
      dot.innerHTML = 'S';
      this.currentMarkers[i] = new mapboxgl.Marker(dot).setLngLat([startCoords[0], startCoords[1]]).addTo(this.map);

      dot2.id= 'dot_end';
      dot2.alt= 'dot_end';
      dot2.className='numMarker';
      dot2.innerHTML = 'E';
      this.currentMarkers[i+1] = new mapboxgl.Marker(dot2).setLngLat([endCoords[0], endCoords[1]]).addTo(this.map); 
    },
    drawExistRoute: function(id){
      const route = this.GROUP_ROUTE_MAP[this.group.id].filter(i=> i.id === id)
      if(_.size(route)) {
        this.route.name = route[0].name
        this.routePathData = JSON.parse(route[0].area.replace(/\\/g, ""))
        this.drawControl.add(this.routePathData);
        if(this.routePathData !== undefined && this.routePathData.features[0] !== undefined){
          //거리 출력 -> 해당 내용 div박스에 출력을 하여 사용자가 알 수 있도록 
          //할것units : ‘miles’ for either ‘degrees’, ‘radians’, or ‘kilometers’
          var linestring = this.routePathData.features[0];
          this.distance_line = turf.length(linestring, {units: 'kilometers'}).toLocaleString();//전체 거리
          //사용자가 그린 경로 위에 marker올리기
          this.drawMarker(this.routePathData.features[0].geometry.coordinates);
        }
      }
    },
    setChargeGarageOptions: function(change){
      // change: 1->charge
      if(change !== 2) {
        this.chargeoptions = []
        this.chargeoptions.push({ value: 0, text: this.$i18n.t('ROUTE.REG.select_charge_station') })
        this.GROUP_CHARGE_MAP[this.group.id].map(i=>{
          this.chargeoptions.push({value: i.id, text: i.name})
        })
      }
      // 2->garage
      if(change !==1){
        this.garageoptions = []
        this.garageoptions.push({ value: 0, text: this.$i18n.t('ROUTE.REG.select_garage_station') })
        this.GROUP_GARAGE_MAP[this.group.id].map(i=>{
          this.garageoptions.push({value: i.id, text: i.name})
        })
      }
      if(change!==3) {
        this.routesoptions = []
        this.routesoptions.push({ value: 0, text: this.$i18n.t('ROUTE.REG.select_existing_route') })
        this.GROUP_ROUTE_MAP[this.group.id].map(i=>{
          if(_.size(i.RouteDetail)) {
            i.RouteDetail.map(rd => {
              if(rd.vid !== this.vehicle.id) {
                this.routesoptions.push({value: i.id, text: i.name})
              }
            })
          }else{
            this.routesoptions.push({value: i.id, text: i.name})
          }
        })
      }
    }
  },
  mounted(){
    const mapcanvas = $('.mapboxgl-canvas')
    if(!mapcanvas.hasClass('resizeFull')){
      mapcanvas.addClass('resizeFull')
    }
    this.GET_GROUP_LIST().then(res => {
      this.setChargeGarageOptions(4)
    })
  }
}
</script>

<style lang="scss">
.resizeFull{
  width: 100% !important;
  height: 100% !important;
}
.searchBox{
  top: 1px;
  left: 3rem;
  position: absolute;
}
.calcbox{
bottom: 10px;
left: 3rem;
min-width: 100px;
position: absolute;
font: bold 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
.btn-control {
font: bold 12px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
background-color: #3386c0;
color: #fff;
position: absolute;
bottom: 10px;
left: 0.5rem;
z-index: 1;
border: none;
display: block;
padding: 8px 12px;
border-radius: 3px;
cursor: pointer;
}
.btn-control:hover {
background-color: #4ea0da;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>