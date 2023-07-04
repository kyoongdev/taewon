<template>
  <b-modal id="modal-route-setting" centered title="경로 설정" size="xxl" v-model="modalShow" @hide="closeModal" >
    <div class="position-absolute w-100 h-100" style="right:0;">
      <div class="row text-left p-3 h-100">
        <div class="col-md-9 col-sm-12 p-4">
          <div id="route__map__setting" class="shadow" style="border-radius:4px"></div>
        </div>
        <div class="col-md-3 col-sm-12">
          <b-form class="pl-3 pr-3 h-100">
            <div class="d-flex justify-content-between pb-3">
              <label>등록된 그룹</label>
              <span>
                <b-button squared class="ml-2" variant="primary" size="sm" :disabled="btnDEdit" @click="editRoute">
                  <i class="fa fa-pencil" aria-hidden="true"></i>
                </b-button>
                <b-button squared class="ml-2" variant="danger" size="sm" :disabled="btnDDelete" @click="deleteRoute">
                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                </b-button>
              </span>
            </div>
            <b-form-select v-model="group_id" :options="groupsOptions" size="sm" class="mb-2" @change="setSelectGroup"></b-form-select>
            <div class="table-box border cscrollbar">
              <el-table :columns="tbhead" :tabledata="tableData" @selectCheckbox="setckGroups" :cStyle="tbHeight" :h100="true" :showcheckbox="false" :singleSelection="true"/>
            </div>
            <img src="@/assets/img/settings/clean_route_register.png" class="position-absolute mt-2 mr-4" style="bottom: 10px; width: 90%"/>
          </b-form>
        </div>
      </div>
    </div>
    <template #modal-footer="{ ok, cancel, hide }">
    <b-button class="rounded-1 btnPrimary" size="sm" @click="hide('forget')">닫기</b-button>
    </template>
  </b-modal>
</template>

