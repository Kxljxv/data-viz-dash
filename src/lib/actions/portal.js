/**
 * Simple portal action to move an element to a target (default: body)
 * @param {HTMLElement} node 
 * @param {HTMLElement|string} [target='body']
 */
export function portal(node, target = 'body') {
	let targetEl;
	
	function update(newTarget) {
		if (typeof newTarget === 'string') {
			targetEl = document.querySelector(newTarget);
		} else {
			targetEl = newTarget;
		}
		
		if (targetEl) {
			targetEl.appendChild(node);
		}
	}

	update(target);

	return {
		update,
		destroy() {
			if (node.parentElement) {
				node.parentElement.removeChild(node);
			}
		}
	};
}
