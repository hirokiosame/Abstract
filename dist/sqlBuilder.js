"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = {

	createTable: function createTable(schema) {

		var attributes = [];

		// Attributes
		for (var attribute in schema.attributes) {
			var opts = schema.attributes[attribute];

			if (opts instanceof Function) {

				attributes.push("`" + attribute + "` " + (opts.attributes[opts.primaryKey].type || ""));

				attributes.push("FOREIGN KEY (`" + attribute + "`) REFERENCES " + opts.tableName + " (`" + opts.primaryKey + "`) ON DELETE CASCADE ON UPDATE CASCADE");
			} else if (opts instanceof Object) {
				attributes.push("`" + attribute + "` " + (opts.type || "") + " " + (opts.misc || ""));
			}
		}

		// Primary Key
		if (typeof schema.primaryKey === "string" && schema.attributes[schema.primaryKey]) {
			attributes.push("PRIMARY KEY (`" + schema.primaryKey + "`)");
		}

		// Unique keys
		if (schema.uniqueKeys instanceof Array) {
			attributes.push("UNIQUE KEY (`" + schema.uniqueKeys.join("`, `") + "`)");
		}

		var query = "CREATE TABLE IF NOT EXISTS `" + schema.tableName + "` (\n\t\t\t" + attributes.join(",\n") + "\n\t\t) ENGINE=InnoDB DEFAULT CHARSET=latin1;";

		return query;
	},

	insertModel: function insertModel(model, instance) {

		var attributes = model.attributes;

		var insertAttributes = [],
		    values = [];

		for (var att in attributes) {

			if (!instance.hasOwnProperty(att)) {
				continue;
			}

			if (attributes[att] instanceof Function) {

				if (instance[att] instanceof attributes[att]) {
					// Insert PK
					insertAttributes.push(att);
					values.push(instance[att][attributes[att].primaryKey]);
				}
				continue;
			}

			insertAttributes.push(att);
			values.push(instance[att]);
		}

		return ["INSERT INTO `" + model.tableName + "`\n\t\t\t(" + insertAttributes + ") VALUES (" + Array(values.length).fill('?') + ")\n\t\t\t-- ON DUPLICATE KEY UPDATE " + insertAttributes.map(function (k) {
			return k + "=values(" + k + ")";
		}) + ";\n\t\t\t", values];
	},

	updateModel: function updateModel(schema, model) {}
};
module.exports = exports["default"];
//# sourceMappingURL=sqlBuilder.js.map