import Ember from 'ember';
import ENV from 'multiple-orgs/config/environment';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  beforeModel () {
    window.__communityOrgSigninCallback = Ember.run.bind(this, this.setToken);
    window.open(this.get('iframeSrc'), 'oauth-window', 'height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes');
  },

  setToken (token) {
    this.set('communityOrgService.token', token);
    this.transitionTo('community');
  },

  iframeSrc: Ember.computed('property', function () {
    const url = ENV.APP.portalUrl; // 'https://dc.mapsdevext.arcgis.com/sharing/rest/oauth2/authorize';
    const params = {
      client_id: 'arcgisonline', // ENV.torii.providers['arcgis-oauth-bearer'].apiKey, // 'fVNWb7GlPzbD2AJp', // arcgisonline
      prepopulatedusername: ENV.APP.communityOrg.username,
      force_login: true,
      response_type: 'token',
      expiration: 20160,
      display: 'default',
      redirect_uri: encodeURIComponent(this.get('redirectUri'))
    };
    var qryString = Object.entries(params).map((item) => item.join('=')).join('&');
    return `${url}/sharing/rest/oauth2/authorize?${qryString}`;
  }),

  redirectUri: Ember.computed('property', function () {
    // return 'https://dc.mapsdevext.arcgis.com/home/pages/Account/callback.html?clientId%3Darcgisonline%26redirectUri%3Dhttps%253A%252F%252Fdc.mapsdevext.arcgis.com%252Fhome%252Faccountswitcher-callback.html%26user%3Ddcadmin%26signout%3Dtrue%26origin%3Dhttps%3A%2F%2Fflying6114.mapsdevext.arcgis.com%26provider%3Darcgis';
    return 'http://localui.arcgis.com:4200/signin-callback.html';
  }),

});
