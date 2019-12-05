"use strict";

var _testApp = _interopRequireDefault(require("./testApp"));

var _config = require("./config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* entry point for SPA application */

/* global window, document */
var app;
var config;
var rootElem = document.getElementById('root');

function mount() {
  // Create the app as a function of config
  app = new _testApp.default(config);
  window._testApp = app; // Expose for console fiddling

  app.mount(window, rootElem);
  return app;
} // Regular landing, read config from URL


window.bootstrapLanding = function () {
  config = window.location.search ? (0, _config.getConfigFromUrl)() : (0, _config.getDefaultConfig)();
  mount();
  app.bootstrapHome();
}; // Callback, read config from storage


window.bootstrapCallback = function () {
  config = (0, _config.getConfigFromStorage)();
  (0, _config.clearStorage)();
  mount();
  app.bootstrapCallback();
};

window.addEventListener('load', function () {
  rootElem.classList.add('loaded');
});
