const PLACE_FIELD_LABELS = {
  name: 'Name',
  street: 'Street',
  number: 'House number',
  city: 'City',
  state: 'State',
  country: 'Country',
  plz: 'Postal code',
  district: 'District',
  category: 'Category',
  lat: 'Latitude',
  lng: 'Longitude',
};

export function normalizePlace(rawPlace = {}) {
  return {
    name: rawPlace.name ?? '',
    street: rawPlace.street ?? '',
    number: rawPlace.number ?? '',
    city: rawPlace.city ?? '',
    state: rawPlace.state ?? '',
    country: rawPlace.country ?? '',
    plz: rawPlace.plz ?? '',
    district: rawPlace.district ?? '',
    category: rawPlace.category ?? '',
    lat: rawPlace.lat ?? '',
    lng: rawPlace.lng ?? '',
  };
}

export function buildPlaceContext(placeInput) {
  const place = normalizePlace(placeInput);

  return Object.entries(PLACE_FIELD_LABELS)
    .map(([key, label]) => `${label}: ${place[key] || 'Unknown'}`)
    .join('\n');
}

export function buildSummaryPrompt(placeInput) {
  const placeContext = buildPlaceContext(placeInput);

  return `
You are writing concise, grounded travel-style place briefings for an interactive map.

Rules:
- Use only the provided location data and careful general inference from it.
- If the geocode data is sparse, say that briefly instead of inventing facts.
- Keep the tone informative, vivid, and trustworthy.
- Mention uncertainty explicitly when needed.
- Return valid JSON only with this shape:
{
  "title": "short title, max 60 characters",
  "summary": "2 short paragraphs, max 120 words total",
  "highlights": ["3 short bullet-style strings, max 12 words each"],
  "questionSuggestions": ["2 short question suggestions the user could ask next"]
}

Location data:
${placeContext}
`.trim();
}

export function buildQuestionPrompt({ place, summary, question, remainingQuestions }) {
  const placeContext = buildPlaceContext(place);

  return `
You answer follow-up questions about a clicked place on a map.

Rules:
- Base the answer on the provided geocode data and the summary context below.
- Do not invent precise historical facts, statistics, or opening hours.
- If the question cannot be answered reliably from the context, say what is uncertain and give the best high-level answer anyway.
- Keep the answer under 90 words.
- Return valid JSON only with this shape:
{
  "answer": "string",
  "remainingQuestionsLabel": "short string telling the user how many follow-up questions remain"
}

Location data:
${placeContext}

Current place summary:
${summary || 'No summary provided.'}

User question:
${question}

Follow-up questions remaining after this answer: ${remainingQuestions}
`.trim();
}

export function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}
