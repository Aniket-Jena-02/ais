import { create } from "zustand";
type State = {
    editMode: boolean,
    msgId: string,
    content: string
}

type Actions = {
    enableEditMode: (msgId: State["msgId"], content: State["content"]) => void
    disableEditMode: () => void
}

export const useEditMode = create<State & Actions>((set) => ({
    editMode: false,
    msgId: "",
    content: "",
    enableEditMode(msgId, content) {
        if (!msgId) return
        set({
            editMode: true,
            msgId,
            content: content ?? ""
        })
    },
    disableEditMode() {
        set({
            editMode: false,
            msgId: "",
            content: ""
        })
    },
}))
