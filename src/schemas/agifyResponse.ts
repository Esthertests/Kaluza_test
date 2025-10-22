import { type APIRequestContext, expect } from "@playwright/test";
import { API_CONFIG } from '../../src/config/api';

export type AgifyResponse = {
  name: string;
  age: number | null;
  count: number;
};

// Enhanced response type with localization
export type AgifyLocalizedResponse = {
  name: string;
  age: number | null;
  count: number;
  country_id: string;
};

// Response type for multiple names (array of responses)
export type AgifyMultipleResponse = AgifyResponse[];


// Helper function to parse response
async function parseResponse<T>(response: { json(): Promise<T> }): Promise<T> {
  return await response.json() as T;
}

export class AgifyResponseSchema {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async estimateTheAgeOfAName({
    name,
    headers,
  }: {
    name: string;
    headers?: Record<string, string>;
  }): Promise<AgifyResponse> {
    return this.request.get('/', { 
      params: { name },
      headers: {
        ...headers,
        'x-api-key': API_CONFIG.API_KEY,
      }
    }).then(parseResponse<AgifyResponse>);
  }
  async estimateAgeWithLocalization({
    name,
    countryId,
    headers,
  }: {
    name: string;
    countryId: string;
    headers?: Record<string, string>;
  }) {
    const response = await this.request.get('/', { 
      params: { name, country_id: countryId },
      headers 
    });

    return parseResponse<AgifyLocalizedResponse>(response);
  }

  async estimateMultipleNames({
    names,
    headers,
  }: {
    names: string[];
    headers?: Record<string, string>;
  }) {
    const params = new URLSearchParams();
    names.forEach(name => params.append('name[]', name));
    
    const response = await this.request.get(`/?${params.toString()}`, { headers });
    
    // Use Playwright's built-in assertions
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    
    const data = await parseResponse<AgifyMultipleResponse>(response);
    expect(Array.isArray(data)).toBe(true);
    
    return data;
  }

  async estimateMultipleNamesWithLocalization({
    names,
    countryId,
    headers,
  }: {
    names: string[];
    countryId: string;
    headers?: Record<string, string>;
  }) {
    const params = new URLSearchParams();
    names.forEach(name => params.append('name[]', name));
    params.append('country_id', countryId);
    
    const response = await this.request.get(`/?${params.toString()}`, { headers });
    
    // Use Playwright's built-in assertions
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    
    const data = await parseResponse<AgifyMultipleResponse>(response);
    expect(Array.isArray(data)).toBe(true);
    
    return data;
  }
}
