import Ember from 'ember';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  model () {
    // if you are not logged in to the enterprise org, show an error
    if (!this.get('session.isAuthenticated')) {
      return {
        error: { message: 'You must be logged in.' }
      };
    }

    // if you are not logged in to the community org, redirect to sign-in
    if (!this.get('communityOrgService.isAuthenticated')) {
      return this.transitionTo('sign-in');
    }

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
  },

  resetController (controller) {
    controller.setProperties({
      model: null,
      error: null
    });
  }

});
