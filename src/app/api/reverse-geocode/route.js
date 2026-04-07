import { NextResponse } from 'next/server';
import { loadEnvConfig } from '@next/env';

import { normalizePlace } from '@/lib/place-insights';

loadEnvConfig(process.cwd());

export async function POST(req) {
  try {
    const body = await req.json();
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${body.lat}&lon=${body.lng}&apiKey=${process.env.GEOCODING_API_KEY}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Reverse geocoding failed.' }, { status: 502 });
    }

    const data = await response.json();
    const properties = data.features?.[0]?.properties;

    if (!properties) {
      return NextResponse.json({ error: 'No place found for that point.' }, { status: 404 });
    }

    const locationInfo = normalizePlace({
      name: properties.name,
      street: properties.street,
      number: properties.housenumber,
      city: properties.city,
      state: properties.state,
      country: properties.country,
      plz: properties.postcode,
      district: properties.district,
      category: properties.category,
      lng: properties.lon,
      lat: properties.lat,
    });

    return NextResponse.json({ data: locationInfo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unexpected reverse geocoding error.' }, { status: 500 });
  }
}
