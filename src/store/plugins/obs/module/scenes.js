export default {
	state: {
		current: null,
		list: []
	},
	actions: {
		'connection/closed'({commit}) {
			commit('scenes/reset')
		},
		async 'connection/ready'({dispatch}) {
			return dispatch('scenes/reload')
		},
		async 'scenes/reload'({commit, getters: {client}}) {
			const {'current-scene': current, scenes} = await client.send({'request-type': 'GetSceneList'})

			commit('scenes/list', {scenes})
			commit('scenes/current', {
				'scene-name': current
			})
			for (const scene of scenes) {
				for (const source of scene.sources) {
					// Can we do without this:
					// eslint-disable-next-line no-await-in-loop
					const properties = await client.send({'request-type': 'GetSceneItemProperties', 'scene-name': scene.name, item: source.name})
					commit('scenes/SceneItemTransformChanged', {
						sceneName: scene.name,
						sourceName: source.name,
						scale: properties.scale.x,
						cropTop: properties.crop.top,
						cropRight: properties.crop.right,
						cropBottom: properties.crop.bottom,
						cropLeft: properties.crop.left
					})
				}
			}

			commit('scenes/kick_update', {'scene-name': current})
		},
		'scenes/current'({getters: {client}}, {name}) {
			return client.send({'request-type': 'SetCurrentScene', 'scene-name': name})
		},
		async 'scenes/setScale'({getters: {client}}, {scene, source, scale}) {
			return client.send({'request-type': 'SetSceneItemTransform', 'scene-name': scene, item: source, 'x-scale': scale, 'y-scale': scale, rotation: 0})
		},
		async 'scenes/setCrop'({getters: {client}}, {scene, source, crop}) {
			return client.send({'request-type': 'SetSceneItemCrop', 'scene-name': scene, item: source, top: crop.top, bottom: crop.bottom, left: crop.left, right: crop.right})
		},
		async 'sources/render'({getters: {client}}, {scene, source, render}) {
			return client.send({
				'request-type': 'SetSourceRender',
				'scene-name': scene,
				source,
				render
			})
		},
		'event/SwitchScenes'({commit}, data) {
			commit('scenes/current', data)
		},
		'event/ScenesChanged'({dispatch}) {
			return dispatch('scenes/reload')
		},
		'event/SceneItemAdded'({dispatch}) {
			return dispatch('scenes/reload')
		},
		'event/SceneItemRemoved'({dispatch}) {
			return dispatch('scenes/reload')
		},
		// No event from obs-websocket (in 4.2.0 at least) for something like 'SceneItemChanged' (like rename)
		'event/SceneItemVisibilityChanged'({commit}, data) {
			commit('scenes/itemVisibilityChanged', data)
		},
		'event/SceneItemTransformChanged'({commit}, {'scene-name': sceneName, 'item-name': sourceName, 'item-id': id, transform}) {
			commit('scenes/SceneItemTransformChanged', {
				sceneName, sourceName, id,
				scale: transform.scale.x,
				cropTop: transform.crop.top,
				cropRight: transform.crop.right,
				cropBottom: transform.crop.bottom,
				cropLeft: transform.crop.left
			})
			commit('scenes/kick_update', {'scene-name': sceneName})
		}
	},
	getters: {
		currentScene(state) {
			return state.list.find(scene => scene.name === state.current)
		}
	},
	mutations: {
		'scenes/current'(state, {'scene-name': name}) {
			state.current = name
		},
		'scenes/list'(state, {scenes}) {
			state.list = scenes
		},
		'scenes/reset'(state) {
			state.current = null
			state.list = []
		},
		'scenes/kick_update'(state, {'scene-name': name}) {
			// This forcefully triggers an update in the
			// computed properties in
			// components/panels/PIP_scaler. why changing the
			// current scene works but changing the transform
			// does not?
			state.current = null
			state.current = name
		},
		'scenes/itemVisibilityChanged'(state, {'scene-name': sceneName, 'item-name': sourceName, 'item-visible': render}) {
			const scene = state.list.find(scene => scene.name === sceneName)

			if (scene) {
				const source = scene.sources.find(source => source.name === sourceName)
				if (source) {
					source.render = render
				}
			}
		},
		// eslint-disable-next-line no-unused-vars
		'scenes/SceneItemTransformChanged'(state, {sceneName, sourceName, _id, scale, cropTop, cropRight, cropBottom, cropLeft}) {
			// When the transform of scene item changes, store the
			// properties we need for the PIP adjustor
			const scene = state.list.find(scene => scene.name === sceneName)
			if (!scene) {
				return
			}

			const source = scene.sources.find(source => source.name === sourceName)
			if (source) {
				source.scale = scale
				source.crop = {
					top: cropTop,
					right: cropRight,
					bottom: cropBottom,
					left: cropLeft
				}
			}
		}
	}
}
