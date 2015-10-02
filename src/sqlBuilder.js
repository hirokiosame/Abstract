export default {

	createTable (schema) {

		let attributes = [];


		// Attributes
		for( let attribute in schema.attributes ){
			let opts = schema.attributes[attribute];

			if( opts instanceof Function ){

				attributes.push(`\`${attribute}\` ${opts.attributes[opts.primaryKey].type || ""}`);	

				attributes.push(`FOREIGN KEY (\`${attribute}\`) REFERENCES ${opts.tableName} (\`${opts.primaryKey}\`) ON DELETE CASCADE ON UPDATE CASCADE`);	
			}

			else if( opts instanceof Object ){
				attributes.push(`\`${attribute}\` ${opts.type || ""} ${opts.misc || ""}`);	
			}

		}

		// Primary Key
		if( typeof schema.primaryKey === "string" && schema.attributes[schema.primaryKey] ){
			attributes.push("PRIMARY KEY (`" + schema.primaryKey + "`)");
		}

		// Unique keys
		if( schema.uniqueKeys instanceof Array ){
			attributes.push("UNIQUE KEY (`" + schema.uniqueKeys.join("`, `") + "`)");
		}


		let query = `CREATE TABLE IF NOT EXISTS \`${schema.tableName}\` (
			${attributes.join(",\n")}
		) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

		return query;
	},

	insertModel (model, instance) {

		const attributes = model.attributes;

		let insertAttributes = [],
			values = [];

		for (let att in attributes) {

			if (!(instance.hasOwnProperty(att))) { continue; }

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

		return [
			`INSERT INTO \`${model.tableName}\`
			(${insertAttributes}) VALUES (${Array(values.length).fill('?')})
			-- ON DUPLICATE KEY UPDATE ${insertAttributes.map((k) => `${k}=values(${k})`)};
			`,
			values
		];
	},

	updateModel (schema, model) {

	}
};