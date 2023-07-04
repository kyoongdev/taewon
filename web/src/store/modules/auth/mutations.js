import TYPE from './types.js'

export default {
  [TYPE.MU.SET_LOGIN](state, {token}) {
    state.loggedIn = true
    state.accessToken = token
  },
  [TYPE.MU.SET_LOGOUT](state) {    
    state.accessToken = null    
    state.loggedIn = false;
  },
  [TYPE.MU.SET_SESSION_TIMEOUT](state) {
    state.accessToken = null    
    state.loggedIn = false;
  },
  refreshToken(state, accessToken) {
    state.loggedIn = true;
    state.user = { accessToken: accessToken };
  }
}