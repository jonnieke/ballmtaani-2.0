/**
 * BallMtaani CDN images
 * Hosted on Supabase Storage (public bucket: ballmtaani-images)
 * Add new images here as they are uploaded.
 */

const BASE = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images";

export const IMAGES = {
  /** Packed stadium, African fans celebrating – warm gold/orange tones */
  africanFans: `${BASE}/African_fans_celebration_stadium.jpeg`,

  /** General football stadium culture – wide angle, atmospheric */
  footballCulture: `${BASE}/Football_culture_stadium.jpeg`,

  /** Free-kick wall, dramatic stadium lighting */
  freeKickWall: `${BASE}/Football_free_kick_wall_stadium_202606080310.jpeg`,

  /** VAR screen / referee reviewing decision – dark, technical */
  varScreen: `${BASE}/VAR_screen_football_referee.jpeg`,

  /** World Cup stadium interior under floodlights – cinematic */
  wc26Stadium: `${BASE}/World_Cup_stadium_interior_flood.jpeg`,
} as const;
