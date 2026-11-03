import {
  Waves, Wifi, Zap, Car, Snowflake, Flame, UtensilsCrossed, Tv, Sparkles, Droplets, BedDouble,
  ShieldCheck, Sun, Trees, Anchor, ShoppingBasket, Lock, Bath, PawPrint, Baby, Fan, Refrigerator, Clock, MapPin,
  type LucideIcon,
} from 'lucide-react';

const EMOJI_RE = /(?![©®™])[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}‍️]/gu;

/** Removes decorative emoji from user-editable copy; the UI draws icons instead. */
export const stripEmoji = (text: string): string =>
  text.replace(EMOJI_RE, '').replace(/[ \t]{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();

const RULES: Array<[RegExp, LucideIcon]> = [
  [/wifi|wi-fi|internet|fibra/i, Wifi],
  [/piscina|pool|alberca/i, Waves],
  [/aparca|parking|garaje|estacion/i, Car],
  [/aire|clima|calefac/i, Snowflake],
  [/barbacoa|parrilla|bbq|asador/i, Flame],
  [/cocina|horno|microondas|menaje/i, UtensilsCrossed],
  [/luz|planta|el[eé]ctric|energ/i, Zap],
  [/agua/i, Droplets],
  [/\btv\b|smart|televis/i, Tv],
  [/habitaci|cama|dormitor|suite/i, BedDouble],
  [/seguridad|vigilan|c[aá]mara/i, ShieldCheck],
  [/terraza|sol[aá]rium|hamaca|jard[ií]n|patio/i, Sun],
  [/[aá]rbol|naturaleza|parque/i, Trees],
  [/cayo|lancha|bote|embarc|playa/i, Anchor],
  [/super|mercado|tienda/i, ShoppingBasket],
  [/privad|cerrad|acceso/i, Lock],
  [/ba[nñ]o|ducha/i, Bath],
  [/mascota|perro/i, PawPrint],
  [/ni[nñ]os|beb[eé]|cuna/i, Baby],
  [/ventilad/i, Fan],
  [/nevera|refriger/i, Refrigerator],
  [/hora|minuto|duraci/i, Clock],
  [/direcci|ubicaci|mapa/i, MapPin],
];

export const iconForText = (text: string): LucideIcon => {
  for (const [re, Icon] of RULES) if (re.test(text)) return Icon;
  return Sparkles;
};
