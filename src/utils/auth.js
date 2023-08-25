import Cookies from 'js-cookie'

const TokenKey = 'token'
const UserKey = 'user'

export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  return Cookies.remove(TokenKey)
}

export function getUserName () {
  return sessionStorage.getItem(UserKey)
}

export function setUserName (username) {
  return sessionStorage.setItem(UserKey, username)
}

export function removeUserName () {
  return sessionStorage.removeItem(UserKey)
}
