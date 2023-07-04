<template>
  <div style="height: 100vh">
    <Header />
    <div class="mainDiv">
        <div class="row h-60 bg-light">
            <div class="col-md-6 p-2">
                <div class="dash_wrapper bg-light h-100 shadow border-white">
                   <div class="row h-100">
                        <div class="col-md-5 p-2">
                            <div class="card h-100 radius-10">
                                <div class="card-body">
                                    <img src="@/assets/img/intro/vh_img.png" class="w-100"/>
                                    <div class="d-flex justify-content-between" v-if="selectedVH">
                                        <i v-if="is0" class="fa fa-battery-empty fa-rotate-270 text-danger" aria-hidden="true"></i>
                                        <i v-if="isGt20" class="fa fa-battery-quarter fa-rotate-270 text-danger" aria-hidden="true"></i>
                                        <i v-if="isGt40" class="fa fa-battery-half fa-rotate-270 text-primary" aria-hidden="true"></i>
                                        <i v-if="isGt60" class="fa fa-battery-three-quarters fa-rotate-270 text-info" aria-hidden="true"></i>
                                        <i v-if="isGt80" class="fa fa-battery-full fa-rotate-270 text-success" aria-hidden="true"></i>
                                        <div class="w-100 bg-light rounded border d-flex">
                                            <div class="rounded" :class="getBattaryLen" :style="{'width': getCurrentBattary}">&nbsp;</div>
                                            <span class="position-absolute b-80 font-weight-bold text-center">{{selectedVehicle.battery}}%</span>
                                        </div>
                                    </div>
                                    <ul class="list-group h-60 align-items-center justify-content-center" v-if="selectedVH">
                                        <li class="list-group-item bg-light shadow-sm w-100 m-1">
                                            <div class="d-flex justify-content-between">
                                                <span class="font-weight-bold">속도</span>
                                                <span>{{selectedVehicle.speed}}km/h</span>
                                            </div>
                                        </li>
                                        <li class="list-group-item bg-light shadow-sm w-100 m-1">
                                            <div class="d-flex justify-content-between">
                                                <span class="font-weight-bold">청소량</span>
                                                <span>{{selectedVehicle.clean_completion}}%</span>
                                            </div>
                                        </li>
                                        <li class="list-group-item bg-light shadow-sm w-100 m-1">
                                            <div class="d-flex justify-content-between">
                                                <span class="font-weight-bold">남은시간</span>
                                                <span>{{selectedVehicle.clean_remain_time}}분</span>
                                            </div>
                                        </li>
                                        <li class="list-group-item bg-light shadow-sm w-100 m-1">
                                            <div class="d-flex justify-content-between">
                                              <span class="font-weight-bold">주행 상태</span>
                                              <span>{{selectedVehicle.system_mode}}</span>
                                            </div>
                                        </li>
                                        <li class="list-group-item bg-light shadow-sm w-100 m-1">
                                            <div class="d-flex justify-content-between">
                                                <span class="font-weight-bold">시스템 상태</span>
                                                <span>{{selectedVehicle.system_error}}</span>
                                            </div>
                                        </li>
                                    </ul>
                                    <div class="h-60 bg-light radius-10" v-if="!selectedVH">
                                      <div class="row align-items-center justify-content-center h-100 text-secondary">
                                        <i class="fa fa-info-circle fa-2x pr-2 text-info" aria-hidden="true"></i>
                                        <span>차량 정보</span>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-7 p-2 pl-0">
                            <div class="card h-80 radius-10 align-items-center justify-content-center shadow" style="min-height:300px">
                                <div class="vdo-url-setting" v-if="selectedVH && !isShownVideoURLSetting">
                                  <b-button size="sm" variant='light' class="btn" @click="isShownVideoURLSetting=true">
                                    <b-icon icon="link45deg"></b-icon>
                                  </b-button>
                                </div>
                                <div class="frameWrapper">
                                  <div class="bg-light text-white videopanel radius-10" :class="{'no-signal': !isCameraOn}" id="div_veideo_panel" v-show="!isShownVideoURLSetting">
                                    <div class="real-time-vdo-caption">
                                      실시간 운행 화면
                                    </div>
                                    <div v-show="isCameraOn" class="h-100 w-100 position-relative" :class="{'bg-dark': isCameraOn}" style="border-radius:14px;">
                                      <div v-if="isPlaying" class="livetext">
                                        <span class="bg-white p-1 rounded">
                                          <b-icon icon="circle-fill" animation="throb"></b-icon>&nbsp;LIVE
                                        </span>
                                        <span class="text-white pl-2 font-weight-bold">{{videoTimer}}</span>
                                      </div>
                                      <canvas class="h-100 w-100 radius-10" width="1280" height="740" :id="videoCanvas">
                                        You browser doesn't support the Canvas Tag. Please use Chrome, Firefox or Safari
                                      </canvas>
                                      <transition name="fade">
                                        <template v-if="isShowCtrlBtn">
                                          <b-button v-if="isPlaying" size="sm"  variant='dark' class="btn shadow videoButton" @click="setStopVdoStream" style="bottom:42%">
                                            <i class="fa fa-stop-circle fa-3x"></i>
                                          </b-button>
                                          <b-button v-else size="sm"  variant='dark' class="btn shadow videoButton" @click="setPlayVdoStream">
                                            <i class="fa fa-play-circle fa-3x"></i>
                                          </b-button>
                                        </template>
                                      </transition>
                                    </div>
                                    <div v-if="!isCameraOn" class="d-flex justify-content-center align-items-center videopanel radius-10">
                                      <div v-if="isStreamLoading" class="text-center">
                                        <b-icon icon="three-dots" animation="cylon" font-scale="2" class="text-dark"></b-icon><br/>
                                        <b-badge variant="info"><span>{{$t('Dash.txt_stream_requesting')}}</span></b-badge>
                                      </div>
                                      <div v-else class="text-center">
                                        <b-button size="sm"  class="btn shadow" variant='dark' @click="setVdoStream" :disabled="!validStreamUrl || !isEngineOn">
                                          <i class="fa fa-play-circle fa-3x"></i>
                                        </b-button>
                                        <template v-if="selectedVehicle.id">
                                          <br />
                                          <b-badge variant="info">
                                          <span v-if="!isEngineOn">{{$t('Dash.txt_offline')}}</span>
                                          <span v-if="!validStreamUrl && isEngineOn">{{$t('Dash.txt_no_stream_url')}}</span>
                                          <span v-if="selectedVHCamera===-1 && isEngineOn">{{$t('Dash.txt_fail_to_stream')}}</span>
                                          </b-badge>
                                        </template>
                                      </div>
                                    </div>          
                                  </div>
                                  <div class="w-100 h-100 bg-light radius-10" style="z-index:90000" v-show="isShownVideoURLSetting">
                                    <div class="card h-100 radius-10">
                                      <div class="card-body">
                                          <div class="p-2">
                                            [ <span class="text-primary">{{selectedVehicle.name}}</span>]<span class="pl-2 text-dark">비디오 링크 설정</span>
                                          </div>
                                          <div class="h-75 bg-light p-2 radius-10">
                                            <b-list-group class="pt-2">
                                              <b-list-group-item class="mb-2">
                                              {{$t('Dash.txt_streaming_url')}}
                                              </b-list-group-item>
                                              <b-list-group-item class="pt-3">
                                                <b-form-textarea
                                                  v-model="selectedVehicle.camera_stream"
                                                  placeholder="rtsp://192.168.0.1:8554/test"
                                                  rows="3"
                                                  max-rows="6"
                                                ></b-form-textarea>
                                                <div class="text-center">
                                                  <b-button size="sm" class="btn w-40 m-2" variant='primary' @click="saveVideoUrlSetting(true)" :disabled="!isStreamChanged">
                                                    <b-icon icon="gear-fill" aria-hidden="true"></b-icon>&nbsp; {{$t('btn_change')}}
                                                  </b-button>
                                                  <b-button size="sm" class="btn w-40 m-2" variant='dark' @click="saveVideoUrlSetting(false)">
                                                    {{$t('btn_cancel')}}
                                                  </b-button>
                                                </div>
                                              </b-list-group-item>
                                            </b-list-group>
                                          </div>
                                      </div>
                                  </div>
                                </div>
                              </div>                                
                            </div>
                            <div class="h-20 d-flex align-items-end">
                                <div class="d-flex h-75 w-100">
                                    <div class="w-100 pr-2">
                                        <button class="btn w-100 h-100 radius-10 border"
                                            :disabled="!selectedVH || !isEngineOn" 
                                            :class="{'bg-white':!isReturn, 'btn-return':isReturn}"
                                            @click="setVehicleEmergency(3)">
                                            <div class="d-flex align-items-between justify-content-center">
                                                <b-icon icon="bootstrap-reboot" font-scale="2" aria-hidden="true"></b-icon>
                                                <span class="btn-text-sm pl-2">복귀</span>
                                            </div>
                                        </button>
                                    </div>
                                    <!-- <div class="w-50 pl-2">
                                        <button class="btn w-100 h-100 radius-10 border" style="background-color: #9dc3e6 #ff9800" :disabled="!selectedVH || !isEngineOn" @click="setVehicleManualDriving(0)">
                                            <img src="@/assets/img/control/control_off_icon_black.png" width="34px"/>
                                            <span class="btn-text-sm pl-2">수동운행</span>
                                        </button>
                                    </div> -->
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </div>
            <div class="col-md-6 p-2 radius-10">
                <div class="bg-white h-100 p-2 shadow radius-10">
                    <div id="realtime__map"></div>
                </div>
            </div>            
        </div>
        <div class="row h-40 bg-light">
          <div class="col-md-12 p-2">
                <div class="dash_wrapper bg-white h-100 p-2">
                    <div class="row h-100 rounded align-items-center justify-content-between bg-light">
                        <div class="col-md-3 col-sm-12 w-25 h-100 p-1">
                            <div class="d-flex justify-content-between h-50">
                                <div class="shadow h-100 w-100 ml-2 mr-2 radius-10">
                                    <button class="btn w-100 h-100 radius-10" 
                                            :class="{'bg-white':!isEmStop, 'btn-emstop':isEmStop}"
                                            :disabled="!selectedVH || !isEngineOn" 
                                            @click="setVehicleEmergency(1)">
                                        <span class="btn-text">긴급정지</span>
                                    </button>
                                </div>
                                <div class="shadow h-100 w-100 ml-2 mr-2 radius-10">
                                    <button class="btn w-100 h-100 radius-10" 
                                            :disabled="!selectedVH || !isEngineOn" 
                                            :class="{'bg-white':!isEvacuation, 'btn-evacuation':isEvacuation}"
                                            @click="setVehicleEmergency(2)">
                                        <span class="btn-text">긴급대피</span>
                                    </button>
                                </div>
                            </div>
                            <div class="h-50 p-2 mt-1">
                                <div class="shadow h-100 radius-10">
                                    <button class="btn w-100 h-100 radius-10" 
                                            :disabled="!selectedVH || !isEngineOn" 
                                            @click="setAutoMode(selectedVehicle.id, !isAutoMode)" 
                                            :class="{'bg-white':!isAutoMode, 'bg-primary':isAutoMode}">
                                        <span v-show="isAutoMode" class="btn-text text-white">주행 중료</span>
                                        <span v-show="!isAutoMode" class="btn-text">주행 시작</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-9 col-sm-12 w-75 h-100">
                            <div class="row h-100 p-0 shadow radius-10 ">
                              <div class="col-6 p-2 ">
                                <div class="bg-white border radius-10 h-100">
                                    <el-table :columns="tbColumns" :tabledata="tabledata" :h100="true" :showcheckbox="false" :singleSelection="true" @selectCheckbox="selectCheckbox" />
                                </div>
                              </div>
                              <div class="col-6 p-2">
                                <div class="bg-white border radius-10 h-100">
                                    <b-tabs fill class="fod-tab" content-class="pb-2" >
                                      <b-tab title="FOD" active>
                                        <div class="table-container">
                                          <el-fod-table :columns="tbColumns1" :tabledata="tabledata1"/>
                                        </div>
                                      </b-tab>
                                      <b-tab title="조류">
                                        <div class="table-container">
                                          <el-fod-table :columns="tbColumns1" :tabledata="tabledata2"/>
                                        </div>
                                      </b-tab>
                                    </b-tabs>
                                </div>
                              </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        
    <Footer />
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
import VehicleFodPopup from '@/components/VehicleFodPopup.vue'
import VehicleCardRow from '@/components/VehicleCardRow.vue'
import VehicleCardRowDetail from '@/components/VehicleCardRowDetail.vue'
import ElTable from '@/components/ElTable.vue'
import ElFodTable from '@/components/ElFodTable.vue'

