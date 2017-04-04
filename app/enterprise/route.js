import Ember from 'ember';

export default Ember.Route.extend({

  itemsService: Ember.inject.service(),

  model () {
    return this.get('itemsService')
      .search({ q: 'access:private' });
  }

});
