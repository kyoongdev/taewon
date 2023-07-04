import TYPE from './types.js'
const getters = {
  [TYPE.GET.GROUP_LIST](state) {
    return state.groups || []
  },
  [TYPE.GET.GROUP_GARAGE](state) {
    return state.groups_garages || {}
  },
  [TYPE.GET.GROUP_CHARGE](state) {
    return state.groups_charges || {}
  },
  [TYPE.GET.GROUP_ROUTE](state) {
    return state.groups_routes || {}
  },
  [TYPE.GET.GROUP_USER](state) {
    return state.groups_users || {}
  },
  [TYPE.GET.GROUP_VEHICLE](state) {
    return state.groups_vehicles || {}
  },
  [TYPE.GET.GROUP_ROUTE_MAP](state) {
    return state.groups_routes_map || {}
  },
  [TYPE.GET.GROUP_GARAGE_MAP](state) {
    return state.groups_garages_map || {}
  },
  [TYPE.GET.GROUP_CHARGE_MAP](state) {
    return state.groups_charges_map || {}
  },
  [TYPE.GET.GROUP_VEHICLE_MAP](state) {
    return state.groups_vehicles_map || {}
  },
  [TYPE.GET.GROUP_ROUTE_DETAIL](state) {
    return state.group_route_detail || []
  }
}
export default getters