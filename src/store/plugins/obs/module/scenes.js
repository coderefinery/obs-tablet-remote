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
					const properties = await client.send({'request-type': 'GetSceneItemProperties', 'scene-name': scene.name, 'item': source.name})
					commit('scenes/SceneItemTransformChanged', {
						'scene_name': scene.name,
						'source_name':source.name,
						'scale': properties.scale.x,
						'crop_top': properties.crop.top,
						'crop_right': properties.crop.right,
						'crop_bottom': properties.crop.bottom,
						'crop_left': properties.crop.left
					})
				}
			}
		},
		'scenes/current'({getters: {client}}, {name}) {
			return client.send({'request-type': 'SetCurrentScene', 'scene-name': name})
		},
		async 'scenes/setScale'({getters: {client}}, {scene, source, scale, crop}) {
			return client.send({'request-type': 'SetSceneItemTransform', 'scene-name': scene, 'item': source, 'x-scale': scale, 'y-scale': scale, 'rotation': 0})
		},
		async 'scenes/setCrop'({getters: {client}}, {scene, source, crop}) {
			return client.send({'request-type': 'SetSceneItemCrop', 'scene-name': scene, 'item': source, 'top': crop.top, 'bottom': crop.bottom, 'left': crop.left, 'right': crop.right})
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
		'event/SceneItemTransformChanged'({commit}, {"scene-name": scene_name, "item-name": source_name, "item-id": id, transform}) {
			commit('scenes/SceneItemTransformChanged', {
				scene_name, source_name, id,
				'scale': transform.scale.x,
				'crop_top': transform.crop.top,
				'crop_right': transform.crop.right,
				'crop_bottom': transform.crop.bottom,
				'crop_left': transform.crop.left
			})
			// This forcefully triggers an update in the
			// computed properties in
			// components/panels/PIP_scaler. why changing the
			// current schene works but changing the transform
			// does not?
			commit('scenes/current', {'scene-name': ''})
			commit('scenes/current', {'scene-name': scene_name})
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
		'scenes/itemVisibilityChanged'(state, {'scene-name': sceneName, 'item-name': sourceName, 'item-visible': render}) {
			const scene = state.list.find(scene => scene.name === sceneName)

			if (scene) {
				const source = scene.sources.find(source => source.name === sourceName)
				if (source) {
					source.render = render
				}
			}
		},
		'scenes/SceneItemTransformChanged'(state, {scene_name, source_name, id, scale, crop_top, crop_right, crop_bottom, crop_left}) {
			// When the transform of scene item changes, store the
			// properties we need for the PIP adjustor
			const scene = state.list.find(scene => scene.name === scene_name)
			if (!scene) {
				return
			}

			const source = scene.sources.find(source => source.name === source_name)
			if(source) {
				source.scale = scale
				source.crop = {
					top: crop_top,
				  right: crop_right,
				  bottom: crop_bottom,
				  left: crop_left
				}
			}




		}
	}
}
