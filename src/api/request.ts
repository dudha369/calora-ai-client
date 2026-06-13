import axios from "axios";
import { initData } from "@telegram-apps/sdk-react";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;
const DEBUG_INIT_DATA = import.meta.env.VITE_DEBUG_INIT_DATA ?? "";

export const request = async <T = unknown>(
  endpoint: string,
  method: Method = "GET",
  data?: unknown
): Promise<{ data: T }> => {
  // FormData (загрузка файлов, см. food.analyze) должна уйти как multipart —
  // axios сам проставит правильный Content-Type с boundary, если мы не
  // зададим его вручную и не сериализуем тело в JSON.
  const isFormData = data instanceof FormData;

  return await axios.request({
    url: `${SERVER_API_URL}/${endpoint}`,
    method,
    headers: {
      initData: initData.raw() || DEBUG_INIT_DATA,
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    data: isFormData ? data : data ? JSON.stringify(data) : undefined,
  });
};
