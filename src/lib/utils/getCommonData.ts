import type { Languages } from "../../types/Languages";
import type { Pages } from "../../types/Pages";

const sanitizePathName = (path: string): Pages => {
  return path.replace(/\//g, '') as Pages;
}

export default (page: string, language: Languages): Promise<any> => {
  try {
    return import(`../data/${sanitizePathName(page)}/${language}`).then((data) => data.default);
  } catch (error) {
    throw new Error(`Error loading data for ${page} in ${language}`);
  }
}
