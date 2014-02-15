# view

[![Build Status](https://travis-ci.org/ripplejs/view.png?branch=master)](https://travis-ci.org/ripplejs/view)

  A generic view for a DOM element that is able to be compiled by `ripple/compiler`. It manages user
  interactions on a DOM element and binds the model to the DOM.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/view

## Example

```js
var view = require('view');

// Creates a new view from a template
var View = view('<div selected="{{selected}}"></div>');

// Set state of the view
var myThing = new View({
  selected: false
});

myThing.set('selected', true);
```

## API

### view(template)

The function takes a template string and returns a `View` constructor that
can be used to render an element.

Whenever a new `View` is created, an element will be rendered based on
that template string.

```js
var View = view('<div></div>');
```

## View API

### View(object)

A constructor function that takes an object with the initial data.

```js
var item = new View({
  selected: true,
  title: 'Hello World'
});
```

Creating a new view emits a `construct` event on the `View` constructor.

```js
View.on('construct', function(view){
  console.log('created');
});

var child = new View(); // logs 'created'
```

### Properties

#### view.state

  The model for the view manages its **state**. Rather than passing your data model
  for the view to try and render, this model can store any data and bind it to the DOM.

  The view watches for changes in it's state and should automatically update the DOM.

#### view.el

  The **DOM element** that the view represents. A view can only ever manage a single element
  and should never touch elements outside of it.

#### view.owner

  A view can have a single **owner**. This is generally a view higher up in the DOM tree.
  When a views owner is destroyed, the child is also destroyed.

### Static Methods

#### View.init(fn)

Set the initialize method. Each view can only ever have a
single initialize method. Because View is created for you
you don't get access to the constructor.

```js
View.init(function(){
  this.on('save', this.save);
});
```

#### View.render(fn)

Set the `render` method of the view. Each view can only ever
have a single method for rendering. In **ripple** we set this
be the compiler.

```js
View.render(function(){
  compile(this);
});
```

#### View.use(fn)

Add a plugin to the view. Takes a function that is called with
the View object and returns `this` for chaining.

```js
var View = view('<div></div>');

function plugins(View) {
  View.prototype.log = function(str){
    console.log(str);
  };
}

view.use(plugins);
```

This allows you add plugins easily:

```js
View
  .use(events)
  .use(dispatch)
  .use(helpers)
```

#### View.filter(name, fn)

Add a filter to be used in interpolation.

```js
View.filter('uppercase', function(val){
  return val.toUpperCase();
});
```

#### View.computed(name, deps, fn)

Add a computed property that will automatically
update when the dependencies change.

```js
View.computed('fullname', ['first', 'last'], function(first, last){
  return first + ' ' + last;
});
```

Then when you create a view you'll be able to get that property:

```js
var view = new View({
  first: 'Homer',
  last: 'Simpson'
});

view.get('fullname'); // Homer Simpson
view.set('first', 'Bart');
view.get('fullname'); // Bart Simpson
```

### Methods

#### View#set(prop, value)

Set a property on the view. Triggers changes events that
will automatically re-render dependant elements.

```js
view.set('selected', true);
```

#### View#get(prop)

Get a property from the view

```js
view.get('selected');
```

#### View#change(prop, fn)

Watch for changes to a property. Returns a function for
unbinding.

```js
var change = view.change('selected', function(newVal, oldVal){
  console.log(newVal);
});

change(); // removed the binding
```

#### View#interpolate(string, fn)

Interpolate a string with properties on the view. The `fn` is called
with the value of the rendered string whenever any of the properties
in the string change.

```js
var unbind = view.interpolate('Hello {{world | uppercase}}', function(val){
  console.log(val);
});

view.set('world', 'World'); // logs: Hello WORLD
view.set('world', 'Pluto'); // logs: Hello PLUTO

unbind(); // Remove the binding
```

If a function isn't passed it will just return the rendered string.

```js
var str = view.interpolate('Hello {{world | uppercase}}');
```

#### View#mount(el, [replace])

Mount the view inside of `el`. The second parameter is a boolean
that will replace the element instead of append to it.

Emits a `mount` event with the `el`.

```js
view.mount(document.body);
```

#### View#unmount()

Remove the view from the DOM. Emits an `unmount` event.

#### View#on(event, fn)

Bind a function to an event.

```js
view.on('update', function(){
  console.log('triggered');
});
```

#### View#emit(event, [values...])

Emit an event and call all listeners

```js
view.on('update', function(user, id){
  console.log('triggered');
});

view.emit('update', user, id);
```

#### View#off(event, fn)

Unbind a function from an event. If a function isn't passed, all functions
for the event will be removed. If no parameters are passed in then all events
will be removed.

#### View#once(event, fn)

The same as `on` except it will only be called once.

## License

  MIT
