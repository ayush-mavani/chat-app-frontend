import { io } from "socket.io-client";

const socket = io("http://192.168.29.139:5000");

export default socket;
