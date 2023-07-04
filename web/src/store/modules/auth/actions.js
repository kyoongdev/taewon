import TYPE from './types.js'
import AuthService from '@/api/auth.service';

export default {
   [TYPE.AC.SET_LOGIN]({ commit }, user) {
    return AuthService.setLogin(user).then(
      res => {
        if(res.user && res.token) {
          commit(TYPE.MU.SET_LOGIN, res.token);
          commit('user/'+TYPE.MU.SET_INFO, { userinfo: res.user }, { root: true })
        }
        return Promise.resolve(res);
      },
      error => {
        return Promise.reject(error);
      },
    )
  },
  [TYPE.AC.SET_LOGOUT]({commit}) {
    return AuthService.setLogout().then(res => {
      commit(TYPE.MU.SET_LOGOUT);
      commit('user/'+TYPE.MU.SET_INFO, {}, { root: true })
      return Promise.resolve(res);
    },
    error => {
      commit(TYPE.MU.SET_LOGOUT);
      commit('user/'+TYPE.MU.SET_INFO, {}, { root: true })
      return Promise.reject(error);
    }).catch(error =>{
      commit(TYPE.MU.SET_LOGOUT);
      commit('user/'+TYPE.MU.SET_INFO, {}, { root: true })
      return Promise.reject(error);
    })
  },
  [TYPE.AC.FIND_USER_ID]({commit},data) {
    return AuthService.findUserId(data).then(res => {
      return Promise.resolve(res);
    },
    error => {
      return Promise.reject(error);
    })
  },
  [TYPE.AC.FIND_USER_PWD]({commit},data) {
    return AuthService.findUserPwd(data).then(res => {
      return Promise.resolve(res);
    },
    error => {
      return Promise.reject(error);
    })
  },
  [TYPE.AC.SET_REGISTER_USER]({ commit }, data) {
    return AuthService.registerUser(data).then(res => {
      return Promise.resolve(res);
    },
    error => {
      return Promise.reject(error);
    });
  },

  
  refreshToken({ commit }, accessToken) {
    commit('refreshToken', accessToken);
  }
}