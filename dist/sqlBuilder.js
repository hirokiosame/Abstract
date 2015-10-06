"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = {

	createTable: function createTable(model) {

		var attributes = [];

		// Attributes
		for (var attribute in model.attributes) {
			var opts = model.attributes[attribute];

			if (opts instanceof Function) {

				attributes.push("`" + attribute + "` " + (opts.attributes[opts.primaryKey].type || ""));

				attributes.push("FOREIGN KEY (`" + attribute + "`) REFERENCES " + opts.tableName + " (`" + opts.primaryKey + "`) ON DELETE CASCADE ON UPDATE CASCADE");
			} else if (opts instanceof Object) {
				attributes.push("`" + attribute + "` " + (opts.type || "") + " " + (opts.misc || ""));
			}
		}

		// Primary Key
		if (typeof model.primaryKey === "string" && model.attributes[model.primaryKey]) {
			attributes.push("PRIMARY KEY (`" + model.primaryKey + "`)");
		}

		// Unique keys
		if (model.uniqueKeys instanceof Array) {
			attributes.push("UNIQUE KEY (`" + model.uniqueKeys.join("`, `") + "`)");
		}

		var query = "CREATE TABLE IF NOT EXISTS `" + model.tableName + "` (\n\t\t\t" + attributes.join(",\n") + "\n\t\t) ENGINE=InnoDB DEFAULT CHARSET=latin1;";

		return query;
	},

	insertModel: function insertModel(model) {

		var attributes = model.attributes;

		var insertAttributes = [],
		    values = [];

		for (var att in attributes) {

			if (!this.hasOwnProperty(att)) {
				continue;
			}

			if (attributes[att] instanceof Function) {

				if (this[att] instanceof attributes[att]) {
					// Insert PK
					insertAttributes.push(att);
					values.push(this[att][attributes[att].primaryKey]);
				}
				continue;
			}

			insertAttributes.push(att);
			values.push(this[att]);
		}

		return ["INSERT INTO `" + model.tableName + "`\n\t\t\t(" + insertAttributes + ") VALUES (" + Array(values.length).fill('?') + ")\n\t\t\t-- ON DUPLICATE KEY UPDATE " + insertAttributes.map(function (k) {
			return k + "=values(" + k + ")";
		}) + ";\n\t\t\t", values];
	},

	updateModel: function updateModel(model) {

		var set = [],
		    values = [];

		for (var att in model.attributes) {
			// if( att === model.primaryKey ){ continue; }

			var value = this[att];

			set.push("`" + att + "` = ?");

			if (value instanceof Object) {
				var _model = value.constructor;
				values.push(value[_model.primaryKey]);
			} else {
				values.push(value);
			}
		}
		values.push(this[model.primaryKey]);

		if (set.length === 0) {
			return [null, null];
		}

		var query = "UPDATE " + model.tableName + " SET " + set + " WHERE " + model.primaryKey + " = ?;";

		return [query, values];
	}
};
module.exports = exports["default"];
//# sourceMappingURL=sqlBuilder.js.map
