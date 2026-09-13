import { useEffect, useRef, useState } from "react";

interface KnobProps {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    label: string;
    icon: React.ReactNode;
    color?: "amber" | "red";
    snap?: boolean; // Включает Snap (дискретный шаг)
}

export default function Knob({
    min,
    max,
    step = 1,
    value,
    onChange,
    label,
    icon,
    color = "amber",
    snap = false
}: KnobProps) {
    const knobRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Переводим текущее значение в градусы вращения (диапазон 270 градусов: от -135 до 135)
    const currentAngle = ((value - min) / (max - min)) * 270 - 135;

        const handleUpdate = (clientX: number, clientY: number) => {
        if (!knobRef.current) return;

        const rect = knobRef.current.getBoundingClientRect();
        // Центр крутилки на экране
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Вектор от центра крутилки до курсора мыши
        const x = clientX - centerX;
        const y = clientY - centerY;

        // Получаем угол от -180 до 180 градусов. 
        // 0° — строго справа, 90° — строго снизу, -90° — строго сверху, 180/-180 — строго слева.
        let angle = Math.atan2(y, x) * (180 / Math.PI);

        // Переводим систему координат так, чтобы 0° был строго сверху, 
        // а диапазон вращения шел от -135° (минимум слева-снизу) до +135° (максимум справа-снизу)
        let convertedAngle = angle + 90;
        if (convertedAngle > 180) convertedAngle -= 360;
        if (convertedAngle < -180) convertedAngle += 360;

        // Обработка мертвой зоны (снизу, между 135° и 225° в абсолютных градусах)
        // Если мышка ушла в нижний сектор, мы просто игнорируем изменения, чтобы ручка не прыгала
        if (convertedAngle > 135 || convertedAngle < -135) {
            // Если курсор ближе к левой нижней части — фиксируем минимум
            if (convertedAngle < 0) {
                convertedAngle = -135;
            } else {
                // Если ближе к правой нижней — фиксируем максимум
                convertedAngle = 135;
            }
        }

        // Переводим угол (от -135 до 135) в процент от 0 до 1
        const percentage = (convertedAngle + 135) / 270;

        // Высчитываем итоговое значение от min до max
        let newValue = percentage * (max - min) + min;

        // Применяем шаг (Step) и Snap (округление)
        if (snap) {
            const stepsCount = Math.round((newValue - min) / step);
            newValue = min + stepsCount * step;
        }

        // Жесткая защита от выхода за границы диапазона
        newValue = Math.max(min, Math.min(max, newValue));
        onChange(newValue);
    };


    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            handleUpdate(e.clientX, e.clientY);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);
    const colorClasses = {
        amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
        red: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    };

    return (
        <div className="flex flex-col items-center gap-2 select-none">
            <span className="text-xs uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                {icon} {label}
            </span>
            
            <div 
                ref={knobRef}
                onMouseDown={() => setIsDragging(true)}
                className="w-24 h-24 rounded-full bg-linear-to-b from-zinc-700 to-zinc-800 border-4 border-zinc-950 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing relative transition-transform active:scale-98"
                style={{ transform: `rotate(${currentAngle}deg)` }}
            >
                {/* Внутреннее винтажное кольцо */}
                <div className="absolute inset-2 rounded-full border border-zinc-900/50 bg-zinc-800 shadow-inner" />
                
                {/* Физическая насечка направления крутилки */}
                <div className={`w-1 h-6 rounded-full absolute top-1.5 ${colorClasses[color]}`} />
            </div>
            
            <span className="text-xs font-bold text-zinc-400 mt-1">
                {snap ? value.toFixed(1) : Math.round(value * 100) + "%"}
            </span>
        </div>
    );
}
