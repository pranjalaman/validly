import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeWithAI } from "@/lib/insforge";
import { structureRedditData } from "@/lib/reddit";
import { parseSubredditInput } from "@/lib/subreddit";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  subreddit: z
    .string()
    .trim()
    .min(1, "Subreddit is required")
    .transform((val) => parseSubredditInput(val))
    .refine((val) => /^[A-Za-z0-9_]{1,50}$/.test(val), {
      message: "Invalid subreddit name. Use letters, numbers, and underscores only (max 50 chars).",
    }),
});

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid request payload.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server error.";
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    console.log(`[API] Starting analysis for r/${body.subreddit}`);
    
    const source = await structureRedditData(body.subreddit);
    console.log(`[API] Scraped ${source.posts.length} posts`);
    
    const ideas = await analyzeWithAI(source);
    console.log(`[API] Generated ${ideas.length} ideas`);

    return NextResponse.json({
      subreddit: source.subreddit,
      source,
      ideas,
    });
  } catch (error) {
    console.error("[API] Error occurred:", error);
    const message = getErrorMessage(error);
    const status = error instanceof z.ZodError ? 400 : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}