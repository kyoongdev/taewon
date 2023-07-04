import TYPE from './types.js'
import i18n  from '@/i18n.js' 
const getters = {
  [TYPE.GET.MY_INFO](state){
    return state.userinfo || {}
  },
  [TYPE.GET.USER_LIST](state) {
    return state.user_list || []
  },
  [TYPE.GET.USER_GROUP](state) {
    return state.user_group || {}
  },
  [TYPE.GET.USER_GROUP_BY_ID]: (state) => (id) => {
    return state.user_group[id] || [];
  },
  [TYPE.GET.USER_TREE] (state) {
    return state.user_tree || []
  },
  [TYPE.GET.USER_MENU_SETTING](state) {   
    let menu = [
      {
        text: i18n.t('SubMenu.Events'),
        icon: "fa fa-list-ul",
        component: () => import('@/views/EventLog.vue'),
        state: { read: false, update: false, delete: false, create: false }
      },
      {
        text: i18n.t('SubMenu.Routes'),
        icon: "fa fa-pie-chart",
        component: () => import('@/views/CleanLog.vue'),
        state: { read: false, update: false, delete: false, create: false }
      },
      {
        text: i18n.t('SubMenu.Users'),
        icon: "fa fa-users",
        isAdmin: true,
        component: () => import('@/views/UserSetting.vue'),
        state: { read: false, update: false, delete: false, create: false }
      },
      {
        text: i18n.t('SubMenu.Vehicles'),
        icon: "fa fa-train",
        component: () => import('@/views/VehicleSetting.vue'),
        state: { read: false, update: false, delete: false, create: false }
      },
      {
        text: i18n.t('SubMenu.Setting'),
        icon: "fa fa-suitcase",
        isAdmin: true,
        component: () => import('@/views/GeneralSetting.vue'),
        state: { read: false, update: false, delete: false, create: false }
      }
    ]
    if(state.userinfo){
      const role = state.userinfo.role
      //Super Admin
      if( role === 1) {
        menu.map(m => {
          m.state = { read: true,update: true, delete: true, create: true }
        })
      } else {
        //Admin
        if(role === 2) {      
          menu.map(m => m.state = { read: true,  update: true, delete: true, create: true })
        }
        //User
        else if(role === 3) {
          menu.map(m => m.state = { read: true,  update: false, delete: false, create: false })
        }
        menu = menu.filter(m => !m.isAdmin)
      }
    }
    state.user_setting_menu = menu
    return menu
  },
  [TYPE.GET.IS_SADMIN](state){
    if(state.userinfo!=null) {
      return state.userinfo.role === 1
    } else {
      return false
    }
  },
  
}
export default getters