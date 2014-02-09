# view

[![Build Status](https://travis-ci.org/ripplejs/view.png?branch=master)](https://travis-ci.org/ripplejs/view)

  A view for a DOM element that is compiled by `ripple/compiler`. It manages user
  interactions on a DOM element and binds the model to the DOM.

  Uses `ripplejs/model` for the view-model.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/view

## API

```js
var view = require('view');

// Creates a new view from a template
var View = view('<div></div>');

// Computed properties
View.computed('foo', ['bar'], function(bar){
  return bar * 2;
});

// Set state of the view
var myThing = new View({
  selected: false
});
```

## License

  MIT
