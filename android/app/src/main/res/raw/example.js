var __BUNDLE_START_TIME__=this.nativePerformanceNow?nativePerformanceNow():Date.now(),__DEV__=false,process=this.process||{};process.env=process.env||{};process.env.NODE_ENV=process.env.NODE_ENV||"production";
(function (global) {
  "use strict";

  global.__non_webpack_require__ = LiquidCore.require;
  global.__webpack_require__ = metroRequire;
  global.__r = metroRequire;
  global.__d = define;
  global.__c = clear;
  global.__registerSegment = registerSegment;
  var modules = clear();
  var EMPTY = {};
  var _ref = {},
      hasOwnProperty = _ref.hasOwnProperty;

  function clear() {
    modules = Object.create(null);
    return modules;
  }

  function define(factory, moduleId, dependencyMap) {
    if (modules[moduleId] != null) {
      return;
    }

    var mod = {
      dependencyMap: dependencyMap,
      factory: factory,
      hasError: false,
      importedAll: EMPTY,
      importedDefault: EMPTY,
      isInitialized: false,
      isCyclic: false,
      publicModule: {
        exports: {}
      }
    };
    modules[moduleId] = mod;
  }

  function proxyModuleExports(module) {
    module.exports = function () {};

    var handler = {
      get: function get(t, p, r) {
        return Reflect.get(module.exports, p, r);
      },
      set: function set(t, p, v, r) {
        return Reflect.set(module.exports, p, v, r);
      },
      setPrototypeOf: function setPrototypeOf(t, p) {
        return Reflect.setPrototypeOf(module.exports, p);
      },
      getPrototypeOf: function getPrototypeOf(t) {
        return Reflect.getPrototypeOf(module.exports);
      },
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(t, p) {
        return Reflect.getOwnPropertyDescriptor(module.exports, p);
      },
      defineProperty: function defineProperty(t, p, d) {
        return Reflect.defineProperty(module.exports, p, d);
      },
      has: function has(t, p) {
        return Reflect.has(module.exports, p);
      },
      deleteProperty: function deleteProperty(t, p) {
        return Reflect.deleteProperty(module.exports, p);
      },
      ownKeys: function ownKeys(t) {
        return Reflect.ownKeys(module.exports);
      },
      apply: function apply(t, z, a) {
        return Reflect.apply(module.exports, z, a);
      },
      construct: function construct(t, a, n) {
        return Reflect.construct(module.exports, a, n);
      },
      preventExtensions: function preventExtensions(t) {
        return Reflect.preventExtensions(module.exports);
      },
      isExtensible: function isExtensible(t) {
        return Reflect.isExtensible(module.exports);
      }
    };
    return new Proxy(function () {}, handler);
  }

  function metroRequire(moduleId) {
    var moduleIdReallyIsNumber = moduleId;
    var module = modules[moduleIdReallyIsNumber];
    return module && module.isCyclic ? proxyModuleExports(module) : module && module.isInitialized ? module.publicModule.exports : guardedLoadModule(moduleIdReallyIsNumber, module);
  }

  function metroImportDefault(moduleId) {
    var moduleIdReallyIsNumber = moduleId;

    if (modules[moduleIdReallyIsNumber] && modules[moduleIdReallyIsNumber].importedDefault !== EMPTY) {
      return modules[moduleIdReallyIsNumber].importedDefault;
    }

    var exports = metroRequire(moduleIdReallyIsNumber);
    var importedDefault = exports && exports.__esModule ? exports.default : exports;
    return modules[moduleIdReallyIsNumber].importedDefault = importedDefault;
  }

  metroRequire.importDefault = metroImportDefault;

  function metroImportAll(moduleId) {
    var moduleIdReallyIsNumber = moduleId;

    if (modules[moduleIdReallyIsNumber] && modules[moduleIdReallyIsNumber].importedAll !== EMPTY) {
      return modules[moduleIdReallyIsNumber].importedAll;
    }

    var exports = metroRequire(moduleIdReallyIsNumber);
    var importedAll;

    if (exports && exports.__esModule) {
      importedAll = exports;
    } else {
      importedAll = {};

      if (exports) {
        for (var key in exports) {
          if (hasOwnProperty.call(exports, key)) {
            importedAll[key] = exports[key];
          }
        }
      }

      importedAll.default = exports;
    }

    return modules[moduleIdReallyIsNumber].importedAll = importedAll;
  }

  metroRequire.importAll = metroImportAll;
  var inGuard = false;

  function guardedLoadModule(moduleId, module) {
    if (!inGuard && global.ErrorUtils) {
      inGuard = true;
      var returnValue;

      try {
        returnValue = loadModuleImplementation(moduleId, module);
      } catch (e) {
        global.ErrorUtils.reportFatalError(e);
      }

      inGuard = false;
      return returnValue;
    } else {
      return loadModuleImplementation(moduleId, module);
    }
  }

  var ID_MASK_SHIFT = 16;
  var LOCAL_ID_MASK = 65535;

  function unpackModuleId(moduleId) {
    var segmentId = moduleId >>> ID_MASK_SHIFT;
    var localId = moduleId & LOCAL_ID_MASK;
    return {
      segmentId: segmentId,
      localId: localId
    };
  }

  metroRequire.unpackModuleId = unpackModuleId;

  function packModuleId(value) {
    return (value.segmentId << ID_MASK_SHIFT) + value.localId;
  }

  metroRequire.packModuleId = packModuleId;
  var moduleDefinersBySegmentID = [];

  function registerSegment(segmentID, moduleDefiner) {
    moduleDefinersBySegmentID[segmentID] = moduleDefiner;
  }

  function loadModuleImplementation(moduleId, module) {
    if (!module && moduleDefinersBySegmentID.length > 0) {
      var _unpackModuleId = unpackModuleId(moduleId),
          segmentId = _unpackModuleId.segmentId,
          localId = _unpackModuleId.localId;

      var definer = moduleDefinersBySegmentID[segmentId];

      if (definer != null) {
        definer(localId);
        module = modules[moduleId];
      }
    }

    var nativeRequire = global.nativeRequire;

    if (!module && nativeRequire) {
      var _unpackModuleId2 = unpackModuleId(moduleId),
          _segmentId = _unpackModuleId2.segmentId,
          _localId = _unpackModuleId2.localId;

      nativeRequire(_localId, _segmentId);
      module = modules[moduleId];
    }

    if (!module) {
      throw unknownModuleError(moduleId);
    }

    if (module.hasError) {
      throw moduleThrewError(moduleId, module.error);
    }

    module.isInitialized = true;
    module.isCyclic = true;
    var _module = module,
        factory = _module.factory,
        dependencyMap = _module.dependencyMap;

    try {
      var moduleObject = module.publicModule;
      moduleObject.id = moduleId;
      factory(global, metroRequire, metroImportDefault, metroImportAll, moduleObject, moduleObject.exports, dependencyMap);
      {
        module.factory = undefined;
        module.dependencyMap = undefined;
      }
      module.isCyclic = false;
      return moduleObject.exports;
    } catch (e) {
      module.hasError = true;
      module.error = e;
      module.isInitialized = false;
      module.isCyclic = false;
      module.publicModule.exports = undefined;
      throw e;
    } finally {}
  }

  function unknownModuleError(id) {
    var message = 'Requiring unknown module "' + id + '".';
    return Error(message);
  }

  function moduleThrewError(id, error) {
    var displayName = id;
    return Error('Requiring module "' + displayName + '", which threw an exception: ' + error);
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  var _require = _$$_REQUIRE(_dependencyMap[0]),
      LiquidCore = _require.LiquidCore;

  setInterval(function () {}, 1000);
  console.log('Hello, World!');
  LiquidCore.emit('my_event', {
    foo: "hello, world",
    bar: 5,
    l337: ['a', 'b']
  });
  LiquidCore.on('ping', function () {
    LiquidCore.emit('pong', {
      message: 'Hello, World from LiquidCore!'
    });
    process.exit(0);
  });
  LiquidCore.emit('ready');
},0,[1]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);

  var _classCallCheck2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));

  var _possibleConstructorReturn2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));

  var _getPrototypeOf2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[3]));

  var _inherits2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[4]));

  function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

  var events = _$$_REQUIRE(_dependencyMap[5]);

  var fs = _$$_REQUIRE(_dependencyMap[6]);

  var path = _$$_REQUIRE(_dependencyMap[7]);

  var join = path.join;
  var lc = global && global.LiquidCore;

  if (!lc) {
    var LiquidCore = function (_events) {
      (0, _inherits2.default)(LiquidCore, _events);

      var _super = _createSuper(LiquidCore);

      function LiquidCore() {
        (0, _classCallCheck2.default)(this, LiquidCore);
        return _super.apply(this, arguments);
      }

      return LiquidCore;
    }(events);

    lc = new LiquidCore();
    var native_require = global.require;
    var defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
      platform: process.platform,
      arch: process.arch,
      version: process.versions.node,
      bindings: 'bindings.node',
      bindingsjs: 'bindings.node.js',
      try: [['module_root', 'build', 'bindings'], ['module_root', 'build', 'Debug', 'bindings'], ['module_root', 'build', 'Release', 'bindings'], ['module_root', 'out', 'Debug', 'bindings'], ['module_root', 'Debug', 'bindings'], ['module_root', 'out', 'Release', 'bindings'], ['module_root', 'Release', 'bindings'], ['module_root', 'build', 'default', 'bindings'], ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings'], ['module_root', 'mocks', 'bindingsjs']]
    };

    function bindings(opts) {
      if (typeof opts == 'string') {
        opts = {
          bindings: opts
        };
      } else if (!opts) {
        opts = {};
      }

      Object.keys(defaults).map(function (i) {
        if (!(i in opts)) opts[i] = defaults[i];
      });

      if (path.extname(opts.bindings) != '.node') {
        opts.bindings += '.node';
      }

      opts.bindingsjs = opts.bindings + '.js';
      var requireFunc = native_require;
      var tries = [],
          i = 0,
          l = opts.try.length,
          n,
          b,
          err;
      var modules = [];
      var mods = fs.readdirSync(path.resolve('.', 'node_modules'));
      mods.forEach(function (m) {
        return m.startsWith('@') ? modules = modules.concat(fs.readdirSync(path.resolve('.', 'node_modules', m)).map(function (f) {
          return m + '/' + f;
        })) : modules.push(m);
      });

      for (var j = 0; j < modules.length; j++) {
        opts.module_root = modules[j];

        for (i = 0; i < l; i++) {
          n = join.apply(null, opts.try[i].map(function (p) {
            return opts[p] || p;
          }));
          tries.push(n);

          try {
            b = opts.path ? requireFunc.resolve(n) : requireFunc(n);

            if (!opts.path) {
              b.path = n;
            }

            return b;
          } catch (e) {
            if (!/not find/i.test(e.message)) {
              throw e;
            }
          }
        }
      }

      err = new Error('Could not locate the bindings file. Tried:\n' + tries.map(function (a) {
        return opts.arrow + a;
      }).join('\n'));
      err.tries = tries;
      throw err;
    }

    lc.require = function (module) {
      if (path.extname(module) == '.node') {
        console.warn('WARN: Attempting to bind native module ' + path.basename(module));
        console.warn('WARN: Consider using a browser implementation or make sure you have a LiquidCore addon.');
        return bindings(path.basename(module));
      }

      return native_require(module);
    };

    lc.require.__proto__ = native_require.__proto__;

    if (global) {
      global.LiquidCore = lc;
    }
  }

  module.exports = {
    LiquidCore: lc
  };
},1,[2,3,4,7,8,10,11,12]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      "default": obj
    };
  }

  module.exports = _interopRequireDefault;
},2,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  module.exports = _classCallCheck;
},3,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  var _typeof = _$$_REQUIRE(_dependencyMap[0]);

  var assertThisInitialized = _$$_REQUIRE(_dependencyMap[1]);

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return assertThisInitialized(self);
  }

  module.exports = _possibleConstructorReturn;
},4,[5,6]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof (typeof Symbol === "function" ? Symbol.iterator : "@@iterator") === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== (typeof Symbol === "function" ? Symbol.prototype : "@@prototype") ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
},5,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  function _assertThisInitialized(self) {
    if (self === undefined) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  module.exports = _assertThisInitialized;
},6,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  function _getPrototypeOf(o) {
    module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  module.exports = _getPrototypeOf;
},7,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  var setPrototypeOf = _$$_REQUIRE(_dependencyMap[0]);

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) setPrototypeOf(subClass, superClass);
  }

  module.exports = _inherits;
},8,[9]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  function _setPrototypeOf(o, p) {
    module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  module.exports = _setPrototypeOf;
},9,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = LiquidCore.require('events');
},10,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = LiquidCore.require('fs');
},11,[]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = LiquidCore.require('path');
},12,[]);
__r(0);