import { useS2TMode } from '#/stores/s2t.store.ts';
import { clsx } from 'clsx';
import { Mic } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const MicrophoneBtn = () => {
  const { enableS2TMode, disableS2TMode } = useS2TMode()
  const { browserSupportsSpeechRecognition, listening, transcript, resetTranscript } = useSpeechRecognition()
  const startListening = async () => {
    await SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
    enableS2TMode()
  }
  const stopListening = async () => {
    await SpeechRecognition.stopListening()
    console.log("Final Transcript:", transcript)
    disableS2TMode(transcript)
    resetTranscript()
  }

  return (
    <button
      type="button"
      onClick={() => listening ? stopListening() : startListening()}
      disabled={!browserSupportsSpeechRecognition}
      title={browserSupportsSpeechRecognition ? "Microphone coming soon" : "Your browser does not support speech recognition"}
      aria-label="Microphone coming soon"
      className={clsx("hidden sm:flex p-2 rounded-full  transition-all disabled:cursor-not-allowed hover:bg-white/5", listening ? "text-white bg-white/10 animate-pulse" : "text-white/15")}
    >
      <Mic size={20} />
    </button>
  )
}

export default MicrophoneBtn