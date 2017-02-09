/** Very lightweight wrapper and handler around native mongodb.
 * intended to completely replace mongoose
 */
import mongodb = require('mongodb');
import async = require('async');
var mongoskin = require('mongoskin');

export class Mongosome {
	/** mongoskin database object */
	public mongoSkinDB = undefined;

	constructor(private databaseAddress: string) {
	}

	/**
	 * registers the specified collection with mongosome.
	 */
	public registerCollection<T>(name: string): ICollection<T> {
		this.connect();
		return <ICollection<T>>this.mongoSkinDB.collection(name);
	}

	/**
	 * Drops the whole current database (mostly for testing).
	 */
	public dropDatabase(callback: (err: Error) => void): void {
		this.connect();
		this.mongoSkinDB.dropDatabase(callback);
	}

	/**
	 * Connects to the database. Must be called explicitly.
	 */
	private connect() {
		if (this.mongoSkinDB !== undefined) {
			return;
		}

		var mongoOptions = {
			db: {
				safe: true
			}
		};

		this.mongoSkinDB = mongoskin.MongoClient.connect(this.databaseAddress, mongoOptions);

		//// This is for internal use. It globally keeps track of all connections, and provides
		//// a means to close them.
		//// Currently, this is only used for orchestrating TDD/ tests from the Gulp file (thus, global)
		if ('mongoConnections' in global) {
			global['mongoConnections'].push(this.mongoSkinDB);
		}
		else {
			global['mongoConnections'] = [this.mongoSkinDB];
			if (!('closeAllMongoConnections' in global)) {
				global['closeAllMongoConnections'] = (finished) => {
					async.each(global['mongoConnections'], (connection: any, next) => {
						connection.close(next);
					}, (err) => {
						global['mongoConnections'] = [];
						finished();
					});
				};
			}
		}
		////

	}
}

/** "Forward declaration" of MongoDB's ObjectID, so that clients
 * can directly use mongosome.ObjectID without having to import
 * mongodb as well.
 */
export class ObjectID extends mongodb.ObjectID {
}

export function objectIDfromHexString(hexString: string): ObjectID {
	try {
		return ObjectID.createFromHexString(hexString);
	}
	catch (e) {
		return undefined;
	}
}

/** {max} We assume any document has an optional _id,
 * This is required to help with improved type-safety.
 * Derive all your document interfaces from this.
 */
export interface IDocument {
	_id?: ObjectID;
}

/** {max} I was not able to find official documentation on
 * this, however it is quite useful and appears to work fine
 * for 2.7 (and, trusting some questions on the internet, for 3.0 as well).
 */
export interface ILastError {
	updatedExisting: boolean; ///< relevant for upsert
	n: number; ///< number affected
	ok: boolean; ///< did the operation succeed?
	err?: any; ///< last error, not necessarily returned
}

export interface IPromise<T> {
	//// {max} i fill this in eventually
}

export interface IStreamOptions<T> {
	transform: (doc: T) => any;
}

export interface ICursorCountOptions {
	skip?: number; ///< The number of documents to skip
	limit?: number; ///< The maximum amounts to count before aborting
	maxTimeMS?: number; ///< Number of milliseconds to wait before aborting the query
	hint?: number; ///< An index name hint for the query
	readPreference?: any;
}

/* Copied from mongodb.d.ts, but using generic to enforce Type Safety */
export interface ICursor<T> {
	/// Mostly up-to-date {{max}} at of 2015-11-23
	/// (couple of methods missing which we never use)
	/// http://mongodb.github.io/node-mongodb-native/2.0/api/Cursor.html
    batchSize(batchSize: number): ICursor<T>;

	clone(): ICursor<T>;
    close(callback: (err: Error, result: any) => void): void;
    count(applySkipLimit: boolean, callback: (err: Error, count: number) => void): void;
    count(applySkipLimit: boolean, options: ICursorCountOptions, callback: (err: Error, count: number) => void): void;

    explain(callback: (err: Error, result: any) => void): void;

