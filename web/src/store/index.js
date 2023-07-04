import Vue from 'vue'
import Vuex from 'vuex'
import authModule from './modules/auth'
import userModule from './modules/user'
import groupModule from './modules/group'
import vehicleModule from './modules/vehicle'

const modules = {
  user: userModule,
  auth: authModule,
  group: groupModule,
  vehicle: vehicleModule
}

const state = {
  globalLoading: false,
  uiLanguage: localStorage.getItem('locale'),
  map:{
    token:'pk.eyJ1IjoiYWRhc29uZSIsImEiOiJja2E2NGtyMHgwM2ZzMnJwOWtlNG5lN3AzIn0.grte_lO27-VaILPhUYJk2g',
    // style:'mapbox://styles/adasone/ckpytaze523sa17pehg8cme17', 
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 15,
    closeZoom: 18,
    minZoom: 5,
  }
}

const mutations = {
  setGlobalLoading(state,load) {    
    state.globalLoading = load
  },
  setUILanguage(state, lang) {
    state.uiLanguage = lang
    localStorage.setItem('locale', lang);
  }
}

const actions = {
  setUILanguage({commit}, lang) {
    commit('setUILanguage', lang)
  },
  setLoading({commit}, load) {
    commit('setGlobalLoading', load)
  }
}

const getters = {
  getLoading(state){
    return state.globalLoading
  },
  mapConfig(state) {
    return state.map
  },
  getUILang(state) {
    if(!state.uiLanguage || state.uiLanguage === 'undefined' || state.uiLanguage === 'null') {
      state.uiLanguage = process.env.VUE_APP_BASE_I18N_LOCALE || "ko"
      localStorage.setItem('locale', state.uiLanguage)
    }
    return state.uiLanguage
  }
}

Vue.use(Vuex)
export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
  modules
})
