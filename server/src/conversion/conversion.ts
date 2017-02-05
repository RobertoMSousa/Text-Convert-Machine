
import mongosome = require('../mongosome');
import db = require('../main-db');


export interface IConversionSetDocument extends mongosome.IDocument {
	documentId: mongosome.ObjectID;
	delta: any;
	// created: Date;
	// status: string;
}


export var collection: mongosome.ICollection<IConversionSetDocument> = db.mongosome.registerCollection<IConversionSetDocument>('conversion');
