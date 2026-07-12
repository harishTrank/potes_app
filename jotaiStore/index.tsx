import { atom } from "jotai";

export const userProfileGlobal = atom<any>({});
export const apiCallBackGlobal = atom<any>(0);
export const searchValueGlobal = atom<any>("");
export const homeNoteEditGlobal = atom<any>(false);
export const aiAssistantOverlayGlobal = atom<{
  visible: boolean;
  contactId: string | null;
}>({ visible: false, contactId: null });