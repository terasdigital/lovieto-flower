import { NextRequest, NextResponse } from "next/server";

// // Biteship API endpoint (cek docs terbaru di biteship.com/docs/api)
// const BITESHIP_API_URL = "https://api.biteship.com/v1/rates/couriers";

// interface ShippingRequest {
//   destinationPostalCode: string; //kode pos tujuan
//   weightGrams: number; // berat total dalam gram
// }

// interface BiteshipRate {
//   courier_name: string;
//   courier_service: string;
//   cost: number;
//   eta_days: string;
//   courier_code?: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { destinationPostalCode, weightGrams } =
//       (await req.json()) as ShippingRequest;

//     // validasi input
//     if (!destinationPostalCode || !weightGrams || weightGrams <= 0) {
//       return NextResponse.json(
//         {
//           error: "Kodepos tujuan dan berat wajib diisi (berat > 0)",
//         },
//         { status: 400 },
//       );
//     }

//     // cek env variables
//     const apiKey = process.env.BITESHIP_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         {
//           error: "BITESHIP_API_KEY belum di konfigurasi di .env.local",
//         },
//         { status: 500 },
//       );
//     }

//     const originPostalCode = process.env.NEXT_PUBLIC_STORE_ORIGIN_POSTAL_CODE;
//     if (!originPostalCode) {
//       return NextResponse.json(
//         {
//           error:
//             "NEXT_PUBLIC_STORE_ORIGIN_POSTAL_CODE belum di konfigurasi di .env.local",
//         },
//         { status: 500 },
//       );
//     }

//     // panggil biteship API
//     const response = await fetch(BITESHIP_API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: ` Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         origin_postal_code: originPostalCode,
//         destination_postal_code: destinationPostalCode,
//         weight_grams: weightGrams,
//         couriers: ["jne", "tiki", "pos", "sicepat", "paxel"], // kurir yang ingin di cek
//       }),
//     });
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Biteship API error:", response.status, errorText);
//       return NextResponse.json(
//         { error: "Gagal mengambil tarif dari Biteship, Silahkan coba lagi." },
//         { status: 502 },
//       );
//     }
//     const data = await response.json();

//     // Biteship response bisa di "data" atau langsung di root, tergantung versi API
//     const rates: BiteshipRate[] = data.rates || data.data || [];

//     // normalize ke format yang dipakai frontend
//     const normalized = rates.map((rate) => ({
//       code: rate.courier_code || rate.courier_name,
//       courier: rate.courier_name,
//       service: rate.courier_service,
//       cost: rate.cost,
//       eta: rate.eta_days,
//     }));

//     return NextResponse.json({ rates: normalized });
//   } catch (error) {
//     console.error("Shipping API error", error);
//     return NextResponse.json(
//       {
//         error: "Terjadi kesalahan saat menghitung ongkir",
//       },
//       { status: 400 },
//     );
//   }
// }

export async function POST(request: NextRequest) {
  const { destinationPostalCode, weightGrams } = await request.json();

  // Mock data untuk development (ganti ke Biteship nanti)
  const mockRates = [
    {
      code: "jne",
      courier: "JNE",
      service: "Reguler",
      cost: Math.round(weightGrams * 15), // Rp 15 per gram
      eta: "2-3 hari",
    },
    {
      code: "sicepat",
      courier: "SiCepat",
      service: "REG",
      cost: Math.round(weightGrams * 14),
      eta: "1-2 hari",
    },
    {
      code: "pos",
      courier: "POS Indonesia",
      service: "Reguler",
      cost: Math.round(weightGrams * 12),
      eta: "3-4 hari",
    },
  ];

  return NextResponse.json({ rates: mockRates });
}
