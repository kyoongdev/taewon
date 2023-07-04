import api from "./api";

const GROUP = {
  API_GET_GROUP_LIST: '/groups/list',
  API_ADD_NEW_GROUP: '/groups/add',
  API_DELETE_GROUP: '/groups/delete',
  API_UPDATE_GROUP: '/groups/update',
  API_SET_USER_GROUP: '/groups/user',
  API_SET_VEHICLE_GROUP: '/groups/vehicle',
  API_SET_GROUP_GARAGE: '/groups/garage',
  API_SET_GROUP_CHARGE_STATION: '/groups/charge_station',

  API_ADD_GROUP_ROUTE: '/routes/add',
  API_UPDATE_GROUP_ROUTE: '/routes/update',  
  API_DELETE_GROUP_ROUTE: '/routes/delete',
  API_GET_GROUP_ROUTE_LIST: '/routes/list',
  API_SET_GROUP_ROUTE_DETAIL: '/routes/details',
  API_GET_GROUP_ROUTE_DETAIL: '/routes/detaillist',
  API_DELETE_GROUP_ROUTE_DETAIL: '/routes/details/delete',
}

const GroupService = {
  async getGroupList() {
    return api.get(GROUP.API_GET_GROUP_LIST)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getGroupById(groupid) {
    const url = '/groups/'+groupid
    return api.get(url)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async addNewGroup({name,desc}) {
    return api.post(GROUP.API_ADD_NEW_GROUP, {name,desc})
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async deleteGroup(list) {
    return api.post(GROUP.API_DELETE_GROUP, list)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async updateGroup({id,name,desc}) {
    const url = GROUP.API_UPDATE_GROUP+'/'+id
    const data = {name,desc}
    return api.post(url, data)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setUserGroup(data){
    return api.post(GROUP.API_SET_USER_GROUP, data)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setVehicleGroup(data){
    return api.post(GROUP.API_SET_VEHICLE_GROUP, data)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setGroupChargeStation(data){
    return api.post(GROUP.API_SET_GROUP_CHARGE_STATION, data)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setGroupGarage(data){
    return api.post(GROUP.API_SET_GROUP_GARAGE, data)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getGroupRouteList() {
    return api.get(GROUP.API_GET_GROUP_ROUTE_LIST)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getGroupRouteDetail() {
    return api.get(GROUP.API_GET_GROUP_ROUTE_DETAIL)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async addGroupRoute(data){
    return api.post(GROUP.API_ADD_GROUP_ROUTE, data)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async updateGroupRoute(data){
    const {id, gid, name,start_point,end_point,area,path_point} = data
    const url = GROUP.API_UPDATE_GROUP_ROUTE+'/'+id
    return api.post(url, {gid, name,start_point,end_point,area,path_point})
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async deleteGroupRoute({routeid}){
    const url = GROUP.API_DELETE_GROUP_ROUTE+'/'+routeid
    return api.post(url)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async deleteGroupRouteDetail(list) {
    return api.post(GROUP.API_DELETE_GROUP_ROUTE_DETAIL, list)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setGroupRouteDetail(data){
    return api.post(GROUP.API_SET_GROUP_ROUTE_DETAIL, data)
    .then(response => {
      return response
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  }
}

export default GroupService