import { HttpResponse, http } from "msw";
import { server } from "./server";

interface MockEndpointConfig {
	url: string;
	body: unknown;
}

export function mockEndpoint({ url, body }: MockEndpointConfig): void {
	server.use(http.get(url, () => HttpResponse.json(body)));
}
