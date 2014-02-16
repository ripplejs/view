var domify = require('domify');
var emitter = require('emitter');
var model = require('model');

module.exports = function(template) {

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
  function View(data, owner) {
    this.el = domify(template);
    this.state = new State(data);
    this.owner = owner;
    this.root = (owner) ? owner.root : this;
    if(this.init) this.init();
    if(this.render) this.render();
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
    return this;
  };

  return View;
};
