<template>
  <b-modal id="modal_charge_station" centered :title="getTitle" size="xxl" footer-class="justify-content-end" v-model="visible" @hide="closeModal">
    <div class="position-absolute w-100 h-100 pb-4 pl-5 pr-5" style="right:0;">
      <b-row class="border rounded h-100">
        <b-col md="12" class="text-left">
          <div id="charge_station_map"></div>
        </b-col>
        <b-col md="3" class="ml-auto text-left border-left cbg">
          <div class="p-3">
            <div id="geocoder" class="p-2"></div>
            <b-row class="m-2 rounded bg-light">
              <b-col md="12" class="text-left">
                <b-card class="rounded-0">
                  <template #header>
                    <label for="gname">그룹 이름</label>
                    <b-form-input
                      name="gname"
                      size="sm"
                      type="text"
                      class="mb-3 bg-white text-dark rounded-0"
                      :disabled="true"
                      v-model="group.name"
                    ></b-form-input>
                  </template>
                  <b-form>
                    <label for="cpwd">충전소 이름</label>
                    <b-form-input
                      name="cpwd"
                      class="mb-3"
                      placeholder="이름이 입력하세요"
                      size="sm"
                      type="text"
                      v-model="charge.name"
                    ></b-form-input>

                    <label for="address">현재 충전소 주소</label>
                    <b-form-input
                      disabled
                      name="address"
                      class="mb-2"
                      size="sm"
                      placeholder="주소를 입력하세요"
                      type="text"
                      @keyup.enter="setSearchLocation"
                      v-model="charge.address"
                    ></b-form-input>         
                  </b-form>
                  <b-form-checkbox v-model="setMarkerByClick" name="check-button" switch class="mt-4">
                  마우스 클릭으로 설정 가능
                  </b-form-checkbox>
                  <!-- <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text> -->
                </b-card>
              </b-col>
            </b-row>
          </div>
        </b-col>
      </b-row>
    </div>
    <template #modal-footer="{ ok, cancel, hide}">
    <b-button class="rounded-1" size="sm" @click="hide('forget')">취소</b-button>
    <b-button class="rounded-1 btnPrimary" size="sm" :disabled="isDisabled" @click="applyClick">{{btnApplyName}}</b-button>
    </template>
  </b-modal>
</template>

