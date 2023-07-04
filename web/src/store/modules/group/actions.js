import TYPE from './types.js'
import GroupService from '@/api/group.service';

export default {
  [TYPE.AC.GET_GROUP_LIST]({ commit }) {
    return GroupService.getGroupList().then(
      res => {
        commit(TYPE.MU.SET_GROUP_LIST, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.GET_GROUP_BY_ID]({ commit }, {groupid}) {
    return GroupService.getGroupById(groupid).then(
      res => {
        commit(TYPE.MU.SET_UPDATE_GROUP_DETAIL, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.ADD_NEW_GROUP]({ commit }, {name,desc}) {
    return GroupService.addNewGroup({name,desc}).then(
      res => {
        commit(TYPE.MU.SET_NEW_GROUP, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  
  [TYPE.AC.DELETE_GROUP]({ commit }, list) {
    return GroupService.deleteGroup(list).then(
      res => {
        commit(TYPE.MU.SET_DELETE_GROUP, list);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.UPDATE_GROUP]({ commit }, data) {
    return GroupService.updateGroup(data).then(
      res => {
        commit(TYPE.MU.SET_UPDATE_GROUP, res.data);
        return Promise.resolve(res);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.SET_USER_GROUP]({commit}, data) {
    return GroupService.setUserGroup(data).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.SET_VEHICLE_GROUP]({commit}, data) {
    return GroupService.setVehicleGroup(data).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.SET_GROUP_GARAGE]({ commit },data) {
    return GroupService.setGroupGarage(data).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.SET_GROUP_CHARGE_STATION]({ commit },data) {
    return GroupService.setGroupChargeStation(data).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.GET_GROUP_ROUTE_LIST]({ commit }) {
    return GroupService.getGroupRouteList().then(
      res => {
        commit(TYPE.MU.SET_GROUP_ROUTE_LIST, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.ADD_GROUP_ROUTE]({ commit },{gid,name,start_point,end_point,area,path_point}) {
    return GroupService.addGroupRoute({gid,name,start_point,end_point,area,path_point}).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.UPDATE_GROUP_ROUTE]({ commit },{id, gid,name,start_point,end_point,area,path_point}) {
    return GroupService.updateGroupRoute({id, gid,name,start_point,end_point,area,path_point}).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.DELETE_GROUP_ROUTE]({ commit },{routeid}) {
    return GroupService.deleteGroupRoute({routeid}).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.DEL_GROUP_ROUTE_DETAIL]({ commit }, list) {
    return GroupService.deleteGroupRouteDetail(list).then(
      res => {
        commit(TYPE.MU.SET_DELETE_GROUP_ROUTE_DETAIL, list);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.GET_GROUP_ROUTE_DETAIL]({commit}) {
    return GroupService.getGroupRouteDetail().then(
      res => {
        commit(TYPE.MU.SET_GROUP_ROUTE_DETAIL, res.data)
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
  [TYPE.AC.SET_GROUP_ROUTE_DETAIL]({ commit },{cmd,id,rid,vid,name,charge_id,garage_id}) {
    return GroupService.setGroupRouteDetail({cmd,id,rid,vid,name,charge_id,garage_id}).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
}