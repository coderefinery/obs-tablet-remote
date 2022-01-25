export const state = {
	list: [],
	types: {}
}

export const actions = {
	'connection/closed'({commit}) {
		commit('sources/reset')
	},
	async 'connection/ready'({dispatch}) {
		return dispatch('sources/reload')
	},
	async 'sources/reload'({commit, dispatch, getters}) {
		const {client} = getters

		const [
			{sources},
			{types}
		] = await Promise.all([
			client.send({'request-type': 'GetSourcesList'}),
			client.send({'request-type': 'GetSourceTypesList'})
		])

		commit('sources/types', types)
		commit('sources/list', sources)

		// Retrive volume & muted status for sources with volume
		await Promise.all(getters['sources/audioSources'].map(
			source => dispatch('sources/updateSourceVolume', source.name)
		))
	},
	async 'sources/mute'({getters: {client}}, {source, mute}) {
		await client.send({'request-type': 'ToggleMute', source, mute})
	},
	async 'sources/volume'({getters: {client}}, {source, volume}) {
		await client.send({'request-type': 'SetVolume', source, volume})
	},
	async 'sources/updateSourceVolume'({commit, getters: {client}}, name) {
		const response = await client.send({'request-type': 'GetVolume', source: name})
		commit('sources/updateAudio', response)
	},
	async 'sources/takeSourceScreenshot'({getters: {client}}, options) {
		return client.send({'request-type': 'TakeSourceScreenshot', ...options})
	},
	async 'event/SourceMuteStateChanged'({commit}, {sourceName, muted}) {
		commit('sources/updateAudio', {name: sourceName, muted})
	},
	async 'event/SourceVolumeChanged'({commit}, {sourceName, volume}) {
		commit('sources/updateAudio', {name: sourceName, volume})
	},
	async 'sources/scale'({getters: {client}}, {scene, source, scale}) {
		console.log(typeof(scale))
		client.send({'request-type': 'SetSceneItemTransform', 'scene-name': scene, 'item': source, 'x-scale': scale, 'y-scale': scale, 'rotation': 0})
	},
	async 'event/SceneItemTransformChanged'({commit}, {"scene-name": scene_name, "item-name": source_name, "item-id": id, transform}) {
		commit('sources/SceneItemTransformChanged', {scene_name, source_name, id, transform})
	}
}

export const mutations = {
	'sources/list'(state, sources) {
		state.list = sources.map(source => ({
			...source,
			volume: undefined,
			muted: undefined
		}))
	},
	'sources/reset'(state) {
		state.list = []
		state.types = {}
	},
	'sources/types'(state, types) {
		state.types = {}
		types.forEach(type => {
			state.types[type.typeId] = type
		})
	},
	'sources/updateAudio'(state, {muted, name, volume}) {
		const source = state.list.find(source => source.name === name)
		if (!source) {
			return
		}

		if (muted !== undefined) {
			source.muted = muted
		}

		if (volume !== undefined) {
			source.volume = volume
		}
	},
	'sources/SceneItemTransformChanged'(state, {scene_name, source_name, id, transform}) {
		console.log(source_name)
  	console.log(transform)
		console.log(state.list)
		const source = state.list.find(source => source.name === source_name)
		console.log(source)
		if (!source) {
			return
		}

	}
}

export const getters = {
	'sources/audioSources'(state) {
		return state.list.filter(source => sourceHasAudio(source, state.types))
	}
}

function sourceHasAudio(source, types) {
	const def = types[source.typeId]

	return def && def.caps && def.caps.hasAudio
}