	filter(filter: Object): ICursor<T>;
	forEach(iterator: (doc: T) => void, endCallback: (error: Error) => void): void;

	hasNext(callback: (error: Error, result: boolean) => void): IPromise<T>;
	hint(hint: Object): ICursor<T>;

    isClosed(): boolean;

    limit(limit: number): ICursor<T>;
	map(transform: (doc: T) => any): void;
	map<K>(transform: (doc: T) => K): void;
	next(callback: (error: Error, result?: T) => void): void;

    rewind(): ICursor<T>;

    setReadPreference(preference: string): ICursor<T>;
    skip(skip: number): ICursor<T>;
	snapshot(snapshot: boolean): ICursor<T>;
	sort(keyOrList: any /* string|Array|Object */, direction?: number): ICursor<T>;

    toArray(callback: (err: Error, results: T[]) => any): void;

	project(value: Object): ICursor<T>;
	project<K>(value: Object): ICursor<K>; ///< Project will likely change the type
}


export interface ICommandCursor<T> {
	/// i don't care
}


/// {max} This is not documented. XXX UPDATE: NOW, it is documented ... will fix
export interface IInsertResult<T> {
	result: {
		ok: number;
		n: number;
	};
	ops: Array<T>;
	insertedCount: number;
	insertedIds: Array<ObjectID>;
};

export interface IInsertOneResult<T> {
	insertedCount: number; ///< Total amount of documents inserted (wtf??)
	ops: Array<T>;
	insertedId: ObjectID;
	connection: Object;
	result: {
		ok: number; ///< 1 iff ok
		n: number; ///< total count (duh)
	};
};

/// {max} new
export interface IUpsertEntry {
	index: number;
	_id: ObjectID;
};

/// {max} new
/// http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#~updateWriteOpResult
export interface IUpdateResult {
	result: {
		ok: number;	///< is 1 if the command executed correctly
		nModified: number; ///< the total count of documents modified
		n: number; ///< the total count of documents scanned
	};
	connection: any;		///< The connection object used for the operation
	matchedCount: number;	///< The number of documents that matched the filter
	modifiedCount: number;	///< The number of documents that were modified
	upsertedCount: number;	///< The number of documents upserted
	upsertedId: {			///< Upserted id
		_id: ObjectID;
	};
};

///{max}
export interface IUpdateOptions {
	upsert?: boolean; ///< Update operation is an upsert. Default: false
	w?: number | string; ///< write concern. Default: null
	wtimeout?: number; ///< write concern timeout. Default: null
	j?: boolean; ///< Specify a journal write concern
	bypassDocumentValidation?: boolean; ///< Allow driver to bypass schema validation in MongoDB 3.2 or higher
};

///{max}
export interface IMongoDBPromise {
	/// undefined for now..
};

///{max}
export interface IDeleteResult {
	result: {
		ok: number; ///< 1 iff command executed correctly
		n: number; ///< The total count of documents deleted
	};
	connection: any; ///< The connection object used for the operation
	deletedCount: number; ///< The number of documents deleted
};

///{max}
export interface IDeleteOptions {
	w?: number | string; ///< write concern
	wtimeout?: number;
	j?: boolean;
	bypassDocumentValidation?: boolean;
};

export interface IAggregateOptions {
	readPreference?: string; ///< PRIMARY, PRIMARY_PREFERRED, SECONDARY, SECONDARY_PREFERRED, NEAREST
	cursor?: Object; ///< Return the query as cursor
	batchSize?: number; ///< The batch size for the cursor
	explain?: boolean; ///< Explain returns the aggregation execution plan
	allowDiskUse?: boolean; ///< lets the server know if it can use disk to store temporary results for the aggregation (default: false)
	maxTimeMS?: number; ///< specifies a cumulative time limit in ms for procssing operations on the cursor
	bypassDocumentValidation?: boolean; ///< see above somewhere
};

