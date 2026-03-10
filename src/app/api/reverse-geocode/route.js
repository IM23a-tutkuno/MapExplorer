import { NextResponse } from 'next/server';
import { loadEnvConfig } from '@next/env'


loadEnvConfig(process.cwd())



export async function POST(req) {
  const body = await req.json()
  console.log(body)
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${body.lat}&lon=${body.lng}&apiKey=${process.env.GEOCODING_API_KEY}`;
  const response = await fetch(url, {
    method: "GET",
  })
  const data = await response.json()
  const location_info = {
    "name": data.features[0].properties.name,
    "street": data.features[0].properties.street,
    "number": data.features[0].properties.housenumber,
    "city": data.features[0].properties.city,
    "state": data.features[0].properties.state,
    "country": data.features[0].properties.country,
    "plz": data.features[0].properties.postcode,
    "district": data.features[0].properties.district,
    "category": data.features[0].properties.category,
    "lon": data.features[0].properties.lon,
    "lat": data.features[0].properties.lat,
  }
  console.log(location_info)
  return NextResponse.json({ data: location_info });
}
