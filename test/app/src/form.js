"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateForm = updateForm;
exports.Form = void 0;

/* global document */
var Form = "\n  <form target=\"/oidc\" method=\"GET\">\n  <label for=\"issuer\">Issuer</label><input id=\"issuer\" name=\"issuer\" /><br/>\n  <label for=\"clientId\">Client ID</label><input id=\"clientId\" name=\"clientId\" /><br/>\n  <label for=\"pkce\">PKCE</label><input id=\"pkce\" name=\"pkce\" type=\"checkbox\"/><br/>\n  <input id=\"login-submit\" type=\"submit\" value=\"Update Config\"/>\n  </form>\n";
exports.Form = Form;

function updateForm(config) {
  document.getElementById('issuer').value = config.issuer;
  document.getElementById('clientId').value = config.clientId;
  document.getElementById('pkce').checked = !!config.pkce;
}
