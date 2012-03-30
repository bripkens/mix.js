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
      args.pub = this;
      args.instances = instances;

      // instantiate every class and register it under *instances*
      for (var i = 0; i < classes.length; i++) {
        var clazz = classes[i];
        var instance = new clazz(args);
        instance._pub = this;
        instance._instances = instances;
        instances[clazz._id] = instance;
      }

      // Add public properties and functions to the object's public API.
      // This mechanism leverages the *publicProperties* object which is
      // created at mixin creation time, i.e., only once when mix(...) is
      // called.
      for (var propName in publicProperties) {
        var clazz = publicProperties[propName];
        var instance = instances[clazz._id];

        (function(obj, propName, instance) {
          obj[propName] = function() {
            return instance[propName].apply(instance, arguments);
          };
        })(this, propName, instance);
      }
    };

    constructor._meta = {classes: classes};
    constructor._id = classes[classes.length - 1]._id;

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