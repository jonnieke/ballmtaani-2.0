export interface GrassrootsTalent {
  id: string;
  name: string;
  age: number;
  position: "Striker" | "Winger" | "Central Midfielder" | "Defensive Midfielder" | "Center Back" | "Full Back" | "Goalkeeper";
  institution: string; // e.g. "St. Anthony's Boys Kitale"
  category: "ksssa" | "nsl" | "academy" | "county";
  region: string; // e.g. "Rift Valley / Kitale", "Nairobi / Dagoretti"
  currentLeague: string;
  avatarUrl?: string;
  strengths: string[];
  stats: {
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    appearances: number;
  };
  scoutVerdict: string;
  endorsements: number;
  featuredQuote: string;
  verifiedBy?: string; // e.g. "Verified by Derrick Okach (Shabana FC)"
}

export const GRASSROOTS_TALENTS: GrassrootsTalent[] = [
  {
    id: "talent-1",
    name: "Brian 'Dinho' Otieno",
    age: 17,
    position: "Winger",
    institution: "St. Anthony's Boys Kitale (Solidarity Boys)",
    category: "ksssa",
    region: "Rift Valley (Kitale)",
    currentLeague: "KSSSA National School Championships",
    strengths: ["Explosive 1v1 Pace", "Incisive Cut-Ins", "Set-Piece Specialist"],
    stats: {
      goals: 14,
      assists: 9,
      appearances: 12,
    },
    scoutVerdict: "Electrifying winger with blistering acceleration and fearless dribbling. Dominated the East Africa Secondary School games with a lethal left foot.",
    endorsements: 342,
    featuredQuote: "My dream is to step onto the FKF Premier League pitch and wear the national Harambee Stars jersey.",
    verifiedBy: "Derrick Okach (Shabana FC Scout Review)",
  },
  {
    id: "talent-2",
    name: "Kelvin Mwangi",
    age: 18,
    position: "Central Midfielder",
    institution: "Highway Secondary School (South B, Nairobi)",
    category: "ksssa",
    region: "Nairobi (South B)",
    currentLeague: "KSSSA Nairobi Region / Chapa Dimba",
    strengths: ["Pinpoint Long Passing", "Press Resistance", "Tactical Vision"],
    stats: {
      goals: 6,
      assists: 15,
      appearances: 16,
    },
    scoutVerdict: "The engine room of Highway Secondary. Dictates tempo effortlessly and can break opposition lines with single-touch progressive passing.",
    endorsements: 289,
    featuredQuote: "Football in South B taught me composure under intense pressure. Vision is everything.",
    verifiedBy: "BallMtaani Scout Desk",
  },
  {
    id: "talent-3",
    name: "Collins 'Gattuso' Onyango",
    age: 19,
    position: "Defensive Midfielder",
    institution: "Kibera Black Stars Youth Academy",
    category: "academy",
    region: "Nairobi (Kibera)",
    currentLeague: "Nairobi County League / FKF Division 2",
    strengths: ["Ball Recovery", "Physical Duels", "Positional Discipline"],
    stats: {
      goals: 3,
      assists: 5,
      appearances: 20,
    },
    scoutVerdict: "A relentless ball-winner with exceptional work rate. Shields the defensive four with aggressive tackling and quick transition distribution.",
    endorsements: 415,
    featuredQuote: "From the dust pitches of Woodley to the national spotlight. We don't stop grinding.",
    verifiedBy: "Derrick Okach (Shabana FC)",
  },
  {
    id: "talent-4",
    name: "Emmanuel Wafula",
    age: 18,
    position: "Center Back",
    institution: "Kakamega High School (Green Commandos)",
    category: "ksssa",
    region: "Western (Kakamega)",
    currentLeague: "KSSSA Western Region / NSL Reserve",
    strengths: ["Aerial Dominance", "Commanding Leadership", "Clean Tackling"],
    stats: {
      cleanSheets: 8,
      goals: 2,
      appearances: 14,
    },
    scoutVerdict: "Towering central defender who reads the game like a veteran. Exceptional in aerial duels and organizes the backline with natural authority.",
    endorsements: 310,
    featuredQuote: "Green Commandos history demands excellence. I play with the spirit of the legends before me.",
    verifiedBy: "BallMtaani Western Bureau",
  },
  {
    id: "talent-5",
    name: "Abdirahman Hassan",
    age: 18,
    position: "Striker",
    institution: "Garissa Youth FC / Northern Stars",
    category: "county",
    region: "North Eastern (Garissa)",
    currentLeague: "FKF Division One Northern Zone",
    strengths: ["Clinical Finishing", "Off-The-Ball Runs", "Both-Footed Striking"],
    stats: {
      goals: 18,
      assists: 4,
      appearances: 15,
    },
    scoutVerdict: "Pure goalscorer with natural instincts in the penalty box. Needs half a yard of space to punish defenders.",
    endorsements: 520,
    featuredQuote: "Talent is everywhere in Kenya — we just need the spotlight and the opportunity to shine.",
    verifiedBy: "BallMtaani Scout Desk",
  },
];
