import {WebApp} from "./telegram.ts";

const DEFAULT_URL = "";

type Method = "GET" | "POST";

// TODO (data: string)
async function request(endpoint: string, method: Method, data?: string) {
    const options: RequestInit = {
        method: method,
        headers: {
            Authorization: WebApp?.initData ?? "",
            ContentType: "application/json",
            Access: "application/json",
        },
        body: data ? JSON.stringify(data) : undefined
    }

    const response = await fetch(`${DEFAULT_URL}/api/${endpoint}`, options);
    const jsonData = await response.json();

    if(response.ok) return jsonData;
    return undefined;
}

export {WebApp, request};