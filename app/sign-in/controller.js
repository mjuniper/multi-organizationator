import Ember from 'ember';
import ENV from 'multi-organizationator/config/environment';

export default Ember.Controller.extend({

  communityOrgService: Ember.inject.service('community-org'),

  iframeSrc: Ember.computed('redirectUri', function () {
    const url = ENV.APP.portalUrl;
    const params = this.get('communityOrgService.oAuthParams');
    params.display = 'iframe';
    var qryString = Object.entries(params).map((item) => item.join('=')).join('&');
    return `${url}/sharing/oauth2/authorize?${qryString}`;
  }),

});
