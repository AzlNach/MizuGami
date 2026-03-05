import { NextRequest, NextResponse } from "next/server";

// Free-tier friendly endpoint: 5 day / 3 hour forecast
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

type OWMForecastItem = {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg?: number;
    gust?: number;
  };
  pop?: number;
  rain?: { "3h"?: number };
};

type OWMForecastResponse = {
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
  };
  list: OWMForecastItem[];
};

// Return shape compatible with existing WeatherForecastCard (daily-like)
type DailyForecastDay = {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: OWMForecastItem["weather"];
  speed: number;
  deg: number;
  gust: number;
  clouds: number;
  pop: number;
  rain?: number;
};

type DailyForecastResponse = {
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
  };
  list: DailyForecastDay[];
};

// WIB = UTC+7. Use timezone offset from OWM response when available (passed as param),
// but since we don't have it here, default to WIB (+7h) for Indonesia.
// This fixes wrong day grouping when UTC midnight != local midnight.
function toDayKey(unixSeconds: number, tzOffsetSeconds = 7 * 3600) {
  const localMs = (unixSeconds + tzOffsetSeconds) * 1000;
  const d = new Date(localMs);
  // Use UTC getters on the shifted date so we read the LOCAL date fields
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function pickNoonish(items: OWMForecastItem[], tzOffsetSeconds = 7 * 3600) {
  // Pick item closest to 12:00 LOCAL time for a representative weather description.
  const targetHour = 12;
  let best = items[0];
  let bestDiff = Infinity;
  for (const it of items) {
    const localMs = (it.dt + tzOffsetSeconds) * 1000;
    const h = new Date(localMs).getUTCHours();
    const diff = Math.abs(h - targetHour);
    if (diff < bestDiff) {
      best = it;
      bestDiff = diff;
    }
  }
  return best;
}

function aggregateToDaily(data: OWMForecastResponse): DailyForecastResponse {
  // Use the timezone offset from OWM response (in seconds) so day-grouping uses local time
  const tzOffset = data.city.timezone ?? 7 * 3600;
  const byDay = new Map<string, OWMForecastItem[]>();
  for (const it of data.list) {
    const key = toDayKey(it.dt, tzOffset);
    const arr = byDay.get(key) ?? [];
    arr.push(it);
    byDay.set(key, arr);
  }

  const days = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 5) // Free endpoint provides ~5 days
    .map(([, items]) => {
      const rep = pickNoonish(items, tzOffset);

      const min = Math.min(...items.map((x) => x.main.temp_min));
      const max = Math.max(...items.map((x) => x.main.temp_max));
      const avgTemp = items.reduce((s, x) => s + x.main.temp, 0) / items.length;
      const avgHumidity = Math.round(items.reduce((s, x) => s + x.main.humidity, 0) / items.length);
      const maxPop = Math.max(...items.map((x) => x.pop ?? 0));
      const avgWind = items.reduce((s, x) => s + x.wind.speed, 0) / items.length;
      const maxGust = Math.max(...items.map((x) => x.wind.gust ?? 0));
      const rain = items.reduce((s, x) => s + (x.rain?.["3h"] ?? 0), 0);

      return {
        dt: rep.dt,
        temp: {
          day: avgTemp,
          min,
          max,
          // Not provided by this endpoint; keep same numbers for UI compatibility
          night: avgTemp,
          eve: avgTemp,
          morn: avgTemp,
        },
        // Not provided; keep placeholders
        feels_like: { day: avgTemp, night: avgTemp, eve: avgTemp, morn: avgTemp },
        pressure: 0,
        humidity: avgHumidity,
        weather: rep.weather,
        speed: avgWind,
        deg: rep.wind.deg ?? 0,
        gust: maxGust,
        clouds: 0,
        pop: maxPop,
        rain: rain > 0 ? rain : undefined,
      } satisfies DailyForecastDay;
    });

  return {
    city: {
      id: data.city.id,
      name: data.city.name,
      coord: data.city.coord,
      country: data.city.country,
      population: 0,
      timezone: data.city.timezone,
    },
    list: days,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat/lon query params" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || "";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenWeather API key tidak ditemukan. Tambahkan NEXT_PUBLIC_OPENWEATHER_API_KEY di .env.local lalu restart dev server.",
      },
      { status: 500 }
    );
  }

  try {
    const url = `${API_BASE_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
      lon
    )}&units=metric&appid=${apiKey}&lang=id`;

    const res = await fetch(url, {
      // Avoid caching so location changes reflect quickly
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `OpenWeather request failed (${res.status})`,
          details: text,
        },
        { status: res.status }
      );
    }

    const raw = JSON.parse(text) as OWMForecastResponse;
    const daily = aggregateToDaily(raw);
    return NextResponse.json(daily);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Gagal menghubungi OpenWeather",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
