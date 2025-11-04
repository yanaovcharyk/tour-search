export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const formatMoney = (amount: number, currency?: string) => {
  const nf = new Intl.NumberFormat("uk-UA");
  return `${nf.format(amount)} ${currency ? currency.toUpperCase() : ""}`;
};
