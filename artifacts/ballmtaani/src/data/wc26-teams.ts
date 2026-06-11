// WC26 Team Explorer Data
// Groups, players, fixtures, stadiums

export interface WC26Player {
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  club: string;
  caps?: number;
}

export interface WC26Fixture {
  matchday: number;
  opponent: string;
  date: string;        // "Jun 11"
  time: string;        // "10:00 PM EAT"
  stadium: string;
  city: string;
  home: boolean;       // true = this team listed first
}

export interface WC26TeamData {
  name: string;
  flag: string;
  logo: string;        // api-sports flag URL
  group: string;
  confederation: string;
  players: WC26Player[];
  fixtures: WC26Fixture[];
}

export interface WC26Stadium {
  name: string;
  city: string;
  country: string;
  capacity: number;
  image: string;
  matchCount: number;
  finalVenue: boolean;
  note?: string;
}

// --- Stadiums ------------------------------------------------
export const WC26_STADIUMS: WC26Stadium[] = [
  { name: "MetLife Stadium",         city: "East Rutherford, NJ", country: "USA",    capacity: 82500, matchCount: 8, finalVenue: true,  image: "/stadiums/metlife.png",      note: "FINAL  -  Jul 19" },
  { name: "Estadio Azteca",          city: "Mexico City",          country: "Mexico", capacity: 87000, matchCount: 8, finalVenue: false, image: "/stadiums/azteca.png",       note: "Opening Match" },
  { name: "AT&T Stadium",            city: "Arlington, TX",        country: "USA",    capacity: 80000, matchCount: 7, finalVenue: false, image: "/stadiums/att.png" },
  { name: "SoFi Stadium",            city: "Inglewood, CA",        country: "USA",    capacity: 70240, matchCount: 7, finalVenue: false, image: "/stadiums/sofi.png" },
  { name: "Hard Rock Stadium",       city: "Miami Gardens, FL",    country: "USA",    capacity: 65326, matchCount: 7, finalVenue: false, image: "/stadiums/hardrock.png" },
  { name: "Levi's Stadium",          city: "Santa Clara, CA",      country: "USA",    capacity: 68500, matchCount: 7, finalVenue: false, image: "/stadiums/levis.png" },
  { name: "BMO Field",               city: "Toronto",              country: "Canada", capacity: 45000, matchCount: 7, finalVenue: false, image: "/stadiums/bmo.png" },
  { name: "BC Place",                city: "Vancouver",            country: "Canada", capacity: 54500, matchCount: 7, finalVenue: false, image: "/stadiums/bcplace.png" },
  { name: "Lincoln Financial Field", city: "Philadelphia, PA",     country: "USA",    capacity: 69796, matchCount: 6, finalVenue: false, image: "/stadiums/lincoln.png" },
  { name: "Arrowhead Stadium",       city: "Kansas City, MO",      country: "USA",    capacity: 76416, matchCount: 6, finalVenue: false, image: "/stadiums/arrowhead.png" },
  { name: "Gillette Stadium",        city: "Foxborough, MA",       country: "USA",    capacity: 65878, matchCount: 6, finalVenue: false, image: "/stadiums/gillette.png" },
  { name: "Lumen Field",             city: "Seattle, WA",          country: "USA",    capacity: 72000, matchCount: 6, finalVenue: false, image: "/stadiums/lumen.png" },
  { name: "NRG Stadium",             city: "Houston, TX",          country: "USA",    capacity: 72220, matchCount: 6, finalVenue: false, image: "/stadiums/nrg.png" },
  { name: "Mercedes-Benz Stadium",   city: "Atlanta, GA",          country: "USA",    capacity: 71000, matchCount: 6, finalVenue: false, image: "/stadiums/mercedesbenz.png" },
  { name: "Estadio Akron",           city: "Guadalajara",          country: "Mexico", capacity: 49850, matchCount: 6, finalVenue: false, image: "/stadiums/akron.png" },
  { name: "Estadio BBVA",            city: "Monterrey",            country: "Mexico", capacity: 51350, matchCount: 6, finalVenue: false, image: "/stadiums/bbva.png" },
];

