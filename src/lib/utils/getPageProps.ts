import type { Languages } from "../../types/Languages";
import getCommonData from "./getCommonData";

export const getPageProps = async (Astro: any) => {
  const isPost = Astro.request?.method === "POST";
  const language = Astro.url.searchParams.get('language') ?? 'es' as Languages;
  const props = isPost ? await Astro.request.json() : await getCommonData(Astro.url.pathname, language);
  return { props };
}
