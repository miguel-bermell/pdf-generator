import getCommonData from "./getCommonData";

export const getPageProps = async (Astro: any) => {
  const isPost = Astro.request?.method === "POST";
  const props = isPost ? await Astro.request.json() : await getCommonData(Astro.url.pathname, 'es')
  return { props };
}
