export default {
    LOGIN: {text:'Login',path:'/fod/',name:'Login',component:'Login',requiresAuth:false},
    DASHBOARD: {text:'Dashboard',path:'/fod/dashboard',name:'Dashboard',component:'Dashboard',requiresAuth:true,},
    MAIN_SETTING: {text:'Setting',path:'/fod/setting',name:'Setting',component:'Setting',requiresAuth:true,},
    NOT_FOUND: {text:'NotFound',path:'/fod/*',name:'NotFound',component:'NotFound',requiresAuth:false,},
}