describe('core', function () {
  it('should list dependencies', function() {
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

  it('should allow access to other mixin methods', function() {
    var mix1 = mix(function() {
      return {
        printFoo: function() {
          console.log('Foo')
        }
      };
    });

    var mix2 = mix(mix1, function() {
      return {
        printFoo: function() {
          this._getMixinMethods(mix1).printFoo();
          console.log('Bar!');
        }
      };
    });

    //new mix1().printFoo();
    //console.log(new mix1());
    //console.log(new mix1())
    //console.log(new mix2());
    console.log(mix1);
    console.log(new mix2());
    new mix2().printFoo();
  });
});