'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _asynk = require('asynk');

var _asynk2 = _interopRequireDefault(_asynk);

var _sqlBuilder = require('./sqlBuilder');

var sql = _interopRequireWildcard(_sqlBuilder);

var _constructorMethods = require('./constructorMethods');

var _constructorMethods2 = _interopRequireDefault(_constructorMethods);

var InstanceMethods = (function (_ConstructorMethods) {
	_inherits(InstanceMethods, _ConstructorMethods);

	function InstanceMethods() {
		_classCallCheck(this, InstanceMethods);

		_get(Object.getPrototypeOf(InstanceMethods.prototype), 'constructor', this).call(this);
	}

	_createClass(InstanceMethods, [{
		key: 'toJSON',
		value: function toJSON() {
			var model = this.constructor,
			    attributes = model.attributes;

			var obj = {};

			for (var att in attributes) {
				obj[att] = this[att];
			}

			return obj;
		}
	}, {
		key: 'belongsTo',
		value: function belongsTo() {

			// console.log('belongsTo');

			var model = this.constructor;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _len = arguments.length, objs = Array(_len), _key = 0; _key < _len; _key++) {
					objs[_key] = arguments[_key];
				}

				for (var _iterator = objs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var obj = _step.value;

					if (!(obj instanceof Model)) {
						continue;
					}

					var instanceParent = obj.constructor;

					// Verify has primary key
					if (!obj.hasOwnProperty(instanceParent.primaryKey)) {
						throw new Error('Cannot establish relation without a primary key');
					}

					// Verify that the relation exists in schema
					var exists = false;
					for (var att in model.attributes) {
						if (model.attributes[att] === instanceParent) {
							exists = att;break;
						}
					}

					if (exists === false) {
						throw new Error('The relationship does not exist');
					}

					// let opts = {};
					// opts[instanceParent.primaryKey] = obj[instanceParent.primaryKey];

					this[exists] = obj;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return this;
		}
	}, {
		key: 'findByAttributes',
		value: function findByAttributes(keys, cb) {

			var model = this.constructor,
			    attributes = model.attributes;

			var where = [],
			    values = [];

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var att = _step2.value;

					console.assert(att in attributes, 'Attribute \'' + att + '\' not defined in schema');

					var value = this[att];

					where.push('`' + att + '` = ?');

					// if( value instanceof Object ){
					// 	let _model = value.constructor;
					// 	values.push(value[_model.primaryKey]);
					// }else{
					values.push(value);
					// }
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2['return']) {
						_iterator2['return']();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			model.find(where, values, cb);
		}
	}, {
		key: 'findSelf',
		value: function findSelf(cb) {
			var _this = this;

			var model = this.constructor;

			// Find by primary key
			if (this[model.primaryKey]) {

				// IMPLEMENT
				// Fetch Data
				this.findByAttributes([model.primaryKey], function (err, models) {

					console.assert(!err, 'There was an error ' + err);

					console.log('found', models);
					if (models instanceof Array && models.length > 0) {

						for (var att in models[0]) {

							// If attribues don't exist
							if (!_this.hasOwnProperty(att)) {
								_this[att] = models[0][att];
							}
						}
						cb(_this);

						// Only extend key properties
						// cb( this::extendProperties(model, models[0]) );
					} else {
							cb(false);
						}
				});
				return;
			}

			// Find by unique keys
			if (model.uniqueKeys instanceof Array && model.uniqueKeys.every(function (att) {
				return _this[att] !== undefined;
			})) {

				// Fetch Data
				this.findByAttributes(model.uniqueKeys, function (err, models) {

					if (models instanceof Array && models.length > 0) {

						for (var att in models[0]) {

							// If attribues don't exist
							if (!_this.hasOwnProperty(att)) {
								_this[att] = models[0][att];
							}
						}
						cb(_this);

						// Only extend key properties
						// cb( this::extendProperties(model, models[0]) );
					} else {
							cb(false);
						}
				});
				return;
			}

			cb(false);
		}

		// Insert or update
	}, {
		key: 'save',
		value: function save(cb) {
			return _asynk2['default'].call(this, regeneratorRuntime.mark(function callee$2$0(resume) {
				var _model$_connection;

				var model, att, err, result, tableCreated, _ref, _ref2, _ref3, _ref32, found, query, _ref4, _ref42;

				return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
					var _this2 = this;

					while (1) switch (context$3$0.prev = context$3$0.next) {
						case 0:
							model = this.constructor;

							console.log('Save', this);

							// Validation
							for (att in model.attributes) {
								if (model.attributes[att].required) {
									console.assert(!this[att], 'Missing required field ' + att + ' in ' + JSON.stringify(this));
								}
							}

							err = undefined, result = undefined;
							tableCreated = undefined;
							context$3$0.next = 7;
							return model.createTable(resume);

						case 7:
							_ref = context$3$0.sent;
							_ref2 = _slicedToArray(_ref, 2);
							err = _ref2[0];
							tableCreated = _ref2[1];

							console.assert(err === null, err);

							// If table already existed, find self

							if (tableCreated) {
								context$3$0.next = 21;
								break;
							}

							context$3$0.next = 15;
							return this.findSelf(resume);

						case 15:
							_ref3 = context$3$0.sent;
							_ref32 = _slicedToArray(_ref3, 1);
							found = _ref32[0];

							console.log('found?', found);

							if (!found) {
								context$3$0.next = 21;
								break;
							}

							return context$3$0.abrupt('return', this.update(cb));

						case 21:
							query = sql.insertModel(model, this);

							console.log(query);
							context$3$0.next = 25;
							return (_model$_connection = model._connection).query.apply(_model$_connection, _toConsumableArray(query).concat([resume]));

						case 25:
							_ref4 = context$3$0.sent;
							_ref42 = _slicedToArray(_ref4, 2);
							err = _ref42[0];
							result = _ref42[1];

							console.log(err, result);

							if (!err) {
								context$3$0.next = 35;
								break;
							}

							if (!(err.code === 'ER_DUP_ENTRY')) {
								context$3$0.next = 33;
								break;
							}

							return context$3$0.abrupt('return', this.findSelf(function () {
								return _this2.update(cb);
							}));

						case 33:

							typeof cb === 'function' && cb(err);
							return context$3$0.abrupt('return');

						case 35:

							console.assert(result.affectedRows === 1, 'Failed to insert new row');

							// Assign primary key - not reliable, always numeric
							// if (model.primaryKey && result instanceof Object && result.insertId !== null) {
							// 	this[model.primaryKey] = result.insertId;
							// }

							typeof cb === 'function' && cb(null, this);

						case 37:
						case 'end':
							return context$3$0.stop();
					}
				}, callee$2$0, this);
			}));
		}
	}, {
		key: 'update',
		value: function update(cb) {

			console.log('update!');

			var model = this.constructor;

			// EDIT LATER
			if (!this[model.primaryKey]) {
				throw new Error('Please add a primary key in ' + JSON.stringify(this));
			}

			var set = [],
			    values = [];

			for (var att in this) {
				// if( att === model.primaryKey ){ continue; }

				var value = this[att];

				set.push('`' + att + '` = ?');

				if (value instanceof Object) {
					var _model = value.constructor;
					values.push(value[_model.primaryKey]);
				} else {
					values.push(value);
				}
			}
			values.push(this[model.primaryKey]);

			if (set.length === 0) {
				return cb(null, this);
			}

			_asynk2['default'].call(this, regeneratorRuntime.mark(function callee$2$0(resume) {
				var query, _ref5, _ref52, err, rows, fields;

				return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
					while (1) switch (context$3$0.prev = context$3$0.next) {
						case 0:
							query = 'UPDATE ' + model.tableName + ' SET ' + set + ' WHERE ' + model.primaryKey + ' = ?;';

							console.log(query, values);

							context$3$0.next = 4;
							return model._connection.query(query, values, resume);

						case 4:
							_ref5 = context$3$0.sent;
							_ref52 = _slicedToArray(_ref5, 3);
							err = _ref52[0];
							rows = _ref52[1];
							fields = _ref52[2];

							if (!err) {
								context$3$0.next = 11;
								break;
							}

							return context$3$0.abrupt('return', cb(err));

						case 11:
							if (!(rows.affectedRows !== 1)) {
								context$3$0.next = 13;
								break;
							}

							throw new Error(rows.affectedRows + ' rows affected! ' + query);

						case 13:

							cb(null, this);

						case 14:
						case 'end':
							return context$3$0.stop();
					}
				}, callee$2$0, this);
			}));
		}
	}]);

	return InstanceMethods;
})(_constructorMethods2['default']);

exports['default'] = InstanceMethods;
module.exports = exports['default'];

// Save instance
//# sourceMappingURL=instanceMethods.js.map