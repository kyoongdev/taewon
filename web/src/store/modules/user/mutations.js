import TYPE from './types.js'

export default {
  [TYPE.MU.SET_INFO](state, {userinfo}) {
    state.userinfo = _.cloneDeep(userinfo, true)
  },
  [TYPE.MU.SET_USER_LIST](state, list) {
    state.user_list = _.cloneDeep(list, true)
    list.map(u => {
      if(_.has(u, 'UserGroup')){
        state.user_group[u.id] = u.UserGroup
      }else{
        state.user_group[u.id] = []
      }
    })
  },

  [TYPE.MU.SET_TREE](state, data) {
    state.user_tree = _.cloneDeep(data, true)
  },

  [TYPE.MU.SET_UPDATE_USER](state, user) {
    // find index
    const index = _.findIndex(state.user_list, {id: user.id});
    // Replace item at index
    state.user_list.splice(index, 1, user);
  },
  [TYPE.MU.SET_USER_GROUP](state, data) {
    const id = data.req.userid
    const index = _.findIndex(state.user_list, {id});
    if(index !== -1) {
      if(_.has(state.user_list[index], 'UserGroup')){
        state.user_list[index].UserGroup = _.cloneDeep(data.res, true)
        state.user_group[id] = data.res
      }else{
        state.user_list[index].UserGroup = []
        state.user_group[id] = []
      }
    }
  }
}