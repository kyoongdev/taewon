import TYPE from './types.js'
import UserService from '@/api/user.service';

export default {
  [TYPE.AC.SET_INFO]({ commit }, info) {
      commit(TYPE.MU.SET_INFO, info);
  },  

  [TYPE.AC.SET_UPDATE_USER]({ commit }, data) {
    return UserService.updateUser(data).then(
      res => {
        commit(TYPE.MU.SET_UPDATE_USER, res.data.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.GET_USER_GROUP]({commit}, {userid, groupid}) {
    return UserService.getUserGroup({userid, groupid}).then(
      res => {
        const data = {
          req: {userid, groupid},
          res: res.data
        }
        commit(TYPE.MU.SET_USER_GROUP, data);
        return Promise.resolve(data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.GET_USER_LIST]({ commit }) {
    return UserService.getUserList().then(
      res => {
        commit(TYPE.MU.SET_USER_LIST, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.SET_DELETE_USER]({ commit }, userlist) {
    return UserService.deleteUser(userlist).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.GET_USER_PROFILE]({ commit }) {
    return UserService.getUserProfile().then(
      res => {
        if(res.data) {
          const user = { userinfo: res.data.profile }
          commit(TYPE.MU.SET_INFO, user);
        }
        return Promise.resolve(res);
      },
      error => {
        return Promise.reject(error);
      },
    )
  },

  [TYPE.AC.GET_USER_CLEAN_ROUTE_TREE]({ commit }) {
    return UserService.getUserTree().then(
      res => {
        if(res.data) {
          commit(TYPE.MU.SET_TREE, res.data);
        }
        return Promise.resolve(res);
      },
      error => {
        return Promise.reject(error);
      },
    )
  },
  
  [TYPE.AC.CHANGE_USER_PASSWORD]({ commit },data) {
    return UserService.changePassword(data).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    )
  },
}