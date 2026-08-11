/**
 * Parses any user-provided subreddit input and extracts the bare subreddit name.
 *
 * Accepted input formats:
 *  - "saas"                                     → "saas"
 *  - "r/saas"                                   → "saas"
 *  - "/r/saas"                                  → "saas"
 *  - "https://reddit.com/r/saas"                → "saas"
 *  - "https://www.reddit.com/r/saas/"           → "saas"
 *  - "https://old.reddit.com/r/saas/top/?t=week"→ "saas"
 *  - "reddit.com/r/saas"                        → "saas"
 */
export function parseSubredditInput(raw: string): string {
  const trimmed = raw.trim();

  // Try URL extraction first — handle "http(s)://" and "reddit.com/..." without scheme
  const urlLike = /^(https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/([A-Za-z0-9_]+)/i;
  const urlMatch = trimmed.match(urlLike);
  if (urlMatch?.[2]) {
    return urlMatch[2];
  }

  // Handle "r/saas" or "/r/saas"
  const rSlashMatch = trimmed.match(/^\/?r\/([A-Za-z0-9_]+)/i);
  if (rSlashMatch?.[1]) {
    return rSlashMatch[1];
  }

  // Plain name — strip leading/trailing slashes and whitespace
  return trimmed.replace(/^\/+|\/+$/g, "");
}

/** Returns true if the given string is a valid bare subreddit name */
export function isValidSubredditName(name: string): boolean {
  return /^[A-Za-z0-9_]{1,50}$/.test(name);
}

/**
 * Validates raw user input for the subreddit field.
 * Returns { valid: true, name } or { valid: false, error }
 */
export function validateSubredditInput(raw: string):
  | { valid: true; name: string }
  | { valid: false; error: string } {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, error: "Enter a subreddit name or URL." };
  }

  const name = parseSubredditInput(trimmed);

  if (!name) {
    return { valid: false, error: "Could not extract a subreddit name from your input." };
  }

  if (!isValidSubredditName(name)) {
    return {
      valid: false,
      error: `"${name}" is not a valid subreddit name (letters, numbers, and underscores only, max 50 chars).`,
    };
  }

  return { valid: true, name };
}
