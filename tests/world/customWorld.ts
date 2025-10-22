import { APIRequestContext } from '@playwright/test';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { API_CONFIG } from '../../src/config/api';

export class World {
  public request!: APIRequestContext;
  public browser!: Browser;
  public context!: BrowserContext;
  public baseURL: string;
  private lastRequestTime: number = 0;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext({
      baseURL: this.baseURL
    });
    this.request = this.context.request;
  }

  /**
   * Make a rate-limited request
   */
  async makeRequest(method: 'GET' | 'POST', url: string, options?: any) {
    await this.rateLimit();
    if (method === 'GET') {
      return this.request.get(url, options);
    } else if (method === 'POST') {
      return this.request.post(url, options);
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Add rate limiting to prevent 429 errors
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < API_CONFIG.RATE_LIMIT_DELAY) {
      const delay = API_CONFIG.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
