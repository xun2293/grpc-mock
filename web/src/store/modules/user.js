const user = {
  state: {
    username: localStorage.getItem('username'),
    token: localStorage.getItem('token'),
  },

  mutations: {
    BIND_LOGIN: (state, data) => {
      localStorage.setItem('token', data);
      state.token = data
    },
    BIND_LOGOUT: (state) => {
      localStorage.removeItem('token');
      state.token = null
    },
    SAVE_USER: (state, data) => {
      localStorage.setItem('username', data);
      state.username = data
    }
  },

};

export default user
