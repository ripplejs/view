var domify = require('domify');
var emitter = require('emitter');
var model = require('model');
var interpolate = require('interpolate');

module.exports = function(template, process) {

  /**
   * Stores the state of the view.
   *
   * @type {Function}
   */
  var State = model();

  /**
   * Stores the properties of the view.
   *
   * @type {Function}
   */
  var Properties = model();

  /**
   * The view controller
   *
   * @param {Object} state
   */
  function View(state) {
    this.el = domify(template);
    this.state = new State(state);
    this.props = new Properties();
    this.filters = {};
    this.View = View;
    View.emit('construct', this);
    if(process) process(this);
  }

  /**
   * Use a plugin
   *
   * @return {View}
   */
  View.use = function(fn){
    fn(this);
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
    View.on('construct', function(view){
      view.filters[name] = fn;
    });
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
   * Stores a reference to all of the properties
   * this view can have
   *
   * @type {Array}
   */
  View.props = [];

  /**
   * Create a new property on the view
   *
   * @return {void}
   */
  View.prop = function(name){
    View.on('construct', function(view){
      Object.defineProperty(view, name, {
        get: function(){
          return view.props.get(name);
        },
        set: function(val){
          view.props.set(name, val);
        }
      });
    });
    View.props.push(name);
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
   * Run an interpolation on the string using the state. Whenever
   * the model changes it will render the string again
   *
   * @param {String} str
   * @param {Function} callback
   *
   * @return {Function} a function to unbind the interpolation
   */
  View.prototype.interpolate = function(str, callback) {
    var state = this.state;
    var filters = this.filters;
    var attrs = interpolate.props(str);
    if(attrs.length === 0) return;
    function render() {
      return interpolate(str, state.get(attrs), filters);
    }
    callback(render());
    return this.state.change(attrs, function(){
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
  View.prototype.mount = function(el) {
    el.appendChild(this.el);
    this.emit('mount', el);
    return this;
  };

  /**
   * Remove the element from the DOM
   *
   * @return {View}
   */
  View.prototype.unmount = function() {
    if(!this.el.parentNode) return;
    this.el.parentNode.removeChild(this.el);
    this.emit('unmount');
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
