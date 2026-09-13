import { useState, useEffect, useRef } from "react";
import { Radio, Volume2, Play, Pause } from "lucide-react";
import Knob from "./Components/Knob";
import RadioScale from "./Components/RadioScale";

type Station = {
    frequency: number,
    url: string
}

// Список радиостанций
const STATIONS: Station[] = [
    { frequency: 88.5, url: "https://electro-radio.ru" },
    { frequency: 94.2, url: "https://publicradio.ru" },
    { frequency: 103.1, url: "https://publicradio.ru" },
    { frequency: 107.7, url: "https://publicradio.ru" },
];

export default function App() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [frequency, setFrequency] = useState(87.5); // Начальная частота FM
    const [volume, setVolume] = useState(0.5); // Громкость от 0 до 1
    const [currentStation, setCurrentStation] = useState<Station | null>(null);

    // Рефы для аудио-элементов
    const musicAudioRef = useRef<HTMLAudioElement | null>(null);
    const noiseAudioRef = useRef<HTMLAudioElement | null>(null);

    // Включение / Выключение питания радиоприемника
    const handlePlayToggle = () => {
        if (!musicAudioRef.current || !noiseAudioRef.current) return;

        if (isPlaying) {
            musicAudioRef.current.pause();
            noiseAudioRef.current.pause();
        } else {
            musicAudioRef.current.play().catch((e) => console.log("Audio play blocked", e));
            noiseAudioRef.current.play().catch((e) => console.log("Audio play blocked", e));
        }
        setIsPlaying(!isPlaying);
    };

    // Логика микширования звука в зависимости от частоты
    useEffect(() => {
        if (!musicAudioRef.current || !noiseAudioRef.current) return;

        let closestStation: Station | null = null;
        let minDistance = Infinity;

        // Ищем ближайшую станцию к текущему положению ползунка
        STATIONS.forEach((station: Station) => {
            const distance = Math.abs(frequency - station.frequency);
            if (distance < minDistance) {
                minDistance = distance;
                closestStation = station;
            }
        });

        // Если мы близко к станции (в радиусе 0.6 МГц), настраиваемся на нее
        if (minDistance <= 0.6 && closestStation) {
            const station = closestStation as Station;
            if (currentStation?.frequency !== station.frequency) {
                setCurrentStation(station);
                musicAudioRef.current.src = station.url;
                if (isPlaying) musicAudioRef.current.play().catch(() => {});
            }

            // Математика затухания: чем ближе к центру частоты, тем громче музыка и тише шум
            const targetMusicVolume = (1 - minDistance / 0.6) * volume;
            const targetNoiseVolume = (minDistance / 0.6) * volume;

            musicAudioRef.current.volume = Math.max(0, Math.min(1, targetMusicVolume));
            noiseAudioRef.current.volume = Math.max(0, Math.min(1, targetNoiseVolume));
        } else {
            // Если укрутили в пустоту — играет только белый шум
            setCurrentStation(null);
            musicAudioRef.current.volume = 0;
            noiseAudioRef.current.volume = volume;
        }
    }, [frequency, volume, currentStation, isPlaying]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 font-mono text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
            
            {/* Скрытые аудио-теги */}
            <audio ref={noiseAudioRef} src="https://google.com" loop />
            <audio ref={musicAudioRef} loop />

            {/* Корпус Радиоприемника */}
            <div className="w-full max-w-xl rounded-3xl bg-zinc-900 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-zinc-800 flex flex-col gap-8 relative overflow-hidden">
                
                {/* Компонент шкалы */}
                <RadioScale frequency={frequency} stations={STATIONS} />

                {/* Панель управления с крутилками */}
                <div className="grid grid-cols-3 items-center gap-6 bg-zinc-900">
                    
                    {/* Крутилка Громкости (Плавный ход) */}
                    <Knob 
                        min={0} 
                        max={1} 
                        step={0.01} 
                        value={volume} 
                        onChange={setVolume} 
                        label="Vol" 
                        icon={<Volume2 className="h-3 w-3" />} 
                        color="amber" 
                        snap={false} 
                    />

                    {/* Кнопка Плей / Пауза (Тумблер питания) */}
                    <div className="flex flex-col items-center justify-center">
                        <button
                            onClick={handlePlayToggle}
                            className={`w-16 h-16 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-xl transition-all ${
                                isPlaying 
                                    ? "bg-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                        >
                            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                        </button>
                        <span className="text-[10px] uppercase text-zinc-500 tracking-widest mt-3 font-bold">Power</span>
                    </div>

                    {/* Крутилка Частоты (С эффектом Snap по 0.1 MHz) */}
                    <Knob 
                        min={87.5} 
                        max={108.0} 
                        step={0.1} 
                        value={frequency} 
                        onChange={setFrequency} 
                        label="Tune" 
                        icon={<Radio className="h-3 w-3" />} 
                        color="red" 
                        snap={true} 
                    />

                </div>
            </div>
        </div>
    );
}
