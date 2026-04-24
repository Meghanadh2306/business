import { useEffect, useRef, useCallback } from "react";

export default function useAutoLogout(logout, timeout = 10 * 60 * 1000) {
    const timer = useRef(null);

    const resetTimer = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);

        sessionStorage.setItem("lastActivity", Date.now());

        timer.current = setTimeout(() => {
            logout();
        }, timeout);
    }, [logout, timeout]);

    useEffect(() => {
        const events = ["mousemove", "keydown", "click", "scroll"];

        events.forEach((event) =>
            window.addEventListener(event, resetTimer)
        );

        resetTimer();

        return () => {
            if (timer.current) clearTimeout(timer.current);
            events.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [resetTimer]);
}