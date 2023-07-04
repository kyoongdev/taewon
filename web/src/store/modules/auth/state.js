import AuthService from '@/api/auth.service';
const authUserToken = AuthService.getAuthToken();
const isLoggedIn = authUserToken? true: false
const token = authUserToken?authUserToken: null

const state = {
    accessToken: token,
    loggedIn: isLoggedIn,
}

export default state