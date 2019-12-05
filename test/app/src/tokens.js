"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokensArrayToObject = tokensArrayToObject;
exports.tokensHTML = tokensHTML;

var _util = require("./util");

function tokensArrayToObject(tokens) {
  var accessToken = tokens.filter(function (token) {
    return token.accessToken;
  });
  accessToken = accessToken.length ? accessToken[0] : null;
  var idToken = tokens.filter(function (token) {
    return token.idToken;
  });
  idToken = idToken.length ? idToken[0] : null;
  return {
    accessToken: accessToken,
    idToken: idToken
  };
}

function tokensHTML(tokens) {
  var idToken = tokens.idToken,
      accessToken = tokens.accessToken;
  var claims = idToken.claims;
  var html = "\n  <table id=\"claims\">\n    <thead>\n      <tr>\n        <th>Claim</th><th>Value</th>\n      </tr>\n    </thead>\n    <tbody>\n    ".concat(Object.keys(claims).map(function (key) {
    return "<tr><td>".concat(key, "</td><td>").concat(claims[key], "</td></tr>");
  }).join('\n'), "\n    </tbody>\n  </table>\n  <hr/>\n  <div class=\"flex-row\">\n    <div class=\"box\">\n      <strong>Access Token</strong><br/>\n      <div id=\"access-token\">").concat((0, _util.htmlString)(accessToken), "</div>\n    </div>\n    <div class=\"box\">\n      <strong>ID Token</strong><br/>\n      <div id=\"id-token\">").concat((0, _util.htmlString)(idToken), "</div>\n    </div>\n  </div>\n  ");
  return html;
}
