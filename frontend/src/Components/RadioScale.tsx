import { RadioReceiver } from "lucide-react";

interface Station {
    frequency: number;
    url: string;
}

interface RadioScaleProps {
    frequency: number;
    stations: Station[];
}

export default function RadioScale({ frequency, stations }: RadioScaleProps) {
    // Переводим текущую частоту в проценты для сдвига стрелки
    const minFreq = 87.5;
    const maxFreq = 108.0;
    const progressPercent = ((frequency - minFreq) / (maxFreq - minFreq)) * 100;

    return (
        <div className="w-full bg-zinc-950 rounded-2xl p-6 border border-zinc-800 shadow-inner flex flex-col gap-4 relative">
            <div className="flex justify-between items-center text-xs text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                    <RadioReceiver className="h-4 w-4" /> Vintage Band
                </span>
                <span className="text-amber-500/80 animate-pulse font-bold">FM Stereo</span>
            </div>

            {/* Бегунок шкалы частот */}
            <div className="relative w-full h-12 bg-zinc-900/50 rounded-lg border border-zinc-800 flex items-center overflow-hidden px-4">
                {/* Деления шкалы */}
                <div className="absolute inset-0 flex justify-between items-end pb-1 opacity-20 pointer-events-none">
                    {Array.from({ length: 21 }).map((_, i) => (
                        <div key={i} className={`w-0.5 bg-white ${i % 5 === 0 ? "h-6" : "h-3"}`} />
                    ))}
                </div>

                {/* Красная стрелка тюнера */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] transition-all duration-75 ease-out"
                    style={{ left: `${progressPercent}%` }}
                />

                {/* Точки радиостанций */}
                {stations.map((st) => {
                    const dotPercent = ((st.frequency - minFreq) / (maxFreq - minFreq)) * 100;
                    return (
                        <div
                            key={st.frequency}
                            className="absolute w-1.5 h-1.5 rounded-full bg-amber-500/40"
                            style={{ left: `${dotPercent}%`, transform: 'translateX(-50%)' }}
                        />
                    );
                })}
            </div>

            {/* Цифровое табло */}
            <div className="flex justify-center items-baseline mt-2">
                <div className="text-5xl font-black text-amber-500 font-sans tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    {frequency.toFixed(1)} <span className="text-xl font-normal text-zinc-600">MHz</span>
                </div>
            </div>
        </div>
    );
}
