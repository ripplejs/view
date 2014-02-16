var assert = require('assert');
var createView = require('view');

describe('View', function(){
  var View;

  beforeEach(function(){
    View = createView('<div></div>');
  });

  it('should construct', function(){
    var view = new View();
  })

  it('should construct with state properties', function(){
    var view = new View({
      foo: 'bar'
    });
    assert(view.get('foo') === 'bar');
  })

  it('should set state', function(){
    var view = new View();
    view.set('foo', 'bar');
    assert(view.get('foo') === 'bar');
  })

  it('should mount to an element and fire an event', function(done){
    var view = new View();
    view.on('mount', function(){
      assert(document.body.contains(view.el));
      done();
    })
    view.mount(document.body);
  })

  it('should unmount and fire an event', function(done){
    var view = new View();
    view.mount(document.body);
    view.on('unmount', function(){
      done();
    })
    view.unmount();
  })

  it('should have computed properties', function(){
    View.computed('fullname', ['firstname', 'lastname'], function(first, last){
      return [first,last].join(' ');
    });
    var view = new View({
      'firstname': 'Bruce',
      'lastname': 'Willis'
    });
    assert(view.get('fullname') === 'Bruce Willis');
    view.set('firstname', 'Danny');
    assert(view.get('fullname') === 'Danny Willis');
  })

  it('should have computed properties with nested dependencies', function(){
    View.computed('fullname', ['names.first', 'names.last'], function(first, last){
      return [first,last].join(' ');
    });
    var view = new View({
      names: {
        first: 'Bruce',
        last: 'Willis'
      }
    });
    assert(view.get('fullname') === 'Bruce Willis');
    view.set({
      names: {
        first: 'Jet',
        last: 'Li'
      }
    });
    assert(view.get('fullname') === 'Jet Li');
  })

  it('should watch for changes', function(done){
    var view = new View();
    view.change('foo', function(){
      done();
    })
    view.set('foo', 'bar');
  })

  it('should have an owner', function () {
    var parent = new View();
    var child = new View(null, parent);
    var grandchild = new View(null, child);
    assert(child.owner === parent);
    assert(child.root == parent);
    assert(grandchild.owner == child);
    assert(grandchild.root == parent);
  });

})