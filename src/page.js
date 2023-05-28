/** 
 * This file is part of Minos
 *
 * Copyright (C) 2023 ebmaj7 <ebmaj7@proton.me>
 *
 * Minos is a hack. You can use it according to the terms and
 * conditions of the Hacking License (see licenses/HACK.txt)
 */ 

/**
 * Portions of this file are Copyright (C) 2020 Andrea Cardaci <cyrus.and@gmail.com>
 * (see licenses/MIT.txt)
 */

function Page(url){
	this._responseBodyCounter = 0;
	this.url = url;
	this.firstRequestId = undefined;
	this.firstRequestMs = undefined;
	this.domContentEventFiredMs = undefined;
	this.loadEventFiredMs = undefined;
	this.entries = new Map();
}

Page.prototype.processEvent = function(method, params){
	const methodName = `_${method.replace('.', '_')}`;
	if(methodName in Page.prototype){
		const handler = Page.prototype[methodName];
		handler(params);
	}
}

Page.prototype._Network_requestWillBeSent = function(params) {
	const {requestId, initiator, timestamp, redirectResponse} = params;
	// skip data URI
	if (params.request.url.match('^data:')) {
		return;
	}
	// the first is the first request
	if (!this.firstRequestId && initiator.type === 'other') {
		this.firstRequestMs = timestamp * 1000;
		this.firstRequestId = requestId;
	}
	// redirect responses are delivered along the next request
	if (redirectResponse) {
		const redirectEntry = this.entries.get(requestId);
		// craft a synthetic response params
		redirectEntry.responseParams = {
			response: redirectResponse
		};
		// set the redirect response finished when the redirect
		// request *will be sent* (this may be an approximation)
		redirectEntry.responseFinishedS = timestamp;
		redirectEntry.encodedResponseLength = redirectResponse.encodedDataLength;
		// since Chrome uses the same request id for all the
		// redirect requests, it is necessary to disambiguate
		const newId = requestId + '_redirect_' + timestamp;
		// rename the previous metadata entry
		this.entries.set(newId, redirectEntry);
		this.entries.delete(requestId);
	}
	// initialize this entry
	this.entries.set(requestId, {
		requestParams: params,
		responseParams: undefined,
		responseLength: 0, // built incrementally
		encodedResponseLength: undefined,
		responseFinishedS: undefined,
		responseBody: undefined,
		responseBodyIsBase64: undefined,
		newPriority: undefined
	});
};