//images
import vImage from '@/assets/img/control/vehicle.png'

const g_system_mode = {
  0 : "대기 상태 ",
  1 : "수동 상태  (수동 조이스틱)",
  2 : "자율 운전 상태",
  3 : "긴급 정지 상태",
  4 : "대피로 대피 상태",
  5 : "복귀 중 상태",
  6 : "FOD 청소 상태 중",
  7 : "자율 운전 및 조류 퇴치 상태"
}

const g_system_error = {
  0 : "정상",
  // 1100 : "센서 이상 감지",
  // 1110 : "센서 이상 감지 - 1122",
  // 1120 : "센서 이상 감지 - 카메라",
  // 1130 : "센서 이상 감지 - IMU",
  // 1140 : "센서 이상 감지 - GPS",
  // 1150 : "센서 이상 감지 - 모터",
  // 1200 : "감지 이상 감지",
  // 1300 : "지도 이상 감지",
  // 1400 : "현지화 이상 감지",
  // 1500 : "계획 이상 감지",
  // 1400 : "제어 이상 감지",
  // 1500 : "차량 이상 감지",
  // 1600 : "시스템 이상 감지",
  1100 : "센서 이상 감지",
  1110 : "라이다",
  1120 : "카메라",
  1130 : "IMU",
  1140 : "GPS",
  1150 : "제어 모터",
  1160 : "조류 퇴치기",
  1200 : "감지 이상 감지",
  1210 : "감지  프로세스 동작 이상",
  1300 : "지도 이상 감지",
  1310 : "지도 프로세스 동작 이상",
  1400 : "현지화 이상 감지",
  1410 : "현지화 프로세스 동작 이상",
  1420 : "현지화 프로세스 성능 이상",
  1500 : "계획 이상 감지",
  1510 : "계획 프로세스 동작 이상",
  1600 : "제어 이상 감지",
  1610 : "차량 제어 이상",
  1620 : "차량 제어값 이상",
  1700 : "차량 이상 감지",
  1800 : "시스템 이상 감지",
  1810 : "시스템 프로세스 동작 이상",
  1820 : "CPU 리소스 이상",
  1830 : "GPU 리소스 이상",
  1840 : "Memory 리소스 이상",
  1850 : "Storage 리소스 이상"
}

