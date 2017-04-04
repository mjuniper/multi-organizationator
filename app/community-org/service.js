import Ember from 'ember';
import fetch from 'ember-network/fetch';
import ENV from 'multiple-orgs/config/environment';

export default Ember.Service.extend({

  itemsService: Ember.inject.service(),

  init () {
    if (this.get('storeTokenInLocalStorage')) {
      const token = window.localStorage.getItem(this.get('localStorageKey'));
      if (token) {
        this.set('_token', token);
      }
    }
  },

  storeTokenInLocalStorage: false,

  useGenerateToken: false,

  localStorageKey: 'community-org-token-key',

  token: Ember.computed('_token', {
    get () {
      return this.get('_token');
    },
    set (key, token) {
      this.set('_token', token);
      if (this.get('storeTokenInLocalStorage')) {
        window.localStorage.setItem(this.get('localStorageKey'), token);
      }
      return token;
    }
  }),

  hasToken: Ember.computed.notEmpty('_token'),

  getToken () {
    const token = this.get('token');
    if (token) { return Ember.RSVP.resolve({ token: token }); }

    const generateTokenUrl = `${ENV.APP.portalUrl}/sharing/rest/generateToken`;

    const body = this._encodeForm({
      username: ENV.APP.communityOrg.username,
      password: ENV.APP.communityOrg.password,
      referer: window.location.origin,
      f: 'json'
    });

    const opts = {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    };

    return fetch(generateTokenUrl, opts)
      .then((response) => response.json())
      .then((tokenInfo) => {
        this.set('token', tokenInfo.token);
        return tokenInfo;
      });
  },

  getPortalOptions () {
    return this.getToken()
      .then((tokenInfo) => {
        return {
          portalHostname: ENV.APP.communityOrg.portalHostname,
          token: tokenInfo.token
        };
      });
  },

  getItems () {
    return this.getPortalOptions()
      .then((portalOpts) => {
        return this.get('itemsService')
          .search({ q: 'access:private' }, portalOpts);
      });
  },

  _encodeForm (formData) {
    return Object.keys(formData).map((key) => {
      return [key, formData[key]].map(encodeURIComponent).join('=');
    }).join('&');
  }

});
