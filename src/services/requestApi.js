import http from "./http-common";

class DataService {
  AllUser(roomName) {
    return http.get(`userByRoom/${roomName}`);
  }
}

export default new DataService();
