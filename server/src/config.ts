
import nconf = require('nconf');
import path = require('path');
/* Load */

/* Read config from file */
/* Note: TypeScript typings are WRONG for nconf */
(<any>nconf).file('credentials', path.join(__dirname, '..', 'config.credentials.json'));
(<any>nconf).file('overrides', path.join(__dirname, '..', 'config.local.json'));
(<any>nconf).file('common', path.join(__dirname, '..', 'config.json'));



export function get(key: string): any {
	const REPLACE_ENV: boolean = true;
	if (REPLACE_ENV) {
		var val: string = nconf.get(key);
		if (!val) {
			return val;
		}
		const RE: RegExp = /\$\{([^}]+)\}/;
		var g = val.match(RE);
		while (g) {
			var ev: string = process.env[g[1]];
			if (!ev) {
				ev = '<undefined>';
			}
			val = val.replace(g[0], ev);
			g = val.match(RE);
		}
		return val;
	}
	return nconf.get(key);
}