export default {
  name: 'Dashboard',
  components:{
    Header,
    Footer,
    ElTable,
    ElFodTable,
    VehiclePopup,
    VehicleFodPopup,
    VehicleCardRow,
    VehicleCardRowDetail
  },
  data(){
    return {
      wsSocket: {},
      videoPlayer:{},
      isCameraOn: false,
      btnActive: 1,
      vehicleState: 0,
      videoStream: 0,
      isPlaying: false,
      isStreamLoading: false,
      currentTimeout: -1,
      isShowCtrlBtn: false,
      camera_stream_url:'',
      isRecording: false,
      isShownVideoURLSetting: false,
      videoTimer: '00:00:00',
      fod_list: [],

      selectedVH: 0,
      map: Object,
      currentMarkers: {},
      mapCenter: [127.36855814055015, 36.52965449036096], 
      toastCount: 0,
      vehicleList: Object,
      vTableData: [],
      vhTable: [],
      allMarkerBounds : [],
      selectedVehicle:{},
      selectedVHCamera: 0,
      isShowDetail: false,
      txtsearch_vh:'',
      tabledata: [],
      tbColumns: [
        {text: "상태", width: "60px", align: 'center'},
        {text: "차량이름"},
        {text: "주행 영역"},
        {text: "베터리"},
        {text: "청소량"},
        {text: "남은시간"},
        {text: "주행 상태"},
      ],
      tabledata1: [],
      tabledata2: [],
      tbColumns1: [
        {text: "Event ID"},
        {text: "주행 영역"},
        {text: "검출된 시간"},
        {text: "FOD 종류"},
        {text: "이미지"},
        {text: "비디오"}
      ]
    }
  },
  computed: {
    ...mapGetters(['mapConfig']),
    ...mapGetters(vehicle, [
      VH_TYPE.GET.VEHICLE_FOD,
      VH_TYPE.GET.VEHICLE_TYPES
    ]),
     isEngineOn(){
      return (this.selectedVehicle.state & code.vehicle.state.on)?true:false
    },
    isAutoMode(){
      return (this.selectedVehicle.state & code.vehicle.state.autonomous_mode)?true:false
    },
    isCleanMode(){
      return (this.selectedVehicle.state & code.vehicle.state.clean_mode)?true:false
    },
    isChargeMode(){
      return (this.selectedVehicle.state & code.vehicle.state.charge_mode)?true:false
    },
    isParkMode(){
      return (this.selectedVehicle.state & code.vehicle.state.parking_mode)?true:false
    },
    validStreamUrl(){
      return (this.selectedVehicle.camera_stream && this.selectedVehicle.camera_stream.length)?true: false
    },
    videoCanvas(){
      return "videoView"+this.selectedVehicle.id
    },    
    videoBtnPlay(){
      return "btnPlay"+this.selectedVehicle.id
    },
    videoBtnStop(){
      return "btnStop"+this.selectedVehicle.id
    },
    isStreamChanged(){
      return !_.isEqual(this.selectedVehicle.camera_stream, this.camera_stream_url)
    },
    is0(){
      if(_.isEmpty(this.selectedVehicle)) return false;
      return this.selectedVehicle.battery <= 0
    },
    isGt20(){
      if(_.isEmpty(this.selectedVehicle)) return false;
      return this.selectedVehicle.battery >0 && this.selectedVehicle.battery<40
    },
    isGt40(){
      if(_.isEmpty(this.selectedVehicle)) return false;
      return this.selectedVehicle.battery >=40  && this.selectedVehicle.battery<60
    },
    isGt60(){
      if(_.isEmpty(this.selectedVehicle)) return false;
      return this.selectedVehicle.battery >=60 && this.selectedVehicle.battery<80
    },
    isGt80(){
      if(_.isEmpty(this.selectedVehicle)) return false;
      return this.selectedVehicle.battery >=80
    },
    getCurrentBattary() {
      return this.selectedVehicle.battery+"% !important"
    },
    getBattaryLen() {
      let ret = ""
      if(this.isGt80){
        ret = "bg-success";
      }else if(this.isGt60){
        ret = "bg-success";
      }else if(this.isGt40){
        ret = "bg-primary";
      }else if(this.isGt20){
        ret = "bg-danger";
      }
      return ret;
    },
    isEmStop(){
      return this.selectedVehicle.state &  code.vehicle.state.em_stop_mode
    },   
    isEvacuation(){
      return this.selectedVehicle.state &  code.vehicle.state.evacuation_mode
    },
    isReturn(){
      return this.selectedVehicle.state &  code.vehicle.state.return_mode
    }   
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
    },
    selectedVHCamera(v){
      if(v === 1){
        this.initStream()
      }
      else if(v === -1) {
        this.setStopStream()
      }
    },
    isPlaying(v){
      if(!_.isEmpty(this.videoPlayer)) {
        if(v) {
          if(typeof this.videoPlayer.playVideo === 'function') {
            this.videoPlayer.playVideo()
          }
        }
        else {
          if(typeof this.videoPlayer.pauseVideo === 'function') {
            this.videoPlayer.pauseVideo()
          }
        }
      }
    },
    VEHICLE_FOD(data){
      this.fod_list = data;
      this.tabledata1 = []
      this.tabledata2 = []
      this.fod_list.map(item => {
        let image = '', video = ''
        if(item.image && item.image !== ''){
          image = item.image
          // image = `<button type="button" class="btn btn-sm"><i class="fa fa-camera" aria-hidden="true"></i></button>`
        }
        if(item.video && item.video !== ''){
          video = item.video
          // video = `<button type="button" class="btn btn-sm"><i class="fa fa-video-camera" aria-hidden="true"></i></button>`
        }
        
        this.tabledata1.push({
          id: item.id,
          data: {
            event_id: item.id,
            clean_lace: "Demo Area",
            date_time: item.create_dt,
            fod: item.label,
            image: image,
            video: ''
          }
        })
        this.tabledata2.push({
          id: item.id,
          data: {
            event_id: item.id,
            clean_lace: "Demo Area",
            date_time: item.create_dt,
            fod: item.label,
            image,
            video
          }
        })
      });
    },
    fod_list(d){
      if(d.length > 0){
        this.createFod();
      }
    }
  },
  methods: {
    ...mapActions(vehicle, [
      VH_TYPE.AC.GET_VEHICLE_LIST,
      VH_TYPE.AC.GET_VEHICLE_FOD
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
    selectCheckbox: function(ids){
      this.camera_stream_url = ""
      this.isShownVideoURLSetting = false
      this.clearFod();
      if(ids && ids.length){
        const vh = this.vTableData.filter(item=> item.id===ids[0])
        if(vh && vh.length){
          if(this.isCameraOn || this.isStreamLoading){
            this.setStopStream()
            this.isCameraOn = false
            this.isStreamLoading = false
          }
          this.selectedVehicle = vh[0]
          this.camera_stream_url = this.selectedVehicle.camera_stream
          this.listSelectedVehicle(this.selectedVehicle);
          this.getDetectedFOD()
        }else{
          this.selectedVH = -1
          this.selectedVehicle = {}
          this.listSelectedVehicle({id:-1});
        }
      }else{
        this.selectedVH = -1
        this.selectedVehicle = {}
        this.listSelectedVehicle({id:-1});
      }
    },
    showVideoUrlSetting() {
      if(_.isEmpty(this.selectedVehicle) && this.selectedVH){
        this.isShownVideoURLSetting = true;
      }
    },
    saveVideoUrlSetting(flag) {
      this.isShownVideoURLSetting = false;
      if(flag) {
        if(!_.isEmpty(this.selectedVehicle) && this.selectedVH){
          const payload = {url: this.selectedVehicle.camera_stream}
          const command = this.genData('command', code.cmd.set_streaming_info, this.selectedVehicle.id, payload)
          this.sendSocket(command)
          this.camera_stream_url = this.selectedVehicle.camera_stream
        }
      }
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
    getDetectedFOD() {
      if(this.selectedVehicle && this.selectedVH) {
        if(this.selectedVehicle.clean_route_id){
          const data = {vid: this.selectedVehicle.id, rid: this.selectedVehicle.clean_route_id}
          this.GET_VEHICLE_FOD(data);
        }
      }
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
        this.GET_VEHICLE_LIST(true).then(data => {
          this.tabledata = []
          data.map(v => {
            if(v && v.latitude && v.longitude) {
              v.system_error = '-' //g_system_error[0]
              v.system_mode = '-' //g_system_mode[0]
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
      // this.selectedVehicle = {}
      if(this.selectedVH !== v.id) {
        this.selectedVH = v.id
        this.map.flyTo({
          center: [v.longitude, v.latitude],
          zoom: 15,
          essential: true
        });
      }else{
        this.selectedVH = 0
        this.fitToPoint(this.allMarkerBounds)
      }
    },
    clearFod(){
      this.tabledata1 = []
      this.tabledata2 = []
      this.fod_list.map(item => {
        if(item["marker"]) {
          item["marker"].remove();
          item["marker"] = undefined;
        }
      })
    },
    createFod(){
      this.fod_list.map((item) => {
        item = this.createFodMarker(item);
      })
    },
    createFodMarker(item) {
      if(!item["marker"]) {
        const el = document.createElement('div');
        el.className='fodMarker';
        el.innerHTML = '<i class="fa fa-puzzle-piece" aria-hidden="true"></i>';          
        // create the popup
        const vPopup = new Vue({
          ...VehicleFodPopup,
          parent: this,
          propsData: { data: item }
        }).$mount()          
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
        }).setDOMContent(vPopup.$el)
        popup._content.classList.add('showImage');
        item["marker"] = new mapboxgl.Marker(el).setLngLat([item.lon, item.lat]).setPopup(popup).addTo(this.map);
        item["elMarker"] = el
        this.map.resize();
      }
      return item
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
        this.tabledata.push({
          id:v.id,
          data: {
            status: '<div class="'+v.status+'"><span class="blink"></span></div>',
            name: v.name,
            cleaning_place: 'Demo Area',
            battery: v.battery+"%",
            clean_completion: v.clean_completion +"%",
            clean_remain_time: v.clean_remain_time +"분",            
            system_mode: v.system_mode,            
          }
        })
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

      for(let i=0;i<this.tabledata.length;i++){
        const item = this.tabledata[i]
        if(item.id===v.id) {
          item.data = {
            status: '<div class="'+v.status+'"><span class="blink"></span></div>',
            name: v.name,
            cleaning_place: 'Demo Area',
            battery: v.battery+"%",
            clean_completion: v.clean_completion +"%",
            clean_remain_time: v.clean_remain_time +"분",              
            system_mode: v.system_mode,
          }
          break;
        }
      }
    },
    setCleanRouteSelection(route) {
      if(!_.isEmpty(route)) {
        let area = route.area.replace(/\\/g, "")
        area = JSON.parse(area)
        
        const i = route.id
        if (this.map.getSource('route'+i)) {
          // this.map.removeLayer('route'+i)
          // this.map.removeSource('route'+i)
          if(this.currentMarkers["marker"+i]) {
            if(this.currentMarkers["marker"+i]["start"])
              this.currentMarkers["marker"+i]["start"].remove();
            if(this.currentMarkers["marker"+i]["end"])
              this.currentMarkers["marker"+i]["end"].remove();
            if(this.currentMarkers["marker"+i]["home"])
              this.currentMarkers["marker"+i]["home"].remove();
          }
          this.map.getSource('route'+i).setData(area);
        }else{
          this.map.addSource('route'+i, {
          type: 'geojson',
          lineMetrics: true,
          data: area
        });

        const pathColor = ['#0045bc','#6e0e97']
          this.map.addLayer({
            id: 'route'+i,
            // type: 'line',
            type: 'circle',
            source: 'route'+i,
            // paint: {
            //   'line-color': 'gray',
            //   'line-width': 10,
            //   'line-dasharray': [1, 1],
            // },

            paint: {
              'circle-color': 'red',
              'circle-radius': 6,
            },

            // layout: {
            //   'line-join': 'round',
            //   'line-cap': 'round'
            // },
            // paint: {
            //   'line-color': pathColor[0],
            //   'line-width': 4,
            //   // 'line-gradient' must be specified using an expression
            //   // with the special 'line-progress' property
            //   'line-gradient': [
            //     'interpolate',
            //     ['linear'],
            //     ['line-progress'],
            //     0,
            //     pathColor[0],
            //     .1,
            //     pathColor[1]
            //   ]
            // }
          });
        }
        
        if(!this.currentMarkers["marker"+i]) {
          this.currentMarkers["marker"+i] = {start: undefined, end: undefined, home: undefined}
        }
        
        if(route.start_point && route.start_point!="") {
          const startPoint = JSON.parse(route.start_point)
          var start_point = document.createElement('div');
          start_point.className='numMarker path'+i;
          start_point.innerHTML = 'S';
          this.currentMarkers["marker"+i]["start"] = new mapboxgl.Marker(start_point).setLngLat([startPoint[0], startPoint[1]]).addTo(this.map);
        }
        if(route.end_point && route.end_point!="") {
          const endPoint = JSON.parse(route.end_point)
          var end_point = document.createElement('div');
          end_point.className='numMarker numMarkerE path'+i;
          end_point.innerHTML = 'E';
          this.currentMarkers["marker"+i]["end"] = new mapboxgl.Marker(end_point).setLngLat([endPoint[0], endPoint[1]]).addTo(this.map);
        }
        if(route.home_point && route.home_point!="") {
          const homePoint = JSON.parse(route.home_point)
          var home_point = document.createElement('div');
          home_point.className='numMarker numMarkerE path'+i;
          home_point.innerHTML = 'H';
          this.currentMarkers["marker"+i]["home"] = new mapboxgl.Marker(home_point).setLngLat([homePoint[0], homePoint[1]]).addTo(this.map);    
        }
        this.map.resize(); 
      }
    },
    procEvents: function({header, payload}){
      const {Code, VID} = header
      switch(Code) {
        case code.evt.update_info:
          const key = 'VH'+VID;
          if(this.vehicleList[key]) {
            const {lon, lat, speed, water, garbage, battery, cleanning, clean_completion, clean_remain_time, system_mode, error }  = payload
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
                  if(battery>=0) vh.battery = battery>100?100:battery
                  if(clean_completion>=0) vh.clean_completion = clean_completion>100?100:clean_completion
                  if(clean_remain_time>=0) vh.clean_remain_time = clean_remain_time>=60?60:clean_remain_time

                  if(cleanning && (vh.state & code.vehicle.state.clean_mode)==0)  
                    vh.state |= code.vehicle.state.clean_mode
                  else if(cleanning == 0 && (vh.state & code.vehicle.state.clean_mode))
                    vh.state &= ~code.vehicle.state.clean_mode
                  
                  // if(system_mode && (vh.state & code.vehicle.state.autonomous_mode)==0)  
                  //   vh.state |= code.vehicle.state.autonomous_mode
                  // else if(system_mode == 0 && (vh.state & code.vehicle.state.autonomous_mode))
                  //   vh.state &= ~code.vehicle.state.autonomous_mode
                  
                  let er = error
                  if(typeof error === 'string'){
                    er = parseInt(error)
                  }
                  let mode = system_mode
                  if(typeof system_mode === 'string'){
                    mode = parseInt(system_mode)
                  }

                  switch(mode) {
                    // auto stop
                    case 0:
                    case 1:
                      vh.state &= ~code.vehicle.state.autonomous_mode
                    break;
                    // 긴급 정지
                    case 3:
                      vh.state |= code.vehicle.state.em_stop_mode
                      vh.state &= ~(code.vehicle.state.evacuation_mode|code.vehicle.state.return_mode|code.vehicle.state.autonomous_mode)
                    break;
                    // 긴급 대피
                    case 4:
                      vh.state |= code.vehicle.state.evacuation_mode
                      vh.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.return_mode|code.vehicle.state.autonomous_mode)
                    break;
                    // 복귀
                    case 5:
                      vh.state |= code.vehicle.state.return_mode
                      vh.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.evacuation_mode|code.vehicle.state.autonomous_mode)
                    break;
                    // Auto start
                    case 2:
                    case 6:
                    case 7:
                      vh.state |= code.vehicle.state.autonomous_mode
                      vh.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.evacuation_mode|code.vehicle.state.return_mode)
                    break;
                  }

                  vh.system_error = g_system_error[er]?g_system_error[er]:'-'
                  vh.system_mode = g_system_mode[mode]?g_system_mode[mode]:'-'

                  if(!_.isEmpty(this.selectedVehicle) && this.selectedVehicle.id === VID) {
                    this.selectedVehicle = _.cloneDeep(vh)
                  }

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
        case code.evt.video_stream_info:
          const {video_info} = payload
          if(video_info) {
            const temp = video_info.split("time=");
            if(temp && temp.length>0) {
              const s = temp[1].split(' ')
              this.videoTimer = s[0].split('.')[0]
            }
          }
          break;
        case code.evt.detected_fod:
          if(!_.isEmpty(this.selectedVehicle) && VID === this.selectedVehicle.id){            
            const item = this.createFodMarker(payload)
            this.fod_list.push(item)
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
          if(this.selectedVehicle) {
            if(VID === this.selectedVehicle.id) {
              this.setStopStream()
            }
          }
          break;
        case code.cmd.set_self_driving:
          this.vTableData.map(v =>{
            if(v.id === VID) {
              if(payload.data){
                v.state |= code.vehicle.state.autonomous_mode
                v.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.evacuation_mode|code.vehicle.state.return_mode)
              } 
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
              const {engin, data} = payload
              // if(engin == 0) {
              //   v.state &= ~code.vehicle.state.on
              // }else{
              //   v.state |= code.vehicle.state.on
              // }
              
              if(data === 1) {
                v.state |= code.vehicle.state.em_stop_mode
                v.state &= ~(code.vehicle.state.evacuation_mode|code.vehicle.state.return_mode|code.vehicle.state.autonomous_mode)
              } else if(data === 2) {
                v.state |= code.vehicle.state.evacuation_mode
                v.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.return_mode|code.vehicle.state.autonomous_mode)
              }else if(data === 3) {
                v.state |= code.vehicle.state.return_mode
                v.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.evacuation_mode|code.vehicle.state.autonomous_mode)
              }else{
                v.state &= ~(code.vehicle.state.em_stop_mode|code.vehicle.state.evacuation_mode|code.vehicle.state.return_mode)              
              }

              if(!_.isEmpty(this.selectedVehicle) && this.selectedVehicle.id === VID) {
                this.selectedVehicle = _.cloneDeep(v)
              }
              this.SET_UPDATE_VEHICLE(v)
            }
          })
          break;
        case code.cmd.set_route:
          const subcmd = payload.subcmd
          const route_id = payload.data.id;
          if(subcmd==="update" || subcmd==="delete") {
            if(this.vehicleList[key].clean_route.id === route_id){
              const dataJson = {route_id}
              const command = this.genData('command', code.cmd.get_clean_route, VID, dataJson)
              this.sendSocket(command)
            }
          }
          break;
        default:
          break;
      }
    },
    windowResize: function(){
      if(this.map){
        this.map.resize()
      }
    },
    setPlayVdoStream() {
      this.initStream();
    },
    setStopVdoStream() {
      this.setStopStream();
    },
    setStopStream(){
      if(!_.isEmpty(this.videoPlayer)) {
        if(typeof this.videoPlayer.stopStream === 'function') {
          this.videoPlayer.stopStream()
        }
        this.selectedVHCamera = 0;
        this.videoStream = false
        this.isStreamLoading = false
        this.isCameraOn = false
        this.videoPlayer = {}
        this.isPlaying = false
        this.videoStream = false
        this.setStreamStatus(this.selectedVehicle.id, false, this.selectedVehicle.camera_stream)
        this.wsSocket.close()
        if(this.currentTimeout) {
          clearTimeout(this.currentTimeout)
          this.currentTimeout = -1
        }
      }
    },
    initStream() {
      if(this.videoStream) {
        const readyState = this.wsSocket.readyState
        if(readyState && readyState === this.wsSocket.OPEN) {
          this.wsSocket.close();
          this.videoPlayer = {}
        }
        this.wsSocket = new WebSocket(process.env.VUE_APP_BASE_STREAM_SVR);
        const videoid = this.videoCanvas
        const videoCanvas = document.getElementById(videoid);
        videoCanvas.addEventListener("webglcontextlost", (event) =>{
          event.preventDefault();
          this.setStopStream()
          this.initStream()
        }, false);
        const div_veideo_panel = document.getElementById("div_veideo_panel")
        div_veideo_panel.onmouseenter = (e) => {
          this.isShowCtrlBtn = true
        }
        div_veideo_panel.onmouseleave = (e) => {
          this.isShowCtrlBtn = false
        }

        this.videoPlayer = new jsmpeg(this.wsSocket, {canvas: videoCanvas});      
        // Connection errors
        this.wsSocket.addEventListener('error', (event) => {
          console.log('error===========>', event)
          this.setStopStream();
        });
        // Connection opened
        this.wsSocket.addEventListener('open', (event) => {
          console.log('open===========>', event, this.videoPlayer)
          if(this.videoPlayer) {
            this.isCameraOn = true
            this.isPlaying = true
            this.videoPlayer.playVideo()
          }else{
            this.isCameraOn = false
            this.isPlaying = false
          }
          this.isStreamLoading = false
          if(this.currentTimeout) {
            clearTimeout(this.currentTimeout)
            this.currentTimeout = -1
          }
        })
      }
      else{
        const readyState = this.wsSocket.readyState
        if(readyState && readyState === this.wsSocket.OPEN) {
          this.setStopStream()
          this.wsSocket.close();
        }
        this.videoStream = false
        this.isStreamLoading = false
        this.isCameraOn = false
      }
    },
    setVdoStream(){
      this.isStreamLoading = true
      this.videoStream = !this.videoStream    
      this.setStreamStatus(this.selectedVehicle.id, this.videoStream, this.selectedVehicle.camera_stream);
      if(this.currentTimeout) {
        clearTimeout(this.currentTimeout)
        this.currentTimeout = -1
      }
      this.currentTimeout = setTimeout(() => {
        this.isStreamLoading = false
        this.videoStream = false                
      },3*60000);
    },
    setVehicleEmergency(data) {
      if(data===1){
        if(this.isEmStop) data = 0
      }else if(data === 2){
        if(this.isEvacuation) data = 0
      }else if(data === 3){
        if(this.isReturn)  data = 0
      }
      const payload = {data}
      const command = this.genData('command', code.cmd.set_emergency, this.selectedVehicle.id, payload)
      this.sendSocket(command)
    },
    setVehicleManualDriving(data) {
      const payload = {data}
      const command = this.genData('command', code.cmd.set_self_driving, this.selectedVehicle.id, payload)
      this.sendSocket(command)
    },  
    showAlert(idx) {
      alert("Hello "+idx)
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
      console.log('----------------->event', data)
      this.procEvents(data)
    })
  }
}
</script>


