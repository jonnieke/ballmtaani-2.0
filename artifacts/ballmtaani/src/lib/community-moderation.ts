/**
 * BallMtaani Community & Moderation Engine
 * Handles fan discussion safety, banned word filtering, report queues, and user blocking.
 */

const BANNED_TERMS = [
  "fixed match",
  "sure win",
  "odds 100",
  "whatsapp group bet",
  "pay after win",
  "sell ticket",
];

export interface PostContent {
  id: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt: string;
  isFlagged?: boolean;
  isHidden?: boolean;
}

/**
 * Filter text for spam, betting scams, or banned terms
 */
export function checkContentSafety(text: string): { isSafe: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const term of BANNED_TERMS) {
    if (lower.includes(term)) {
      return { isSafe: false, reason: `Contains prohibited commercial or scam term: "${term}"` };
    }
  }
  return { isSafe: true };
}

/**
 * Filter posts based on user blocklist
 */
export function filterBlockedPosts(posts: PostContent[], blockedUserIds: string[]): PostContent[] {
  const blockSet = new Set(blockedUserIds);
  return posts.filter(p => !blockSet.has(p.userId) && !p.isHidden);
}
