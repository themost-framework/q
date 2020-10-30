const path = require('path');
module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: [ 'jasmine', 'karma-typescript' ],
    port: '8080',
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-typescript',
      'karma-spec-reporter',
      'karma-jasmine-html-reporter'
    ],
    karmaTypescriptConfig: {
      tsconfig: "tsconfig.spec.json",
    },
    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false
    },
    files: [ 
        { pattern: 'src/**/*.ts' },
        { pattern: 'spec/**/*.ts' }
    ],
    proxies: {
        '/base/node_modules/karma-typescript/dist/client/sql-wasm.wasm': {
            'target': 'https://cdn.jsdelivr.net/npm/sql.js@1.4.0/dist/sql-wasm.wasm',
            'changeOrigin': true
        }
    },
    preprocessors: {
        '**/*.ts': [ 'karma-typescript' ]
    },
    mime: {
          'application/wasm': ['wasm'],
          'text/x-typescript': ['ts','tsx']
      },
    reporters: [ 'kjhtml', 'spec' ],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: true,
    customLaunchers: {
        ChromeHeadlessNoSandbox: {
            base: 'ChromeHeadless',
            flags: [
                '--no-sandbox',
                '--enable-logging=stderr',
                '--disable-web-security',
                '--disable-gpu'
            ]
        }
    }
  })
}