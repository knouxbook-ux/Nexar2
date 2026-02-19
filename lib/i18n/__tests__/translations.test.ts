// Copyright © Knoux. All rights reserved.
import { describe, it, expect } from "vitest";
import { en } from "../en";
import { ar } from "../ar";

const translations = { en, ar };
const languages = Object.keys(translations) as Array<keyof typeof translations>;

describe("Translation Completeness", () => {
  it("should have all English keys in all other languages", () => {
    const enKeys = getAllKeys(en);

    languages.forEach((lang) => {
      if (lang === "en") return;

      const langKeys = getAllKeys(translations[lang]);
      const missingKeys = enKeys.filter((key) => !langKeys.includes(key));

      expect(
        missingKeys,
        `${lang} is missing keys: ${missingKeys.join(", ")}`
      ).toEqual([]);
    });
  });

  it("should not have extra keys in other languages", () => {
    const enKeys = getAllKeys(en);

    languages.forEach((lang) => {
      if (lang === "en") return;

      const langKeys = getAllKeys(translations[lang]);
      const extraKeys = langKeys.filter((key) => !enKeys.includes(key));

      expect(
        extraKeys,
        `${lang} has extra keys: ${extraKeys.join(", ")}`
      ).toEqual([]);
    });
  });

  it("should not have empty translation values", () => {
    languages.forEach((lang) => {
      const emptyKeys = findEmptyValues(translations[lang]);

      expect(
        emptyKeys,
        `${lang} has empty values for keys: ${emptyKeys.join(", ")}`
      ).toEqual([]);
    });
  });

  it("should have consistent nested structure across languages", () => {
    const enStructure = getStructure(en);

    languages.forEach((lang) => {
      if (lang === "en") return;

      const langStructure = getStructure(translations[lang]);

      expect(langStructure).toEqual(enStructure);
    });
  });
});

describe("Translation Quality", () => {
  it("should have non-trivial translations (minimum 1 character)", () => {
    languages.forEach((lang) => {
      const shortValues = findShortValues(translations[lang], 1);

      expect(
        shortValues,
        `${lang} has empty values: ${shortValues.join(", ")}`
      ).toEqual([]);
    });
  });

  it("should not contain common translation mistakes", () => {
    languages.forEach((lang) => {
      const strings = flattenValues(translations[lang]);

      strings.forEach((str) => {
        // Check for untranslated keys
        expect(str.toUpperCase()).not.toContain("TODO");
        expect(str.toUpperCase()).not.toContain("FIXME");
        expect(str.toUpperCase()).not.toContain("TRANSLATE");
      });
    });
  });

  it("should have consistent placeholder usage across languages", () => {
    const enPlaceholders = extractPlaceholders(en);

    languages.forEach((lang) => {
      if (lang === "en") return;

      const langPlaceholders = extractPlaceholders(translations[lang]);

      expect(langPlaceholders).toEqual(enPlaceholders);
    });
  });
});

describe("Translation Coverage", () => {
  it("should have translations for all major sections", () => {
    const requiredSections = [
      "common",
      "home",
      "screenRecording",
      "audioRecording",
      "videoEditing",
      "cloudSync",
      "settings",
      "developer",
    ];

    languages.forEach((lang) => {
      requiredSections.forEach((section) => {
        expect(translations[lang]).toHaveProperty(section);
      });
    });
  });

  it("should have translations for all home screen keys", () => {
    const requiredKeys = ["title", "subtitle", "recordings", "storage", "services"];

    languages.forEach((lang) => {
      requiredKeys.forEach((key) => {
        expect(translations[lang].home).toHaveProperty(key);
      });
    });
  });

  it("should have translations for all settings screen keys", () => {
    const requiredKeys = [
      "title",
      "subtitle",
      "language",
      "english",
      "arabic",
      "display",
      "darkMode",
      "notifications",
      "enableNotifications",
      "recording",
      "autoBackup",
      "highQualityDefault",
      "storage",
      "usedSpace",
      "available",
      "about",
      "appName",
      "version",
      "developer",
      "clearCache",
      "resetSettings",
    ];

    languages.forEach((lang) => {
      requiredKeys.forEach((key) => {
        expect(translations[lang].settings).toHaveProperty(key);
      });
    });
  });

  it("should have translations for all developer screen keys", () => {
    const requiredKeys = [
      "title",
      "subtitle",
      "name",
      "role",
      "location",
      "device",
      "description",
      "coreSkills",
      "skills",
      "signatureStyle",
      "styles",
      "connectWithMe",
      "socialLinks",
      "email",
    ];

    languages.forEach((lang) => {
      requiredKeys.forEach((key) => {
        expect(translations[lang].developer).toHaveProperty(key);
      });
    });
  });
});

// Helper Functions

/**
 * Get all translation keys in dot notation
 */
function getAllKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  });

  return keys;
}

/**
 * Find empty or null translation values
 */
function findEmptyValues(obj: any, prefix = ""): string[] {
  const empty: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      empty.push(...findEmptyValues(value, fullKey));
    } else if (!value || (typeof value === "string" && value.trim() === "")) {
      empty.push(fullKey);
    }
  });

  return empty;
}

/**
 * Get the structure (keys only) of translation object
 */
function getStructure(obj: any): string[] {
  return getAllKeys(obj);
}

/**
 * Flatten all translation values into an array
 */
function flattenValues(obj: any): string[] {
  const values: string[] = [];

  Object.entries(obj).forEach(([, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      values.push(...flattenValues(value));
    } else if (Array.isArray(value)) {
      values.push(...value.map((v) => String(v)));
    } else {
      values.push(String(value));
    }
  });

  return values;
}

/**
 * Extract placeholder patterns from translations
 */
function extractPlaceholders(obj: any): string[] {
  const placeholders = new Set<string>();
  const values = flattenValues(obj);

  values.forEach((str) => {
    const matches = str.match(/\{+\w+\}+/g) || [];
    matches.forEach((match) => placeholders.add(match));
  });

  return Array.from(placeholders).sort();
}

/**
 * Find suspiciously short translation values
 */
function findShortValues(obj: any, minLength: number, prefix = ""): string[] {
  const short: string[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      short.push(...findShortValues(value, minLength, fullKey));
    } else if (Array.isArray(value)) {
      // Skip array values in short check
    } else if (String(value).length < minLength) {
      short.push(fullKey);
    }
  });

  return short;
}
