import { NextResponse } from 'next/server';
import { loadEnvConfig } from '@next/env';

import {
  buildQuestionPrompt,
  buildSummaryPrompt,
  normalizePlace,
  parseJsonResponse,
} from '@/lib/place-insights';

loadEnvConfig(process.cwd());

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = 'gpt-5-nano';
const MAX_QUESTIONS_PER_CLICK = 2;

async function createOpenAIResponse(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      text: {
        verbosity: 'low',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      ?.filter((item) => item.type === 'output_text')
      ?.map((item) => item.text)
      ?.join('\n');

  if (!outputText) {
    throw new Error('OpenAI response did not include text output.');
  }

  return outputText;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const place = normalizePlace(body.place);
    const mode = body.mode === 'question' ? 'question' : 'summary';

    if (!place.lat || !place.lng) {
      return NextResponse.json({ error: 'Missing place coordinates.' }, { status: 400 });
    }

    if (mode === 'question') {
      const question = body.question?.trim();
      const questionCount = Number(body.questionCount ?? 0);

      if (!question) {
        return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
      }

      if (questionCount >= MAX_QUESTIONS_PER_CLICK) {
        return NextResponse.json(
          { error: `Only ${MAX_QUESTIONS_PER_CLICK} follow-up questions are allowed per click.` },
          { status: 400 },
        );
      }

      const rawAnswer = await createOpenAIResponse(
        buildQuestionPrompt({
          place,
          summary: body.summary,
          question,
          remainingQuestions: MAX_QUESTIONS_PER_CLICK - (questionCount + 1),
        }),
      );
      const parsedAnswer = parseJsonResponse(rawAnswer);

      return NextResponse.json({
        data: {
          mode,
          answer: parsedAnswer.answer,
          remainingQuestions: Math.max(0, MAX_QUESTIONS_PER_CLICK - (questionCount + 1)),
          remainingQuestionsLabel:
            parsedAnswer.remainingQuestionsLabel ||
            `${Math.max(0, MAX_QUESTIONS_PER_CLICK - (questionCount + 1))} follow-up questions remaining`,
        },
      });
    }

    const rawSummary = await createOpenAIResponse(buildSummaryPrompt(place));
    const parsedSummary = parseJsonResponse(rawSummary);

    return NextResponse.json({
      data: {
        mode,
        model: OPENAI_MODEL,
        title: parsedSummary.title,
        summary: parsedSummary.summary,
        highlights: Array.isArray(parsedSummary.highlights)
          ? parsedSummary.highlights.slice(0, 3)
          : [],
        questionSuggestions: Array.isArray(parsedSummary.questionSuggestions)
          ? parsedSummary.questionSuggestions.slice(0, 2)
          : [],
        remainingQuestions: MAX_QUESTIONS_PER_CLICK,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected error while generating place insights.',
      },
      { status: 500 },
    );
  }
}
