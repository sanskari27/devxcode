/**
 * Query Params ↔ Object Converter tool
 * Converts between query string and object
 */
export const transform = (input: string, toObject: boolean = true): string => {
  try {
    if (toObject) {
      // Query string to object
      const params = new URLSearchParams(input);
      const obj: any = {};
      params.forEach((value, key) => {
        if (obj[key]) {
          // Handle multiple values
          if (Array.isArray(obj[key])) {
            obj[key].push(value);
          } else {
            obj[key] = [obj[key], value];
          }
        } else {
          obj[key] = value;
        }
      });
      return JSON.stringify(obj, null, 2);
    } else {
      // Object to query string
      const parsed = JSON.parse(input);
      const params = new URLSearchParams();
      Object.entries(parsed).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      });
      return params.toString();
    }
  } catch (error) {
    throw new Error(
      `Query params conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(input);
      // It's an object, convert to query string
      const params = new URLSearchParams();
      Object.entries(parsed).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      });
      return params.toString();
    } catch {
      // It's a query string, convert to object
      const params = new URLSearchParams(input);
      const obj: any = {};
      params.forEach((value, key) => {
        if (obj[key]) {
          if (Array.isArray(obj[key])) {
            obj[key].push(value);
          } else {
            obj[key] = [obj[key], value];
          }
        } else {
          obj[key] = value;
        }
      });
      return JSON.stringify(obj, null, 2);
    }
  } catch (error) {
    throw new Error(
      `Query params conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