export interface IBulkWriteOpResult {
	insertedCount: number;
	matchedCount: number;
	modifiedCount: number;
	deletedCount: number;
	upsertedCount: number;
	insertedIds: Object;
	upsetedIds: Object;
	result: Object;
};

export interface ICollectionCountOptions {
	limit?: number; ///< Note: according to doc this was 'boolean'
	skip?: number; ///< same
	hint?: string;
	readPreference?: string;
};

export interface IDropIndexOptions {
	w?: number | string;
	wtimeout?: number;
	j?: boolean;
};

export interface IFindOneAndDeleteOptions {
	projection?: Object;
	sort?: Object;
	maxTimeMS?: number;
};

export interface IFindAndModifyWriteOpResult<T> {
	value: T; ///< Document returned
	lastErrorObject: Object;
	ok: number; ///< 1 iff command executed correctly
};

export interface IFindOneAndWriteOptions {
	projection?: Object; ///< Limits the fields to return for all matching documents
	sort?: Object; ///< Determines which document the operation modifies if the query selects multiple documents
	maxTimeMS?: number; ///< ...
	upsert?: boolean;
	returnOriginal?: boolean;
};

export interface IInsertOptions {
	w?: number | string;
	wtimeout?: number | string;
	j?: boolean;
	serializeFunctions?: boolean;
	forceServerObjectId?: boolean;
};

export interface IMapReduceOptions {
	readPreferences?: string;
	out?: Object;
	query?: Object;
	sort?: Object;
	limit?: number;
	keeptemp?: boolean;
	finalize?: Function | string;
	scope?: Object;
	jsMode?: boolean;
	verbose?: boolean;
	bypassDocumentValidation?: boolean;
};

export interface IReplaceOneOptions {
	upsert?: boolean;
	w?: number | string;
	wtimeout?: number;
	j?: boolean;
	bypassDocumentValidation?: boolean;
};

export interface ICollection<T> {
	/// Properties on every collection:
	collectionName: string;
	namespace: string;
	writeConcern: Object;
	readConcert: Object;
    hint: Object;

	/// DO NOT INSTANTIATE DIRECTLY (c.f. 2.0 documentation)
    // new (db: mongodb.Db, collectionName: string, pkFactory?: Object, options?: mongodb.CollectionCreateOptions): ICollection<T>; // is this right?

    aggregate(pipeline: any[], callback: (err: Error, results: T[]) => void): void;
    aggregate(pipeline: any[], options: IAggregateOptions, callback: (err: Error, results: T[]) => void): void;

	/// aggregate will likely project
    aggregate<K>(pipeline: any[], callback: (err: Error, results: K[]) => void): void;
    aggregate<K>(pipeline: any[], options: IAggregateOptions, callback: (err: Error, results: K[]) => void): void;

	bulkWrite(operations: Array<any>, options: Object, callback: (error: Error, result: IBulkWriteOpResult) => void): void;

    count(callback: (err: Error, result: number) => void): void; ///< XXX not official
    count(query: Object, callback: (err: Error, result: number) => void): void;
    count(query: Object, options: ICollectionCountOptions, callback: (err: Error, result: number) => void): void;

    createIndex(fieldOrSpec: any, callback: (err: Error, indexName: string) => void): void;
    createIndex(fieldOrSpec: any, options: mongodb.IndexOptions, callback: (err: Error, indexName: string) => void): void;

	/// ommitted: createIndexes

	deleteMany(filter: Object, callback?: (err: Error, result: IDeleteResult) => void): IMongoDBPromise;
	deleteMany(filter: Object, options: IDeleteOptions, callback?: (err: Error, result: IDeleteResult) => void): IMongoDBPromise;

	deleteOne(filter: Object, callback?: (err: Error, result: IDeleteResult) => void): IMongoDBPromise;
	deleteOne(filter: Object, options: IDeleteOptions, callback?: (err: Error, result: IDeleteResult) => void): IMongoDBPromise;

	distinct(key: string, query: Object, callback: (err: Error, result: any) => void): IMongoDBPromise;
	distinct(key: string, query: Object, options: { readPreferences: string; }, callback: (err: Error, result: any) => void): IMongoDBPromise;

