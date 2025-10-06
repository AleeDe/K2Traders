// Google Sheets integration removed. Use Supabase via `utils/orders.js` instead.
export async function submitToGoogleSheets() {
  console.warn('submitToGoogleSheets is deprecated. Orders are now stored in the database.');
  return { deprecated: true };
}