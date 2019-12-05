"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _oktaAuthJs = _interopRequireDefault(require("@okta/okta-auth-js"));

var _config = require("./config");

var _constants = require("./constants");

var _util = require("./util");

var _form = require("./form");

var _tokens2 = require("./tokens");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* global document, window, Promise, console */

/* eslint-disable no-console */
function homeLink(app) {
  return "<a id=\"return-home\" href=\"".concat(app.originalUrl, "\">Return Home</a>");
}

function logoutLink(app) {
  return "<a id=\"logout\" href=\"".concat(app.originalUrl, "\" onclick=\"logoutAndReload(event)\">Logout (and reload)</a><br/>\n    <a id=\"logout-redirect\" href=\"").concat(app.originalUrl, "\" onclick=\"logoutAndRedirect(event)\">Logout (and redirect here)</a><br/>\n    <a id=\"logout-local\" href=\"").concat(app.originalUrl, "\" onclick=\"logoutLocal(event)\">Logout (local only)</a><br/>\n    ");
}

var Footer = "\n";
var Layout = "\n  <div id=\"layout\">\n    <div id=\"token-error\" style=\"color: red\"></div>\n    <div id=\"token-msg\" style=\"color: green\"></div>\n    <div id=\"page-content\"></div>\n    <div id=\"config-area\" class=\"flex-row\">\n      <div id=\"form-content\" class=\"box\">".concat(_form.Form, "</div>\n      <div id=\"config-dump\" class=\"box\"></div>\n    </div>\n    ").concat(Footer, "\n  </div>\n");

function makeClickHandler(fn) {
  return function (event) {
    event && event.preventDefault(); // prevent navigation / page reload

    return fn();
  };
}

function bindFunctions(testApp, window) {
  var boundFunctions = {
    loginRedirect: testApp.loginRedirect.bind(testApp, {}),
    loginPopup: testApp.loginPopup.bind(testApp, {}),
    loginDirect: testApp.loginDirect.bind(testApp),
    getToken: testApp.getToken.bind(testApp, {}),
    clearTokens: testApp.clearTokens.bind(testApp),
    logout: testApp.logout.bind(testApp),
    logoutAndReload: testApp.logoutAndReload.bind(testApp),
    logoutAndRedirect: testApp.logoutAndRedirect.bind(testApp),
    logoutLocal: testApp.logoutLocal.bind(testApp),
    refreshSession: testApp.refreshSession.bind(testApp),
    renewToken: testApp.renewToken.bind(testApp),
    revokeToken: testApp.revokeToken.bind(testApp),
    handleCallback: testApp.handleCallback.bind(testApp),
    getUserInfo: testApp.getUserInfo.bind(testApp)
  };
  Object.keys(boundFunctions).forEach(function (functionName) {
    window[functionName] = makeClickHandler(boundFunctions[functionName]);
  });
}

function TestApp(config) {
  this.config = config;
}

