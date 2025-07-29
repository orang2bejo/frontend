import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const createOrderSchema = z.object({
  item_description: z.string().min(1, { message: "Item description is required." }),
  store_location: z.string().optional(),
  delivery_address: z.string().min(1, { message: "Delivery address is required." }),
  max_budget: z.number().positive({ message: "Max budget must be a positive number." }),
  customer_phone: z.string().min(1, { message: "Phone number is required." }),
  customer_notes: z.string().optional(),
});
