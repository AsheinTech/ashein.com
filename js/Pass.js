import {
	OrthographicCamera,
	PlaneGeometry,
	Mesh,
	Scene
} from './three.module.js';

class Pass {
	constructor() {
		this.enabled = true;
		this.needsSwap = true;
		this.clear = false;
		this.renderToScreen = false;
	}

	setSize(width, height) {}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {
		console.warn('THREE.Pass: .render() must be implemented in derived pass.');
	}
}

// ✅ FullScreenQuad helper
const _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const _geometry = new PlaneGeometry(2, 2);

class FullScreenQuad {
	constructor(material) {
		this._mesh = new Mesh(_geometry, material);
		this._scene = new Scene();
		this._camera = _camera;
		this._scene.add(this._mesh);
	}

	dispose() {
		this._mesh.geometry.dispose();
	}

	render(renderer) {
		renderer.render(this._scene, this._camera);
	}

	get material() {
		return this._mesh.material;
	}

	set material(value) {
		this._mesh.material = value;
	}
}

export { Pass, FullScreenQuad };
