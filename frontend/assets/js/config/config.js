const BASE_URL = "https://localhost:8081";

export const config = {
  wsPort: 8081,
  api: {
    register: `${BASE_URL}/register`,
    login: `${BASE_URL}/login`,
    logout: `${BASE_URL}/logout`,
    users: `${BASE_URL}/api/users`,
    user: `${BASE_URL}/api/user/`,
    chats: `${BASE_URL}/api/chats`,
    post: `${BASE_URL}/api/post/`,
    posts: `${BASE_URL}/api/posts`,
    comment: `${BASE_URL}/api/comment`,
    session: `${BASE_URL}/api/session/`,
  },
};
