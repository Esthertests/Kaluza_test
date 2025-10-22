Feature: Agify API - Core Functionality Tests
  As a QA
  I want to test the core functionality of the Agify API
  So that I can ensure reliable age estimation services

  Background:
    Given the Agify API is available

  Scenario: #1 - Single name request
    When I make a GET request to "/" with name "michael"
    Then the response should have status code 200
    And the response should contain valid JSON structure
    And the response should contain the name "michael"

  Scenario: #2 - Single name with country_id
    When I make a GET request to "/" with name "michael" and country_id "US"
    Then the response should have status code 200
    And the response should contain valid JSON structure
    And the response should contain the name "michael"
    And the response should contain country_id "US"

  Scenario: #3 - Multiple names request
    When I make a GET request to "/" with multiple names "michael", "matthew", "jane"
    Then the response should have status code 200
    And the response should be an array
    And the array should contain 3 items
    And each item should have valid structure

  Scenario: #4 - Request with no parameters
    When I make a GET request to "/" with no parameters
    Then the response should have status code 422
    And the response should contain error message for missing name parameter

  Scenario: #5 - Request with empty name parameter
    When I make a GET request to "/" with empty name parameter
    Then the response should have status code 200
    And the response should contain valid JSON structure

  Scenario: #6 - Request with invalid characters
    When I make a GET request to "/" with name "@#$%"
    Then the response should have status code 200
    And the response should contain valid JSON structure

  Scenario: #7 - Request with invalid country code
    When I make a GET request to "/" with name "michael" and country_id "XYZ"
    Then the response should have status code 200
    And the response should contain valid JSON structure

  Scenario: #8 - Multiple names with partial invalid input
    When I make a GET request to "/" with names "michael" and empty name
    Then the response should have status code 200
    And the response should be an array

  Scenario: #9 - Request with excessively long name
    When I make a GET request to "/" with very long name
    Then the response should have status code 200
    And the response should contain valid JSON structure

  Scenario: #10 - Request with many names (stress test)
    When I make a GET request to "/" with 100 names
    Then the response should have status code 422
    And the response should contain error message for invalid name parameter

  Scenario: #11 - Validate HTTP status code 200 for valid requests
    When I make a GET request to "/" with name "michael"
    Then the response should have status code 200

  Scenario: #12 - Validate HTTP status code for invalid requests
    When I make a GET request to "/" with no parameters
    Then the response should have status code 422

  Scenario: #13 - Verify response format (JSON structure)
    When I make a GET request to "/" with name "michael"
    Then the response should have status code 200
    And the response should contain valid JSON structure
    And the response should have required fields


  Scenario: #16 - Verify API rejects non-GET methods
    When I make a POST request to "/" with name "michael"
    Then the response should have status code 404
