// format angka ke rupiah (IDR)

export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

// format berat (gram ke kg jika >= 1000g)
export function gram(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)} kg` : `${n} g`;
}
