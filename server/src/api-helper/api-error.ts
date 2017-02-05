
import express = require('express');


/**
 * api error code to http error code
 *
 * List of HTTP status codes
 *
 * 2xx Success
 * 200 OK
 *
 * 4xx Client Error
 * 400 Bad Request
 *     The server cannot or will not process the request due to something that is
 *     perceived to be a client error, e.g., malformed request syntax
 * 401 Unauthorized
 *     Used when authentication is required and has failed or has not yet been provided.
 * 404 Not Found
 *     The requested resource could not be found but may be available again in the future.
 *     Subsequent requests by the client are permissible.
 * 409 Conflict
 *     Indicates that the request could not be processed because of conflict in the request,
 *     such as an edit conflict in the case of multiple updates.
 *
 * 5xx Server Error
 * 500 Internal Server Error
 *     A generic error message, given when an unexpected condition was encountered
 *     and no more specific message is suitable.
 *
 */

/**
 * class used to notify the client for errors
 */
export class ApiError {
	httpCode: number;
	errorId: string;
	description: string;

	constructor(httpCode: number, errorId: string, description?: string) {
		this.httpCode = httpCode;
		this.errorId = errorId;
		this.description = description;
	}

	send(res: express.Response, details?: any): void {
		var j = {
			errorId: this.errorId,
			description: this.description,
			details: details
		};
		console.error(j);
		res.status(this.httpCode).json(j);
	}

	sendError(res: express.Response, err: Error): void {
		// If the error has a message, use it as it may contain
		// more useful info:
		if (err.message) {
			this.description = err.message;
		}
		return this.send(res, err);
	}
}

/**
 * List API errors
 */

export var UnknownError = new ApiError(500, "Unknown", "Unknown error");
export var InternalError = new ApiError(500, "InternalError", "Internal server error");
export var DatabaseError = new ApiError(500, "DatabaseError", "Database error");
export var RequiredParameterMissing = new ApiError(400, "RequiredParameterMissing", "A parameter required by the API was missing");
export var BadRequest = new ApiError(400, "BadRequest", "The server cannot process the request due to bad input data");
export var NotFound = new ApiError(404, "NotFound", "The requested resource could not be found");
/** From Stack Overflow:
In summary, a 401 Unauthorized response should be used for missing or bad authentication, and a 403 Forbidden response should be used afterwards, when the user is authenticated but isn’t authorized to perform the requested operation on the given resource.
 */
export var Unauthorized = new ApiError(401, "Unauthorized", "Authentication is required and has failed or has not yet been provided.");
export var Forbidden = new ApiError(403, "Forbidden", "Permission for this operation was denied");
