import { z } from "zod";

// Validation schema for detailed trade entry
export const detailedTradeSchema = z.object({
  pair: z.string().trim().min(1, "Trading pair is required").max(20, "Trading pair must be less than 20 characters"),
  entry: z.number().positive("Entry price must be positive"),
  exit: z.number().positive("Exit price must be positive"),
  stopLoss: z.number().positive("Stop loss must be positive"),
  takeProfit: z.number().positive("Take profit must be positive").optional(),
  accountBalance: z.number().positive("Account balance must be positive"),
  riskPercent: z.number().min(0.01, "Risk percent must be at least 0.01%").max(100, "Risk percent cannot exceed 100%"),
  date: z.date().max(new Date(), "Trade date cannot be in the future"),
});

// Validation schema for simple RR trade entry
export const simpleTradeSchema = z.object({
  pair: z.string().trim().min(1, "Trading pair is required").max(20, "Trading pair must be less than 20 characters"),
  rrValue: z.number().min(-100, "RR value too low").max(1000, "RR value too high"),
  accountBalance: z.number().positive("Account balance must be positive"),
  date: z.date().max(new Date(), "Trade date cannot be in the future"),
});

export type DetailedTradeInput = z.infer<typeof detailedTradeSchema>;
export type SimpleTradeInput = z.infer<typeof simpleTradeSchema>;
