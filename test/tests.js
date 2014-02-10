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

  it('should interpolate a string', function(done){
    var view = new View();
    view.set('foo', 'bar');
    view.interpolate('{{foo}}', function(val){
      assert(val === 'bar');
      done();
    });
  })

  it('should add interpolation filters', function(done){
    View.filter('noobify', function(){
      return 'noob';
    });
    var view = new View();
    view.set('foo', 'bar');
    view.interpolate('{{foo | noobify}}', function(val){
      assert(val === 'noob');
      done();
    });
  })

  it('should have chainable static methods', function(){
    View
      .use(function(){})
      .filter('noobify', function(){
        return 'noob';
      })
      .prop('foo')
      .computed('bar', ['baz'], function(){});

    var view = new View();
  })

  it('should watch a string for changes', function(done){
    var count = 0;
    var view = new View();
    view.set('foo', 'bar');
    view.interpolate('{{foo}}', function(val){
      count++;
      if(count === 1) assert(val === 'bar');
      if(count === 2) {
        assert(val === 'baz');
        done();
      }
    });
    view.set('foo', 'baz');
  })

  it('should unwatch a strings changes', function(){
    var count = 0;
    var view = new View();
    view.set('foo', 'bar');
    var unbind = view.interpolate('{{foo}}', function(val){
      count++;
    });
    unbind();
    view.set('foo', 'baz');
    assert(count === 1, count);
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

  it('should bind and fire an event', function(done){
    var view = new View();
    view.on('bind', function(){
      done();
    })
    view.bind();
  })

  it('should unbind and fire an event', function(done){
    var view = new View();
    view.on('unbind', function(){
      done();
    })
    view.unbind();
  })

  it('should get properies', function(){
    View.prop('foo');
    var view = new View();
    view.props.set('foo', 'bar');
    assert(view.foo === 'bar');
  })

  it('should set properties', function(){
    View.prop('foo');
    var view = new View();
    view.foo = 'bar';
    assert(view.props.get('foo') === 'bar');
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

  it('should add events to the view', function(done){
    View.event('foo', function(view){
      assert(this instanceof View);
      assert(view instanceof View);
      done();
    });
    var view = new View();
    view.emit('foo');
  })

  it('should watch for changes', function(done){
    var view = new View();
    view.change('foo', function(){
      done();
    })
    view.set('foo', 'bar');
  })

})