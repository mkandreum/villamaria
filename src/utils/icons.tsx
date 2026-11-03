import {
  Waves, Wifi, Zap, Car, Snowflake, Flame, UtensilsCrossed, Tv, Sparkles, Droplets, BedDouble,
  ShieldCheck, Sun, Trees, Anchor, ShoppingBasket, Lock, Bath, PawPrint, Baby, Fan, Refrigerator, Clock, MapPin, Coffee, Bike, Ship, Umbrella, Music, Dumbbell, Shirt, Wind, Mountain, Camera, Key, Phone,
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

/** Icons the admin can pick for a service; keys are stored in the settings. */
export const ICON_CHOICES: Record<string, { label: string; Icon: LucideIcon }> = {
  wifi: { label: 'Wi-Fi', Icon: Wifi }, pool: { label: 'Piscina', Icon: Waves }, car: { label: 'Parking', Icon: Car },
  snow: { label: 'Aire acondicionado', Icon: Snowflake }, flame: { label: 'Barbacoa', Icon: Flame }, kitchen: { label: 'Cocina', Icon: UtensilsCrossed },
  power: { label: 'Electricidad', Icon: Zap }, water: { label: 'Agua', Icon: Droplets }, tv: { label: 'TV', Icon: Tv }, bed: { label: 'Habitación', Icon: BedDouble },
  shield: { label: 'Seguridad', Icon: ShieldCheck }, sun: { label: 'Terraza / sol', Icon: Sun }, trees: { label: 'Jardín', Icon: Trees }, anchor: { label: 'Cayos / lancha', Icon: Anchor },
  shop: { label: 'Supermercado', Icon: ShoppingBasket }, lock: { label: 'Acceso privado', Icon: Lock }, bath: { label: 'Baño', Icon: Bath }, paw: { label: 'Mascotas', Icon: PawPrint },
  baby: { label: 'Niños', Icon: Baby }, fan: { label: 'Ventilador', Icon: Fan }, fridge: { label: 'Nevera', Icon: Refrigerator }, coffee: { label: 'Café', Icon: Coffee },
  bike: { label: 'Bicicletas', Icon: Bike }, ship: { label: 'Barco', Icon: Ship }, umbrella: { label: 'Playa', Icon: Umbrella }, music: { label: 'Música', Icon: Music },
  gym: { label: 'Gimnasio', Icon: Dumbbell }, laundry: { label: 'Lavandería', Icon: Shirt }, wind: { label: 'Brisa', Icon: Wind }, mountain: { label: 'Vistas', Icon: Mountain },
  camera: { label: 'Cámaras', Icon: Camera }, key: { label: 'Llegada autónoma', Icon: Key }, phone: { label: 'Atención', Icon: Phone }, star: { label: 'Otro', Icon: Sparkles },
};
