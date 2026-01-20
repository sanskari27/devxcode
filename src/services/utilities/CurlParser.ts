/**
 * Curl Parser tool
 * Parses curl commands and extracts method, URL, headers, authorization, body, etc.
 */
export const transform = (input: string): string => {
  try {
    const result: any = {};

    // Normalize input: remove line continuations (backslash + newline)
    const normalized = input
      .replace(/\\\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract method (must come before URL extraction to avoid confusion)
    const methodMatch = normalized.match(/-X\s+(\w+)/);
    result.method = methodMatch ? methodMatch[1] : 'GET';

    // Helper function to extract quoted strings (handles escaped quotes)
    const extractQuotedString = (
      str: string,
      startIndex: number,
      quoteChar: string
    ): string | null => {
      if (str[startIndex] !== quoteChar) return null;

      let i = startIndex + 1;
      let escaped = false;

      while (i < str.length) {
        if (escaped) {
          escaped = false;
          i++;
          continue;
        }
        if (str[i] === '\\') {
          escaped = true;
          i++;
          continue;
        }
        if (str[i] === quoteChar) {
          return str.substring(startIndex + 1, i);
        }
        i++;
      }

      return null; // Unclosed quote
    };

    // Extract URL - more robust approach: find first argument that looks like a URL
    // Skip all flags and find the URL
    const parts = normalized.split(/\s+/);
    let foundCurl = false;
    const urlPattern =
      /^(?:https?|ftp):\/\/|^(?:[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(?::[0-9]+)?/i;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'curl') {
        foundCurl = true;
        continue;
      }
      if (foundCurl) {
        // Skip flags (single dash or double dash)
        if (parts[i].startsWith('-')) {
          // If it's a flag with a value (like -X POST), skip the value too
          if (parts[i].match(/^-X$|^-H$|^-d$|^--data$|^--header$/i)) {
            i++; // Skip the flag value
          }
          continue;
        }
        // Check if this looks like a URL
        const cleaned = parts[i].replace(/^['"]|['"]$/g, '');
        if (urlPattern.test(cleaned)) {
          result.url = cleaned;
          break;
        }
        // If we've found curl and this is the first non-flag, assume it's the URL
        if (!result.url) {
          result.url = cleaned;
          break;
        }
      }
    }

    // Extract headers - handle both quoted and unquoted values
    result.headers = {};

    // Find all -H or --header flags
    const headerFlagPattern = /-H\s+|--header\s+/g;
    let headerFlagMatch;

    while ((headerFlagMatch = headerFlagPattern.exec(normalized)) !== null) {
      const headerStartIndex =
        headerFlagMatch.index! + headerFlagMatch[0].length;
      const headerContent = normalized.substring(headerStartIndex).trim();

      let headerValue: string | null = null;

      // Check if it starts with a quote
      if (headerContent.startsWith("'") || headerContent.startsWith('"')) {
        const quoteChar = headerContent[0];
        headerValue = extractQuotedString(headerContent, 0, quoteChar);
      } else {
        // Unquoted - find until next flag or end
        const nextFlagMatch = headerContent.match(/\s+-(?![a-z])|^\s*--/i);
        if (nextFlagMatch && nextFlagMatch.index !== undefined) {
          headerValue = headerContent.substring(0, nextFlagMatch.index).trim();
        } else {
          headerValue = headerContent.trim();
        }
      }

      if (headerValue) {
        const colonIndex = headerValue.indexOf(':');
        if (colonIndex > 0) {
          const key = headerValue.substring(0, colonIndex).trim();
          const value = headerValue.substring(colonIndex + 1).trim();
          result.headers[key] = value;
        }
      }
    }

    // Extract authorization
    if (result.headers.Authorization || result.headers.authorization) {
      result.authorization =
        result.headers.Authorization || result.headers.authorization;
    }

    // Extract body - handle both -d and --data, with quoted and unquoted values
    const dataFlagMatch = normalized.match(/-d\s+|--data\s+/);
    if (dataFlagMatch) {
      const dataStartIndex = dataFlagMatch.index! + dataFlagMatch[0].length;
      const dataContent = normalized.substring(dataStartIndex).trim();

      // Check if it starts with a quote
      if (dataContent.startsWith("'") || dataContent.startsWith('"')) {
        const quoteChar = dataContent[0];
        const extracted = extractQuotedString(dataContent, 0, quoteChar);
        if (extracted !== null) {
          result.body = extracted;
        }
      } else {
        // No quotes - try to extract JSON or find until next flag
        // Look for JSON object/array structure
        let jsonEnd = -1;
        let braceCount = 0;
        let bracketCount = 0;
        let inString = false;
        let escaped = false;
        let started = false;

        for (let i = 0; i < dataContent.length; i++) {
          const char = dataContent[i];

          if (escaped) {
            escaped = false;
            continue;
          }

          if (char === '\\') {
            escaped = true;
            continue;
          }

          if (char === '"' && !escaped) {
            inString = !inString;
            started = true;
            continue;
          }

          if (!inString) {
            if (char === '{') {
              braceCount++;
              started = true;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0 && started) {
                jsonEnd = i + 1;
                break;
              }
            } else if (char === '[') {
              bracketCount++;
              started = true;
            } else if (char === ']') {
              bracketCount--;
              if (bracketCount === 0 && braceCount === 0 && started) {
                jsonEnd = i + 1;
                break;
              }
            } else if (
              char === ' ' &&
              started &&
              braceCount === 0 &&
              bracketCount === 0
            ) {
              // Check if next token is a flag
              const remaining = dataContent.substring(i).trim();
              if (remaining.match(/^-[a-zA-Z]|^--[a-zA-Z]/)) {
                jsonEnd = i;
                break;
              }
            }
          }
        }

        if (jsonEnd > 0) {
          result.body = dataContent.substring(0, jsonEnd).trim();
        } else if (started) {
          // Started parsing but didn't find end - take all
          result.body = dataContent;
        } else {
          // No JSON structure, find until next flag
          const nextFlagMatch = dataContent.match(/\s+-(?![a-z])|^\s*--/i);
          if (nextFlagMatch && nextFlagMatch.index !== undefined) {
            result.body = dataContent.substring(0, nextFlagMatch.index).trim();
          } else {
            result.body = dataContent.trim();
          }
        }
      }
    }

    // Extract cookies
    const cookieMatch = normalized.match(
      /-b\s+['"]?([^'"\s]+)['"]?|--cookie\s+['"]?([^'"\s]+)['"]?/
    );
    if (cookieMatch) {
      result.cookies = cookieMatch[1] || cookieMatch[2];
    }

    // Extract proxy
    const proxyMatch = normalized.match(/--proxy\s+['"]?([^'"\s]+)['"]?/);
    if (proxyMatch) {
      result.proxy = proxyMatch[1];
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(
      `Curl parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // Curl parser is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  if (!input.trim().startsWith('curl')) {
    return { valid: false, error: 'Input must start with "curl"' };
  }
  return { valid: true };
};
