import Ember from 'ember';

export default Ember.Route.extend({

  itemsService: Ember.inject.service(),

  model () {
    if (!this.get('session.isAuthenticated')) {
      return {
        error: { message: 'You must be logged in.' }
      };
    }

    return this.get('itemsService').search({ q: 'access:private' })
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
