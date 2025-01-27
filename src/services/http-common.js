import axios from "axios";
export const BASEURL = {
  ENDPOINT_URL: process.env.NEXT_PUBLIC_API_ENDPOINT,
};

console.log("BASEURL::: ", BASEURL);
export default axios.create({
  baseURL: `${BASEURL.ENDPOINT_URL}/`,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
  },
});
