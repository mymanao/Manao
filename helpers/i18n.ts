import { translations } from "@/translations";

type Lang = keyof typeof translations;
type TranslationNode = string | { [key: string]: TranslationNode };

export function t(
  key: string,
  lang: Lang,
  ...params: (string | number)[]
): string {
  const keys = key.split(".");
  let translation: TranslationNode = translations[lang];

  for (const k of keys) {
    if (
      typeof translation === "object" &&
      translation !== null &&
      k in translation
    ) {
      translation = translation[k] as TranslationNode;
    } else {
      return lang !== "en" ? t(key, "en", ...params) : key;
    }
  }

  if (typeof translation === "string" && params.length > 0) {
    let result = translation;
    for (const param of params) {
      result = result.replace("{}", String(param));
    }
    return result;
  }

  return typeof translation === "string" ? translation : key;
}
