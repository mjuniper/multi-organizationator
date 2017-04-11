import Ember from 'ember';
import fetch from 'ember-network/fetch';
import ENV from 'multi-organizationator/config/environment';

export default Ember.Service.extend({

  itemsService: Ember.inject.service(),

  session: Ember.inject.service(),

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

  reset () {
    this.setProperties({
      tokenInfo: null,
      portalInfo: null
    });
  },

  // just a property we can increment to get the login iframe to rerender
  sessionId: 0,

  // need to be able to force it to use popout for development
  forcePopout: false,

  usePopout: Ember.computed('forcePopout', function () {
    const forcePopout = this.get('forcePopout');
    const isArcGis = location.hostname.includes('arcgis.com');
    return forcePopout || !isArcGis;
  }),

  useIFrame: Ember.computed.not('usePopout'),

  oAuthParams: Ember.computed('session', 'useIFrame', 'sessionId', function () {
    const communityOrgUsername = this.get('session.portal.portalProperties.hub.settings.communityOrg.username');
    const origin = `${location.protocol}//${location.host}`;
    const redirectUri = `${origin}/signin-callback.html`;
    const useIFrame = this.get('useIFrame');

    return {
      client_id: ENV.torii.providers['arcgis-oauth-bearer'].apiKey,
      prepopulatedusername: communityOrgUsername,
      response_type: 'token',
      expiration: 20160,
      display: useIFrame ? 'iframe' : 'default',
      showSocialLogins: true,
      // locale: '',
      linkUserRequest: true, // if true, platform cookie will not be set
      sessionId: this.get('sessionId'),
      parent: origin,
      redirect_uri: redirectUri
    };
  }),

  authorizeUrl: Ember.computed('oAuthParams', function () {
    const params = this.get('oAuthParams');

    let url = ENV.APP.portalUrl;
    const communtityOrgPortalHostname = this.get('session.portal.portalProperties.hub.settings.communityOrg.portalHostname');
    if (communtityOrgPortalHostname) {
      url = url = `https://${communtityOrgPortalHostname}`;
    } else {
      // if we don't have the portalHostname of the community org, we need to make sure we get logged in to the right org
      params.force_login = true;
    }

    var qryString = Object.entries(params).map((item) => item.join('=')).join('&');
    return `${url}/sharing/rest/oauth2/authorize?${qryString}`;
  }),

  validateOrg (tokenInfo) {
    // validate that they logged in to the right org as the right user
    // it would be better to refactor this so we do not have to set it, only to maybe unset it below...
    this.set('tokenInfo', tokenInfo);
    return this.getPortalInfo()
    .then((portalInfo) => {
      const communityOrgInfo = this.get('session.portal.portalProperties.hub.settings.communityOrg');
      // we want to validate that the orgId and the username are the same
      if (portalInfo.id === communityOrgInfo.orgId && portalInfo.user.username === communityOrgInfo.username) {
        return Ember.RSVP.resolve(tokenInfo);
      } else {
        // overwrite the tokenInfo we just set because it's the wrong one
        this.setProperties({
          tokenInfo: null,
          portalInfo: null
        });
        return Ember.RSVP.reject();
      }
    });
  },

  localStorageKey: 'community-org-token-key',

  tokenInfo: Ember.computed('_tokenInfo', {
    get () {
      return this.get('_tokenInfo');
    },
    set (key, tokenInfo) {
      this.set('_tokenInfo', tokenInfo);
      if (tokenInfo) {
        window.localStorage.setItem(this.get('localStorageKey'), JSON.stringify(tokenInfo));
        if (tokenInfo.expires) {
          const expiresIn = tokenInfo.expires - Date.now() - 2000;
          Ember.run.later(() => { this.set('_tokenInfo', null); }, expiresIn);
        }
      } else {
        localStorage.removeItem(this.get('localStorageKey'));
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
