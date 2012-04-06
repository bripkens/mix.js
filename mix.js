/* 
 * mix.js 1.1
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

  var classIdCounter = 0;
  var addClassIdIfAbsent = function(clazz) {
    if (typeof clazz._id === 'undefined') {
      clazz._id = classIdCounter++;
    }
  };

  var addDependencyIfAbsent = function(dependencyList, lookupList, dependency) {
    var dependencyId = dependency._id;
    if (lookupList.indexOf(dependencyId) === -1) {
      dependencyList.push(dependency);
      lookupList.push(dependencyId);
    }
  };

  var dependencyResolution = function(declaredDependencies) {
    var realDependencies = [],
        // used to improve speed. Functions comparisons are *SLOW*.
        // http://jsperf.com/javascript-functions-as-object-keys
        depedencyLookup = [];

    for (var i = 0; i < declaredDependencies.length; i++) {
      var declaredDependency = declaredDependencies[i],
          meta = declaredDependency._meta;

      if (typeof meta === 'undefined') {
        // Not a mixin, but a plain JavaScript "class"

        addClassIdIfAbsent(declaredDependency);

        addDependencyIfAbsent(realDependencies,
            depedencyLookup,
            declaredDependency);
      } else {
        // mixin in a mixin - mixception! Make sure that we untangle all
        // transitive dependencies before we continue. At this point, we can
        // be sure that every dependency has an Id, because it needs to be
        // a direct dependency (for some mixin), before it can become a
        // transitive.
        var transitiveDependencies = meta.classes;
        for (var j = 0; j < transitiveDependencies.length; j++) {
          addDependencyIfAbsent(realDependencies,
              depedencyLookup,
              transitiveDependencies[j]);
        }
      }
    }

    return realDependencies;
  };

  var getPublicPropertyProviders = function(classes) {
    var publicProperties = {};

    for (var i = 0; i < classes.length; i++) {
      var clazz = classes[i],
          proto = clazz.prototype;

      for (var propName in proto) {
        if (proto.hasOwnProperty(propName) && propName.charAt(0) !== '_') {
          // public property "propName" will be provided through "clazz"
          publicProperties[propName] = clazz;
        }
      }
    }

    return publicProperties;
  };

  var mix = function() {
    var classes = dependencyResolution(arguments),
        publicProperties = getPublicPropertyProviders(classes);

    var constructor = function(args) {
      args = args || {};
      var instances = {};
      this._instances = instances;
      args.instances = instances;
      args.pub = this;

      // instantiate every class and register it under *instances*
      for (var i = 0; i < classes.length; i++) {
        var clazz = classes[i];
        var instance = new clazz(args);
        instance._pub = this;
        instance._instances = instances;
        instances[clazz._id] = instance;
      }
    };

    // Add public properties and functions to the object's public API.
    for (var propName in publicProperties) {
      var clazz = publicProperties[propName];

      constructor.prototype[propName] = (function(propName, clazz) {
        return function() {
          var instance = this._instances[clazz._id];
          return instance[propName].apply(instance, arguments);
        };
      })(propName, clazz);
    }

    constructor._meta = {classes: classes};
    constructor._id = classes[classes.length - 1]._id;

    return constructor;
  };

  /*
   * Exporting the public API
   * ------------------------
   * In a browser, the library will be available through this.mix. Should
   * requireJS be used, we register mix.js through requireJS.
   * For other environments, CommonJS is supported.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = mix;
  } else if (typeof define !== 'undefined') {
    define(function() {
      return mix;
    });
  } else {
    /*
     * In case the global variable mix needs to be reset to its previous value.
     * The mix library is returned by this method.
     */
    var previousMix = context.mix;
    mix.noConflict = function() {
      context.mix = previousMix;
      return mix;
    };

    context.mix = mix;
  }
})(this);