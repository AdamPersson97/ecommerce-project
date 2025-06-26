import { Request, Response } from "express";
import { db } from "../config/db";
import { STRIPE_SECRET_KEY } from "../constants/env";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

export const checkoutSessionHosted = async (req: Request, res: Response) => {
  try {
    const { line_items, order_id } = req.body;

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url:
        "http://localhost:5173/order-confirmation?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:5173/checkout",
      client_reference_id: order_id.toString(),
    });

    res.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

export const checkoutSessionEmbedded = async (
  req: Request,
  res: Response
) => {};

export const webhook = async (req: Request, res: Response) => {};
