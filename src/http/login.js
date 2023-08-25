import axios from './axios'

export const login = (data) => {
  return axios({
    url: '/auth/login',
    methods: 'post',
    data
  })
}
