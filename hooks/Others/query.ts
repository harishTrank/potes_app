import { useQuery } from "@tanstack/react-query";
import { allContactApi } from "../../store/Services/Others";



export const allContactApiHook = () =>
  useQuery(["allContactApi"], () => allContactApi());
  

  