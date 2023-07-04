import api from "./api";
import TokenService from "./token.service";

const AUTH = {
  API_SET_LOGIN: '/login',
  API_SET_LOGOUT: '/logout',
  API_FIND_ID: '/findId',
  API_FIND_PWD: '/findPwd',
  API_REGISTER_USER: '/signUp'
}

const AuthService = {
  async setLogin({ userid, password }) {
    return api.post(AUTH.API_SET_LOGIN, {userid,password})
    .then((response) => {
      const data = response.data.data
      if (data.token) {
        TokenService.setAuthToken(data.token)
      }
      return data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async setLogout() { 
    return api.post(AUTH.API_SET_LOGOUT)
    .then((response) => {
      TokenService.removeAuthToken()
      return response
    }).catch(function (error) {
      TokenService.removeAuthToken()
      if (error.response) {
        return Promise.reject(error.response);
      }
    });   
  },
  async findUserId({username, email}) {
    return api.post(AUTH.API_FIND_ID, {username, email})
    .then((response) => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async findUserPwd({userid, username, email}) {
    return api.post(AUTH.API_FIND_PWD, {userid, username, email})
    .then((response) => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async registerUser({userid,password,name,email,phone,roleid}) {
    return api.post(AUTH.API_REGISTER_USER, {userid,password,name,email,phone,roleid})
    .then((response) => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  getAuthToken(){
    return TokenService.getAuthToken()
  },
  
}

export default AuthService