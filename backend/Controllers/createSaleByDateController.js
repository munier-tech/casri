import { createSaleByDate } from "./salesController.js";

// Dedicated controller entrypoint for Sale By Date.
// Keeps route-level separation while reusing the validated sales logic.
export const createSaleByDateController = async (req, res) => {
  return createSaleByDate(req, res);
};

