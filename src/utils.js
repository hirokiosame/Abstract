import {EventEmitter} from 'events';

let EE = (function() {
	let eventListeners = new WeakMap();

	return function EE(object) {

		let _EE = eventListeners.get(object);

		if (!_EE) {

			_EE = new EventEmitter();
			_EE.setMaxListeners(0);

			eventListeners.set(object, _EE);
		}

		return _EE;
	};
})();
export {EE};



export function buildWhere(where = [], filter, or = false){
	if( where instanceof Array && where.length === 0 ){ return ""; }

	return "(" + where.map( w => (( w instanceof Array ) ? buildWhere(w, filter, !or) : filter(w)) )
			.join(or ? " OR " : " AND ") + ")";
};



// Helper
export function structureModel(model, row){

	let modeled = row[model.tableName];

	if( !modeled ){ return undefined; }

	// Look for foreign key references
	for( let att in model.attributes ){

		let relModel = model.attributes[att];

		// Check if schema-attribute is relational
		if( relModel instanceof Function ){
			modeled[att] = structureModel(relModel, row);
		}
	}
	
	return modeled;
};