import Ember from 'ember';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  beforeModel () {
    if (!this.get('communityOrgService.hasToken') && !this.get('communityOrgService.useGenerateToken')) {
      this.transitionTo('sign-in');
    }
  },

  model () {
    return this.get('communityOrgService').getItems()
      .then((itemsResponse) => {
        return { model: itemsResponse };
      })
      .catch((err) => {
        return { error: err };
      });
  },

  setupController (controller, model) {
    controller.setProperties(model);
  }

});
