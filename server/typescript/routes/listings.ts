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

export function getListings(_req: Request, res: Response): void {
  res.json(listings);
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
