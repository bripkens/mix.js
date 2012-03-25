/* 
 * mix.js 0.5
 *
 * Copyright (c) 2012, Ben Ripkens
 * Licensed under MIT license.
 * https://raw.github.com/bripkens/mix.js/master/LICENSE
 *
 * For all details and documentation:
 * https://github.com/bripkens/mix.js
 */
(function(context) {
  "use strict";

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

  /*
   * Execute the *constructor* with context *obj*. The arguments *args*
   * are passed to it. Should the constructor expose public functions,
   * then those functions are added to *obj* and *obj._mixinMethods*
   * (just in case they are overridden by one of the following mixins).
   */
  var applyConstructor = function(obj, constructor, args) {
    var methods = constructor.apply(obj, args);

    if (methods !== undefined) {
      extend(methods, obj);
      extend(methods, obj._mixinMethods[constructor] = {});
    }
  };

  /*
   * Core
   * ----
   */
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
        applyConstructor(this, depConstructor, arguments);
      }

      this._getMixinMethods = function(mixin) {
        return this._mixinMethods[mixin._meta.constructor];
      };

      applyConstructor(this, newMixConstructor, arguments);
    };

    constructor._meta = meta;

    return constructor;
  };

  /*
   * Exporting the public API
   * ------------------------
   * In a browser, the library will be available through this.mix.
   * For other environments, CommonJS is supported.
   */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = mix;
  } else {
    var previousMix = context.mix;
    context.mix = mix;

    /*
     * In case the global variable mix needs to be reset to its previous value.
     * The mix library is returned by this method.
     */
    mix.noConflict = function() {
      context.mix = previousMix;
      return mix;
    };
  }
})(this);