import { useQuery } from "@tanstack/react-query";
import { allContactApi, getNotesApi } from "../../store/Services/Others";



export const allContactApiHook = () =>
  useQuery(["allContactApi"], () => allContactApi());
  

  export const useGetNotesApi = (payload: any) =>
  useQuery(["getNotesApi", payload], () => getNotesApi(payload));

  
  