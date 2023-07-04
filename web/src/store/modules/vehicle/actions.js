import TYPE from './types.js'
import VehicleService from '@/api/vehicle.service';

export default {
  [TYPE.AC.GET_VEHICLE_LIST]({ commit }, raw) {
    return VehicleService.getVehicleList(raw).then(
      res => {
        commit(TYPE.MU.SET_VEHICLE_LIST, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.GET_VEHICLE_FOD]({ commit }, data) {
    return VehicleService.getVehicleFODList(data).then(
      res => {
        commit(TYPE.MU.SET_VEHICLE_FOD, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.SET_UPDATE_VEHICLE]({ commit }, data) {
    return VehicleService.updateVehicle(data).then(
      res => {
        commit(TYPE.MU.SET_UPDATE_VEHICLE, res.data.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.GET_VEHICLE_GROUP]({commit}, {userid, groupid}) {
    return VehicleService.getVehicleGroup({userid, groupid}).then(
      res => {
        const data = {
          req: {userid, groupid},
          res: res.data
        }
        commit(TYPE.MU.SET_VEHICLE_GROUP, data);
        return Promise.resolve(data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.SET_DELETE_VEHICLE]({ commit }, userlist) {
    return VehicleService.deleteVehicle(userlist).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.GET_VEHICLE_TYPES] ({ commit }) {
    return VehicleService.getVehicleTypes().then(
      res => {
        commit(TYPE.MU.SET_VEHICLE_TYPES, res.data);
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },

  [TYPE.AC.SET_REGISTER_VEHICLE]  ({ commit }, data) {
    return VehicleService.setRegisterVehicle(data).then(
      res => {
        return Promise.resolve(res.data);
      },
      error => {
        return Promise.reject(error);
      }
    );
  },
}