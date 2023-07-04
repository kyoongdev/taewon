import TYPE from './types.js'
import _ from "lodash"

export default {
  [TYPE.MU.SET_GROUP_LIST](state, data) {
    state.groups = data
    const groups_charges = {}
    const groups_garages = {}
    const groups_routes = {}
    const groups_users = {}
    const groups_vehicles = {}
    data.map(d => {
      if(_.has(d, 'Garage')) {
        groups_garages[d.id] = d.Garage
      }
      if(_.has(d, 'ChargeStation')) {
        groups_charges[d.id] = d.ChargeStation
      } 
      if(_.has(d, 'CleanRoute')) {
        groups_routes[d.id] = d.CleanRoute
      }
      if(_.has(d, 'VehicleGroup')) {
        groups_vehicles[d.id] = d.VehicleGroup
      }
      if(_.has(d, 'UserGroup')) {
        groups_users[d.id] = d.UserGroup
      }
    })
    if(!_.isEqual(state.groups_garages_map, groups_garages)){
      state.groups_garages_map = groups_garages
      state.groups_garages = _.flatten(_.values(groups_garages))
    }
    if(!_.isEqual(state.groups_charges_map, groups_charges)){
      state.groups_charges_map = groups_charges
      state.groups_charges = _.flatten(_.values(groups_charges))
    }
    if(!_.isEqual(state.groups_routes_map, groups_routes)){
      state.groups_routes_map = groups_routes
      state.groups_routes = _.flatten(_.values(groups_routes))
    }
    if(!_.isEqual(state.groups_users_map, groups_users)){
      state.groups_users_map = groups_users
      state.groups_users = _.flatten(_.values(groups_users))
    }
    if(!_.isEqual(state.groups_vehicles_map, groups_vehicles)){
      state.groups_vehicles_map = groups_vehicles
      state.groups_vehicles = _.flatten(_.values(groups_vehicles))
    }    
  },
  [TYPE.MU.SET_NEW_GROUP](state, data) {
    state.groups.push(data)
    state.groups_garages_map[data.id] = []
    state.groups_charges_map[data.id] = []
    state.groups_routes_map[data.id] = []
    state.groups_users_map[data.id] = []
    state.groups_vehicles_map[data.id] = []
  },   
  [TYPE.MU.SET_DELETE_GROUP](state, list) {
    list.map(group => {
      //remove group
      state.groups = state.groups.filter(g => g.id !== group.groupid)
      //remove from map
      delete state.groups_garages_map[group.groupid]
      delete state.groups_charges_map[group.groupid]
      delete state.groups_routes_map[group.groupid]
      delete state.groups_users_map[group.groupid]
      delete state.groups_vehicles_map[group.groupid]
      //remove from list
      state.groups_garages  = state.groups_garages.filter(g=> g.gid!==group.groupid)
      state.groups_charges  = state.groups_charges.filter(g=> g.gid!==group.groupid)
      state.groups_routes   = state.groups_routes.filter(g=> g.gid!==group.groupid)
      state.groups_users    = state.groups_users.filter(g=> g.gid!==group.groupid)
      state.groups_vehicles = state.groups_vehicles.filter(g=> g.gid!==group.groupid)
    })
  },
  [TYPE.MU.SET_UPDATE_GROUP_DETAIL](state, group) {
    // find index
    const index = _.findIndex(state.groups, {id: group.id});
    // Replace item at index
    let ugroup = _.cloneDeep(state.groups[index])
    ugroup = {...ugroup, ...group}
    state.groups.splice(index, 1, ugroup);
    const d = group    
    if(_.has(d, 'Garage')) {
      state.groups_garages_map[d.id] = d.Garage
      state.groups_garages = _.flatten(_.values(state.groups_garages_map))
    }
    if(_.has(d, 'ChargeStation')) {
      state.groups_charges_map[d.id] = d.ChargeStation
      state.groups_charges = _.flatten(_.values(state.groups_charges_map))
    } 
    if(_.has(d, 'CleanRoute')) {
      state.groups_routes_map[d.id] = d.CleanRoute
      state.groups_routes = _.flatten(_.values(state.groups_routes_map))
    }
    if(_.has(d, 'VehicleGroup')) {
      state.groups_vehicles_map[d.id] = d.VehicleGroup
      state.groups_vehicles = _.flatten(_.values(state.groups_vehicles_map))
    }
    if(_.has(d, 'UserGroup')) {
      state.groups_users_map[d.id] = d.UserGroup
      state.groups_users = _.flatten(_.values(state.groups_users_map))      
    }
  },
  [TYPE.MU.SET_DELETE_GROUP_ROUTE_DETAIL](state, routeids) {
    const ids = _.values(routeids)
    state.group_route_detail = state.group_route_detail.filter(r => !ids.includes(r.id))
  },
  [TYPE.MU.SET_UPDATE_GROUP](state, group) {
    // find index
    const index = _.findIndex(state.groups, {id: group.id});
    // Replace item at index
    let ugroup = _.cloneDeep(state.groups[index])
    ugroup = {...ugroup, ...group}
    state.groups.splice(index, 1, ugroup);
  },
  [TYPE.MU.SET_GROUP_ROUTE_LIST](state,routes) {
    // console.log(routes)
  },
  [TYPE.MU.SET_GROUP_ROUTE_DETAIL](state, route_details) {
    state.group_route_detail = {}
    state.group_route_detail = route_details
  }

}