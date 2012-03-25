(function() {
  "use strict";

  var root = this;

  var slice = Array.prototype.slice;

  var dependencyResolution = function(declaredDependencies) {
    var realDependencies = [];

    for (var i = 0; i < declaredDependencies.length; i++) {
      var declaredDependency = declaredDependencies[i];

      // dependency not analysed
      if (realDependencies.indexOf(declaredDependency) === -1) {
        var transitiveDependencies = declaredDependency._meta.dependencies;

        for (var j = 0; j < transitiveDependencies.length; j++) {
          var transitiveDependency = transitiveDependencies[j];

          if (realDependencies.indexOf(transitiveDependency) === -1) {
            realDependencies.push(transitiveDependency);
          }
        }

        realDependencies.push(declaredDependency);
      }
    }

    return realDependencies;
  };

  var extend = function(from, to) {
    for (var key in from) {
      if (from.hasOwnProperty(key)) {
        to[key] = from[key];
      }
    }
  };

  var applyConstructor = function(obj, constructor, handle, args) {
    var methods = constructor.apply(obj, args);

    if (methods !== undefined) {
      extend(methods, obj);
      extend(methods, obj._mixinMethods[handle] = {});
    }
  };

  var mix = function() {
    var dependencies = slice.call(arguments, 0, arguments.length-1),
        newMixConstructor = arguments[arguments.length-1];

    var meta = {
      dependencies: dependencyResolution(dependencies),
      constructor: newMixConstructor
    };

    var constructor = function() {
      this._mixinMethods = {};

      for (var i = 0; i < dependencies.length; i++) {
        var depConstructor = dependencies[i]._meta.constructor;
        applyConstructor(this, depConstructor, depConstructor, arguments);
      }

      this._getMixinMethods = function(mixin) {
        return this._mixinMethods[mixin._meta.constructor];
      };

      applyConstructor(this, newMixConstructor, constructor, arguments);
    };

    constructor._meta = meta;

    return constructor;
  };

  root.mix = mix;
}).call(this);