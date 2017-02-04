
import mongosome = require('../mongosome');
import db = require('../main-db');


export interface IConversionSetDocument extends mongosome.IDocument {
	refId: mongosome.ObjectID;
}

export var collection: mongosome.ICollection<IConversionSetDocument> = db.mongosome.registerCollection<IConversionSetDocument>('conversion');
