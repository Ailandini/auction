import { HttpResponse, http, type JsonBodyType } from "msw";
import { server } from "./server";

interface MockEndpointConfig {
	url: string;
	body: JsonBodyType;
	method?: "get" | "post";
}

export function mockEndpoint({
	url,
	body,
	method = "get",
}: MockEndpointConfig): void {
	server.use(http[method](url, () => HttpResponse.json(body)));
}
