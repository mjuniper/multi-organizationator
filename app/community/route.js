import Ember from 'ember';

export default Ember.Route.extend({

  communityOrgService: Ember.inject.service('community-org'),

  // beforeModel () {
  //   if (!this.get('communityOrgService.isAuthenticated')) {
  //     this.transitionTo('sign-in');
  //   }
  // },

  model () {
    if (!this.get('session.isAuthenticated')) {
      return {
        error: { message: 'You must be logged in.' }
      };
    }

    if (!this.get('communityOrgService.isAuthenticated')) {
      this.transitionTo('sign-in');
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
