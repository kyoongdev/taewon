import 'babel-polyfill'
import Vue from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router'
import code from '@/utils/cecode'
import _ from "lodash"
import VueAutoscroll from '@codekraft-studio/vue-autoscroll'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import moment from 'moment'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/css/font-awesome.min.css'
import '@/assets/css/reset.css'
import '@/assets/css/custom.css'
import '@/assets/css/time.css'
import '@/assets/css/mapbox-gl.css'
import '@/assets/css/mapbox-gl-draw.css'
import '@/assets/css/mapbox-gl-geocoder.css'
import '@/assets/css/main.scss'
import setInterceptors from '@/api/interceptors';
import Directives from '@/utils/directives'
import * as turf from "@/assets/js/turf.min.js"
import * as AnimatedPopup from "@/assets/js/mapbox-gl-animated-popup.min.js"
import { io } from "socket.io-client";
import '@/assets/js/jsmpg.js';
import i18n from "./i18n";

window.turf = turf
window.code = code
window.AnimatedPopup = AnimatedPopup
// import JSMpeg from "@/assets/js/jsmpeg.min.js"
// window.JSMpeg = JSMpeg
// console.log(JSMpeg)
var socketCheck = -1
const socket = io.connect(process.env.VUE_APP_BASE_SERVER_SOCKET, { 
  path: "/webio/",
  transports: ["websocket"],
  query: 'api_key='+process.env.VUE_APP_BASE_SOCKET_KEY
}).on('connect', function() {
  //Join room
  socket.emit('subscribe',code.room)
}).on('disconnect', function(reason) {
  console.log('server is down!', reason)
  socket.disconnect();
  console.log('server disconnect!')
  socketCheck = -1
  socketCheck = setInterval(() => {
    if(socketCheck) {
      socket.connect();
      if(socket.connected) {
        console.log('server re-connect!')
        clearInterval(socketCheck);
        socketCheck = undefined
      }
    }
  }, 1000)
}).on("connect_error", err => {
  console.log(err instanceof Error);
  console.log(err.message);
  console.log(err.data); 
});
window.socket = socket
Vue.use(_)
Vue.use(Directives)
Vue.use(VueAutoscroll)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.mixin({
  methods: {
    setLanguage(lang){
      store.dispatch('setUILanguage', lang)
    },
    setLoading: function (flag) {
      store.dispatch('setLoading', flag)
    },
    alert: function(message, callback) {
      this.$bvModal.msgBoxOk(message, {
        title: i18n.t('txt_alert_default'),
        size: 'sm',
        buttonSize: 'sm b-minw rounded-1',
        okVariant: 'primary',
        headerClass: 'border-bottom-0 justify-content-center',
        footerClass: 'border-top-0 justify-content-center',
        centered: true
      })
      .then(value => {
        if(callback) callback(value)
      })
    },
    confirm: function(message, callback, opt) {
      let default_opt = {
        title: i18n.t('txt_alert_default'),
        size: 'sm',
        buttonSize: 'sm b-minw rounded-1',
        okVariant: 'primary',
        headerClass: 'border-bottom-0 justify-content-center',
        footerClass: 'border-top-0 justify-content-center',
        okTitle:  i18n.t('btn_yes'),
        cancelTitle:  i18n.t('btn_no'),
        centered: true,
      }
      if (opt) {
        Object.assign(default_opt, opt);
      }
      const h = this.$createElement
      // Using HTML string
      const titleVNode = h('div', { domProps: { innerHTML: default_opt.title } })
      default_opt.title = [titleVNode]
      this.$bvModal.msgBoxConfirm(message, default_opt)
      .then(value => {
        if(callback) callback(value)
      })
    },
    genData: function(type, Code, VID, payload){
      return {
        type,
        header:{
          Code,
          VID,
          Datetime: new Date()
        },
        payload
      }
    },
    sendSocket: function({type, header, payload}){
      const data = {header, payload}
      if(socket.connected) {
        if(type === 'command') {
          socket.emit(code.commands, data)
        }else if(type === 'event') {
          socket.emit(code.events, data)
        }else{
          this.alert('unknown type - sendsocket.')
        }
      }
    },
    getKeyChange: function(obj1, obj2) {
      const diff = Object.keys(obj1).reduce((result, key) => {
          if (!obj2.hasOwnProperty(key)) {
              result.push({key});
          } else if (_.isEqual(obj1[key], obj2[key])) {
              const resultKeyIndex = result.indexOf(key);
              result.splice(resultKeyIndex, 1);
          }
          return result;
      }, Object.keys(obj2));
      return diff;
    }
  },
})

Vue.prototype.moment = moment
Vue.config.productionTip = false
setInterceptors(store);

const startApplication = async () => {

  //check status and get user info
  if(store.getters['auth/LOGIN_STATUS']) {
    await store.dispatch('user/GET_USER_PROFILE').catch(async () => {
      await store.dispatch('auth/SET_LOGOUT').catch(() =>{
        setTimeout(() => {
          window.location.href = '/'
        }, 1000);
      })
    })
  }

  //render ui
  new Vue({
    router,
    store,
    i18n,
    render: (h) => h(App),
  }).$mount("#app");

}

startApplication();