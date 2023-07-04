import TYPE from './types.js'

const getters = {
  [TYPE.GET.LOGIN_STATUS](state) {
    return state.loggedIn && !_.isEmpty(state.accessToken)
  },
  [TYPE.GET.REMEMBER_ME](state){
    return JSON.parse(state.rememberMe) === true
  },
}
export default getters