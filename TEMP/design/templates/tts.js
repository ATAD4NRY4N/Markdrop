const ttsSupported = 'speechSynthesis' in window;

if (ttsSupported) {
    console.log("Web Speech API is supported.");

    let isSpeaking = false; // Flag to prevent interrupting speech

    function speak(text, voiceName = null, rate = 1, pitch = 1) {
        if (isSpeaking) return; // Don't interrupt if already speaking

        isSpeaking = true; // Set flag to true
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);

        if (voiceName) {
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.name === voiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onend = () => {
            isSpeaking = false; // Reset flag when speech finishes
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            isSpeaking = false; // Reset flag on error
        };

        window.speechSynthesis.speak(utterance);
    }
} else {
    console.log("Web Speech API is not supported in this browser.");
    alert("Sorry, your browser doesn't support Text-to-Speech.");
}