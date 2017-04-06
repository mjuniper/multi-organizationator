import Ember from 'ember';

export default Ember.Controller.extend({

  communityOrgService: Ember.inject.service('community-org'),

  iFrameSrc: Ember.computed.reads('communityOrgService.authorizeUrl'),

});
