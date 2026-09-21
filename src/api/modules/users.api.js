import client from '../client';

class UserApi {
  static getAll() {
    return client.get('/users');
  }

  static getById(id) {
    return client.get(`/users/${id}`);
  }

  static update(id, data) {
    return client.put(`/users/${id}`, data);
  }

  static getStats(id) {
    return client.get(`/users/${id}/stats`);
  }

  static getProfile() {
    return client.get('/users/profile');
  }

  static updateProfile(data) {
    return client.put('/users/profile', data);
  }

  static getMyStats() {
    return client.get('/users/profile/stats');
  }
}

export default UserApi;
