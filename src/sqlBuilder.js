export default {

	createTable (model) {

		let attributes = [];


		// Attributes
		for( let attribute in model.attributes ){
			let opts = model.attributes[attribute];

			if( opts instanceof Function ){

				attributes.push(`\`${attribute}\` ${opts.attributes[opts.primaryKey].type || ""}`);	

				attributes.push(`FOREIGN KEY (\`${attribute}\`) REFERENCES ${opts.tableName} (\`${opts.primaryKey}\`) ON DELETE CASCADE ON UPDATE CASCADE`);	
			}

			else if( opts instanceof Object ){
				attributes.push(`\`${attribute}\` ${opts.type || ""} ${opts.misc || ""}`);	
			}

		}

		// Primary Key
		if( typeof model.primaryKey === "string" && model.attributes[model.primaryKey] ){
			attributes.push("PRIMARY KEY (`" + model.primaryKey + "`)");
		}

		// Unique keys
		if( model.uniqueKeys instanceof Array ){
			attributes.push("UNIQUE KEY (`" + model.uniqueKeys.join("`, `") + "`)");
		}


		let query = `CREATE TABLE IF NOT EXISTS \`${model.tableName}\` (
			${attributes.join(",\n")}
		) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;

		return query;
	},

	insertModel (model) {

		const attributes = model.attributes;

		let insertAttributes = [],
			values = [];

		for (let att in attributes) {

			if (!(this.hasOwnProperty(att))) { continue; }

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

		return [
			`INSERT INTO \`${model.tableName}\`
			(${insertAttributes}) VALUES (${Array(values.length).fill('?')})
			-- ON DUPLICATE KEY UPDATE ${insertAttributes.map((k) => `${k}=values(${k})`)};
			`,
			values
		];
	},

	updateModel (model) {

		let set = [],
			values = [];

		for (let att in model.attributes) {
			// if( att === model.primaryKey ){ continue; }

			let value = this[att];

			set.push(`\`${att}\` = ?`);

			if (value instanceof Object) {
				let _model = value.constructor;
				values.push(value[_model.primaryKey]);
			}else{
				values.push(value);
			}
		}
		values.push(this[model.primaryKey]);


		if (set.length === 0) {
			return [null, null];
		}


		let query = `UPDATE ${model.tableName} SET ${set} WHERE ${model.primaryKey} = ?;`;

		return [query, values];
	}
};