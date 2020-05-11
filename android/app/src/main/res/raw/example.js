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
  const EMPTY = {};
  const _ref = {},
        hasOwnProperty = _ref.hasOwnProperty;

  function clear() {
    modules = Object.create(null);
    return modules;
  }

  function define(factory, moduleId, dependencyMap) {
    if (modules[moduleId] != null) {
      return;
    }

    const mod = {
      dependencyMap,
      factory,
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

    const handler = {
      get: (t, p, r) => Reflect.get(module.exports, p, r),
      set: (t, p, v, r) => Reflect.set(module.exports, p, v, r),
      setPrototypeOf: (t, p) => Reflect.setPrototypeOf(module.exports, p),
      getPrototypeOf: t => Reflect.getPrototypeOf(module.exports),
      getOwnPropertyDescriptor: (t, p) => Reflect.getOwnPropertyDescriptor(module.exports, p),
      defineProperty: (t, p, d) => Reflect.defineProperty(module.exports, p, d),
      has: (t, p) => Reflect.has(module.exports, p),
      deleteProperty: (t, p) => Reflect.deleteProperty(module.exports, p),
      ownKeys: t => Reflect.ownKeys(module.exports),
      apply: (t, z, a) => Reflect.apply(module.exports, z, a),
      construct: (t, a, n) => Reflect.construct(module.exports, a, n),
      preventExtensions: t => Reflect.preventExtensions(module.exports),
      isExtensible: t => Reflect.isExtensible(module.exports)
    };
    return new Proxy(function () {}, handler);
  }

  function metroRequire(moduleId) {
    const moduleIdReallyIsNumber = moduleId;
    const module = modules[moduleIdReallyIsNumber];
    return module && module.isCyclic ? proxyModuleExports(module) : module && module.isInitialized ? module.publicModule.exports : guardedLoadModule(moduleIdReallyIsNumber, module);
  }

  function metroImportDefault(moduleId) {
    const moduleIdReallyIsNumber = moduleId;

    if (modules[moduleIdReallyIsNumber] && modules[moduleIdReallyIsNumber].importedDefault !== EMPTY) {
      return modules[moduleIdReallyIsNumber].importedDefault;
    }

    const exports = metroRequire(moduleIdReallyIsNumber);
    const importedDefault = exports && exports.__esModule ? exports.default : exports;
    return modules[moduleIdReallyIsNumber].importedDefault = importedDefault;
  }

  metroRequire.importDefault = metroImportDefault;

  function metroImportAll(moduleId) {
    const moduleIdReallyIsNumber = moduleId;

    if (modules[moduleIdReallyIsNumber] && modules[moduleIdReallyIsNumber].importedAll !== EMPTY) {
      return modules[moduleIdReallyIsNumber].importedAll;
    }

    const exports = metroRequire(moduleIdReallyIsNumber);
    let importedAll;

    if (exports && exports.__esModule) {
      importedAll = exports;
    } else {
      importedAll = {};

      if (exports) {
        for (const key in exports) {
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
  let inGuard = false;

  function guardedLoadModule(moduleId, module) {
    if (!inGuard && global.ErrorUtils) {
      inGuard = true;
      let returnValue;

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

  const ID_MASK_SHIFT = 16;
  const LOCAL_ID_MASK = 65535;

  function unpackModuleId(moduleId) {
    const segmentId = moduleId >>> ID_MASK_SHIFT;
    const localId = moduleId & LOCAL_ID_MASK;
    return {
      segmentId,
      localId
    };
  }

  metroRequire.unpackModuleId = unpackModuleId;

  function packModuleId(value) {
    return (value.segmentId << ID_MASK_SHIFT) + value.localId;
  }

  metroRequire.packModuleId = packModuleId;
  const moduleDefinersBySegmentID = [];

  function registerSegment(segmentID, moduleDefiner) {
    moduleDefinersBySegmentID[segmentID] = moduleDefiner;
  }

  function loadModuleImplementation(moduleId, module) {
    if (!module && moduleDefinersBySegmentID.length > 0) {
      const _unpackModuleId = unpackModuleId(moduleId),
            segmentId = _unpackModuleId.segmentId,
            localId = _unpackModuleId.localId;

      const definer = moduleDefinersBySegmentID[segmentId];

      if (definer != null) {
        definer(localId);
        module = modules[moduleId];
      }
    }

    const nativeRequire = global.nativeRequire;

    if (!module && nativeRequire) {
      const _unpackModuleId2 = unpackModuleId(moduleId),
            segmentId = _unpackModuleId2.segmentId,
            localId = _unpackModuleId2.localId;

      nativeRequire(localId, segmentId);
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
    const _module = module,
          factory = _module.factory,
          dependencyMap = _module.dependencyMap;

    try {
      const moduleObject = module.publicModule;
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
    let message = 'Requiring unknown module "' + id + '".';
    return Error(message);
  }

  function moduleThrewError(id, error) {
    const displayName = id;
    return Error('Requiring module "' + displayName + '", which threw an exception: ' + error);
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  const {
    LiquidCore
  } = _$$_REQUIRE(_dependencyMap[0]);

  setInterval(() => {}, 1000);
  console.log('Hello, World!');
  LiquidCore.emit('my_event', {
    foo: "hello, world",
    bar: 5,
    l337: ['a', 'b']
  });
  LiquidCore.on('ping', () => {
    LiquidCore.emit('pong', {
      message: 'Hello, World from LiquidCore!'
    });
    process.exit(0);
  });
  LiquidCore.emit('ready');
},0,[1]);
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  throw new Error('Cannot resolve module');
},1,[]);
__r(0);