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

  it('should construct with properties', function(){
    var view = new View({
      foo: 'bar'
    });
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

  describe('getting values', function () {

    it('should get values from the state first', function () {
      var view = new View({
        foo: 'bar'
      });
      view.state.set('foo', 'baz');
      assert( view.get('foo') === 'baz' );
    });

    it('should get values from the props second', function () {
      var view = new View({
        one: 'prop'
      });
      view.state.set('one', undefined);
      assert( view.get('one') === 'prop' );
    });

    it('should get values from the owner last', function () {
      var parent = new View({
        one: 'one'
      });
      var child = new View(null, {
        owner: parent
      });
      child.set('foo', 'bar');
      assert( child.get('foo') === 'bar' );
      assert( child.get('one') === 'one' );
    });

  });

  describe('state', function () {

    it('should set state', function(){
      var view = new View();
      view.state.set('foo', 'bar');
      assert(view.state.get('foo') === 'bar');
    })

    it('should get state with accessors', function () {
      var view = View.create({
        state: {
          foo: 'bar'
        }
      });
      assert(view.state.foo === 'bar');
    });

    it('should set state with accessors', function () {
      var view = View.create({
        state: {
          foo: 'baz'
        }
      });
      view.state.foo = 'bar';
      assert(view.state.foo === 'bar');
    });

    it('should have computed properties', function(){
      View.computed('fullname', ['firstname', 'lastname'], function(first, last){
        return [first,last].join(' ');
      });
      var view = View.create({
        state: {
          'firstname': 'Bruce',
          'lastname': 'Willis'
        }
      });
      assert(view.state.get('fullname') === 'Bruce Willis');
      view.state.set('firstname', 'Danny');
      assert(view.state.get('fullname') === 'Danny Willis');
    })

    it('should have computed properties with nested dependencies', function(){
      View.computed('fullname', ['names.first', 'names.last'], function(first, last){
        return [first,last].join(' ');
      });
      var view = View.create({
        state: {
          names: {
            first: 'Bruce',
            last: 'Willis'
          }
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
      view.state.change('foo', function(){
        done();
      })
      view.state.set('foo', 'bar');
    })

    it('should be able to set default properties', function () {
      View.on('created', function(){
        this.state.set({
          first: 'Fred',
          last: 'Flintstone'
        });
      });
      var view = new View();
      view.set('first', 'Wilma');
      assert(view.get('first') === 'Wilma');
      assert(view.get('last') === 'Flintstone');
    });

    it('should have accessors', function(){

    })

  });

  describe('props', function () {

    it('should set props when created', function () {
      var view = new View({
        foo: 'bar'
      });
      assert(view.props.get('foo') === 'bar');
    });

    it('should not allow setting new props', function(){
      var view = new View({
        foo: 'bar'
      });
      view.props.set('bar', 'foo');
      assert( view.props.get('bar') === undefined )
    })

  });

  describe('having an owner', function () {

    it('should be able to have an owner', function () {
      var parent = new View();
      var child = new View(null, { owner: parent });
      var grandchild = new View(null, { owner: child });
      assert(child.owner === parent);
      assert(child.root == parent);
      assert(grandchild.owner == child);
      assert(grandchild.root == parent);
    });

    it('should get properties from the owner', function () {
      var parent = new View({
        foo: 'bar'
      });
      var child = new View(null, { owner: parent });
      var grandchild = new View(null, { owner: child });
      assert(grandchild.get('foo') === 'bar');
    });

  });

  describe('lifecycle events', function () {

    it('should bind ready callback to the instance', function () {
      View.on('ready', function(){
        this.set('foo', 'bar');
      })
      var view = new View();
      assert(view.get('foo') === 'bar');
    });

    it('should bind created callback to the instance', function () {
      View.on('created', function(){
        this.set('foo', 'bar');
      })
      var view = new View();
      assert(view.get('foo') === 'bar');
    });

    it('should bind mount callback to the instance', function () {
      View.on('mount', function(){
        this.set('foo', 'bar');
      })
      var view = new View();
      view.mount(document.body);
      assert(view.get('foo') === 'bar');
      view.unmount();
    });

    it('should bind unmount callback to the instance', function () {
      View.on('unmount', function(){
        this.set('foo', 'bar');
      })
      var view = new View();
      view.mount(document.body);
      view.unmount();
      assert(view.get('foo') === 'bar');
    });

  });

  describe('mounting', function () {
    var view;

    beforeEach(function () {
      view = new View();
    });

    afterEach(function () {
      view.unmount();
    });

    it('should mount to an element', function () {
      view.mount(document.body);
      assert(document.body.contains(view.el));
    });

    it('should unmount', function () {
      view.mount(document.body);
      view.unmount();
      assert(document.body.contains(view.el) === false);
    });

    it('should emit an instance event when mounted', function (done) {
      view.on('mount', function(){
        done();
      });
      view.mount(document.body);
    });

    it('should emit an instance event when unmounted', function (done) {
      view.on('unmount', function(){
        done();
      });
      view.mount(document.body);
      view.unmount();
    });

    it('should not emit an event if not mounted', function(done){
      view.on('unmount', function(){
        done(false);
      });
      view.unmount();
      done();
    })

  });

  describe('custom templates', function () {

    it('should allow a template override', function () {
      var view = new View(null, {
        template: '<div id="hooray"></div>'
      });
      assert(view.el.id === "hooray");
    });

  });

  describe('create syntax', function () {

    it('should create a view with the create method', function () {
      var parent = new View();
      var view = View.create({
        state: {
          foo: 'bar'
        },
        template: '<div id="created"></div>',
        owner: parent
      });
      assert(view.get('foo') === 'bar');
      assert(view.el.id === 'created');
      assert(view.owner === parent);
      assert(view.root === parent);
    });

  });

  describe('using plugins', function () {

    it('should expose a use method', function () {
      View.use(function(Child){
        Child.on('ready', function(){
          this.set('foo', 'bar');
        });
      });
      var view = new View();
      assert(view.get('foo') === 'bar');
    });

  });

  describe('destroying the view', function () {

    it('should unmount', function () {
      var view = new View();
      view.mount(document.body);
      view.destroy();
      assert(document.body.contains(view.el) === false);
    });

    it('should remove all event listeners', function (done) {
      var view = new View();
      view.on('foo', function(){
        done(false);
      });
      view.destroy();
      view.emit('foo');
      done();
    });

    it('should remove all change listeners', function (done) {
      var view = new View({
        foo: 'bar'
      });
      view.change('foo', function(){
        done(false);
      });
      view.destroy();
      view.set('foo', 'baz');
      done();
    });

  });

})