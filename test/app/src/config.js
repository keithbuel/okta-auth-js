"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultConfig = getDefaultConfig;
exports.getConfigFromUrl = getConfigFromUrl;
exports.saveConfigToStorage = saveConfigToStorage;
exports.getConfigFromStorage = getConfigFromStorage;
exports.clearStorage = clearStorage;

var _constants = require("./constants");

/* global window, URL, localStorage, process */
var HOST = window.location.host;
var REDIRECT_URI = 'http://' + HOST + _constants.CALLBACK_PATH;

function getDefaultConfig() {
  var ISSUER = process.env.ISSUER;
  var CLIENT_ID = process.env.CLIENT_ID;
  return {
    redirectUri: REDIRECT_URI,
    issuer: ISSUER,
    clientId: CLIENT_ID,
    pkce: true
  };
}

function getConfigFromUrl() {
  var url = new URL(window.location.href);
  var issuer = url.searchParams.get('issuer');
  var clientId = url.searchParams.get('clientId');
  var pkce = url.searchParams.get('pkce') && url.searchParams.get('pkce') !== 'false';
  var scopes = (url.searchParams.get('scopes') || 'openid,email').split(',');
  var responseType = (url.searchParams.get('responseType') || 'id_token,token').split(',');
  return {
    redirectUri: REDIRECT_URI,
    issuer: issuer,
    clientId: clientId,
    pkce: pkce,
    scopes: scopes,
    responseType: responseType
  };
}

function saveConfigToStorage(config) {
  localStorage.setItem(_constants.STORAGE_KEY, JSON.stringify(config));
}

function getConfigFromStorage() {
  var config = JSON.parse(localStorage.getItem(_constants.STORAGE_KEY));
  return config;
}

function clearStorage() {
  localStorage.removeItem(_constants.STORAGE_KEY);
}
