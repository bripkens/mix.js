describe('core', function () {
  it('should resolve dependencies', function() {
    var mix1 = mix(function() {});
    expect(mix1._meta.dependencies.length).toBe(0);

    var mix2 = mix(mix1, function() {});
    expect(mix2._meta.dependencies.length).toBe(1);
    expect(mix2._meta.dependencies[0]).toBe(mix1);

    var mix3 = mix(mix2, function() {});
    expect(mix3._meta.dependencies.length).toBe(2);
    expect(mix3._meta.dependencies[0]).toBe(mix1);
    expect(mix3._meta.dependencies[1]).toBe(mix2);

    var mix4 = mix(mix2, mix1, function() {});
    expect(mix4._meta.dependencies.length).toBe(2);
    expect(mix4._meta.dependencies[0]).toBe(mix1);
    expect(mix4._meta.dependencies[1]).toBe(mix2);
  });

  it('should allow access to overridden methods', function() {
    var mix1 = mix(function() {
      return {
        getMessage: function() {
          return 'Foo';
        }
      };
    });

    var mix2 = mix(mix1, function() {
      return {
        getMessage: function() {
          return this._getMixinMethods(mix1).getMessage() + 'Bar';
        }
      };
    });

    expect(new mix2().getMessage()).toEqual('FooBar');
  });

  it('should allow private variables', function() {
    var Counter = mix(function() {
      var counter = 0;

      return {
        getCallCount: function() {
          return ++counter;
        }
      };
    });

    var first = new Counter(),
        second = new Counter();

    expect(first.getCallCount()).toBe(1);
    expect(first.getCallCount()).toBe(2);
    expect(second.getCallCount()).toBe(1);
    expect(first.getCallCount()).toBe(3);
  });

  it('should provide constructors', function() {
    var Counter = mix(function(initialCount) {
      var counter = initialCount;

      return {
        getCallCount: function() {
          return ++counter;
        }
      };
    });

    var initialCount = 5;
    var counter = new Counter(initialCount);
    expect(counter.getCallCount()).toBe(initialCount + 1);
  });
});