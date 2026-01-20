/**
 * Utilities Service
 * Re-exports all tool services and provides utilities service class
 */

// Re-export types
export * from './types';

// Re-export all tool services
export * as Base64Converter from './Base64Converter';
export * as BytesConverter from './BytesConverter';
export * as CaseConverter from './CaseConverter';
export * as CronToHuman from './CronToHuman';
export * as CurlParser from './CurlParser';
export * as EpochDateConverter from './EpochDateConverter';
export * as FileSizeFormatter from './FileSizeFormatter';
export * as HexConverter from './HexConverter';
export * as HttpHeadersFormatter from './HttpHeadersFormatter';
export * as HumanToCron from './HumanToCron';
export * as IsoFormatter from './IsoFormatter';
export * as JavascriptToJson from './JavascriptToJson';
export * as JsonPickOmit from './JsonPickOmit';
export * as JsonPrettyMinify from './JsonPrettyMinify';
export * as JsonRemoveNulls from './JsonRemoveNulls';
export * as JsonSortKeys from './JsonSortKeys';
export * as JsonStringConverter from './JsonStringConverter';
export * as JsonValidator from './JsonValidator';
export * as JwtAnalyzer from './JwtAnalyzer';
export * as NanoIdGenerator from './NanoIdGenerator';
export * as NowConverter from './NowConverter';
export * as QueryParamsConverter from './QueryParamsConverter';
export * as RandomColor from './RandomColor';
export * as RandomString from './RandomString';
export * as SlugGenerator from './SlugGenerator';
export * as TextNormalizeLineEndings from './TextNormalizeLineEndings';
export * as TextRemoveNewlines from './TextRemoveNewlines';
export * as TextTabsSpaces from './TextTabsSpaces';
export * as TextTrim from './TextTrim';
export * as TimeCalculator from './TimeCalculator';
export * as UrlConverter from './UrlConverter';
export * as UuidGenerator from './UuidGenerator';

import { TOOL_GROUPS, Tool, ToolGroup } from './types';

/**
 * Utilities Service class
 * Provides access to tool groups and tools
 */
export class UtilitiesService {
  /**
   * Get all tool groups
   */
  getAllToolGroups(): ToolGroup[] {
    return TOOL_GROUPS;
  }

  /**
   * Get a tool by ID
   */
  getToolById(toolId: string): Tool | undefined {
    for (const group of TOOL_GROUPS) {
      const tool = group.tools.find(t => t.id === toolId);
      if (tool) {
        return tool;
      }
    }
    return undefined;
  }

  /**
   * Get a tool group by ID
   */
  getToolGroupById(groupId: string): ToolGroup | undefined {
    return TOOL_GROUPS.find(group => group.id === groupId);
  }

  /**
   * Get tool service module name by tool ID
   */
  getToolServiceName(toolId: string): string | undefined {
    const tool = this.getToolById(toolId);
    return tool?.component;
  }
}
