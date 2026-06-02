import axios from "axios";
import { initData } from "@tma.js/sdk-react";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;

export const request = async <T = unknown>(
  endpoint: string,
  method: Method = "GET",
  data?: unknown
): Promise<{ data: T }> => {
  return await axios.request({
    url: `${SERVER_API_URL}/${endpoint}`,
    method,
    headers: {
      initData: initData.raw() ?? "",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: data ? JSON.stringify(data) : undefined,
  });
};
