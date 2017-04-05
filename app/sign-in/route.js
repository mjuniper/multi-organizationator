import Ember from 'ember';
import ENV from 'multi-organizationator/config/environment';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  cookies: Ember.inject.service(),

  beforeModel () {
    // save the cookie cuz it's about to get stepped on
    const esriAuthCookie = this.get('cookies').read('esri_auth');
    this.set('esri_auth', esriAuthCookie);

    window.__communityOrgSigninCallback = Ember.run.bind(this, this.setToken);
    if (!this.get('communityOrgService.useIFrame')) {
      window.open(this.get('authorizeUrl'), 'oauth-window', 'height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes');
    }
  },

  setToken (tokenInfo) {
    this.set('communityOrgService.tokenInfo', tokenInfo);

    // when we logged on via iframe, our cookie got stepped on... switch it back!
    const esriAuthCookie = this.get('esri_auth');
    this.get('cookies').write('esri_auth', esriAuthCookie, { domain: 'arcgis.com' });

    this.transitionTo('community');
  },

  authorizeUrl: Ember.computed('redirectUri', function () {
    const url = ENV.APP.portalUrl;
    // const url = 'https://flying6114.mapsdevext.arcgis.com';
    const params = this.get('communityOrgService.oAuthParams');
    var qryString = Object.entries(params).map((item) => item.join('=')).join('&');
    return `${url}/sharing/rest/oauth2/authorize?${qryString}`;
  })

});
