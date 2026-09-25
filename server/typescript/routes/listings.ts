import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { listings } from "../store";

export type Category = "tractor" | "combine" | "implement" | "attachment";
export type Status = "active" | "closed" | "pending";

export interface CreateListingRequest {
  title: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  startingPrice: number;
  currentBid: number;
  currentBidder: string | null;
  status: Status;
  endsAt: string;
  imageUrl: string;
}

const MAX_PAGE_SIZE = 100;

export function getListings(req: Request, res: Response): void {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);

  if (!Number.isInteger(page) || page < 1) {
    res.status(400).json({ error: "page must be a whole number of at least 1" });
    return;
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    res
      .status(400)
      .json({ error: `pageSize must be a whole number from 1 to ${MAX_PAGE_SIZE}` });
    return;
  }

  res.json({
    items: listings.slice((page - 1) * pageSize, page * pageSize),
    total: listings.length,
    page,
    pageSize,
    totalPages: Math.ceil(listings.length / pageSize),
  });
}

export function createListing(req: Request, res: Response): void {
  const { title } = req.body as CreateListingRequest;

  if (!title || typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const listing: Listing = {
    id: randomUUID(),
    title: title.trim(),
    description: "",
    category: "implement",
    startingPrice: 0,
    currentBid: 0,
    currentBidder: null,
    status: "active",
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "",
  };

  listings.push(listing);
  res.status(201).json(listing);
}
