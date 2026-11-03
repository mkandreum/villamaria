import { useSite } from '../context/SiteContext';
import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Cloud, Wind, Waves, Compass, Droplets, RefreshCw } from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  seaStatus: string;
  seaDescription: string;
  icon: string;
  updatedAt: string;
}

export const WeatherSeaWidget: React.FC = () => {
  const { t, siteName } = useSite();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${t('weather_lat')}&longitude=${t('weather_lon')}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=America%2FCaracas`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const current = data.current;

      const temp = Math.round(current.temperature_2m);
      const feelsLike = Math.round(current.apparent_temperature);
      const humidity = Math.round(current.relative_humidity_2m);
      const wind = Math.round(current.wind_speed_10m);
      const code = current.weather_code;

      let cond = 'Soleado & Despejado';
      let icon = '';

      if (code === 0) {
        cond = 'Cielo Despejado';
        icon = '';
      } else if (code <= 3) {
        cond = 'Parcialmente Nublado';
        icon = '';
      } else if (code >= 51 && code <= 67) {
        cond = 'Llovizna Pasajera';
        icon = '';
      } else if (code >= 80) {
        cond = 'Lluvia Tropical Breve';
        icon = '';
      }

      let sea = 'Mar Calmo';
      let seaDesc = 'Condiciones óptimas para navegar a Cayo Sombrero y Cayo Sal';

      if (wind <= 14) {
        sea = 'Mar Calmo';
        seaDesc = 'Excelente para peñeros y snorkel en los cayos';
      } else if (wind <= 24) {
        sea = 'Brisa Suave';
        seaDesc = 'Navegación normal y agradable en Morrocoy';
      } else {
        sea = 'Oleaje Moderado';
        seaDesc = 'Precaución en aguas abiertas';
      }

      setWeather({
        temp,
        feelsLike,
        humidity,
        windSpeed: wind,
        condition: cond,
        seaStatus: sea,
        seaDescription: seaDesc,
        icon,
        updatedAt: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch {
      // No data, no widget: nothing invented is shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!t('weather_lat') || !t('weather_lon')) return;
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 min
    return () => clearInterval(interval);
  }, [t('weather_lat'), t('weather_lon')]);

  if (!weather) return null;

  return (
    <div className="relative inline-block w-full max-w-sm sm:max-w-md font-sans">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-[#e1dfd8] hover:bg-[#d8d6ce] rounded-2xl p-2.5 sm:p-3   transition cursor-pointer flex items-center justify-between gap-3 text-[#1c1c1c]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300/40 text-2xl flex items-center justify-center shrink-0 ">
            {weather.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-serif font-bold text-base sm:text-lg text-[#1c1c1c] leading-none">
                {weather.temp}°C
              </span>
              <span className="text-[13px] font-semibold text-emerald-800 leading-snug">
                {weather.condition}
              </span>
            </div>
            <p className="text-[13px] text-[#1c1c1c]/70 flex items-start gap-1 mt-0.5">
              <Compass className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>{t('txt_weather_place')} • {weather.seaStatus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[13px] bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">{t('txt_weather_badge')}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchWeather();
            }}
            title="Actualizar clima"
            className="p-1 text-[#1c1c1c]/60 hover:text-emerald-800 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="mt-2 p-3 bg-[#e1dfd8] rounded-2xl  space-y-2 text-xs text-[#1c1c1c] animate-fadeIn">
          <div className="flex items-center justify-between  pb-1.5 text-[13px] font-bold text-[#1c1c1c]">
            <span>{t('txt_weather_panel')}</span>
            <span className="text-[13px] text-[#1c1c1c]/60 font-mono">Hora: {weather.updatedAt}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#e1dfd8]/50 p-2 rounded-xl">
              <span className="text-[13px] text-[#1c1c1c]/60 block font-semibold">Sensación</span>
              <span className="font-bold text-sm text-[#1c1c1c]">{weather.feelsLike}°C</span>
            </div>
            <div className="bg-[#e1dfd8]/50 p-2 rounded-xl">
              <span className="text-[13px] text-[#1c1c1c]/60 block font-semibold flex items-center justify-center gap-0.5">
                <Wind className="w-3 h-3 text-emerald-700" /> Viento
              </span>
              <span className="font-bold text-sm text-[#1c1c1c]">{weather.windSpeed} km/h</span>
            </div>
            <div className="bg-[#e1dfd8]/50 p-2 rounded-xl">
              <span className="text-[13px] text-[#1c1c1c]/60 block font-semibold flex items-center justify-center gap-0.5">
                <Droplets className="w-3 h-3 text-emerald-700" /> Humedad
              </span>
              <span className="font-bold text-sm text-[#1c1c1c]">{weather.humidity}%</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-2">
            <Waves className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[13px]">
              <span className="font-bold text-emerald-900 block">{weather.seaStatus}</span>
              <span className="text-[#1c1c1c]/80">{weather.seaDescription}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
