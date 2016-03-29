exports.config = {

  seleniumPort: 4444,

  allScriptsTimeout: 120000,

  capabilities: {
    'browserName': 'chrome'
  },

  specs: [
    './sanity.js',
  ],

  baseUrl: 'http://localhost:3000/',
  
  rootElement: 'div',

  onPrepare: function() {
  },

  framework: 'jasmine',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 8000,
    isVerbose: false,
    includeStackTrace: true
  },

  params: {
    credentials: {
      google: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD
      }
    }
  }

};

