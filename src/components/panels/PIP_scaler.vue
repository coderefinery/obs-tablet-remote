<template>
	<panel-wrapper content-class="flex flex-col">
		<template slot="name">
			Picture in Picture scale
		</template>

		<h3 class="p-2 text-center font-bold">
			Picture in Picture scale
		</h3>

		<div
			v-if="currentScene"
			class="flex-grow button-grid has-per-row-1 overflow-y-auto"
		>
			<input
				v-model="scale"
				class="flex-1 w-full mx-2 slider"
				type="range"
				min="0"
				max="1"
				step="0.01"
			>
		</div>

	</panel-wrapper>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'
import panelMixin from '@/mixins/panel'

export default {
	mixins: [panelMixin],

	computed: {
		scale: {
			get({PIPSource: {scale}}) {
				return scale
			},
			set(scale) {
				let pip_source = this.PIPSource
				if(!pip_source){
					return 0
				}
				this.setScale({
					scene: this.currentScene,
					source: pip_source.name,
					scale: Number(scale)
				})
			}
		},
		...mapState('obs', {
			currentScene: state => state.scenes.current,
			sceneslist: state => state.scenes.list,
			PIPSource(state) {
				let currentScene = this.sceneslist.find(i => i.name == this.currentScene)
				if(!currentScene || !currentScene.sources){
					return undefined
				}
				let pip_source = currentScene.sources.find(i => i.name == "_Camera[Hidden]")
				if(pip_source){
					return pip_source
				}
				return undefined
			}
		}),
	},
	methods: {
		...mapActions('obs', {
			setScale: 'scenes/setScale',
		}),

	}
}

</script>
