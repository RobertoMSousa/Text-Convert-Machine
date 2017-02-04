
import mongosome = require('../mongosome');
import db = require('../main-db');


export interface ISampleSetDocument extends mongosome.IDocument {
	refId: mongosome.ObjectID;
}

export var collection: mongosome.ICollection<ISampleSetDocument> = db.mongosome.registerCollection<ISampleSetDocument>('sample');
