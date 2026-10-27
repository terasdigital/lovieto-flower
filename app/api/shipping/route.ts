import { NextRequest, NextResponse } from "next/server";

/**
 * Kalkulator ongkir.
 *
 * MODE:
 *  - BITESHIP_API_KEY terisi → panggil Biteship live (POST /v1/rates/couriers).
 *    Auth sesuai docs resmi: token diletakkan di header Authorization
 *    (HTTP Basic, token = password). Kalau format "Bearer" ditolak 401,
 *    dicoba ulang dengan Basic.
 *  - BITESHIP_API_KEY kosong → MODE DEMO: tarif simulasi per gram, supaya
 *    klien tetap bisa mencoba seluruh flow tanpa saldo API.
 *
 * CATATAN KALIBRASI: skema field respons Biteship dinormalisasi sefektif
 * mungkin; kalau hasil kosong, respons mentah di-log agar nama field bisa
 * dicocokkan saat pertama kali memakai key live.
 */

const BITESHIP_URL = "https://api.biteship.com/v1/rates/couriers";

interface NormalizedRate {
  code: string;
  courier: string;
  service: string;
  cost: number;
  eta: string;
}

// ── Mode demo (tanpa key) ──
function mockRates(weightGrams: number): NormalizedRate[] {
  return [
    {
      code: "jne",
      courier: "JNE",
      service: "Reguler",
      cost: Math.round(weightGrams * 15),
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
}

// ── Normalisasi respons Biteship yang tahan variasi penamaan field ──
function normalizeBiteship(json: unknown): NormalizedRate[] {
  const root = json as Record<string, unknown>;
  const list: unknown[] = Array.isArray(json)
    ? json
    : ((root.data ?? root.rates ?? root.results ?? []) as unknown[]);

  const out: NormalizedRate[] = [];
  for (const raw of list) {
    const r = raw as Record<string, unknown>;
    const cost = Number(
      r.cost ?? r.price ?? r.rate ?? r.total_cost ?? 0
    );
    if (!Number.isFinite(cost) || cost <= 0) continue;
    out.push({
      code: String(r.code ?? r.courier_code ?? r.courier ?? "kirim"),
      courier: String(
        r.courier_name ?? r.courier ?? r.courier_type ?? "Kurir"
      ),
      service: String(
        r.service ?? r.courier_service ?? r.service_name ?? "Reguler"
      ),
      cost,
      eta: String(
        r.eta ??
          r.eta_days ??
          r.estimated_delivery ??
          r.estimate ??
          "estimasi menyusul"
      ),
    });
  }
  return out;
}

async function callBiteship(
  key: string,
  body: Record<string, unknown>,
  authStyle: "bearer" | "basic"
): Promise<Response> {
  const auth =
    authStyle === "bearer"
      ? `Bearer ${key}`
      : `Basic ${btoa(`:${key}`)}`;

  return fetch(BITESHIP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  let parsed: { destinationPostalCode?: string; weightGrams?: number };
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const destinationPostalCode = String(
    parsed.destinationPostalCode ?? ""
  ).trim();
  const weightGrams = Number(parsed.weightGrams);

  if (!/^\d{5}$/.test(destinationPostalCode)) {
    return NextResponse.json(
      { error: "Kodepos tujuan harus 5 digit angka" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    return NextResponse.json(
      { error: "Berat tidak valid (harus > 0 gram)" },
      { status: 400 }
    );
  }

  const apiKey = process.env.BITESHIP_API_KEY?.trim();

  // ── MODE DEMO ──
  if (!apiKey) {
    return NextResponse.json({
      rates: mockRates(weightGrams),
      source: "demo",
    });
  }

  // ── MODE LIVE ──
  const originPostalCode =
    process.env.NEXT_PUBLIC_STORE_ORIGIN_POSTAL_CODE ?? "";
  const body = {
    origin_postal_code: originPostalCode,
    destination_postal_code: destinationPostalCode,
    weight: weightGrams, // Biteship memakai gram
    current_country_code: "IDN",
    target_country_code: "IDN",
  };

  try {
    let res = await callBiteship(apiKey, body, "bearer");

    // Docs menyebut HTTP Basic (token = password) → fallback sekali bila 401
    if (res.status === 401) {
      res = await callBiteship(apiKey, body, "basic");
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("Biteship error:", res.status, errText.slice(0, 300));
      return NextResponse.json(
        {
          error:
            "Tarif sedang tidak tersedia. Silakan tanya ongkir via WhatsApp.",
        },
        { status: 502 }
      );
    }

    const json = await res.json();
    const rates = normalizeBiteship(json);

    if (rates.length === 0) {
      // Kalibrasi: tampilkan bentuk respons asli di log dev sekali-sekali
      console.log(
        "Biteship respons tak dikenali — samakan nama field di normalizeBiteship():",
        JSON.stringify(json).slice(0, 500)
      );
      return NextResponse.json(
        {
          error:
            "Tarif sedang tidak tersedia. Silakan tanya ongkir via WhatsApp.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ rates, source: "live" });
  } catch (error) {
    console.error("Shipping API error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menghitung ongkir.",
      },
      { status: 502 }
    );
  }
}
