/**
 * The single money formatter for Seatline. Every dollar figure the browser — and therefore
 * Kane — ever sees comes from here. Values are integer cents everywhere else in the app.
 */
export function formatMoney(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const grouped = dollars.toLocaleString("en-US");
  return `${negative ? "-" : ""}$${grouped}.${String(remainder).padStart(2, "0")}`;
}