<style lang="scss">
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
  border-radius: 10px !important;
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

.mainDiv{
    // margin-top: 10px;
    height: calc(100vh - 90px);
    .btn-text {
        font-size: 2rem;
        font-weight: bold;
    }
    .btn-text-sm {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .radius-10{
        border-radius: 10px;
    }
    .h-80{
        height: 80% !important;
    }
    .h-60{
        height: 60% !important;
    }
    .h-40{
        height: 40% !important;
    }
    .h-20{
        height: 20% !important;
    }
    .w-40{
        width: 40% !important;
    }
    .vdo-url-setting {
      right: 1rem;
      bottom: 0.9rem; 
      z-index: 1000;
      button {
        background:none; border:none;
      }
    }
    .real-time-vdo-caption{
      left:1rem;
      top:0.8rem; 
      color:#0061af;
      letter-spacing: .1rem !important;
      font-size: 18px;
    }
    .vdo-url-setting,
    .real-time-vdo-caption{
      font-weight: bold;
      position: absolute; 
    }
    .list-group-item{
        padding-top: 6px;
        padding-bottom: 6px;
        border-radius: 4px;
    }
    .dash_wrapper{
        border-radius: 6px !important;
        border: 1px solid #e9ecef;
    }
    .row {
        margin: 0px;
        padding: 0.8rem 1rem;
        overflow: auto;
    }
    .no-signal{
      background-image:url('~@/assets/img/common/no_signal.gif');
      // background: url(/img/vehicle.2ed2981a.png) no-repeat;
      // background-size: contain;
      background-position: center;
    }

    .radius-10{
        border-radius: 10px;
    }
    .b-90{width: 90% !important;}
    .b-80{width: 80% !important;}
    .b-70{width: 70% !important;}
    .b-60{width: 60% !important;}
    .b-50{width: 50% !important;}
    .b-40{width: 40% !important;}
    .b-30{width: 30% !important;}
    .b-20{width: 20% !important;}
    .b-10{width: 10% !important;}

    .frameWrapper{
      width: 100%;
      height: 100%;
      padding: 10px;
      .videopanel{
        z-index: 1000;
        height: 100%;
        border-radius: 10px;
        &.no-signal{
          // background-image:url('~@/assets/img/common/no_signal.gif');
          background: url(/img/vehicle.2ed2981a.png) no-repeat;
          background-size: contain;
          background-position: center;
        }
      }
      .videoButton{
        left: 45%;
        bottom: 36%;
        border: none;
        position: absolute;
        // background: transparent;  
      }
      .livetext{
        position: absolute;
        left: 6px;
        color: red;
        margin-top: 6px;
        padding: 1px 6px;
        font-size: 13px;
        // background: white;
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
    .showImage{
      background: white;
      background-image:none; 
    }
    .btn-return{
      background: rgb(0, 218, 0) !important
    }
    .btn-emstop{
      color: white !important;
      background: rgb(194, 0, 0) !important
    }    
    .btn-evacuation{
      background: yellow !important
    }
}
.tabs.fod-tab{  
  .nav-item{
    &:first-child{
      .nav-link{
        border-top-left-radius: 10px;
      }
    }
    &:last-child{
      .nav-link{
        border-top-right-radius: 10px;
      }
    }
    .nav-link {
      color:#000;
      border:none;
      border-radius: 0px;
      font-size: medium;
      background: #82c4fd;
      &.active {
        color:#FFF !important;
        font-size: medium !important;
        background: #004f94 !important;
      }
    }
  }
  .tab-content{
    // background: #c8e3fc;
    .cscrollbar {
      padding: 0px;
    }
  }
}
</style>
