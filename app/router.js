import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('enterprise');
  this.route('community');
  this.route('sign-in');
});

export default Router;
