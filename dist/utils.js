"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.buildWhere = buildWhere;
exports.structureModel = structureModel;

var _events = require('events');

var EE = (function () {
	var eventListeners = new WeakMap();

	return function EE(object) {

		var _EE = eventListeners.get(object);

		if (!_EE) {

			_EE = new _events.EventEmitter();
			_EE.setMaxListeners(0);

			eventListeners.set(object, _EE);
		}

		return _EE;
	};
})();
exports.EE = EE;

function buildWhere(where, filter) {
	if (where === undefined) where = [];
	var or = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

	if (where instanceof Array && where.length === 0) {
		return "";
	}

	return "(" + where.map(function (w) {
		return w instanceof Array ? buildWhere(w, filter, !or) : filter(w);
	}).join(or ? " OR " : " AND ") + ")";
}

;

// Helper

function structureModel(model, row) {

	var modeled = row[model.tableName];

	if (!modeled) {
		return undefined;
	}

	// Look for foreign key references
	for (var att in model.attributes) {

		var relModel = model.attributes[att];

		// Check if schema-attribute is relational
		if (relModel instanceof Function) {
			modeled[att] = structureModel(relModel, row);
		}
	}

	return modeled;
}

;
//# sourceMappingURL=utils.js.map
