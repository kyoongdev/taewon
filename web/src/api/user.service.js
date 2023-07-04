import api from "./api";

const USER = {
  API_GET_USER_LIST: '/users/list',
  API_GET_USER_GROUP: '/users/group',
  API_GET_USER_PROFILE: '/users/profile',
  API_DELETE_USER: '/users/delete',
  API_UPDATE_USER: '/users/update',
  API_CHANGE_USER_PWD: '/users/modpwd',
  API_GET_USER_GROUP_TREE: '/users/tree',
}

const UserService = {
  async updateUser({id,name,email,phone,role}) {
    const url = USER.API_UPDATE_USER+'/'+id
    const data = {name,email,phone,role}
    if(_.isEmpty(name)) _.omit(data, name)
    if(_.isEmpty(email)) _.omit(data, email)
    if(_.isEmpty(phone)) _.omit(data, phone)
    if(_.isEmpty(role)) _.omit(data, role)
    return api.post(url, data).then(response => {
      return response
    }).catch(error => {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getUserList() {
    return api.get(USER.API_GET_USER_LIST)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getUserTree(){
    return api.get(USER.API_GET_USER_GROUP_TREE)
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getUserGroup({userid, groupid}){
    return api.post(USER.API_GET_USER_GROUP, {userid, groupid})
    .then(response => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async getUserProfile() {
    return api.get(USER.API_GET_USER_PROFILE)
    .then((response) => {
      return response.data
    }).catch(function (error) {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async deleteUser(ids) {
    return api.post(USER.API_DELETE_USER, ids).then(response => {
      return response
    }).catch(error => {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  },
  async changePassword({id, current_password,new_password,repeat_password}) {
    const url = USER.API_CHANGE_USER_PWD+'/'+id
    const data = {current_password,new_password,repeat_password}
    return api.post(url, data).then(response => {
      return response
    }).catch(error => {
      if (error.response) {
        return Promise.reject(error.response);
      }
    });
  }
}

export default UserService