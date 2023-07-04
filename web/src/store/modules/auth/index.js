import actions from './actions.js'
import mutations from './mutations.js'
import getters from './getters.js'
import state from './state.js'
import types from './types.js'

export const TYPE = types
export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state
}