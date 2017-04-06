import Ember from 'ember';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  cookies: Ember.inject.service(),

  beforeModel () {
    // save the cookie cuz it's about to get stepped on
    const esriAuthCookie = this.get('cookies').read('esri_auth');
    this.set('esri_auth', esriAuthCookie);

    // we need a function in the global scope that the redirect_uri page can call
    window.__communityOrgSigninCallback = Ember.run.bind(this, this.setToken);

    const communityOrgService = this.get('communityOrgService');
    if (communityOrgService.get('usePopout')) {
      // if we are using a popout, show it
      window.open(communityOrgService.get('authorizeUrl'), 'oauth-window', 'height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes');
    }
  },

  setToken (tokenInfo) {
    // when we logged on via iframe, our cookie got stepped on... switch it back!
    const esriAuthCookie = this.get('esri_auth');
    this.get('cookies').write('esri_auth', esriAuthCookie, { domain: 'arcgis.com' });

    // validate that they logged in to the right org as the right user
    const communityOrgService = this.get('communityOrgService');
    communityOrgService.validateOrg(tokenInfo)
    .then(() => {
      this.transitionTo('community');
    }, () => {
      // increment a property so the iframe will rerender
      communityOrgService.incrementProperty('sessionId');
      this.controller.set('error', { message: 'You must log in as the community organization administrator.' });
    });
  }

});
