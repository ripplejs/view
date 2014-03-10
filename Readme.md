# view

[![Build Status](https://travis-ci.org/ripplejs/view.png?branch=master)](https://travis-ci.org/ripplejs/view)

  A generic view that has `state` and `props`.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/view

## Example

```js
var view = require('view');

// Creates a new view class
var View = view();

// Set state of the view
var myThing = new View({
  user: model
});

myThing.props.user // model
myThing.state.set('selected', true);
```

## License

  MIT
