import React, { useEffect, useState } from 'react';
import { H4 } from 'tamagui';

interface LiveTimerProps {
    startTimeIso: string;
}

export function LiveTimer({ startTimeIso }: LiveTimerProps) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        // Tick every second, but ONLY this component re-renders!
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const start = new Date(startTimeIso).getTime();
    const diff = Math.floor((now - start) / 1000);

    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');

    return (
        <H4 col="$yellow10" fontFamily="$mono">
            {`${h}:${m}:${s}`}
        </H4>
    );
}