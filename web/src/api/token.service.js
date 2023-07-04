const authUserKey = 'userToken'

const TokenService = {
  getAuthToken() {
    let token = JSON.parse(localStorage.getItem(authUserKey));
    return token;
  },

  updateAuthToken(token) {
    let user = null
    user = JSON.parse(localStorage.getItem(authUserKey));
    if(user) {
      user.token = token;
      localStorage.setItem(authUserKey, JSON.stringify(user));
    }
  },

  setAuthToken(authToken) {
    localStorage.setItem(authUserKey, JSON.stringify(authToken));
  },

  removeAuthToken() {
    localStorage.removeItem(authUserKey)
  } 
}

export default TokenService