import { HttpResponse, http, type JsonBodyType } from "msw";
import { server } from "./server";

interface MockEndpointConfig {
	url: string;
	body: JsonBodyType;
	method?: "get" | "post";
	searchParams?: Record<string, string>;
}

export function mockEndpoint({
	url,
	body,
	method = "get",
	searchParams = {},
}: MockEndpointConfig): void {
	server.use(
		http[method](url, ({ request }) => {
			if (!hasSearchParams(request, searchParams)) return;
			return HttpResponse.json(body);
		}),
	);
}

function hasSearchParams(
	request: Request,
	expected: Record<string, string>,
): boolean {
	const actual = new URL(request.url).searchParams;
	return Object.entries(expected).every(([key, value]) => actual.get(key) === value);
}
