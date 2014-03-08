var domify = require('domify');
var emitter = require('emitter');
var model = require('model');
var toArray = require('to-array');
var computed = require('computed');
var accessors = require('accessors');

function freeze(Model) {
  Model.on('construct', function(model){
    Object.freeze(model.props);
  });
}

module.exports = function(template) {

  /**
   * Stores the state of the view.
   *
   * @type {Function}
   */
  var State = model()
    .use(accessors)
    .use(computed);


  /**
   * Stores the properties of the view
   *
   * @type {Function}
   */
  var Props = model()
    .use(accessors)
    .use(freeze);


  /**
   * The view controls the lifecycle of the
   * element that it creates from a template.
   * Each element can only have one view and
   * each view can only have one element.
   *
   * @param {Object} data
   * @param {Object} options
   */
  function View(props, options) {
    options = options || {};
    this.props = new Props(props);
    this.state = new State(options.state);
    this.owner = options.owner;
    this.root = this.owner ? this.owner.root : this;
    this.template = options.template || template;
    View.emit('created', this, props, options);
    this.el = this.render();
    View.emit('ready', this);
  }


  /**
   * Mixins
   */
  emitter(View);
  emitter(View.prototype);


  /**
   * Alternate create method so that we can
   * keep the API for normal views nice
   *
   * @param {Object} options
   *
   * @return {View}
   */
  View.create = function(options) {
    return new View(options.props, {
      template: options.template,
      owner: options.owner,
      state: options.state
    });
  };


  /**
   * Use a plugin
   *
   * @return {View}
   */
  View.use = function(fn, options){
    fn(this, options);
    return this;
  };


  /**
   * Add a computed state property
   *
   * @return {View}
   */
  View.computed = function(key, deps, fn) {
    State.computed(key, deps, fn);
    return this;
  };


  /**
   * When calling View.on the function will
   * always be called in the context of the view instance
   *
   * @return {View}
   */
  View.on = function(event, fn) {
    emitter.prototype.on.call(this, event, function(){
      var args = toArray(arguments);
      var view = args.shift();
      fn.apply(view, args);
    });
    return this;
  };


  /**
   * Lookup a property on this view.
   *
   * @param {String} prop
   */
  View.prototype.lookup = function(prop) {
    if(this.state.get(prop) !== undefined) {
      return this.state;
    }
    if(this.owner) {
      return this.owner.lookup(prop);
    }
    throw new Error('Cannot find property named "' + key + '"');
  };


  /**
   * Get the value of a property on the view. If the
   * value is undefined it checks the owner view recursively
   * up to the root.
   *
   * @param  {String} key
   *
   * @return {Mixed}
   */
  View.prototype.get = function(key) {
    if(Array.isArray(key)) {
      var data = {};
      var self = this;
      key.forEach(function(attr){
        data[attr] = self.get(attr);
      });
      return data;
    }
    return this.lookup(key).get(key);
  };


  /**
   * Set the value of a property on the view
   *
   * @param  {String} key
   * @param  {Mixed}  value
   *
   * @return {void}
   */
  View.prototype.set = function(key, value) {
    this.state.set(key, value);
  };


  /**
   * Watch for a state change
   *
   * @param  {String|Array} key
   * @param  {Function} fn
   *
   * @return {Function} unbinder
   */
  View.prototype.change = function(key, fn) {
    var binding = this.lookup(key).change(key, fn);
    this.once('destroy', binding);
    return binding;
  };


  /**
   * Compile this view's template into an element.
   *
   * @return {Element}
   */
  View.prototype.render = function(){
    return domify(this.template);
  };


  /**
   * Append this view to an element
   *
   * @param {Element} node
   *
   * @return {View}
   */
  View.prototype.mount = function(node, replace) {
    if(replace) {
      node.parentNode.replaceChild(this.el, node);
    }
    else {
      node.appendChild(this.el);
    }
    View.emit('mount', this, node, replace);
    this.emit('mount', node, replace);
    return this;
  };


  /**
   * Remove the element from the DOM
   *
   * @return {View}
   */
  View.prototype.unmount = function() {
    if(!this.el.parentNode) return this;
    this.el.parentNode.removeChild(this.el);
    View.emit('unmount', this);
    this.emit('unmount');
    return this;
  };


  /**
   * Remove the element from the DOM
   *
   * @return {View}
   */
  View.prototype.destroy = function() {
    View.emit('destroy', this);
    this.emit('destroy');
    this.unmount();
    this.off();
  };


  return View;
};
