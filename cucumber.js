module.exports = {
  default: {
    require: [
      'tests/steps/**/*.ts',
      'tests/world/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    worldParameters: {
      timeout: parseInt(process.env.AGIFY_TIMEOUT || '8000')
    },
    parallel: 1, // Run API tests sequentially to avoid rate limiting
    retry: 2,
    paths: ['tests/features/agify.feature']
  }
};
