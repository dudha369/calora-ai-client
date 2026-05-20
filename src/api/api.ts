import axis from "axios";
import {initData} from "@telegram-apps/sdk";

type Method = "GET" | "POST";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;

export const request = async (endpoint: string, method: Method = "GET", data?: any) => {
  return await axis.request({
    url: `${SERVER_API_URL}/api/${endpoint}`,
    method: method,
    headers: {
      initData: `${initData.raw()}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    data: data ? JSON.stringify(data) : undefined
  });
}
