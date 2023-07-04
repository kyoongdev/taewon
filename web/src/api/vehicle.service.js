import api from "./api";

const VEHICLE = {
  API_GET_VEHICLE_LIST: '/vehicles/list',
  API_GET_VEHICLE_FOD: '/vehicles/detected_fod',
  API_GET_VEHICLE_GROUP: '/vehicles/group',
  API_GET_VEHICLE_TYPES: '/vehicles/types',
  API_DELETE_VEHICLE: '/vehicles/delete',
  API_UPDATE_VEHICLE: '/vehicles/update',
  API_REGISTER_VEHICLE: '/vehicles/add',
}

const VehicleService = {
  async updateVehicle({id,vcode,name,model,myear}) {
    const url = VEHICLE.API_UPDATE_VEHICLE+'/'+id
    const data = {vcode,name,model,myear}
    return api.post(url, data).then(response => {
      return response
    }).catch(error => {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getVehicleTypes() {
    return api.get(VEHICLE.API_GET_VEHICLE_TYPES)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getVehicleList(raw) {
    let url = VEHICLE.API_GET_VEHICLE_LIST
    if(raw) url+="/raw"
    return api.get(url)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getVehicleFODList(data) {
    const {vid,rid} = data
    return api.post(VEHICLE.API_GET_VEHICLE_FOD, {vid,rid})
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getVehicleGroup({vehicleid, groupid}){
    return api.post(VEHICLE.API_GET_VEHICLE_GROUP, {vehicleid, groupid})
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getVehicleProfile() {
    return api.get(VEHICLE.API_GET_VEHICLE_PROFILE)
    .then((response) => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async deleteVehicle(ids) {
    return api.post(VEHICLE.API_DELETE_VEHICLE, ids).then(response => {
      return response
    }).catch(error => {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setRegisterVehicle({vcode,name,type,model,myear}) {
    return api.post(VEHICLE.API_REGISTER_VEHICLE, {vcode,name,type,model,myear}).then(response => {
      return response
    }).catch(error => {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
}

export default VehicleService