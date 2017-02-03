
function AController(controller) {
	return function(...args) {
		args.unshift(null);
		return new (Function.prototype.bind.apply(controller, args))();
	};
}

window['AController'] = AController;