<script>
const pathColor = ['#0045bc','#c5e5ff']
const group = 'group'
import {TYPE} from '@/store/modules/group'
import { mapActions, mapGetters } from 'vuex'
import ElTable from '@/components/ElTable.vue'
export default {
  name: "RouteSettingModal",
  data(){
    return {
      map: Object,
      drawControl: Object,
      editMarker: Object,
      editIndex: -1,
      deleteGID: 0,
      group_id: 0,
      modalShow: false,
      currentMarkers:[],
      tableData:[],
      groupsOptions:[],
      mapCenter: [127.33198394015267, 36.53732260394233],
      tbHeight: "min-height: calc(50vh - 50px)",
      tbhead: [
        {text: "No."},
        {text: "경로이름"},
      ],
      routePathData: {},
      routePathDataOrg: {}
    }
  },
  components:{
    ElTable
  },
  computed: {
    ...mapGetters(['mapConfig']),
    ...mapGetters(group, [
      TYPE.GET.GROUP_LIST,
      TYPE.GET.GROUP_ROUTE_MAP,
    ]),
    btnDEdit(){
      return _.isEqual(this.routePathData, this.routePathDataOrg)
    },
    btnDDelete(){
      return this.editIndex == -1
    }
  },
  watch:{
    async modalShow(v) {
      if(v) {
        this.setLoading(true)
        await this.initMap()
        this.setLoading(false)
      }
    },
    GROUP_ROUTE_MAP:{
      deep: true,
      handler(v) {
        if(this.deleteGID > 0) {
          this.drawControl.deleteAll();
          this.removeAllMarkers()
          this.refreshTableData(this.deleteGID)
          this.deleteGID = 0
        }
      }
    }
  },
  methods:{
    ...mapActions(group, [
      TYPE.AC.GET_GROUP_LIST,
      TYPE.AC.ADD_GROUP_ROUTE,
      TYPE.AC.GET_GROUP_BY_ID,
      TYPE.AC.DELETE_GROUP_ROUTE,
      TYPE.AC.UPDATE_GROUP_ROUTE,
      TYPE.AC.GET_GROUP_ROUTE_LIST,
    ]),
    closeModal: function(){
      this.$emit('closeRouteSettingModal')
    },
    setckGroups: function(d){
      const opacity = [0.1, 1]
      this.editIndex = -1
      this.drawControl.deleteAll();
      this.routePathData = {}
      this.routePathDataOrg = {}
      if(_.size(d)){
        const select_id = d[0]
        this.currentMarkers.map((marker, idx) => {
          const id = marker.route.id
          const route_id = 'route'+id
          if(id === select_id) {
            this.map.setPaintProperty(
              route_id,
              'line-opacity',
              opacity[1]
            );
            let bounds = []
            let point = marker.spoint.getLngLat()
            bounds.push([point.lng, point.lat])
            point = marker.epoint.getLngLat()
            bounds.push([point.lng, point.lat])
            this.map.fitBounds(bounds, {padding:100})
            marker.spoint.getElement().style.opacity = opacity[1]
            marker.epoint.getElement().style.opacity = opacity[1]
            this.routePathData = JSON.parse(marker.route.area.replace(/\\/g, ""))  
            this.routePathDataOrg = _.cloneDeep(this.routePathData, true)
            this.drawControl.add(this.routePathData);
            this.editIndex = idx
          } else {
            this.map.setPaintProperty(
              route_id,
              'line-opacity',
              opacity[0]
            );
            marker.spoint.getElement().style.opacity = opacity[0]
            marker.epoint.getElement().style.opacity = opacity[0]
          }
        })
      } else {
        this.currentMarkers.map(marker => {
          const id = marker.route.id
          const route_id = 'route'+id
          this.map.setPaintProperty(
            route_id,
            'line-opacity',
            opacity[1]
          );
          marker.spoint.getElement().style.opacity = opacity[1]
          marker.epoint.getElement().style.opacity = opacity[1]
        })
      }
    },
    refreshTableData(groupid){
      this.tableData = []
      let gid = 0
      if(groupid) gid = groupid
      else if(this.group_id) gid = this.group_id

      if(this.GROUP_ROUTE_MAP[gid]) {
        this.GROUP_ROUTE_MAP[gid].map((r, idx) => {
          const data = {
            id: r.id,
            data: {
              name: '<p class="wrap_text">'+(idx+1)+'</p>',
              desc: '<p class="wrap_text">'+r.name+'</p>'
            }
          }
          this.tableData.push(data)
          this.createRoute(r)
        })
      }
    },
    setSelectGroup: function(){
      this.editIndex = -1
      this.drawControl.deleteAll();
      this.removeAllMarkers()
      if(this.group_id) {
        this.refreshTableData()
      }else{
        this.tableData = []
        for (const routes of Object.values(this.GROUP_ROUTE_MAP)) {
          routes.map((r, idx) =>{
            const data = {
              id: r.id,
              data: {
                name: '<p class="wrap_text">'+(idx+1)+'</p>',
                desc: '<p class="wrap_text">'+r.name+'</p>'
              }
            }
            this.tableData.push(data)
            this.createRoute(r)
          })
        }
      }      
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
    createMap: function({token, zoom, minZoom,style}){
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
          container: 'route__map__setting', // container id
          center: this.mapCenter,
          zoom: zoom,
          style: style,
          minZoom: minZoom
      });
      return map;
    },
    initMap: async function(){
      this.map = this.createMap(this.mapConfig)
      const nav = new mapboxgl.NavigationControl();
      this.map.addControl(nav, 'top-left');
      this.drawControl = this.createMapboxDraw()
      this.map.addControl(this.drawControl, 'top-left');
      this.map.on('draw.create', this.updateLine);
      this.map.on('draw.update', this.updateLine);
      // this.map.on('draw.delete', this.updateDelete);

      this.map.on('load', () => {    
        this.setSelectGroup()
        const mapid = $('#route__map__setting')
        if(!mapid.hasClass('resizeFull')){
          mapid.addClass('resizeFull')
        }
        $('.mapboxgl-canvas').height($(mapid).height())
        $('.mapboxgl-canvas').width($(mapid).width())
        this.map.resize();
      });
      this.map.on('click',function(e){});
      $('.mapboxgl-ctrl-logo').hide();
      $('.mapboxgl-ctrl-attrib-inner').hide();
      $('.mapboxgl-ctrl-bottom-left').hide();
      $('.mapboxgl-ctrl-bottom-right').hide();
      $(".mapbox-gl-draw_line").parent().hide()
    },
    updateLine: function(e){
      if(this.editIndex>=0) {
        this.currentMarkers[this.editIndex].spoint.remove()
        this.currentMarkers[this.editIndex].epoint.remove()
        const id = this.currentMarkers[this.editIndex].route.id
        if (this.map.getSource('route'+id)) {
          this.map.removeLayer('route'+id)
          this.map.removeSource('route'+id)
        }
        const routePathData = JSON.parse(this.currentMarkers[this.editIndex].route.area.replace(/\\/g, ""))            
        this.drawControl.delete(routePathData);
        const area = this.drawControl.getAll();
        this.currentMarkers[this.editIndex].route.area = JSON.stringify(area)
        this.routePathData = this.currentMarkers[this.editIndex].route.area
        this.createRoute(this.currentMarkers[this.editIndex].route);
      }
    },
    updateDelete: function(e){
      if(this.editIndex>=0) {
        const {route, spoint, epoint} = this.currentMarkers[this.editIndex];
        const id = route.id
        const groupid= route.gid
        this.setLoading(true)
        this.DELETE_GROUP_ROUTE({routeid: id}).then(res =>{
          if(spoint) spoint.remove()
          if(epoint) epoint.remove()
          if (this.map.getSource('route'+id)) {
            this.map.removeLayer('route'+id)
            this.map.removeSource('route'+id)
          }
          this.drawControl.deleteAll();
          delete this.currentMarkers[this.editIndex];
          this.editIndex = -1
          this.deleteGID = groupid
          this.GET_GROUP_BY_ID({groupid})
        }).catch(error => {
          this.setLoading(false)
          const data = error && error.data
          if(data){
            this.alert(data.message);
          }
        })
      }
    },
    createRoute: function(route) {
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
        }
      });
      const coords = JSON.parse(area).features[0].geometry.coordinates
      var startCoords = coords[0];
      var endCoords = coords[coords.length-1];
      var dot = document.createElement('div');
      var dot2 = document.createElement('div');
      dot.className='numMarker path'+i;
      dot.innerHTML = 'S';
      const spoint = new mapboxgl.Marker(dot).setLngLat([startCoords[0], startCoords[1]]).addTo(this.map)
      dot2.className='numMarker path'+i;
      dot2.innerHTML = 'E';
      const epoint = new mapboxgl.Marker(dot2).setLngLat([endCoords[0], endCoords[1]]).addTo(this.map)
      if(this.editIndex>=0) {
        this.currentMarkers[this.editIndex] = {spoint, epoint, route}
      }else{
        this.currentMarkers.push({spoint, epoint, route});
      }
    },
    removeAllMarkers: function(){
      this.editIndex = -1
      if (_.size(this.currentMarkers)) {
        this.currentMarkers.map(marker => {
          const {route, spoint, epoint} = marker;
          if(!_.isEmpty(spoint)) spoint.remove();
          if(!_.isEmpty(epoint)) epoint.remove();
          if(!_.isEmpty(route)) {
            const id = route.id
            if (this.map.getSource('route'+id)) {
              this.map.removeLayer('route'+id)
              this.map.removeSource('route'+id)
            }
          }
        })
      }
      this.currentMarkers = []
    },
    windowResize: function(){
      if(this.map){
        this.map.resize()
      }
    },
    editRoute(){
      this.setLoading(true)
      this.UPDATE_GROUP_ROUTE(this.currentMarkers[this.editIndex].route).then(res=>{
        this.setLoading(false)
        this.currentMarkers[this.editIndex].route = _.cloneDeep(res.data, true)
        this.editIndex = -1
        this.drawControl.deleteAll();
        this.routePathData = {}
        this.routePathDataOrg = {}
        this.setSelectGroup()
        this.alert(res.message);
      }).catch(error =>{
        this.setLoading(false)
        const data = error && error.data
        if(data){
          this.alert(data.message);
        }
      })
    },
    deleteRoute(){
      this.confirm("선택한 경로를 제하시겠습니까?", (v)=>{
        if(v) {
          this.setLoading(true)
          this.updateDelete()
            this.setLoading(false)
        }
      }, {title:'<i class="fa fa-exclamation-triangle text-warning" aria-hidden="true"></i>알림'})
    },
    docKeyUp: function(e){
      const key = e.key;
      if(this.editIndex>=0 && key === "Delete") {        
        // this.deleteRoute()
      }
    }
  },
  created(){
    window.addEventListener("resize", this.windowResize);
    document.addEventListener('keyup', this.docKeyUp);
  },
  destroyed(){
    window.removeEventListener("resize", this.windowResize);
    document.removeEventListener('keyup', this.docKeyUp);
  },
  mounted(){
    this.setLoading(true)
    this.groupsOptions = []
    this.groupsOptions.push({ value: 0, text: '그롭을 선택하세요' })
    this.GET_GROUP_ROUTE_LIST().then(res => {
      this.setLoading(false)
    }).catch(err =>{
      this.setLoading(false)
    })
    this.GROUP_LIST.map(g => {
      this.groupsOptions.push({value: g.id, text: g.name})
    })
    
  }
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