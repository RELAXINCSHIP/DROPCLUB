'use client'

import { useEffect, useRef } from 'react'

// Using online placeholders for dev. 
// User should replace these with local files in public/sounds/
const SOUNDS = {
    scratch: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Sandpaper/Scratch
    win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Casino Win
    tick: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3', // Click/Tick
    pop: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3', // Pop
}

export function useSoundFX() {
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUNDS).forEach(([key, url]) => {
            const audio = new Audio(url)
            audio.volume = 0.4
            audioRefs.current[key] = audio
        })
    }, [])

    const play = (sound: keyof typeof SOUNDS) => {
        const audio = audioRefs.current[sound]
        if (audio) {
            audio.currentTime = 0
            audio.play().catch(e => console.log('Audio play failed', e))
        }
    }

    return { play }
}