var _default = TestApp;
exports.default = _default;
Object.assign(TestApp.prototype, {
  // Mount into the DOM
  mount: function mount(window, rootElem) {
    this.originalUrl = _constants.MOUNT_PATH + (0, _util.toQueryParams)(this.config);
    this.rootElem = rootElem;
    this.rootElem.innerHTML = Layout;
    (0, _form.updateForm)(this.config);
    document.getElementById("config-dump").innerHTML = this.configHTML();
    this.contentElem = document.getElementById("page-content");
    bindFunctions(this, window);
  },
  getSDKInstance: function getSDKInstance() {
    var _this = this;

    return Promise.resolve().then(function () {
      _this.oktaAuth = _this.oktaAuth || new _oktaAuthJs.default(_this.config); // can throw

      _this.oktaAuth.tokenManager.on('error', _this._onTokenError.bind(_this));
    });
  },
  _setContent: function _setContent(content) {
    this.contentElem.innerHTML = "\n      <div>".concat(content, "</div>\n    ");
  },
  _afterRender: function _afterRender(extraClass) {
    this.rootElem.classList.add('rendered');

    if (extraClass) {
      this.rootElem.classList.add(extraClass);
    }
  },
  _onTokenError: function _onTokenError(error) {
    document.getElementById('token-error').innerText = error;
  },
  bootstrapCallback: async function bootstrapCallback() {
    var _this2 = this;

    var content = "\n      <a id=\"handle-callback\" href=\"/\" onclick=\"handleCallback(event)\">Handle callback (Continue Login)</a>\n      <hr/>\n      ".concat(homeLink(this), "\n    ");
    return this.getSDKInstance().then(function () {
      return _this2._setContent(content);
    }).then(function () {
      return _this2._afterRender('callback');
    });
  },
  bootstrapHome: async function bootstrapHome() {
    var _this3 = this;

    // Default home page
    return this.getSDKInstance().then(function () {
      return _this3.render();
    });
  },
  render: function render() {
    var _this4 = this;

    this.getTokens().catch(function (e) {
      _this4.renderError(e);

      throw e;
    }).then(function (data) {
      return _this4.appHTML(data);
    }).then(function (content) {
      return _this4._setContent(content);
    }).then(function () {
      // Add a special highlight on links when they are clicked
      var links = Array.prototype.slice.call(document.getElementsByTagName('a'));
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          this.classList.add('clicked');
        });
      });

      _this4._afterRender();
    });
  },
  renderError: function renderError(e) {
    var xhrError = e && e.xhr ? e.xhr.message : '';

    this._setContent("\n      <div id=\"error\" style=\"color: red\">".concat(e.toString(), "</div>\n      <div id=\"xhr-error\" style=\"color: red\">").concat(xhrError, "</div>\n      <hr/>\n      ").concat(homeLink(this), "\n      ").concat(logoutLink(this), "\n    "));

    this._afterRender('with-error');
  },
  loginDirect: async function loginDirect() {
    var _this5 = this;

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    return this.oktaAuth.signIn({
      username: username,
      password: password
    }).then(function (res) {
      if (res.status === 'SUCCESS') {
        (0, _config.saveConfigToStorage)(_this5.config);
        return _this5.oktaAuth.token.getWithRedirect({
          sessionToken: res.sessionToken,
          responseType: _this5.config.responseType
        });
      }
    }).catch(function (e) {
      _this5.renderError(e);

      throw e;
    });
  },
  loginRedirect: async function loginRedirect(options) {
    var _this6 = this;

    (0, _config.saveConfigToStorage)(this.config);
    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes
    }, options);
    return this.oktaAuth.token.getWithRedirect(options).catch(function (e) {
      _this6.renderError(e);

      throw e;
    });
  },
  loginPopup: async function loginPopup(options) {
    var _this7 = this;

    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes
    }, options);
    return this.oktaAuth.token.getWithPopup(options).then(function (tokens) {
      _this7.saveTokens(tokens);

      _this7.render();
    });
  },
  getToken: async function getToken(options) {
    var _this8 = this;

    options = Object.assign({}, {
      responseType: this.config.responseType,
      scopes: this.config.scopes
    }, options);
    return this.oktaAuth.token.getWithoutPrompt(options).then(function (tokens) {
      _this8.saveTokens(tokens);

      _this8.render();
    });
  },
  refreshSession: async function refreshSession() {
    return this.oktaAuth.session.refresh();
  },
  revokeToken: async function revokeToken() {
    var accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    return this.oktaAuth.token.revoke(accessToken).then(function () {
      document.getElementById('token-msg').innerHTML = 'access token revoked';
    });
  },
  renewToken: async function renewToken() {
    var _this9 = this;

    return this.oktaAuth.tokenManager.renew('idToken').then(function () {
      _this9.render();
    });
  },
  logout: async function logout() {
    return this.oktaAuth.signOut();
  },
  logoutAndReload: function logoutAndReload() {
    this.logout().catch(function (e) {
      console.error('Error during signout: ', e);
    }).then(function () {
      window.location.reload();
    });
  },
  logoutAndRedirect: function logoutAndRedirect() {
    var options = {
      postLogoutRedirectUri: window.location.origin
    };
    this.oktaAuth.signOut(options).catch(function (e) {
      console.error('Error during signout & redirect: ', e);
    });
  },
  logoutLocal: function logoutLocal() {
    this.clearTokens();
    window.location.reload();
  },
  handleCallback: async function handleCallback() {
    var _this10 = this;

    return this.getTokensFromUrl().catch(function (e) {
      _this10.renderError(e);

      throw e;
    }).then(function (tokens) {
      _this10.saveTokens(tokens);

      return _this10.callbackHTML(tokens);
    }).then(function (content) {
      return _this10._setContent(content);
    }).then(function () {
      return _this10._afterRender('callback-handled');
    });
  },
  getTokensFromUrl: async function getTokensFromUrl() {
    // parseFromUrl() Will parse the authorization code from the URL fragment and exchange it for tokens
    var tokens = await this.oktaAuth.token.parseFromUrl();
    this.saveTokens(tokens);
    return tokens;
  },
  saveTokens: function saveTokens(tokens) {
    tokens = Array.isArray(tokens) ? tokens : [tokens];
    tokens = (0, _tokens2.tokensArrayToObject)(tokens);
    var _tokens = tokens,
        idToken = _tokens.idToken,
        accessToken = _tokens.accessToken;

    if (idToken) {
      this.oktaAuth.tokenManager.add('idToken', idToken);
    }

    if (accessToken) {
      this.oktaAuth.tokenManager.add('accessToken', accessToken);
    }
  },
  getTokens: async function getTokens() {
    var accessToken = await this.oktaAuth.tokenManager.get('accessToken');
    var idToken = await this.oktaAuth.tokenManager.get('idToken');
    return {
      accessToken: accessToken,
      idToken: idToken
    };
  },
  clearTokens: function clearTokens() {
    this.oktaAuth.tokenManager.clear();
  },
  getUserInfo: async function getUserInfo() {
    var _this11 = this;

    var _ref = await this.getTokens(),
        accessToken = _ref.accessToken,
        idToken = _ref.idToken;

    if (accessToken && idToken) {
      return this.oktaAuth.token.getUserInfo(accessToken).catch(function (error) {
        _this11.renderError(error);

        throw error;
      }).then(function (user) {
        document.getElementById('user-info').innerHTML = (0, _util.htmlString)(user);
      });
    } else {
      this.renderError(new Error('Missing tokens'));
    }
  },
  configHTML: function configHTML() {
    var config = (0, _util.htmlString)(this.config);
    return "\n      <h2>Config</h2>\n      ".concat(config, "\n    ");
  },
  appHTML: function appHTML(props) {
    var _ref2 = props || {},
        idToken = _ref2.idToken,
        accessToken = _ref2.accessToken;

    if (idToken && accessToken) {
      // Authenticated user home page
      return "\n        <strong>Welcome back</strong>\n        <hr/>\n        ".concat(logoutLink(this), "\n        <hr/>\n        <ul>\n          <li>\n            <a id=\"get-userinfo\" href=\"/\" onclick=\"getUserInfo(event)\">Get User Info</a>\n          </li>\n          <li>\n            <a id=\"renew-token\" href=\"/\" onclick=\"renewToken(event)\">Renew Token</a>\n          </li>\n          <li>\n            <a id=\"get-token\" href=\"/\" onclick=\"getToken(event)\">Get Token (without prompt)</a>\n          </li>\n          <li>\n            <a id=\"clear-tokens\" href=\"/\" onclick=\"clearTokens(event)\">Clear Tokens</a>\n          </li>\n          <li>\n            <a id=\"revoke-token\" href=\"/\" onclick=\"revokeToken(event)\">Revoke Access Token</a>\n          </li>\n          <li>\n            <a id=\"refresh-session\" href=\"/\" onclick=\"refreshSession(event)\">Refresh Session</a>\n          </li>\n        </ul>\n        <div id=\"user-info\"></div>\n        <hr/>\n        ").concat((0, _tokens2.tokensHTML)({
        idToken: idToken,
        accessToken: accessToken
      }), "\n      ");
    } // Unauthenticated user, Login page


    return "\n      <strong>Greetings, unknown user!</strong>\n      <hr/>\n      <ul>\n        <li>\n          <a id=\"login-redirect\" href=\"/\" onclick=\"loginRedirect(event)\">Login using REDIRECT</a>\n        </li>\n        <li>\n          <a id=\"login-popup\" href=\"/\" onclick=\"loginPopup(event)\">Login using POPUP</a>\n        </li>\n      </ul>\n      <h4/>\n      <input name=\"username\" id=\"username\" placeholder=\"username\" type=\"email\"/>\n      <input name=\"password\" id=\"password\" placeholder=\"password\" type=\"password\"/>\n      <a href=\"/\" id=\"login-direct\" onclick=\"loginDirect(event)\">Login DIRECT</a>\n      ";
  },
  callbackHTML: function callbackHTML(tokens) {
    var success = tokens && tokens.length === 2;
    var errorMessage = success ? '' : 'Tokens not returned. Check error console for more details';
    var successMessage = success ? 'Successfully received tokens on the callback page!' : '';
    var content = "\n      <div id=\"callback-result\">\n        <strong><div id=\"success\">".concat(successMessage, "</div></strong>\n        <div id=\"error\">").concat(errorMessage, "</div>\n        <div id=\"xhr-error\"></div>\n      </div>\n      <hr/>\n      ").concat(homeLink(this), "\n      ").concat(success ? (0, _tokens2.tokensHTML)((0, _tokens2.tokensArrayToObject)(tokens)) : '', "\n    ");
    return content;
  }
});