<script>
const group = 'group'
import {TYPE} from '@/store/modules/group'
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'ChargeModal',
  props:{
    selectgroup:{
      type: Object,
      required: true
    },
    updateObject:{
      type: Object,
      required: true,
      default: () => null
    }
  },
  data(){
    return {
      markers : [],
      setMarkerByClick: false,
      visible: false,
      group:{},
      charge:{
        name:'',
        address:'',
        location:'',
      },
      mapCenter: [127.33198394015267, 36.53732260394233],
    }
  },  
  computed:{
    ...mapGetters(['mapConfig']),
    ...mapGetters(group,[
      TYPE.GET.GROUP_LIST,
      TYPE.GET.GROUP_CHARGE_MAP
    ]),
    getTitle(){
      if(this.isUpdate) {
        return "충전소 위치 수정"
      }
      return "충전소 위치 등록"
    },
    isDisabled(){
      return (_.isEmpty(this.charge.name) || _.isEmpty(this.charge.address) || _.isEmpty(this.charge.location) || (this.updateObject && _.isEqual(this.charge.location, this.updateObject.location) && _.isEqual(this.charge.name, this.updateObject.name)))
    },
    btnApplyName(){
      if(this.isUpdate) {
        return "수정"
      }
      return "등록"
    }
  },
  watch: {
    visible(v){
      if(v) {
        this.initMap()
      }
    }
  },
  methods:{
    ...mapActions(group,[
      TYPE.AC.SET_GROUP_CHARGE_STATION,
      TYPE.AC.GET_GROUP_BY_ID,
    ]),
    closeModal: function(){
      this.$emit('closeGroupCharge')
    },
    applyClick: function(){
      if(!_.isEmpty(this.updateObject) && this.updateObject) {
        this.charge.cmd = 300
      }else{
        this.charge.cmd = 100
        this.charge.id = 0
      }
      this.charge.gid = this.group.id
      let area = JSON.stringify(this.charge.location)
      this.charge.location = area.replace(/\\/g, "")
      this.SET_GROUP_CHARGE_STATION(this.charge).then((res) => {
        const msg = res.message
        if(msg) {
          this.alert(msg, async (ok) => {
            if(ok) {
              await this.GET_GROUP_BY_ID({groupid: this.group.id})
              this.closeModal()
            }
          })

        }
      }).catch((error) => {
        const msg = error.data.message
        if(msg) {
          this.alert(msg)
        }
      });
    },
    setChargeLocation(point) {
      this.charge.location = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { 
            type: 'Point',
            coordinates: [point.lng, point.lat]
          },
          properties: {
          }
        }]
      };
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
    initMap: function(){
      let mapcenter = []
      const s = _.size(this.markers)
      if(s){
        mapcenter = _.cloneDeep(this.markers[s-1].coord, true)
      }else{
        mapcenter = _.cloneDeep(this.mapCenter, true)
      }
      
      let marker_charge = {}
      var _this = this    
      const {token, zoom, closeZoom,minZoom,style} = this.mapConfig
      mapboxgl.accessToken = token;
      var map = new mapboxgl.Map({
          container: 'charge_station_map', // container id
          center: mapcenter,
          zoom: zoom,
          style: style,
          minZoom: minZoom
      });
      // Add the control to the map.
      map.addControl(new mapboxgl.NavigationControl());

      const geocoder = new MapboxGeocoder({ 
        accessToken: token, 
        mapboxgl: mapboxgl,
        marker: false,
        zoom:closeZoom,
        placeholder: '충전소 주소 검색'
      })
      $('#geocoder').append(geocoder.onAdd(map));
      var map_markers_bounds = new mapboxgl.LngLatBounds();
      this.markers.map(c => {
        const el = document.createElement('div');
        if(!_.isEmpty(this.updateObject) && this.updateObject.id === c.data.id) {
          el.className = 'charging-marker active'; 
        }else{
          el.className = 'charging-marker';
        }
        let popup      
        if(_.isEmpty(this.updateObject) || (c.data.id !== this.updateObject.id)) {
          el.addEventListener('mouseover', function () {
            map.getCanvas().style.cursor = 'pointer';
            let description = ""
            description += "<b>Name&nbsp;:&nbsp;</b>" + c.data.name
            description += "<br/><b>Address&nbsp;:&nbsp;</b>" + c.data.address
            popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false
            }).setLngLat(c.coord).setHTML(description).addTo(map);
          });
          el.addEventListener('mouseout', function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
          });
        }
        const m = new mapboxgl.Marker(el).setLngLat(c.coord).setPopup(popup).addTo(map); 
        if(!_.isEmpty(this.updateObject) && c.data.id === this.updateObject.id) {
          m.setDraggable(true)
          marker_charge = m
          marker_charge.on('dragend', function(){
            const lngLat = this.getLngLat();
            _this.setChargeLocation(lngLat)
          });
        }
        map_markers_bounds.extend(_.values(m._lngLat));
      })

      map.on('load', () => {
        geocoder.on('result', (event) => {
          const coordinates = event.result.geometry.coordinates
          _this.setChargeLocation({lng : coordinates[0], lat:coordinates[1]})
          if(!_.isEmpty(marker_charge)) {
            marker_charge.remove();
          }
          const el = document.createElement('div');
          el.className = 'charging-marker active';
          marker_charge = new mapboxgl.Marker(el, {draggable: true} ).setLngLat(coordinates).addTo(map); 
          marker_charge.on('dragend', function(){
            const lngLat = this.getLngLat();
            _this.setChargeLocation(lngLat)
          });
        });
        const mapid = $('#charge_station_map')
        if(!mapid.hasClass('resizeFull')){
          mapid.addClass('resizeFull')
        }
        $('.mapboxgl-canvas').height($(mapid).height())
        $('.mapboxgl-canvas').width($(mapid).width())
        map.resize();
        $(document).ready(() =>{
          if(_.size(map_markers_bounds)){
            if(!_.isEmpty(this.updateObject)) {
              let area = this.updateObject.location
              area = area.replace(/\\/g, "")
              area = JSON.parse(area)
              area = area.features[0].geometry.coordinates
              map.flyTo({
                center: [area[0], area[1]],
                zoom: 15,
                essential: true
              });
            }else{
              map.fitBounds(map_markers_bounds, {
                maxZoom: 15,
                padding: 140
              });
            }
          }
        })
      });
      map.on('click',function(e){
        if(_this.setMarkerByClick){
          const c = e.lngLat
          _this.setChargeLocation(c)
          if(!_.isEmpty(marker_charge)) {
            marker_charge.remove();
          }
          const el = document.createElement('div');
          el.className = 'charging-marker active';
          marker_charge = new mapboxgl.Marker(el, {draggable: true} ).setLngLat(c).addTo(map); 
          marker_charge.on('dragend', function(){
            const lngLat = this.getLngLat();
            _this.setChargeLocation(lngLat)
          });
        }
      });
      //로고 삭제
      $('.mapboxgl-ctrl-logo').hide();
      $('.mapboxgl-ctrl-attrib-inner').hide();
      $('.mapboxgl-ctrl-bottom-left').hide();
      $('.mapboxgl-ctrl-bottom-right').hide();
    }
  },
  mounted(){
    if(_.isNull(this.updateObject)) this.updateObject = {}
    this.group = this.selectgroup
    let idx = this.group.id
    if(!_.isEmpty(this.updateObject) && !idx && this.updateObject) {
      idx = this.updateObject.gid
      this.group = this.GROUP_LIST.filter(g => g.id === idx)[0]
    }
    if(this.GROUP_CHARGE_MAP[idx]) {
      this.GROUP_CHARGE_MAP[idx].map(c => {
        const area = c.location.replace(/\\/g, "")
        c.location = area
        if(!_.isEmpty(this.updateObject) && c.id === this.updateObject.id) {
          this.charge = {...c}
          this.charge.location = area
        }
        const d = JSON.parse(area)
        this.markers.push({coord: d.features[0].geometry.coordinates, data: c})
      })
    }
  }
}
</script>

<style lang="scss">
.cbg{
  background: aliceblue;
  position: absolute;
  top: 0.8rem;
  left: 3rem;
}
</style>