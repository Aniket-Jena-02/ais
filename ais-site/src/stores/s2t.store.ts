import { create } from "zustand";
type State = {
    S2TMode: boolean,
    transcriptContent: string
}

type Actions = {
    enableS2TMode: () => void
    disableS2TMode: (inputValue?: string) => void
}

export const useS2TMode = create<State & Actions>((set) => ({
    S2TMode: false,
    transcriptContent: "",
    enableS2TMode() {
        set({ S2TMode: true })
    },
    disableS2TMode(inputValue?: string) {
        set({ S2TMode: false, transcriptContent: inputValue || "" })
    }
}))