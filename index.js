var domify = require('domify');
var emitter = require('emitter');
var model = require('model');
var interpolate = require('interpolate');

module.exports = function(template) {

  /**
   * A function that renders the view.
   * This is set with View.render
   *
   * @type {Function}
   */
  var render;

  /**
   * A function that works as a constructor
   * for the view. Set it with View.init
   *
   * @type {Function}
   */
  var init;

  /**
   * Stores the interpolation filters
   *
   * @type {Object}
   */
  var filters = {};

  /**
   * Stores the state of the view.
   *
   * @type {Function}
   */
  var State = model();

  /**
   * The view controller
   *
   * @param {Object} state
   */
  function View(data) {
    this.el = domify(template);
    this.state = new State(data);
    if(init) init.call(this);
    if(render) render.call(this, this);
    View.emit('construct', this);
  }

  /**
   * Use a plugin
   *
   * @return {View}
   */
  View.use = function(fn){
    fn.call(this, this);
    return this;
  };

  /**
   * Add a function that tell us how
   * to render this view. Only one function
   * can be set as the render function
   *
   * @return {View}
   */
  View.render = function(fn){
    render = fn;
    return this;
  };

  /**
   * Add an initialize method. This is another
   *
   * @return {View}
   */
  View.init = function(fn){
    init = fn;
    return this;
  };

  /**
   * Add an interpolation filter
   *
   * @param {String} name
   * @param {Function} fn
   *
   * @return {View}
   */
  View.filter = function(name, fn) {
    filters[name] = fn;
    return this;
  };

  /**
   * Add a computed state property
   *
   * @return {void}
   */
  View.computed = function(key, deps, fn) {
    State.computed(key, deps, fn);
    return this;
  };

  /**
   * Mixin emitter
   */
  emitter(View);
  emitter(View.prototype);

  /**
   * Get the value of a property on the view
   * @param  {String} key
   * @return {Mixed}
   */
  View.prototype.get = function(key) {
    return this.state.get(key);
  };

  /**
   * Set the value of a property on the view
   * @param  {String} key
   * @param  {Mixed}  value
   * @return {void}
   */
  View.prototype.set = function(key, value) {
    this.state.set(key, value);
  };

  /**
   * Watch for a state change
   * @param  {String|Array} key
   * @param  {Function} fn
   * @return {Function} unbinder
   */
  View.prototype.change = function(key, fn) {
    return this.state.change(key, fn);
  };

  /**
   * Run an interpolation on the string using the state. Whenever
   * the model changes it will render the string again
   *
   * @param {String} str
   * @param {Function} callback
   *
   * @return {Function} a function to unbind the interpolation
   */
  View.prototype.interpolate = function(str, callback) {
    var self = this;
    var attrs = interpolate.props(str);
    if(attrs.length === 0) return;
    function render() {
      return interpolate(str, self.get(attrs), filters);
    }
    if(!callback) return render();
    callback(render());
    return this.change(attrs, function(){
      callback(render());
    });
  };

  /**
   * Append this view to an element
   *
   * @param {Element} el
   *
   * @return {View}
   */
  View.prototype.mount = function(el, replace) {
    if(replace) {
      el.parentNode.replaceChild(this.el, el);
    }
    else {
      el.appendChild(this.el);
    }
    this.emit('mount', el);
    View.emit('mount', this, el);
    this.bind();
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
    this.emit('unmount');
    View.emit('unmount', this);
    this.unbind();
    return this;
  };

  /**
   * Causes all bindings that are watching
   * this view to attach themselves
   *
   * @return {View}
   */
  View.prototype.bind = function(){
    this.emit('bind', this);
    View.emit('bind', this);
    return this;
  };

  /**
   * Unbind all events and binding from the view,
   * leaving just the element in place
   * @return {View}
   */
  View.prototype.unbind = function(){
    this.emit('unbind', this);
    View.emit('unbind', this);
    return this;
  };

  return View;
};
