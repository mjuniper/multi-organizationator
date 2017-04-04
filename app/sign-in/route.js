import Ember from 'ember';
import ENV from 'multi-organizationator/config/environment';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  beforeModel () {
    window.__communityOrgSigninCallback = Ember.run.bind(this, this.setToken);
    window.open(this.get('authorizeUrl'), 'oauth-window', 'height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes');
  },

  setToken (tokenInfo) {
    this.set('communityOrgService.tokenInfo', tokenInfo);
    this.transitionTo('community');
  },

  authorizeUrl: Ember.computed('redirectUri', function () {
    const communityOrgUsername = this.get('session.portal.portalProperties.hub.communityOrg.username');

    const url = ENV.APP.portalUrl;
    const params = {
      client_id: 'jJSYpDe6LdG5yRqo',
      prepopulatedusername: communityOrgUsername,
      force_login: true,
      response_type: 'token',
      expiration: 20160,
      display: 'default',
      redirect_uri: encodeURIComponent(this.get('redirectUri'))
    };
    var qryString = Object.entries(params).map((item) => item.join('=')).join('&');
    return `${url}/sharing/rest/oauth2/authorize?${qryString}`;
  }),

  redirectUri: Ember.computed(function () {
    return `${location.origin}/signin-callback.html`;
  }),

});
