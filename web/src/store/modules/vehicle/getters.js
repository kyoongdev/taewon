import TYPE from './types.js'
const getters = {
  [TYPE.GET.VEHICLE_LIST](state) {
    return state.vehicle_list || []
  },
  [TYPE.GET.VEHICLE_FOD](state) {
    return state.vehicle_fod || []
  },
  [TYPE.GET.VEHICLE_TYPES](state) {
    return state.vehicle_types || []
  },
}
export default getters