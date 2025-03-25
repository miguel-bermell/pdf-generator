import type { Languages } from "../../types/Languages";
import type { Pages } from "../../types/Pages";

const sanitizePathName = (path: string): Pages => {
  return path.replace(/\//g, '') as Pages;
}

export default async (page: string, language: Languages): Promise<any> => {
  try {
    const data = await import(`../data/${sanitizePathName(page)}/${language}/index.ts`);
    return data.default;
  } catch (error) {
    throw new Error(`Error loading data for ${page} in ${language}`);
  }
}
