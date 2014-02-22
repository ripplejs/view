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

  describe('state', function () {

    it('should set state', function(){
      var view = new View();
      view.set('foo', 'bar');
      assert(view.get('foo') === 'bar');
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

    it('should be able to set default properties', function () {
      View.on('created', function(){
        this.set({
          first: 'Fred',
          last: 'Flintstone'
        });
      });
      var view = new View({
        first: 'Wilma'
      });
      assert(view.get('first') === 'Wilma');
      assert(view.get('last') === 'Flintstone');
    });

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

    it('should get multiple values from the owner', function () {
      var items = [];

      var parent = new View({
        foo: 'bar',
        items: items
      });

      var child = View.create({
        data: {
          color: 'red'
        },
        owner: parent
      });

      assert( child.get('color') === 'red' );
      assert( child.get('foo') === 'bar' );
      assert( child.get('items') === items );

      var all = child.get(['color', 'foo', 'items']);
      assert( all.color === 'red' );
      assert( all.foo === 'bar' );
      assert( all.items === items );
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

    it('should bind to multiple events at once', function(){
      View.on({
        ready: function(){
          this.set('ready', true);
        },
        mount: function(){
          this.set('mount', true);
        },
        unmount: function(){
          this.set('unmount', true);
        }
      });
      var view = new View();
      view.mount(document.body);
      view.unmount();
      assert(view.get('ready'));
      assert(view.get('mount'));
      assert(view.get('unmount'));
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
        data: {
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