// --- Teams ---------------------------------------------------
export const WC26_TEAMS: WC26TeamData[] = [
  // -- GROUP A --
  {
    name: "Mexico", flag: "🇲🇽", logo: "https://media.api-sports.io/flags/mx.svg",
    group: "A", confederation: "CONCACAF",
    players: [
      { name: "Guillermo Ochoa",   position: "GK",  club: "América" },
      { name: "César Montes",      position: "DEF", club: "Espanyol" },
      { name: "Edson Álvarez",     position: "MID", club: "West Ham" },
      { name: "Hirving Lozano",    position: "FWD", club: "PSV" },
      { name: "Santiago Giménez",  position: "FWD", club: "Milan" },
      { name: "Alexis Vega",       position: "MID", club: "Chivas" },
    ],
    fixtures: [
      { matchday: 1, opponent: "South Africa", date: "Jun 11", time: "10:00 PM", stadium: "Estadio Azteca",   city: "Mexico City", home: true  },
      { matchday: 2, opponent: "Colombia",     date: "Jun 16", time: "1:00 AM",  stadium: "AT&T Stadium",     city: "Arlington",   home: true  },
      { matchday: 3, opponent: "USA",          date: "Jun 22", time: "7:00 PM",  stadium: "Arrowhead Stadium",city: "Kansas City", home: false },
    ],
  },
  {
    name: "South Africa", flag: "🇿🇦", logo: "https://media.api-sports.io/flags/za.svg",
    group: "A", confederation: "CAF",
    players: [
      { name: "Ronwen Williams",   position: "GK",  club: "SuperSport Utd" },
      { name: "Siyanda Xulu",      position: "DEF", club: "Konyaspor" },
      { name: "Themba Zwane",      position: "MID", club: "Mamelodi Sundowns" },
      { name: "Percy Tau",         position: "FWD", club: "Al Ahly" },
      { name: "Keagan Dolly",      position: "MID", club: "Kaizer Chiefs" },
      { name: "Lebo Mothiba",      position: "FWD", club: "RC Lens" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Mexico",    date: "Jun 11", time: "10:00 PM", stadium: "Estadio Azteca",     city: "Mexico City",  home: false },
      { matchday: 2, opponent: "USA",       date: "Jun 16", time: "7:00 PM",  stadium: "Hard Rock Stadium",  city: "Miami",        home: false },
      { matchday: 3, opponent: "Colombia",  date: "Jun 22", time: "10:00 PM", stadium: "SoFi Stadium",       city: "Inglewood",    home: false },
    ],
  },
  {
    name: "USA", flag: "🇺🇸", logo: "https://media.api-sports.io/flags/us.svg",
    group: "A", confederation: "CONCACAF",
    players: [
      { name: "Matt Turner",       position: "GK",  club: "Nottm Forest" },
      { name: "Sergino Dest",      position: "DEF", club: "PSV" },
      { name: "Tyler Adams",       position: "MID", club: "AFC Bournemouth" },
      { name: "Christian Pulisic", position: "FWD", club: "AC Milan" },
      { name: "Gio Reyna",         position: "MID", club: "Borussia Dortmund" },
      { name: "Ricardo Pepi",      position: "FWD", club: "PSV" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Colombia",     date: "Jun 12", time: "1:00 AM",  stadium: "MetLife Stadium",    city: "E. Rutherford", home: true },
      { matchday: 2, opponent: "South Africa", date: "Jun 16", time: "7:00 PM",  stadium: "Hard Rock Stadium",  city: "Miami",         home: true },
      { matchday: 3, opponent: "Mexico",       date: "Jun 22", time: "7:00 PM",  stadium: "Arrowhead Stadium",  city: "Kansas City",   home: true },
    ],
  },
  {
    name: "Colombia", flag: "🇨🇴", logo: "https://media.api-sports.io/flags/co.svg",
    group: "A", confederation: "CONMEBOL",
    players: [
      { name: "David Ospina",      position: "GK",  club: "Al-Qadsiah" },
      { name: "Santiago Arias",    position: "DEF", club: "Bayer Leverkusen" },
      { name: "Wilmar Barrios",    position: "MID", club: "Zenit" },
      { name: "James Rodríguez",   position: "MID", club: "Rayo Vallecano" },
      { name: "Luis Díaz",         position: "FWD", club: "Liverpool" },
      { name: "Falcao García",     position: "FWD", club: "Rionegro Águilas" },
    ],
    fixtures: [
      { matchday: 1, opponent: "USA",          date: "Jun 12", time: "1:00 AM",  stadium: "MetLife Stadium",  city: "E. Rutherford", home: false },
      { matchday: 2, opponent: "Mexico",       date: "Jun 16", time: "1:00 AM",  stadium: "AT&T Stadium",     city: "Arlington",     home: false },
      { matchday: 3, opponent: "South Africa", date: "Jun 22", time: "10:00 PM", stadium: "SoFi Stadium",     city: "Inglewood",     home: true  },
    ],
  },

  // -- GROUP B --
  {
    name: "Canada", flag: "🇨🇦", logo: "https://media.api-sports.io/flags/ca.svg",
    group: "B", confederation: "CONCACAF",
    players: [
      { name: "Milan Borjan",       position: "GK",  club: "Red Star Belgrade" },
      { name: "Richie Laryea",      position: "DEF", club: "Nottm Forest" },
      { name: "Atiba Hutchinson",   position: "MID", club: "Beşiktaş" },
      { name: "Alphonso Davies",    position: "MID", club: "Bayern Munich" },
      { name: "Jonathan David",     position: "FWD", club: "LOSC Lille" },
      { name: "Cyle Larin",         position: "FWD", club: "Club Brugge" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Venezuela",   date: "Jun 12", time: "4:00 PM",  stadium: "BMO Field",       city: "Toronto",   home: true },
      { matchday: 2, opponent: "Costa Rica",  date: "Jun 17", time: "10:00 PM", stadium: "BC Place",        city: "Vancouver", home: true },
      { matchday: 3, opponent: "Spain",       date: "Jun 23", time: "1:00 AM",  stadium: "BMO Field",       city: "Toronto",   home: false },
    ],
  },
  {
    name: "Venezuela", flag: "🇻🇪", logo: "https://media.api-sports.io/flags/ve.svg",
    group: "B", confederation: "CONMEBOL",
    players: [
      { name: "Wuilker Faríñez",    position: "GK",  club: "Millonarios" },
      { name: "Nahuel Ferraresi",   position: "DEF", club: "Valencia" },
      { name: "Yangel Herrera",     position: "MID", club: "Girona" },
      { name: "Jefferson Savarino", position: "MID", club: "Real Salt Lake" },
      { name: "Salomón Rondón",     position: "FWD", club: "Everton" },
      { name: "Darwin Machís",      position: "FWD", club: "Udinese" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Canada",     date: "Jun 12", time: "4:00 PM",  stadium: "BMO Field",        city: "Toronto",    home: false },
      { matchday: 2, opponent: "Spain",      date: "Jun 17", time: "7:00 PM",  stadium: "Estadio Azteca",   city: "Mexico City",home: false },
      { matchday: 3, opponent: "Costa Rica", date: "Jun 23", time: "7:00 PM",  stadium: "Hard Rock Stadium",city: "Miami",      home: true  },
    ],
  },
  {
    name: "Spain", flag: "🇪🇸", logo: "https://media.api-sports.io/flags/es.svg",
    group: "B", confederation: "UEFA",
    players: [
      { name: "Unai Simón",          position: "GK",  club: "Athletic Bilbao" },
      { name: "Dani Carvajal",       position: "DEF", club: "Real Madrid" },
      { name: "Rodri",               position: "MID", club: "Manchester City" },
      { name: "Pedri",               position: "MID", club: "Barcelona" },
      { name: "Lamine Yamal",        position: "FWD", club: "Barcelona" },
      { name: "Álvaro Morata",       position: "FWD", club: "AC Milan" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Costa Rica", date: "Jun 13", time: "4:00 PM",  stadium: "Levi's Stadium",   city: "Santa Clara", home: true },
      { matchday: 2, opponent: "Venezuela",  date: "Jun 17", time: "7:00 PM",  stadium: "Estadio Azteca",   city: "Mexico City", home: true },
      { matchday: 3, opponent: "Canada",     date: "Jun 23", time: "1:00 AM",  stadium: "BMO Field",        city: "Toronto",     home: true },
    ],
  },
  {
    name: "Costa Rica", flag: "🇨🇷", logo: "https://media.api-sports.io/flags/cr.svg",
    group: "B", confederation: "CONCACAF",
    players: [
      { name: "Keylor Navas",       position: "GK",  club: "Newell's Old Boys" },
      { name: "Bryan Ruiz",         position: "MID", club: "LD Alajuelense" },
      { name: "Celso Borges",       position: "MID", club: "Alajuelense" },
      { name: "Joel Campbell",      position: "FWD", club: "Monterrey" },
      { name: "Bryan Oviedo",       position: "DEF", club: "Copenhagen" },
      { name: "Anthony Contreras",  position: "FWD", club: "Alajuelense" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Spain",    date: "Jun 13", time: "4:00 PM",  stadium: "Levi's Stadium",   city: "Santa Clara", home: false },
      { matchday: 2, opponent: "Canada",   date: "Jun 17", time: "10:00 PM", stadium: "BC Place",         city: "Vancouver",   home: false },
      { matchday: 3, opponent: "Venezuela",date: "Jun 23", time: "7:00 PM",  stadium: "Hard Rock Stadium",city: "Miami",       home: false },
    ],
  },

  // -- GROUP C --
  {
    name: "Brazil", flag: "🇧🇷", logo: "https://media.api-sports.io/flags/br.svg",
    group: "C", confederation: "CONMEBOL",
    players: [
      { name: "Alisson Becker",     position: "GK",  club: "Liverpool" },
      { name: "Marquinhos",         position: "DEF", club: "PSG" },
      { name: "Casemiro",           position: "MID", club: "Manchester Utd" },
      { name: "Vinícius Júnior",    position: "FWD", club: "Real Madrid" },
      { name: "Rodrygo",            position: "FWD", club: "Real Madrid" },
      { name: "Endrick",            position: "FWD", club: "Real Madrid" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Germany",  date: "Jun 13", time: "7:00 PM",  stadium: "SoFi Stadium",     city: "Inglewood",     home: true  },
      { matchday: 2, opponent: "Morocco",  date: "Jun 18", time: "10:00 PM", stadium: "Lumen Field",      city: "Seattle",       home: true  },
      { matchday: 3, opponent: "Japan",    date: "Jun 24", time: "1:00 AM",  stadium: "AT&T Stadium",     city: "Arlington",     home: true  },
    ],
  },
  {
    name: "Germany", flag: "🇩🇪", logo: "https://media.api-sports.io/flags/de.svg",
    group: "C", confederation: "UEFA",
    players: [
      { name: "Manuel Neuer",       position: "GK",  club: "Bayern Munich" },
      { name: "Antonio Rüdiger",    position: "DEF", club: "Real Madrid" },
      { name: "Joshua Kimmich",     position: "MID", club: "Bayern Munich" },
      { name: "Leroy Sané",         position: "MID", club: "Bayern Munich" },
      { name: "Thomas Müller",      position: "FWD", club: "Bayern Munich" },
      { name: "Kai Havertz",        position: "FWD", club: "Arsenal" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Brazil",  date: "Jun 13", time: "7:00 PM",  stadium: "SoFi Stadium",     city: "Inglewood",     home: false },
      { matchday: 2, opponent: "Japan",   date: "Jun 18", time: "4:00 PM",  stadium: "Gillette Stadium", city: "Foxborough",    home: true  },
      { matchday: 3, opponent: "Morocco", date: "Jun 24", time: "7:00 PM",  stadium: "Arrowhead Stadium",city: "Kansas City",   home: false },
    ],
  },
  {
    name: "Japan", flag: "🇯🇵", logo: "https://media.api-sports.io/flags/jp.svg",
    group: "C", confederation: "AFC",
    players: [
      { name: "Shuichi Gonda",      position: "GK",  club: "Shimizu S-Pulse" },
      { name: "Maya Yoshida",       position: "DEF", club: "Schalke 04" },
      { name: "Wataru Endo",        position: "MID", club: "Liverpool" },
      { name: "Daichi Kamada",      position: "MID", club: "Lazio" },
      { name: "Takumi Minamino",    position: "MID", club: "Monaco" },
      { name: "Ayase Ueda",         position: "FWD", club: "Club Brugge" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Morocco",  date: "Jun 13", time: "10:00 PM", stadium: "NRG Stadium",      city: "Houston",    home: false },
      { matchday: 2, opponent: "Germany",  date: "Jun 18", time: "4:00 PM",  stadium: "Gillette Stadium", city: "Foxborough", home: false },
      { matchday: 3, opponent: "Brazil",   date: "Jun 24", time: "1:00 AM",  stadium: "AT&T Stadium",     city: "Arlington",  home: false },
    ],
  },
  {
    name: "Morocco", flag: "🇲🇦", logo: "https://media.api-sports.io/flags/ma.svg",
    group: "C", confederation: "CAF",
    players: [
      { name: "Yassine Bounou",     position: "GK",  club: "Al Hilal" },
      { name: "Achraf Hakimi",      position: "DEF", club: "PSG" },
      { name: "Sofyan Amrabat",     position: "MID", club: "Manchester Utd" },
      { name: "Hakim Ziyech",       position: "MID", club: "Galatasaray" },
      { name: "Youssef En-Nesyri",  position: "FWD", club: "Fenerbahçe" },
      { name: "Azzedine Ounahi",    position: "MID", club: "Marseille" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Japan",    date: "Jun 13", time: "10:00 PM", stadium: "NRG Stadium",      city: "Houston",       home: true  },
      { matchday: 2, opponent: "Brazil",   date: "Jun 18", time: "10:00 PM", stadium: "Lumen Field",      city: "Seattle",       home: false },
      { matchday: 3, opponent: "Germany",  date: "Jun 24", time: "7:00 PM",  stadium: "Arrowhead Stadium",city: "Kansas City",   home: true  },
    ],
  },

  // -- GROUP D --
  {
    name: "Argentina", flag: "🇦🇷", logo: "https://media.api-sports.io/flags/ar.svg",
    group: "D", confederation: "CONMEBOL",
    players: [
      { name: "Emiliano Martínez",  position: "GK",  club: "Aston Villa" },
      { name: "Nahuel Molina",      position: "DEF", club: "Atlético Madrid" },
      { name: "Rodrigo De Paul",    position: "MID", club: "Atlético Madrid" },
      { name: "Lionel Messi",       position: "FWD", club: "Inter Miami" },
      { name: "Ángel Di María",     position: "FWD", club: "Benfica" },
      { name: "Julián Álvarez",     position: "FWD", club: "Atlético Madrid" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Morocco",  date: "Jun 14", time: "10:00 PM", stadium: "Hard Rock Stadium",    city: "Miami",       home: true  },
      { matchday: 2, opponent: "Egypt",    date: "Jun 19", time: "7:00 PM",  stadium: "AT&T Stadium",         city: "Arlington",   home: true  },
      { matchday: 3, opponent: "Uruguay",  date: "Jun 25", time: "10:00 PM", stadium: "Mercedes-Benz Stadium",city: "Atlanta",     home: true  },
    ],
  },
  {
    name: "Uruguay", flag: "🇺🇾", logo: "https://media.api-sports.io/flags/uy.svg",
    group: "D", confederation: "CONMEBOL",
    players: [
      { name: "Fernando Muslera",   position: "GK",  club: "Galatasaray" },
      { name: "José María Giménez", position: "DEF", club: "Atlético Madrid" },
      { name: "Federico Valverde",  position: "MID", club: "Real Madrid" },
      { name: "Darwin Núñez",       position: "FWD", club: "Liverpool" },
      { name: "Luis Suárez",        position: "FWD", club: "River Plate" },
      { name: "Rodrigo Bentancur", position: "MID", club: "Tottenham" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Paraguay",  date: "Jun 14", time: "4:00 PM",  stadium: "Gillette Stadium",     city: "Foxborough",  home: true  },
      { matchday: 2, opponent: "Egypt",     date: "Jun 19", time: "10:00 PM", stadium: "Lumen Field",          city: "Seattle",     home: false },
      { matchday: 3, opponent: "Argentina", date: "Jun 25", time: "10:00 PM", stadium: "Mercedes-Benz Stadium",city: "Atlanta",     home: false },
    ],
  },
  {
    name: "Egypt", flag: "🇪🇬", logo: "https://media.api-sports.io/flags/eg.svg",
    group: "D", confederation: "CAF",
    players: [
      { name: "Mohamed El-Shenawy", position: "GK",  club: "Al Ahly" },
      { name: "Ahmed Hegazy",       position: "DEF", club: "Al Ittihad" },
      { name: "Tarek Hamed",        position: "MID", club: "Zamalek" },
      { name: "Mohamed Salah",      position: "FWD", club: "Liverpool" },
      { name: "Ramadan Sobhi",      position: "MID", club: "Pyramids FC" },
      { name: "Mostafa Mohamed",    position: "FWD", club: "Nantes" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Paraguay",  date: "Jun 14", time: "1:00 AM",  stadium: "Lincoln Financial",    city: "Philadelphia",home: false },
      { matchday: 2, opponent: "Argentina", date: "Jun 19", time: "7:00 PM",  stadium: "AT&T Stadium",         city: "Arlington",   home: false },
      { matchday: 3, opponent: "Uruguay",   date: "Jun 19", time: "10:00 PM", stadium: "Lumen Field",          city: "Seattle",     home: true  },
    ],
  },
  {
    name: "Paraguay", flag: "🇵🇾", logo: "https://media.api-sports.io/flags/py.svg",
    group: "D", confederation: "CONMEBOL",
    players: [
      { name: "Antony Silva",       position: "GK",  club: "Cerro Porteño" },
      { name: "Gustavo Gómez",      position: "DEF", club: "Palmeiras" },
      { name: "Miguel Almirón",     position: "MID", club: "Newcastle" },
      { name: "Richard Sánchez",    position: "MID", club: "Boca Juniors" },
      { name: "Antonio Sanabria",   position: "FWD", club: "Torino" },
      { name: "Ángel Romero",       position: "FWD", club: "Corinthians" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Uruguay", date: "Jun 14", time: "4:00 PM",  stadium: "Gillette Stadium",   city: "Foxborough", home: false },
      { matchday: 2, opponent: "Egypt",   date: "Jun 14", time: "1:00 AM",  stadium: "Lincoln Financial",  city: "Philadelphia",home: true  },
      { matchday: 3, opponent: "Argentina",date: "Jun 25", time: "4:00 PM", stadium: "BMO Field",          city: "Toronto",    home: false },
    ],
  },

  // -- GROUP E --
  {
    name: "France", flag: "🇫🇷", logo: "https://media.api-sports.io/flags/fr.svg",
    group: "E", confederation: "UEFA",
    players: [
      { name: "Mike Maignan",       position: "GK",  club: "AC Milan" },
      { name: "Jules Koundé",       position: "DEF", club: "Barcelona" },
      { name: "Aurélien Tchouaméni",position: "MID", club: "Real Madrid" },
      { name: "Kylian Mbappé",      position: "FWD", club: "Real Madrid" },
      { name: "Antoine Griezmann",  position: "FWD", club: "Atlético Madrid" },
      { name: "Ousmane Dembélé",    position: "FWD", club: "PSG" },
    ],
    fixtures: [
      { matchday: 1, opponent: "England",  date: "Jun 14", time: "1:00 AM",  stadium: "NRG Stadium",          city: "Houston",     home: true  },
      { matchday: 2, opponent: "Belgium",  date: "Jun 19", time: "4:00 PM",  stadium: "Mercedes-Benz Stadium",city: "Atlanta",     home: true  },
      { matchday: 3, opponent: "Slovakia", date: "Jun 25", time: "7:00 PM",  stadium: "Gillette Stadium",     city: "Foxborough",  home: true  },
    ],
  },
  {
    name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://media.api-sports.io/flags/gb-eng.svg",
    group: "E", confederation: "UEFA",
    players: [
      { name: "Jordan Pickford",    position: "GK",  club: "Everton" },
      { name: "Reece James",        position: "DEF", club: "Chelsea" },
      { name: "Declan Rice",        position: "MID", club: "Arsenal" },
      { name: "Jude Bellingham",    position: "MID", club: "Real Madrid" },
      { name: "Harry Kane",         position: "FWD", club: "Bayern Munich" },
      { name: "Bukayo Saka",        position: "FWD", club: "Arsenal" },
    ],
    fixtures: [
      { matchday: 1, opponent: "France",   date: "Jun 14", time: "1:00 AM",  stadium: "NRG Stadium",          city: "Houston",     home: false },
      { matchday: 2, opponent: "Slovakia", date: "Jun 19", time: "1:00 AM",  stadium: "SoFi Stadium",         city: "Inglewood",   home: true  },
      { matchday: 3, opponent: "Belgium",  date: "Jun 25", time: "4:00 PM",  stadium: "Levi's Stadium",       city: "Santa Clara", home: false },
    ],
  },
  {
    name: "Belgium", flag: "🇧🇪", logo: "https://media.api-sports.io/flags/be.svg",
    group: "E", confederation: "UEFA",
    players: [
      { name: "Thibaut Courtois",   position: "GK",  club: "Real Madrid" },
      { name: "Toby Alderweireld",  position: "DEF", club: "Royal Antwerp" },
      { name: "Kevin De Bruyne",    position: "MID", club: "Manchester City" },
      { name: "Romelu Lukaku",      position: "FWD", club: "Roma" },
      { name: "Leandro Trossard",   position: "MID", club: "Arsenal" },
      { name: "Dodi Lukebakio",     position: "FWD", club: "Sevilla" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Slovakia", date: "Jun 15", time: "4:00 PM",  stadium: "Estadio Akron",        city: "Guadalajara",  home: true  },
      { matchday: 2, opponent: "France",   date: "Jun 19", time: "4:00 PM",  stadium: "Mercedes-Benz Stadium",city: "Atlanta",      home: false },
      { matchday: 3, opponent: "England",  date: "Jun 25", time: "4:00 PM",  stadium: "Levi's Stadium",       city: "Santa Clara",  home: true  },
    ],
  },
  {
    name: "Slovakia", flag: "🇸🇰", logo: "https://media.api-sports.io/flags/sk.svg",
    group: "E", confederation: "UEFA",
    players: [
      { name: "Marek Rodák",        position: "GK",  club: "Fulham" },
      { name: "Milan Škriniar",     position: "DEF", club: "PSG" },
      { name: "Stanislav Lobotka",  position: "MID", club: "Napoli" },
      { name: "Marek Hamšík",       position: "MID", club: "Retired" },
      { name: "Ivan Schranz",       position: "FWD", club: "Slavia Prague" },
      { name: "Róbert Mak",         position: "MID", club: "MFK Ružomberok" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Belgium", date: "Jun 15", time: "4:00 PM",  stadium: "Estadio Akron",    city: "Guadalajara", home: false },
      { matchday: 2, opponent: "England", date: "Jun 19", time: "1:00 AM",  stadium: "SoFi Stadium",     city: "Inglewood",   home: false },
      { matchday: 3, opponent: "France",  date: "Jun 25", time: "7:00 PM",  stadium: "Gillette Stadium", city: "Foxborough",  home: false },
    ],
  },

  // -- GROUP F --
  {
    name: "Netherlands", flag: "🇳🇱", logo: "https://media.api-sports.io/flags/nl.svg",
    group: "F", confederation: "UEFA",
    players: [
      { name: "Bart Verbruggen",    position: "GK",  club: "Brighton" },
      { name: "Virgil van Dijk",    position: "DEF", club: "Liverpool" },
      { name: "Frenkie de Jong",    position: "MID", club: "Barcelona" },
      { name: "Memphis Depay",      position: "FWD", club: "Atlético Madrid" },
      { name: "Cody Gakpo",         position: "FWD", club: "Liverpool" },
      { name: "Xavi Simons",        position: "MID", club: "RB Leipzig" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Cameroon", date: "Jun 15", time: "7:00 PM",  stadium: "Lincoln Financial",    city: "Philadelphia",home: true  },
      { matchday: 2, opponent: "Austria",  date: "Jun 20", time: "4:00 PM",  stadium: "Estadio BBVA",         city: "Monterrey",   home: true  },
      { matchday: 3, opponent: "Sweden",   date: "Jun 26", time: "1:00 AM",  stadium: "AT&T Stadium",         city: "Arlington",   home: true  },
    ],
  },
  {
    name: "Sweden", flag: "🇸🇪", logo: "https://media.api-sports.io/flags/se.svg",
    group: "F", confederation: "UEFA",
    players: [
      { name: "Robin Olsen",        position: "GK",  club: "Aston Villa" },
      { name: "Victor Lindelöf",    position: "DEF", club: "Manchester Utd" },
      { name: "Albin Ekdal",        position: "MID", club: "Cagliari" },
      { name: "Emil Forsberg",      position: "MID", club: "RB Leipzig" },
      { name: "Alexander Isak",     position: "FWD", club: "Newcastle" },
      { name: "Dejan Kulusevski",   position: "FWD", club: "Tottenham" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Austria",     date: "Jun 15", time: "10:00 PM", stadium: "Gillette Stadium",   city: "Foxborough",  home: true  },
      { matchday: 2, opponent: "Cameroon",    date: "Jun 20", time: "7:00 PM",  stadium: "Arrowhead Stadium",  city: "Kansas City", home: false },
      { matchday: 3, opponent: "Netherlands", date: "Jun 26", time: "1:00 AM",  stadium: "AT&T Stadium",       city: "Arlington",   home: false },
    ],
  },
  {
    name: "Austria", flag: "🇦🇹", logo: "https://media.api-sports.io/flags/at.svg",
    group: "F", confederation: "UEFA",
    players: [
      { name: "Patrick Pentz",      position: "GK",  club: "Bayer Leverkusen" },
      { name: "David Alaba",        position: "DEF", club: "Real Madrid" },
      { name: "Konrad Laimer",      position: "MID", club: "Bayern Munich" },
      { name: "Marcel Sabitzer",    position: "MID", club: "Borussia Dortmund" },
      { name: "Marko Arnautovic",   position: "FWD", club: "Inter Milan" },
      { name: "Michael Gregoritsch",position: "FWD", club: "Freiburg" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Sweden",      date: "Jun 15", time: "10:00 PM", stadium: "Gillette Stadium", city: "Foxborough",   home: false },
      { matchday: 2, opponent: "Netherlands", date: "Jun 20", time: "4:00 PM",  stadium: "Estadio BBVA",     city: "Monterrey",    home: false },
      { matchday: 3, opponent: "Cameroon",    date: "Jun 26", time: "4:00 PM",  stadium: "NRG Stadium",      city: "Houston",      home: true  },
    ],
  },
  {
    name: "Cameroon", flag: "🇨🇲", logo: "https://media.api-sports.io/flags/cm.svg",
    group: "F", confederation: "CAF",
    players: [
      { name: "André Onana",        position: "GK",  club: "Manchester Utd" },
      { name: "Michael Ngadeu",     position: "DEF", club: "Gent" },
      { name: "André-Frank Zambo Anguissa", position: "MID", club: "Napoli" },
      { name: "Martin Hongla",      position: "MID", club: "Hellas Verona" },
      { name: "Vincent Aboubakar",  position: "FWD", club: "Besiktas" },
      { name: "Karl Toko Ekambi",   position: "FWD", club: "Al-Qadsiah" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Netherlands", date: "Jun 15", time: "7:00 PM",  stadium: "Lincoln Financial",city: "Philadelphia", home: false },
      { matchday: 2, opponent: "Sweden",      date: "Jun 20", time: "7:00 PM",  stadium: "Arrowhead Stadium",city: "Kansas City",  home: true  },
      { matchday: 3, opponent: "Austria",     date: "Jun 26", time: "4:00 PM",  stadium: "NRG Stadium",      city: "Houston",      home: false },
    ],
  },

  // -- GROUP G --
  {
    name: "Portugal", flag: "🇵🇹", logo: "https://media.api-sports.io/flags/pt.svg",
    group: "G", confederation: "UEFA",
    players: [
      { name: "Rui Patrício",       position: "GK",  club: "AS Roma" },
      { name: "Rúben Dias",         position: "DEF", club: "Manchester City" },
      { name: "Bruno Fernandes",    position: "MID", club: "Manchester Utd" },
      { name: "Bernardo Silva",     position: "MID", club: "Manchester City" },
      { name: "Cristiano Ronaldo",  position: "FWD", club: "Al Nassr" },
      { name: "Rafael Leão",        position: "FWD", club: "AC Milan" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Czech Republic",date: "Jun 16", time: "10:00 PM", stadium: "Estadio Akron", city: "Guadalajara",    home: true  },
      { matchday: 2, opponent: "South Korea",   date: "Jun 21", time: "4:00 PM",  stadium: "MetLife Stadium",city: "E. Rutherford", home: true  },
      { matchday: 3, opponent: "Poland",        date: "Jun 27", time: "1:00 AM",  stadium: "Hard Rock Stadium",city: "Miami",        home: true  },
    ],
  },
  {
    name: "Poland", flag: "🇵🇱", logo: "https://media.api-sports.io/flags/pl.svg",
    group: "G", confederation: "UEFA",
    players: [
      { name: "Wojciech Szczęsny", position: "GK",  club: "Barcelona" },
      { name: "Jan Bednarek",      position: "DEF", club: "Southampton" },
      { name: "Piotr Zieliński",   position: "MID", club: "Napoli" },
      { name: "Grzegorz Krychowiak",position:"MID", club: "Al-Shabab" },
      { name: "Robert Lewandowski",position: "FWD", club: "Barcelona" },
      { name: "Arkadiusz Milik",   position: "FWD", club: "Juventus" },
    ],
    fixtures: [
      { matchday: 1, opponent: "South Korea",     date: "Jun 16", time: "4:00 PM",  stadium: "Lumen Field",      city: "Seattle",       home: true  },
      { matchday: 2, opponent: "Czech Republic",  date: "Jun 21", time: "1:00 AM",  stadium: "Levi's Stadium",   city: "Santa Clara",   home: false },
      { matchday: 3, opponent: "Portugal",        date: "Jun 27", time: "1:00 AM",  stadium: "Hard Rock Stadium",city: "Miami",         home: false },
    ],
  },
  {
    name: "Czech Republic", flag: "🇨🇿", logo: "https://media.api-sports.io/flags/cz.svg",
    group: "G", confederation: "UEFA",
    players: [
      { name: "Tomáš Vaclík",       position: "GK",  club: "Olympiacos" },
      { name: "Tomáš Souček",       position: "MID", club: "West Ham" },
      { name: "Vladimír Coufal",    position: "DEF", club: "West Ham" },
      { name: "Patrik Schick",      position: "FWD", club: "Bayer Leverkusen" },
      { name: "Ondřej Duda",        position: "MID", club: "Hertha Berlin" },
      { name: "Matěj Kovář",        position: "GK",  club: "Bayer Leverkusen" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Portugal",    date: "Jun 16", time: "10:00 PM", stadium: "Estadio Akron",    city: "Guadalajara",   home: false },
      { matchday: 2, opponent: "Poland",      date: "Jun 21", time: "1:00 AM",  stadium: "Levi's Stadium",   city: "Santa Clara",   home: true  },
      { matchday: 3, opponent: "South Korea", date: "Jun 27", time: "4:00 PM",  stadium: "BMO Field",        city: "Toronto",       home: false },
    ],
  },
  {
    name: "South Korea", flag: "🇰🇷", logo: "https://media.api-sports.io/flags/kr.svg",
    group: "G", confederation: "AFC",
    players: [
      { name: "Kim Seung-gyu",      position: "GK",  club: "Al-Shabab" },
      { name: "Kim Min-jae",        position: "DEF", club: "Bayern Munich" },
      { name: "Jung Woo-young",     position: "MID", club: "Al-Qadsiah" },
      { name: "Lee Kang-in",        position: "MID", club: "PSG" },
      { name: "Heung-min Son",      position: "FWD", club: "Tottenham" },
      { name: "Hwang Hee-chan",     position: "FWD", club: "Wolverhampton" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Poland",         date: "Jun 16", time: "4:00 PM",  stadium: "Lumen Field",   city: "Seattle",    home: false },
      { matchday: 2, opponent: "Portugal",       date: "Jun 21", time: "4:00 PM",  stadium: "MetLife Stadium",city:"E. Rutherford",home: false },
      { matchday: 3, opponent: "Czech Republic", date: "Jun 27", time: "4:00 PM",  stadium: "BMO Field",     city: "Toronto",    home: true  },
    ],
  },

  // -- GROUP H --
  {
    name: "Senegal", flag: "🇸🇳", logo: "https://media.api-sports.io/flags/sn.svg",
    group: "H", confederation: "CAF",
    players: [
      { name: "Édouard Mendy",      position: "GK",  club: "Al-Ahli" },
      { name: "Kalidou Koulibaly",  position: "DEF", club: "Al Hilal" },
      { name: "Idrissa Gueye",      position: "MID", club: "Everton" },
      { name: "Sadio Mané",         position: "FWD", club: "Al Nassr" },
      { name: "Ismaïla Sarr",       position: "FWD", club: "Marseille" },
      { name: "Nampalys Mendy",     position: "MID", club: "Leicester City" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Netherlands", date: "Jun 17", time: "1:00 AM",  stadium: "Estadio Azteca",  city: "Mexico City",   home: false },
      { matchday: 2, opponent: "Ecuador",     date: "Jun 21", time: "10:00 PM", stadium: "BC Place",        city: "Vancouver",     home: true  },
      { matchday: 3, opponent: "Australia",   date: "Jun 27", time: "7:00 PM",  stadium: "Estadio BBVA",    city: "Monterrey",     home: true  },
    ],
  },
  {
    name: "Nigeria", flag: "🇳🇬", logo: "https://media.api-sports.io/flags/ng.svg",
    group: "H", confederation: "CAF",
    players: [
      { name: "Francis Uzoho",      position: "GK",  club: "Deportivo Alavés" },
      { name: "William Troost-Ekong",position:"DEF", club: "Watford" },
      { name: "Alex Iwobi",         position: "MID", club: "Fulham" },
      { name: "Wilfred Ndidi",      position: "MID", club: "Leicester City" },
      { name: "Victor Osimhen",     position: "FWD", club: "Galatasaray" },
      { name: "Samuel Chukwueze",   position: "FWD", club: "AC Milan" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Italy",     date: "Jun 17", time: "7:00 PM",  stadium: "NRG Stadium",       city: "Houston",      home: false },
      { matchday: 2, opponent: "Denmark",   date: "Jun 22", time: "4:00 PM",  stadium: "Estadio Akron",     city: "Guadalajara",  home: false },
      { matchday: 3, opponent: "Serbia",    date: "Jun 27", time: "10:00 PM", stadium: "Lincoln Financial", city: "Philadelphia", home: true  },
    ],
  },
  {
    name: "Ghana", flag: "🇬🇭", logo: "https://media.api-sports.io/flags/gh.svg",
    group: "H", confederation: "CAF",
    players: [
      { name: "Lawrence Ati Zigi",  position: "GK",  club: "St. Gallen" },
      { name: "Daniel Amartey",     position: "DEF", club: "Leicester" },
      { name: "Thomas Partey",      position: "MID", club: "Arsenal" },
      { name: "Jordan Ayew",        position: "FWD", club: "Leicester" },
      { name: "Antoine Semenyo",    position: "FWD", club: "Bournemouth" },
      { name: "Mohammed Kudus",     position: "MID", club: "West Ham" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Portugal",  date: "Jun 17", time: "4:00 PM",  stadium: "Estadio BBVA",      city: "Monterrey",    home: false },
      { matchday: 2, opponent: "Iran",      date: "Jun 22", time: "10:00 PM", stadium: "Mercedes-Benz Stadium",city:"Atlanta",    home: true  },
      { matchday: 3, opponent: "Serbia",    date: "Jun 28", time: "1:00 AM",  stadium: "Arrowhead Stadium", city: "Kansas City",  home: false },
    ],
  },
  {
    name: "Algeria", flag: "🇩🇿", logo: "https://media.api-sports.io/flags/dz.svg",
    group: "H", confederation: "CAF",
    players: [
      { name: "Raïs M'Bolhi",       position: "GK",  club: "Al Ettifaq" },
      { name: "Ramy Bensebaini",    position: "DEF", club: "Borussia Dortmund" },
      { name: "Samir Nasri",        position: "MID", club: "Retired" },
      { name: "Yacine Brahimi",     position: "MID", club: "Al Ain" },
      { name: "Islam Slimani",      position: "FWD", club: "Sport Boys" },
      { name: "Aïssa Mandi",        position: "DEF", club: "Villarreal" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Croatia",   date: "Jun 18", time: "1:00 AM",  stadium: "Lincoln Financial",city: "Philadelphia", home: true  },
      { matchday: 2, opponent: "Ecuador",   date: "Jun 23", time: "4:00 PM",  stadium: "Estadio Azteca",  city: "Mexico City",  home: false },
      { matchday: 3, opponent: "Australia", date: "Jun 28", time: "4:00 PM",  stadium: "Levi's Stadium",  city: "Santa Clara",  home: true  },
    ],
  },
  {
    name: "Tunisia", flag: "🇹🇳", logo: "https://media.api-sports.io/flags/tn.svg",
    group: "H", confederation: "CAF",
    players: [
      { name: "Aymen Dahmen",       position: "GK",  club: "Montpellier" },
      { name: "Montassar Talbi",    position: "DEF", club: "Lorient" },
      { name: "Ellyes Skhiri",      position: "MID", club: "Cologne" },
      { name: "Hannibal Mejbri",    position: "MID", club: "Sevilla" },
      { name: "Wahbi Khazri",       position: "FWD", club: "Montpellier" },
      { name: "Seifeddine Jaziri",  position: "FWD", club: "Antalyaspor" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Australia", date: "Jun 18", time: "4:00 PM",  stadium: "Estadio Akron",  city: "Guadalajara",  home: true  },
      { matchday: 2, opponent: "Croatia",   date: "Jun 23", time: "7:00 PM",  stadium: "BMO Field",      city: "Toronto",      home: false },
      { matchday: 3, opponent: "Ecuador",   date: "Jun 28", time: "7:00 PM",  stadium: "NRG Stadium",    city: "Houston",      home: false },
    ],
  },

  // -- Additional teams (simplified) --
  {
    name: "Italy", flag: "🇮🇹", logo: "https://media.api-sports.io/flags/it.svg",
    group: "G", confederation: "UEFA",
    players: [
      { name: "Gianluigi Donnarumma", position: "GK",  club: "PSG" },
      { name: "Alessandro Bastoni",   position: "DEF", club: "Inter Milan" },
      { name: "Sandro Tonali",        position: "MID", club: "Newcastle" },
      { name: "Lorenzo Pellegrini",   position: "MID", club: "Roma" },
      { name: "Federico Chiesa",      position: "FWD", club: "Liverpool" },
      { name: "Gianluca Scamacca",    position: "FWD", club: "Atalanta" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Nigeria",  date: "Jun 17", time: "7:00 PM",  stadium: "NRG Stadium",        city: "Houston",    home: true  },
      { matchday: 2, opponent: "Denmark",  date: "Jun 22", time: "1:00 AM",  stadium: "Estadio Azteca",     city: "Mexico City",home: true  },
      { matchday: 3, opponent: "Serbia",   date: "Jun 27", time: "4:00 PM",  stadium: "BC Place",           city: "Vancouver",  home: false },
    ],
  },
  {
    name: "Denmark", flag: "🇩🇰", logo: "https://media.api-sports.io/flags/dk.svg",
    group: "G", confederation: "UEFA",
    players: [
      { name: "Kasper Schmeichel",  position: "GK",  club: "Anderlecht" },
      { name: "Simon Kjær",         position: "DEF", club: "AC Milan" },
      { name: "Christian Eriksen",  position: "MID", club: "Manchester Utd" },
      { name: "Pierre-Emile Højbjerg",position:"MID",club: "Atlético Madrid" },
      { name: "Martin Braithwaite", position: "FWD", club: "Espanyol" },
      { name: "Andreas Cornelius", position: "FWD", club: "Trabzonspor" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Serbia",  date: "Jun 17", time: "10:00 PM", stadium: "Lumen Field",     city: "Seattle",     home: true  },
      { matchday: 2, opponent: "Italy",   date: "Jun 22", time: "1:00 AM",  stadium: "Estadio Azteca",  city: "Mexico City", home: false },
      { matchday: 3, opponent: "Nigeria", date: "Jun 22", time: "4:00 PM",  stadium: "Estadio Akron",   city: "Guadalajara", home: true  },
    ],
  },
  {
    name: "Serbia", flag: "🇷🇸", logo: "https://media.api-sports.io/flags/rs.svg",
    group: "G", confederation: "UEFA",
    players: [
      { name: "Vanja Milinković-Savić", position:"GK", club: "Torino" },
      { name: "Nikola Milenković",   position: "DEF", club: "Fiorentina" },
      { name: "Nemanja Gudelj",      position: "MID", club: "Sevilla" },
      { name: "Sergej Milinković-Savić",position:"MID",club:"Al Hilal" },
      { name: "Aleksandar Mitrović",  position: "FWD", club: "Al Hilal" },
      { name: "Dušan Vlahović",       position: "FWD", club: "Juventus" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Denmark", date: "Jun 17", time: "10:00 PM", stadium: "Lumen Field",      city: "Seattle",      home: false },
      { matchday: 2, opponent: "Italy",   date: "Jun 27", time: "4:00 PM",  stadium: "BC Place",         city: "Vancouver",    home: true  },
      { matchday: 3, opponent: "Nigeria", date: "Jun 27", time: "10:00 PM", stadium: "Lincoln Financial",city: "Philadelphia", home: false },
    ],
  },
  {
    name: "Croatia", flag: "🇭🇷", logo: "https://media.api-sports.io/flags/hr.svg",
    group: "H", confederation: "UEFA",
    players: [
      { name: "Dominik Livaković",  position: "GK",  club: "Fenerbahçe" },
      { name: "Joško Gvardiol",     position: "DEF", club: "Manchester City" },
      { name: "Marcelo Brozović",   position: "MID", club: "Al Nassr" },
      { name: "Luka Modrić",        position: "MID", club: "Real Madrid" },
      { name: "Ivan Perišić",       position: "FWD", club: "Hajduk Split" },
      { name: "Andrej Kramarić",    position: "FWD", club: "Hoffenheim" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Algeria",   date: "Jun 18", time: "1:00 AM",  stadium: "Lincoln Financial",city: "Philadelphia", home: false },
      { matchday: 2, opponent: "Tunisia",   date: "Jun 23", time: "7:00 PM",  stadium: "BMO Field",        city: "Toronto",      home: true  },
      { matchday: 3, opponent: "Australia", date: "Jun 28", time: "10:00 PM", stadium: "Estadio Azteca",   city: "Mexico City",  home: false },
    ],
  },
  {
    name: "Australia", flag: "🇦🇺", logo: "https://media.api-sports.io/flags/au.svg",
    group: "H", confederation: "AFC",
    players: [
      { name: "Mathew Ryan",        position: "GK",  club: "Real Sociedad" },
      { name: "Harry Souttar",      position: "DEF", club: "Leicester City" },
      { name: "Jackson Irvine",     position: "MID", club: "St. Pauli" },
      { name: "Ajdin Hrustic",      position: "MID", club: "Hellas Verona" },
      { name: "Mathew Leckie",      position: "FWD", club: "Melbourne City" },
      { name: "Mitchell Duke",      position: "FWD", club: "Fagiano Okayama" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Tunisia",  date: "Jun 18", time: "4:00 PM",  stadium: "Estadio Akron",  city: "Guadalajara",  home: false },
      { matchday: 2, opponent: "Senegal",  date: "Jun 27", time: "7:00 PM",  stadium: "Estadio BBVA",   city: "Monterrey",    home: false },
      { matchday: 3, opponent: "Croatia",  date: "Jun 28", time: "10:00 PM", stadium: "Estadio Azteca", city: "Mexico City",  home: true  },
    ],
  },
  {
    name: "Ecuador", flag: "🇪🇨", logo: "https://media.api-sports.io/flags/ec.svg",
    group: "H", confederation: "CONMEBOL",
    players: [
      { name: "Alexander Domínguez", position:"GK",  club: "LDU Quito" },
      { name: "Piero Hincapié",      position:"DEF", club: "Bayer Leverkusen" },
      { name: "Carlos Gruezo",       position:"MID", club: "Augsburg" },
      { name: "Moisés Caicedo",      position:"MID", club: "Chelsea" },
      { name: "Enner Valencia",      position:"FWD", club: "Fenerbahçe" },
      { name: "Jeremy Sarmiento",    position:"FWD", club: "Brighton" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Iran",     date: "Jun 18", time: "7:00 PM",  stadium: "Estadio BBVA",     city: "Monterrey",    home: true  },
      { matchday: 2, opponent: "Algeria",  date: "Jun 23", time: "4:00 PM",  stadium: "Estadio Azteca",   city: "Mexico City",  home: true  },
      { matchday: 3, opponent: "Tunisia",  date: "Jun 28", time: "7:00 PM",  stadium: "NRG Stadium",      city: "Houston",      home: true  },
    ],
  },
  {
    name: "Iran", flag: "🇮🇷", logo: "https://media.api-sports.io/flags/ir.svg",
    group: "H", confederation: "AFC",
    players: [
      { name: "Alireza Beiranvand",  position:"GK",  club: "Club Brugge" },
      { name: "Majid Hosseini",      position:"DEF", club: "Kasımpaşa" },
      { name: "Saman Ghoddos",       position:"MID", club: "Brentford" },
      { name: "Ali Gholizadeh",      position:"MID", club: "Charlton" },
      { name: "Mehdi Taremi",        position:"FWD", club: "Inter Milan" },
      { name: "Sardar Azmoun",       position:"FWD", club: "Roma" },
    ],
    fixtures: [
      { matchday: 1, opponent: "Ecuador",  date: "Jun 18", time: "7:00 PM",  stadium: "Estadio BBVA",      city: "Monterrey",  home: false },
      { matchday: 2, opponent: "Ghana",    date: "Jun 22", time: "10:00 PM", stadium: "Mercedes-Benz Stadium",city:"Atlanta",  home: false },
      { matchday: 3, opponent: "Senegal",  date: "Jun 28", time: "1:00 AM",  stadium: "BC Place",          city: "Vancouver",  home: false },
    ],
  },
];

// Helper: build a map from team name → data
export const WC26_TEAM_MAP: Record<string, WC26TeamData> =
  Object.fromEntries(WC26_TEAMS.map(t => [t.name.toLowerCase(), t]));

export function searchTeams(query: string): WC26TeamData[] {
  const q = query.trim().toLowerCase();
  if (!q) return WC26_TEAMS;
  return WC26_TEAMS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.group.toLowerCase().includes(q) ||
    t.confederation.toLowerCase().includes(q)
  );
}
