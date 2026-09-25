import type { Request, Response } from "express";
import { listings } from "../store";

export function getListings(_req: Request, res: Response): void {
	res.json(listings);
}
