import TYPE from './types.js'

export default {
  [TYPE.MU.SET_VEHICLE_LIST](state, data) {
    state.vehicle_list = _.cloneDeep(data, true)
  },
  [TYPE.MU.SET_VEHICLE_FOD](state, data) {
    state.vehicle_fod = _.cloneDeep(data, true)
  },
  [TYPE.MU.SET_VEHICLE_TYPES](state, data) {
    state.vehicle_types = _.cloneDeep(data, true)
  },
  [TYPE.MU.SET_UPDATE_VEHICLE](state, vehicle) {
    // find index
    const index = _.findIndex(state.vehicle_list, {id: vehicle.id});
    // Replace item at index
    state.vehicle_list.splice(index, 1, vehicle);
  },
}