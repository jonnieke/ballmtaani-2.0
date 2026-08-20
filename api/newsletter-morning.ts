import { runNewsletter } from "./_newsletter-delivery";

export const config = { maxDuration: 300 };

export default function handler(req: any, res: any) {
  return runNewsletter(req, res, "morning");
}
