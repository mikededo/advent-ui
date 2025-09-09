/* eslint-disable jsdoc/require-returns-description */
// @ts-check

import { Result } from 'neverthrow';
import fs from 'node:fs';
import path from 'node:path';

/** @typedef {import('eslint').Rule.RuleContext} RuleContext */
/** @typedef {import('eslint').Rule.RuleModule} RuleModule */
/** @typedef {import('estree').Program} Program */

const REQUIRED_EXPORTS = {
  description: 'string',
  tags: 'array',
  title: 'string'
};

const EXPORT_PATTERNS = {
  description: /export\s+(?:const\s+)?description\s*[=:]\s*['"`].*?['"`]/,
  tags: /export\s+(?:const\s+)?tags\s*[=:]\s*\[.*?\]/s,
  title: /export\s+(?:const\s+)?title\s*[=:]\s*['"`].*?['"`]/
};

/**
 * Check if metadata exports are present and valid
 * @param {RuleContext} context
 * @param {Program} node
 * @param {string} content
 */
const checkMetadataExports = (context, node, content) => {
  for (const exportName of Object.keys(REQUIRED_EXPORTS)) {
    const pattern = EXPORT_PATTERNS[exportName];

    if (!pattern.test(content)) {
      context.report({
        data: { export: exportName },
        messageId: 'missingExport',
        node
      });
    }
  }

  const tagsMatch = content.match(/export\s+(?:const\s+)?tags\s*[=:]\s*(\[.*?\])/s);
  if (tagsMatch) {
    const tagsArray = tagsMatch[1];

    // Check if array contains only strings
    const stringArrayPattern = /^\[\s*(?:'[^']*'|"[^"]*"|`[^`]*`)\s*(?:,\s*(?:'[^']*'|"[^"]*"|`[^`]*`)\s*)*\]$/;
    if (!stringArrayPattern.test(tagsArray.replace(/\s*\n\s*/g, ' '))) {
      context.report({
        data: {
          actual: 'array with non-string elements',
          expected: 'array of strings',
          export: 'tags'
        },
        messageId: 'invalidExportType',
        node
      });
    }
  }
};

/**
 * Check if a directory follows the routes/[year]/[day] pattern
 * @param {string} dirPath
 * @returns {boolean}
 */
const isRoutesYearDayPattern = (dirPath) => {
  const normalizedPath = path.normalize(dirPath);
  const pathParts = normalizedPath.split(path.sep);

  const routesIndex = pathParts.findIndex((part) => part === 'routes');
  if (routesIndex === -1) {
    return false;
  }

  if (pathParts.length < routesIndex + 3) {
    return false;
  }

  const yearPart = pathParts[routesIndex + 1];
  const dayPart = pathParts[routesIndex + 2];

  const yearPattern = /^\d{4}$/;
  const dayPattern = /^\d{1,2}$/;

  return yearPattern.test(yearPart) && dayPattern.test(dayPart);
};

/** @type {RuleModule} */
export const requireMetadata = {
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Require metadata.ts file with proper exports in routes/[year]/[day] directories',
      recommended: true
    },
    fixable: undefined,
    messages: {
      invalidExportType: 'Export "{{export}}" should be {{expected}}, but got {{actual}}',
      missingExport: 'Missing required export "{{export}}" in metadata.ts',
      missingFile: 'Missing metadata.ts file in routes/{{year}}/{{day}} directory'
    },
    schema: [],
    type: 'problem'
  },

  create(context) {
    return {
      Program(node) {
        const dirname = path.dirname(context.filename);

        if (!isRoutesYearDayPattern(dirname)) {
          return;
        }

        const pathParts = dirname.split(path.sep);
        const routesIndex = pathParts.findIndex((part) => part === 'routes');
        const year = pathParts[routesIndex + 1];
        const day = pathParts[routesIndex + 2];

        const metadataPath = path.join(dirname, 'metadata.ts');

        if (!fs.existsSync(metadataPath)) {
          context.report({
            data: { day, year },
            messageId: 'missingFile',
            node
          });
          return;
        }

        const safeReadFile = Result.fromThrowable(fs.readFileSync, () => null);
        const metadataContent = safeReadFile(metadataPath, 'utf-8');

        if (metadataContent.isErr()) {
          // If we can't read the file, report it as missing
          context.report({
            data: { day, year },
            messageId: 'missingFile',
            node
          });
          return;
        }

        checkMetadataExports(context, node, metadataContent.value.toString());
      }
    };
  }
};