    drop(callback?: (err: Error, result: any) => void): IMongoDBPromise;

    dropIndex(indexName: string, callback: (err: Error, result: any) => void): IMongoDBPromise;
    dropIndex(indexName: string, options: IDropIndexOptions, callback: (err: Error, result: any) => void): IMongoDBPromise;

	dropIndexes(callback: (err: Error, result: any) => void): IMongoDBPromise;

    find(callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;

	findOneAndDelete(filter: Object, callback: (error: Error, result: IFindAndModifyWriteOpResult<T>) => void): IMongoDBPromise;
	findOneAndDelete(filter: Object, options: IFindOneAndDeleteOptions, callback: (error: Error, result: IFindAndModifyWriteOpResult<T>) => void): IMongoDBPromise;

	findOneAndReplace(filter: Object, replacement: T, callback: (error: Error, result: IFindAndModifyWriteOpResult<T>) => void): IMongoDBPromise;
	findOneAndReplace(filter: Object, replacement: T, options: IFindOneAndWriteOptions, callback: (error: Error, result: IFindAndModifyWriteOpResult<T>) => void): IMongoDBPromise;

	findOneAndUpdate(filter: Object, update: Object, options: IFindOneAndWriteOptions, callback: (error: Error, result: IFindAndModifyWriteOpResult<T>) => void): IMongoDBPromise;

    geoHaystackSearch(x: number, y: number, callback: Function): void;
    geoHaystackSearch(x: number, y: number, options: Object, callback: Function): void;

    geoNear(x: number, y: number, callback: Function): void;
    geoNear(x: number, y: number, options: Object, callback: Function): void;

    group(keys: Object | Array<any> | Function, condition: Object, initial: Object, reduce: Function, finalize: Function, command: boolean, options: { readPreference: string }, callback: (err: Error, result: any) => void): void;

	indexes(callback: (err: Error, result: any) => void): IMongoDBPromise;

	indexExists(indexes: string | Array<string>, callback: (error: Error, result: any) => void): IMongoDBPromise;

    indexInformation(options: { full?: boolean; }, callback: (error: Error, result: any) => void): IMongoDBPromise;

	initializeOrderedBulkOp(options: Object, callback: Function): void; ///< TODO
	initializeUnorderedBulkOp(options: Object); ///< TODO

	insertMany(docs: Array<T>, callback: (err: Error, result: IInsertResult<T>) => void): IMongoDBPromise;
	insertMany(docs: Array<T>, options: IInsertOptions, callback: (err: Error, result: IInsertResult<T>) => void): IMongoDBPromise;

	insertOne(doc: T, callback: (err: Error, result: IInsertOneResult<T>) => void): IMongoDBPromise;
	insertOne(doc: T, options: IInsertOptions, callback: (err: Error, result: IInsertOneResult<T>) => void): IMongoDBPromise;

    isCapped(callback: (err: Error, result: any) => void): IMongoDBPromise;

	listIndexes(options?: { batchSize?: number; }): ICommandCursor<T>;

	mapReduce(
		map: Function | string,
		reduce: Function | string,
		callback: (err: Error, result: any) => void): IMongoDBPromise;

	mapReduce(
		map: Function | string,
		reduce: Function | string,
		options: IMapReduceOptions,
		callback: (err: Error, result: any) => void): IMongoDBPromise;

    options(callback: (err: Error, result: any) => void): IMongoDBPromise;

	parallelCollectionScan(options: Object, callback: Function): IMongoDBPromise; /// TODO: fill in

    reIndex(callback: (err: Error, result: any) => void): IMongoDBPromise;

    rename(newName: string, callback?: (err: Error, result: ICollection<T>) => void): IMongoDBPromise;
    rename(newName: string, options: { dropTarget?: boolean; }, callback?: (err: Error, result: ICollection<T>) => void): IMongoDBPromise;

	replaceOne(filter: Object, doc: T, callback: (err: Error, result: IUpdateResult) => void): IMongoDBPromise;
	replaceOne(filter: Object, doc: T, options: IReplaceOneOptions, callback: (err: Error, result: IUpdateResult) => void): IMongoDBPromise;

    stats(options: { readPreference: string; scale: number }, callback: (err: Error, results: mongodb.CollStats) => void): void;
    stats(callback: (err: Error, results: mongodb.CollStats) => void): void;

	updateMany(filter: Object, update: any, callback?: (err: Error, result: IUpdateResult) => void): IMongoDBPromise;
	updateMany(filter: Object, update: any, options: IUpdateOptions, callback?: (err: Error, result: IUpdateResult) => void): IMongoDBPromise;


	updateOne(filter: Object, update: any, callback?: (err: Error, result: IUpdateResult) => void): IMongoDBPromise;
	updateOne(filter: Object, update: any, options: IUpdateOptions, callback?: (err: Error, result: IUpdateResult) => void): IMongoDBPromise;


	// DEPRECATED
    insert(query: T | T[], callback: (err: Error, result: IInsertResult<T>) => void): void;
    insert(query: T | T[], options: { safe?: any; continueOnError?: boolean; keepGoing?: boolean; serializeFunctions?: boolean; }, callback: (err: Error, result: IInsertResult<T>) => void): void;


	// DEPRECATED
    save(doc: any, callback: (err: Error, result: any) => void): void;
    save(doc: any, options: { safe: any; }, callback: (err: Error, result: any) => void): void;


	// DEPRECATED:
    findAndModify(query: Object, sort: any[], doc: Object, callback: (err: Error, result: any) => void): void;
    findAndModify(query: Object, sort: any[], doc: Object, options: { safe?: any; remove?: boolean; upsert?: boolean; new?: boolean; }, callback: (err: Error, result: any) => void): void;

	// DEPRECATED:
    findAndRemove(query: Object, sort?: any[], callback?: (err: Error, result: any) => void): void;
    findAndRemove(query: Object, sort?: any[], options?: { safe: any; }, callback?: (err: Error, result: any) => void): void;

	// DEPRECATED
    find(selector: Object, callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;
    find(selector: Object, fields: any, callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;
	/// latest:
    find(query: Object, fields?: Object, skip?: number, limit?: number, timeout?: number): ICursor<T>;
    /// REMOVED? find(selector: Object, options: mongodb.CollectionFindOptions, callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;
    /// REMOVED? find(selector: Object, fields: any, options: mongodb.CollectionFindOptions, callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;
    find(selector: Object, fields: any, skip: number, limit: number, callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;
    find(selector: Object, fields: any, skip: number, limit: number, timeout: number, callback?: (err: Error, result: ICursor<T>) => void): ICursor<T>;

	// DEPRECATED
    findOne(callback: (err: Error, result: T) => void): ICursor<T>;
    findOne(selector: Object, callback: (err: Error, result: T) => void): ICursor<T>;
    findOne(selector: Object, fields: any, callback: (err: Error, result: T) => void): ICursor<T>;
    findOne(selector: Object, options: mongodb.FindOneOptions, callback: (err: Error, result: T) => void): ICursor<T>;
    findOne(selector: Object, fields: any, options: mongodb.FindOneOptions, callback: (err: Error, result: T) => void): ICursor<T>;
    findOne(selector: Object, fields: any, skip: number, limit: number, callback: (err: Error, result: T) => void): ICursor<T>;
    findOne(selector: Object, fields: any, skip: number, limit: number, timeout: number, callback: (err: Error, result: T) => void): ICursor<T>;


	/// DEPRECATED:
    ensureIndex(fieldOrSpec: any, callback: (err: Error, indexName: string) => void): void;
    ensureIndex(fieldOrSpec: any, options: mongodb.IndexOptions, callback: (err: Error, indexName: string) => void): void;

    /// DEPRECATED dropAllIndexes(callback: Function): void;
    // dropIndexes = dropAllIndexes


}
