const TYPE = {
    // actions
    AC: {
        SET_LOGIN: 'SET_LOGIN',
        SET_LOGOUT: 'SET_LOGOUT',
        SET_REMEMBER_ME: 'SET_REMEMBER_ME',
        FIND_USER_ID: 'FIND_USER_ID',
        FIND_USER_PWD: 'FIND_USER_PWD',
        SET_REGISTER_USER: 'SET_REGISTER_USER',
        GET_RESOURCE_FILE: 'GET_RESOURCE_FILE'
    },
    
    // mutations
    MU: {
        SET_LOGIN: 'SET_LOGIN',
        SET_LOGOUT: 'SET_LOGOUT',
        SET_INFO: 'SET_INFO',
    },
    
    // getters
    GET: {
        REMEMBER_ME: 'REMEMBER_ME',
        LOGIN_STATUS: 'LOGIN_STATUS',
    }
    
}
export default TYPE