'use client';

import 'leaflet/dist/leaflet.css';

import { useState } from 'react';
import { MapPin, MessageCircle, Sparkles, X } from 'lucide-react';
import { MapContainer, useMapEvents } from 'react-leaflet';

import '../app/globals.css';
import { MapLibreTileLayer } from './maplayer.jsx';

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    },
  });

  return null;
}

async function reverseGeocode(lat, lng) {
  const response = await fetch('/api/reverse-geocode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lat, lng }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Reverse geocoding failed.');
  }

  return payload.data;
}

async function fetchPlaceSummary(place) {
  const response = await fetch('/api/place-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'summary',
      place,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to generate place summary.');
  }

  return payload.data;
}

async function askPlaceQuestion({ place, summary, question, questionCount }) {
  const response = await fetch('/api/place-insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'question',
      place,
      summary,
      question,
      questionCount,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to answer the question.');
  }

  return payload.data;
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/12 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl">
      <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{value || 'Unknown'}</div>
    </div>
  );
}

export default function Map() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeInsight, setPlaceInsight] = useState(null);
  const [questionInput, setQuestionInput] = useState('');
  const [questionHistory, setQuestionHistory] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const remainingQuestions = placeInsight?.remainingQuestions ?? 0;
  const questionsUsed = 2 - remainingQuestions;

  const handleMapClick = async ({ lat, lng }) => {
    setIsPanelOpen(true);
    setErrorMessage('');
    setQuestionInput('');
    setQuestionHistory([]);
    setPlaceInsight(null);
    setIsLoadingPlace(true);

    try {
      const place = await reverseGeocode(lat, lng);
      setSelectedPlace(place);

      const summary = await fetchPlaceSummary(place);
      setPlaceInsight(summary);
    } catch (error) {
      setSelectedPlace(null);
      setPlaceInsight(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load place details.');
    } finally {
      setIsLoadingPlace(false);
    }
  };

  const handleAskQuestion = async (questionOverride) => {
    const question = (questionOverride ?? questionInput).trim();

    if (
      !selectedPlace ||
      !placeInsight ||
      !question ||
      isAskingQuestion ||
      remainingQuestions <= 0
    ) {
      return;
    }

    setIsAskingQuestion(true);
    setErrorMessage('');

    try {
      const answerData = await askPlaceQuestion({
        place: selectedPlace,
        summary: placeInsight.summary,
        question,
        questionCount: questionHistory.length,
      });

      setQuestionHistory((currentHistory) => [
        ...currentHistory,
        {
          question,
          answer: answerData.answer,
        },
      ]);

      setPlaceInsight((currentInsight) =>
        currentInsight
          ? {
              ...currentInsight,
              remainingQuestions: answerData.remainingQuestions,
            }
          : currentInsight,
      );

      setQuestionInput('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to ask follow-up question.');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-4 top-4 z-[1000] flex justify-center">
        <div className="rounded-full border border-white/35 bg-white/14 px-5 py-2.5 text-xs uppercase tracking-[0.32em] text-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl">
          Click anywhere on the map to inspect a place
        </div>
      </div>

      {isPanelOpen && (
        <div className="absolute right-4 top-20 z-[1000] w-[min(420px,calc(100%-2rem))] overflow-hidden rounded-[32px] border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))] shadow-[0_24px_80px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_34%),radial-gradient(circle_at_top_right,rgba(125,211,252,0.24),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))]" />
          <div className="absolute inset-[1px] rounded-[31px] border border-white/10" />
          <div className="relative border-b border-white/15 bg-gradient-to-br from-white/18 via-sky-200/10 to-transparent p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/70">
                  <Sparkles className="h-4 w-4" />
                  AI Place Briefing
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-white drop-shadow-[0_1px_12px_rgba(255,255,255,0.12)]">
                  {placeInsight?.title || selectedPlace?.name || 'Loading place'}
                </h2>
                <p className="mt-2 text-sm text-white/72">
                  {selectedPlace
                    ? `${selectedPlace.city || selectedPlace.district || 'Unknown area'}, ${selectedPlace.country || 'Unknown country'}`
                    : 'Reverse geocoding the clicked point and generating a summary.'}
                </p>
              </div>

              <button
                className="rounded-full border border-white/30 bg-white/12 p-2 text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:bg-white/18 hover:text-white"
                onClick={() => setIsPanelOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative max-h-[70vh] space-y-5 overflow-y-auto p-5">
            {errorMessage && (
              <div className="rounded-2xl border border-rose-200/35 bg-rose-300/14 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-2xl">
                {errorMessage}
              </div>
            )}

            {isLoadingPlace && (
              <div className="rounded-3xl border border-white/28 bg-white/10 p-5 text-sm text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-2xl">
                Loading reverse geocode data and generating an OpenAI summary.
              </div>
            )}

            {selectedPlace && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/88">
                  <MapPin className="h-4 w-4 text-sky-100" />
                  Geocode details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Name" value={selectedPlace.name} />
                  <DetailRow label="Category" value={selectedPlace.category} />
                  <DetailRow label="Street" value={selectedPlace.street} />
                  <DetailRow label="Number" value={selectedPlace.number} />
                  <DetailRow label="City" value={selectedPlace.city} />
                  <DetailRow label="Postal Code" value={selectedPlace.plz} />
                  <DetailRow label="State" value={selectedPlace.state} />
                  <DetailRow label="Country" value={selectedPlace.country} />
                </div>
              </div>
            )}

            {placeInsight?.summary && (
              <div className="rounded-3xl border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-2xl">
                <div className="text-xs uppercase tracking-[0.28em] text-white/65">Overview</div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/90">
                  {placeInsight.summary}
                </p>

                {placeInsight.highlights?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {placeInsight.highlights.map((highlight) => (
                      <span
                        className="rounded-full border border-white/30 bg-white/14 px-3 py-1 text-xs text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]"
                        key={highlight}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {placeInsight && (
              <div className="rounded-3xl border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.07))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <MessageCircle className="h-4 w-4 text-sky-100" />
                      Ask about this place
                    </div>
                    <p className="mt-1 text-sm text-white/65">
                      {remainingQuestions > 0
                        ? `${remainingQuestions} of 2 follow-up questions remaining`
                        : 'Question limit reached for this map click'}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/30 bg-white/12 px-3 py-1 text-xs text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    {questionsUsed}/2 used
                  </div>
                </div>

                {placeInsight.questionSuggestions?.length > 0 && remainingQuestions > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {placeInsight.questionSuggestions.map((suggestion) => (
                      <button
                        className="rounded-full border border-white/30 bg-white/12 px-3 py-1.5 text-left text-xs text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition hover:bg-white/18"
                        key={suggestion}
                        onClick={() => handleAskQuestion(suggestion)}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <input
                    className="min-w-0 flex-1 rounded-2xl border border-white/30 bg-white/12 px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-2xl transition placeholder:text-white/45 focus:border-white/50"
                    disabled={isAskingQuestion || remainingQuestions <= 0}
                    maxLength={160}
                    onChange={(event) => setQuestionInput(event.target.value)}
                    placeholder="Ask something about the clicked place"
                    type="text"
                    value={questionInput}
                  />
                  <button
                    className="rounded-2xl border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.4))] px-4 py-3 text-sm font-medium text-slate-900 shadow-[0_10px_30px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.5))] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/8 disabled:text-white/35 disabled:shadow-none"
                    disabled={!questionInput.trim() || isAskingQuestion || remainingQuestions <= 0}
                    onClick={() => handleAskQuestion()}
                    type="button"
                  >
                    {isAskingQuestion ? 'Asking...' : 'Ask'}
                  </button>
                </div>

                {questionHistory.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {questionHistory.map((entry, index) => (
                      <div
                        className="rounded-2xl border border-white/28 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-2xl"
                        key={`${entry.question}-${index}`}
                      >
                        <div className="text-xs uppercase tracking-[0.24em] text-white/50">
                          Question
                        </div>
                        <p className="mt-2 text-sm font-medium text-white">{entry.question}</p>
                        <div className="mt-4 text-xs uppercase tracking-[0.24em] text-white/58">
                          Answer
                        </div>
                        <p className="mt-2 text-sm leading-7 text-white/78">{entry.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={[38, 139.69222]}
        className="full-height-map"
        maxBounds={[
          [-85.06, -180],
          [85.06, 180],
        ]}
        maxZoom={19}
        minZoom={3}
        scrollWheelZoom
        zoom={6}
      >
        <MapLibreTileLayer
          attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/styles/stamen_toner_dark.json"
        />
        <ClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}
