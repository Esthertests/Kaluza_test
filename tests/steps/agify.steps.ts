import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '../world/customWorld';
import { AgifyResponseSchema } from '../../src/schemas/agifyResponse';
import { constants } from 'http2';

let world: World;
let agifySchema: AgifyResponseSchema;
let lastResponse: any;
let lastHttpResponse: any;

/**
 * Test Case: Initialize Agify API connection
 * Purpose: Sets up the test environment with browser context and API request handler
 * Validates: API availability and proper initialization
 */
Given('the Agify API is available', async function () {
  world = new World();
  await world.init();
  agifySchema = new AgifyResponseSchema(world.request);
});

/**
 * Test Case: #1 - Single name request
 * Purpose: Tests basic age estimation functionality for a single name
 * Validates: API returns valid response with name, age, and count fields
 */
When('I make a GET request to {string} with name {string}', async function (endpoint: string, name: string) {
  const response = await world.makeRequest('GET', endpoint, { params: { name } });
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #2 - Single name with country_id
 * Purpose: Tests age estimation with country-specific data for more accurate results
 * Validates: API returns response with country_id field and localized age data
 */
When('I make a GET request to {string} with name {string} and country_id {string}', async function (endpoint: string, name: string, countryId: string) {
  const response = await world.makeRequest('GET', endpoint, { params: { name, country_id: countryId } });
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #3 - Multiple names request
 * Purpose: Tests batch age estimation for multiple names in a single API call
 * Validates: API returns array of responses for each name with proper structure
 */
When('I make a GET request to {string} with multiple names {string}, {string}, {string}', async function (endpoint: string, name1: string, name2: string, name3: string) {
  const params = new URLSearchParams();
  params.append('name[]', name1);
  params.append('name[]', name2);
  params.append('name[]', name3);
  const response = await world.makeRequest('GET', `${endpoint}?${params.toString()}`);
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #4 - Request with no parameters
 * Purpose: Tests API error handling when no parameters are provided
 * Validates: API returns appropriate error status
 */
When('I make a GET request to {string} with no parameters', async function (endpoint: string) {
  const response = await world.makeRequest('GET', endpoint);
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #5 - Request with empty name parameter
 * Purpose: Tests API handling of empty name parameter
 * Validates: API returns appropriate error status
 */
When('I make a GET request to {string} with empty name parameter', async function (endpoint: string) {
  const response = await world.makeRequest('GET', endpoint, { params: { name: '' } });
  lastHttpResponse = response;
  lastResponse = await response.json();
});


/**
 * Test Case: #8 - Multiple names with partial invalid input
 * Purpose: Tests API handling of mixed valid/invalid names in array
 * Validates: API processes partial invalid input gracefully
 */
When('I make a GET request to {string} with names {string} and empty name', async function (endpoint: string, name: string) {
    const params = new URLSearchParams();
  params.append('name[]', name);
  params.append('name[]', '');
  const response = await world.makeRequest('GET', `${endpoint}?${params.toString()}`);
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #9 - Request with excessively long name
 * Purpose: Tests API handling of very long input strings
 * Validates: API processes long input gracefully
 */
When('I make a GET request to {string} with very long name', async function (endpoint: string) {
  const longName = 'a'.repeat(1000);
  const response = await world.makeRequest('GET', endpoint, { params: { name: longName } });
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #10 - Request with many names (stress test)
 * Purpose: Tests API handling of large number of names
 * Validates: API processes many names efficiently
 */
When('I make a GET request to {string} with 100 names', async function (endpoint: string) {
  const params = new URLSearchParams();
  for (let i = 1; i <= 100; i++) {
    params.append('name[]', `name${i}`);
  }
  const response = await world.makeRequest('GET', `${endpoint}?${params.toString()}`);
  lastHttpResponse = response;
  lastResponse = await response.json();
});

/**
 * Test Case: #16 - Verify API rejects non-GET methods
 * Purpose: Tests API rejection of non-GET HTTP methods
 * Validates: API only accepts GET requests
 */
When('I make a POST request to {string} with name {string}', async function (endpoint: string, name: string) {
  const response = await world.makeRequest('POST', endpoint, { data: { name } });
  lastHttpResponse = response;
});

/**
 * Test Case: Custom headers support
 * Purpose: Tests API functionality with custom HTTP headers
 * Validates: API accepts and processes custom headers correctly
 */
When('I request age estimation for {string} with custom headers', async function (name: string) {
  const customHeaders = { 'User-Agent': 'Test-Agent/1.0' };
  const response = await agifySchema.estimateTheAgeOfAName({ name, headers: customHeaders });
  lastResponse = response;
  expect(lastHttpResponse.status()).toEqual(constants.HTTP_STATUS_OK);
});

/**
 * Test Case: Rate limiting and concurrent requests
 * Purpose: Tests API behavior under concurrent load and rate limiting
 * Validates: API handles multiple simultaneous requests appropriately
 */
When('I make multiple rapid requests', async function () {
  const names = ['Michael', 'Sarah', 'John', 'Emma', 'David'];
  const promises = names.map(name => agifySchema.estimateTheAgeOfAName({ name }));
  const responses = await Promise.all(promises);
  lastResponse = responses;
  responses.forEach(response => {
    expect(lastHttpResponse.status()).toEqual(constants.HTTP_STATUS_OK);
  });
});

/**
 * Test Case: Missing name parameter error
 * Purpose: Tests API error handling when name parameter is missing
 * Validates: API returns 422 status with appropriate error message
 */
When('I request age estimation without a name parameter', async function () {
  const response = await world.request.get('/');
  lastHttpResponse = response;
  expect(response.status()).toEqual(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY);
});

/**
 * Test Case: Invalid name parameter error
 * Purpose: Tests API error handling when name parameter is invalid
 * Validates: API returns 422 status with appropriate error message
 */
When('I request age estimation with invalid name parameter', async function () {
  const response = await world.request.get('/', { params: { name: '' } });
  lastHttpResponse = response;
  expect(response.status()).toEqual(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY);
});

/**
 * Test Case: HTTP Status Code Validation
 * Purpose: Verifies that the API returns the expected HTTP status code
 * Validates: Response status code matches expected value
 */
Then('the response should have status code {int}', function (expectedStatus: number) {
  expect(lastHttpResponse.status()).toEqual(expectedStatus);
});

/**
 * Test Case: JSON Structure Validation
 * Purpose: Verifies that the API response contains valid JSON structure
 * Validates: Response is valid JSON with expected structure
 */
Then('the response should contain valid JSON structure', function () {
  expect(lastResponse).toBeDefined();
  expect(typeof lastResponse).toBe('object');
});

/**
 * Test Case: Name Field Validation
 * Purpose: Verifies that the API response contains the expected name
 * Validates: Response name field matches the input parameter
 */
Then('the response should contain the name {string}', function (expectedName: string) {
  if (Array.isArray(lastResponse)) {
    expect(lastResponse.some((item: any) => item.name === expectedName)).toBe(true);
  } else {
    expect(lastResponse.name).toBe(expectedName);
  }
});

/**
 * Test Case: Array Response Validation
 * Purpose: Verifies that batch requests return an array of responses
 * Validates: Multiple name requests return array format instead of single object
 */
Then('the response should be an array', function () {
  expect(Array.isArray(lastResponse)).toBe(true);
});

/**
 * Test Case: Array Length Validation
 * Purpose: Verifies that the response array contains the expected number of items
 * Validates: Batch processing returns correct number of responses for input names
 */
Then('the array should contain {int} items', function (expectedCount: number) {
  expect(lastResponse.length).toBe(expectedCount);
});

/**
 * Test Case: Array Item Structure Validation
 * Purpose: Verifies that each item in the response array has the correct structure
 * Validates: All array items contain required fields with correct types
 */
Then('each item should have valid structure', function () {
  lastResponse.forEach((item: any) => {
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('age');
    expect(item).toHaveProperty('count');
    expect(typeof item.name).toBe('string');
    expect(typeof item.age === 'number' || item.age === null).toBe(true);
    expect(typeof item.count).toBe('number');
  });
});

/**
 * Test Case: Country ID Validation
 * Purpose: Verifies that localized responses contain the correct country identifier
 * Validates: Country-specific age estimation returns the expected country_id
 */
Then('the response should contain country_id {string}', function (expectedCountryId: string) {
  if (Array.isArray(lastResponse)) {
    expect(lastResponse.some((item: any) => item.country_id === expectedCountryId)).toBe(true);
  } else {
    expect(lastResponse.country_id).toBe(expectedCountryId);
  }
});

/**
 * Test Case: Error Message Validation
 * Purpose: Verifies that the API returns the correct error message for missing name parameter
 * Validates: Error message matches expected format
 */
Then('the response should contain error message for missing name parameter', function () {
  expect(lastResponse.error).toBe("Missing 'name' parameter");
});

/**
 * Test Case: Error Message Validation
 * Purpose: Verifies that the API returns the correct error message for invalid name parameter
 * Validates: Error message matches expected format
 */
Then('the response should contain error message for invalid name parameter', function () {
  expect(lastResponse.error).toBe("Invalid 'name' parameter");
});

/**
 * Test Case: Required Fields Validation
 * Purpose: Verifies that the response contains all required fields
 * Validates: Response has name, age, count fields
 */
Then('the response should have required fields', function () {
  expect(lastResponse).toHaveProperty('name');
  expect(lastResponse).toHaveProperty('age');
  expect(lastResponse).toHaveProperty('count');
});


/**
 * Test Case: Resource cleanup
 * Purpose: Ensures proper cleanup of browser resources after each test scenario
 * Validates: No resource leaks and proper test isolation
 */
After(async function () {
  if (world) {
    await world.cleanup();
  }
});
