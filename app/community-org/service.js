import Ember from 'ember';
import fetch from 'ember-network/fetch';
import ENV from 'multi-organizationator/config/environment';

export default Ember.Service.extend({

  itemsService: Ember.inject.service(),

  init () {
    const tokenInfoStr = window.localStorage.getItem(this.get('localStorageKey'));
    if (tokenInfoStr) {
      const tokenInfo = JSON.parse(tokenInfoStr);
      if (tokenInfo && tokenInfo.expires) {
        if (Date.now() < tokenInfo.expires) {
          this.set('tokenInfo', tokenInfo);
        }
      }
    }
  },

  localStorageKey: 'community-org-token-key',

  tokenInfo: Ember.computed('_tokenInfo', {
    get () {
      return this.get('_tokenInfo');
    },
    set (key, tokenInfo) {
      this.set('_tokenInfo', tokenInfo);
      window.localStorage.setItem(this.get('localStorageKey'), JSON.stringify(tokenInfo));
      if (tokenInfo.expires) {
        const expiresIn = tokenInfo.expires - Date.now() - 2000;
        Ember.run.later(() => { this.set('_tokenInfo', null); }, expiresIn);
      }
      return tokenInfo;
    }
  }),

  token: Ember.computed.reads('tokenInfo.access_token'),

  isAuthenticated: Ember.computed.notEmpty('token'),

  getPortalInfo () {
    const portalInfo = this.get('portalInfo');
    if (portalInfo) {
      return Ember.RSVP.resolve(portalInfo);
    }

    const portalSelfUrl = `${ENV.APP.portalUrl}/sharing/rest/portals/self?f=json&token=${this.get('token')}`;
    return fetch(portalSelfUrl)
      .then((response) => response.json())
      .then((portalInfo) => {
        if (portalInfo && !portalInfo.error) {
          this.set('portalInfo', portalInfo);
          return portalInfo;
        }
      });
  },

  getPortalOptions () {
    return this.getPortalInfo()
      .then((portalInfo) => {
        let portalHostname = portalInfo.portalHostname;
        if (portalInfo.urlKey) {
          portalHostname = `${portalInfo.urlKey}.${portalInfo.customBaseUrl}`;
        }

        return {
          portalHostname: portalHostname,
          token: this.get('token')
        };
      });
  },

  getItems () {
    return this.getPortalOptions()
      .then((portalOpts) => {
        return this.get('itemsService')
          .search({ q: 'access:private' }, portalOpts);
      });
  }

});
