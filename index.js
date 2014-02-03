var emitter = require('emitter');
var Observer = require('observer');

/**
 * Compiled template view
 * @param {Element} el    Parent element
 * @param {Scope} scope   The scope includes all models for this view
 */
function View(el, scope) {
  this.el = el;
  this.children = []; // Child Views
  this.bindings = []; // Attribute bindings
  this.scope = scope; // Current scope
}

/**
 * Mixin emitter
 */
emitter(View.prototype);

/**
 * Get the value of a property on the view
 * @param  {String} key
 * @return {Mixed}
 */
View.prototype.get = function(key) {
  this.scope.get(key);
};

/**
 * Unbind all events and binding from the view,
 * leaving just the element in place
 * @return {View}
 */
View.prototype.unbind = function(){
  this.children.forEach(function(child){
    child.unbind();
  });
  this.bindings.forEach(function(binding){
    binding.unbind();
  });
  return this;
};

/**
 * Remove the view element from the DOM
 * @return {View}
 */
View.prototype.remove = function(){
  if(!this.el.parentNode) return this;
  this.el.parentNode.removeChild(this.el);
  return this;
};

/**
 * Remove this view from the DOM and unbind everything
 * @return {View}
 */
View.prototype.destroy = function(){
  return this.unbind().remove();
};

/**
 * Append this view to an element
 * @param  {Element} el
 * @return {View}
 */
View.prototype.appendTo = function(el) {
  el.appendChild(this.el);
  return this;
};

module.exports = View;