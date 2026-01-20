import { showNotification } from '@src/webview/utils/notifications';

/**
 * JWT Analyzer tool
 * Decodes JWT, checks expiry, and shows issued-at time
 */
interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const base64UrlDecode = (str: string): string => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = str.length % 4;
  if (padding) {
    str += '='.repeat(4 - padding);
  }
  try {
    return atob(str);
  } catch {
    return '';
  }
};

export const transform = (input: string): string => {
  try {
    const parts = input.trim().split('.');
    if (parts.length !== 3) {
      throw new Error(
        'Invalid JWT format. Expected 3 parts separated by dots.'
      );
    }

    const [header, payload, signature] = parts;
    showNotification(`Header: ${header}`, 'info');

    const headerJson = JSON.parse(base64UrlDecode(header));
    const payloadJson: JWTPayload = JSON.parse(base64UrlDecode(payload));

    const result: any = {
      header: headerJson,
      payload: payloadJson,
      signature: signature.substring(0, 20) + '...',
    };

    // Check expiry
    if (payloadJson.exp) {
      const expDate = new Date(payloadJson.exp * 1000);
      const now = new Date();
      result.expiry = {
        timestamp: payloadJson.exp,
        date: expDate.toISOString(),
        expired: now > expDate,
      };
    }

    // Show issued-at time
    if (payloadJson.iat) {
      result.issuedAt = {
        timestamp: payloadJson.iat,
        date: new Date(payloadJson.iat * 1000).toISOString(),
      };
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(
      `JWT decode failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  // JWT analyzer is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  try {
    const parts = input.trim().split('.');
    if (parts.length !== 3) {
      return {
        valid: false,
        error: 'Invalid JWT format. Expected 3 parts separated by dots.',
      };
    }
    base64UrlDecode(parts[0]);
    base64UrlDecode(parts[1]);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JWT',
    };
  }
};
