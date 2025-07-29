import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const submitReviewSchema = z.object({
  order_id: z.string().uuid({ message: "Invalid Order ID." }),
  rating: z.number().int().min(1).max(5, { message: "Rating must be between 1 and 5." }),
  comment: z.string().optional(),
});
