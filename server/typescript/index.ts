import cors from "cors";
import express from "express";
import { createListing, getListing, getListings, placeBid } from "./routes";

const PORT = 3001;

// ============================================================
// App
// ============================================================

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// GET /api/listings
app.get("/api/listings", getListings);

// POST /api/listings
app.post("/api/listings", createListing);

// GET /api/listings/:id
app.get("/api/listings/:id", getListing);

// POST /api/listings/:id/bids
app.post("/api/listings/:id/bids", placeBid);

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
