
import type { Result } from 'neverthrow';

import { err, ok, ResultAsync } from 'neverthrow';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

type SolutionMeta = {
  title: string;
  description: string;
  tags?: string[];
};

type Solution = {
  href: string;
  tags: string[];
  title: string;
  description: string;
};

const DEFAULT_TAGS = ['Algorithm'];

const TITLE_DEF = 'export const title =';
const DESCRIPTION_DEF = 'export const description =';
const TAGS_DEF = 'export const tags =';

const getFromContent = (content: string, start: number, end: number) => {
  if (start === -1 || end === -1) {
    return '';
  }

  return content.slice(start, end).trim().slice(1, -1);
};

const extractMetadata = async (filePath: string): Promise<Result<SolutionMeta, Error>> => {
  const result = await ResultAsync.fromPromise(
    readFile(filePath, 'utf-8'),
    (error) => new Error(`Failed to read file ${filePath}: ${error}`)
  );

  // Return empty metadata if file can't be read
  if (result.isErr()) {
    return err(new Error(result.error.message));
  }

  const content = result.value;

  const titleStart = content.indexOf(TITLE_DEF);
  const titleEnd = content.indexOf(';', titleStart);
  const title = getFromContent(content, titleStart + TITLE_DEF.length, titleEnd);

  const descriptionStart = content.indexOf(DESCRIPTION_DEF);
  const descriptionEnd = content.indexOf(';', descriptionStart);
  const description = getFromContent(content, descriptionStart + DESCRIPTION_DEF.length, descriptionEnd);

  const tagsStart = content.indexOf(TAGS_DEF);
  const tagsEnd = content.indexOf(';', tagsStart);
  const tags = getFromContent(content, tagsStart + TAGS_DEF.length, tagsEnd)
    .split(', ')
    .map((t) => t.trim().slice(1, -1));

  return ok({ description, tags, title });
};

const processDayDirectory = async (
  routesDir: string,
  year: number,
  dayEntry: any
): Promise<Result<{ day: number; solution: Solution } | null, Error>> => {
  if (!dayEntry.isDirectory() || !/^\d+$/.test(dayEntry.name)) {
    return ok(null);
  }

  const day = Number.parseInt(dayEntry.name, 10);
  const metaResult = await extractMetadata(
    join(routesDir, year.toString(), dayEntry.name, 'metadata.ts')
  );
  if (metaResult.isErr()) {
    return ok(null);
  }

  const meta = metaResult.value;
  const solution: Solution = {
    description: meta.description || `Solution for day ${day}`,
    href: `/${year}/${day}`,
    tags: meta.tags || DEFAULT_TAGS,
    title: meta.title
  };

  return ok({ day, solution });
};

const processYearDirectory = async (
  routesDir: string,
  yearEntry: any
): Promise<Result<{ year: number; solutions: Record<number, Solution> } | null, Error>> => {
  if (!yearEntry.isDirectory() || !/^\d{4}$/.test(yearEntry.name)) {
    return ok(null);
  }

  const year = Number.parseInt(yearEntry.name, 10);
  const yearDir = join(routesDir, yearEntry.name);

  const dayEntriesResult = await ResultAsync.fromPromise(
    readdir(yearDir, { withFileTypes: true }),
    (error) => new Error(`Failed to read year directory ${yearDir}: ${error}`)
  );

  if (dayEntriesResult.isErr()) {
    // Skip if year directory can't be read
    return ok(null);
  }

  const solutions: Record<number, Solution> = {};
  const dayEntries = dayEntriesResult.value;

  for (const dayEntry of dayEntries) {
    const dayResult = await processDayDirectory(routesDir, year, dayEntry);
    if (dayResult.isOk() && dayResult.value) {
      const { day, solution } = dayResult.value;
      solutions[day] = solution;
    }
  }

  return ok({ solutions, year });
};

const serializeValue = (value: any, indent: number = 0): string => {
  const spacing = '  '.repeat(indent);
  const nextSpacing = '  '.repeat(indent + 1);

  if (value === null) {
    return 'null';
  }
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    return value.includes("'") ? `"${value}"` : `'${value}'`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map((item) => `${nextSpacing}${serializeValue(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${spacing}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return '{}';
    }

    const items = entries.map(([key, val]) => {
      // Don't quote numeric keys or simple identifier keys
      const keyStr = /^\d+$/.test(key) || /^[a-z_$][\w$]*$/i.test(key)
        ? key
        : key.includes("'") ? `"${key}"` : `'${key}'`;
      return `${nextSpacing}${keyStr}: ${serializeValue(val, indent + 1)}`;
    });

    return `{\n${items.join(',\n')}\n${spacing}}`;
  }

  return JSON.stringify(value);
};

export const generateSolutions = async (routesDir: string): Promise<Result<Record<number, Record<number, Solution>>, Error>> => {
  const entriesResult = await ResultAsync.fromPromise(
    readdir(routesDir, { withFileTypes: true }),
    (error) => new Error(`Failed to read routes directory ${routesDir}: ${error}`)
  );

  if (entriesResult.isErr()) {
    return err(entriesResult.error);
  }

  const allSolutions: Record<number, Record<number, Solution>> = {};
  for (const entry of entriesResult.value) {
    const yearResult = await processYearDirectory(routesDir, entry);

    if (yearResult.isOk() && yearResult.value) {
      const { solutions, year } = yearResult.value;
      if (Object.keys(solutions).length > 0) {
        allSolutions[year] = solutions;
      }
    }
  }

  return ok(allSolutions);
};

export const generateSolutionsFileContent = (
  solutions: Record<number, Record<number, Solution>>
): string => {
  const years = Object.keys(solutions).map((y) => Number.parseInt(y, 10)).sort((a, b) => b - a);
  const parsedYearString = years.map(
    (year) => `  ${year}: ${serializeValue(solutions[year], 1)}`
  ).join(',\n');

  return `/* eslint-disable perfectionist/sort-objects */
import type { Year } from '$lib/utils';

// This file is auto-generated by the build process
// Do not edit manually - changes will be overwritten

export const SOLUTIONS: Record<number, Year> = {
${parsedYearString}
};
`;
};
