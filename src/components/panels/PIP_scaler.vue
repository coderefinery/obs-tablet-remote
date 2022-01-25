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
import {mapActions, mapGetters} from 'vuex'
import panelMixin from '@/mixins/panel'

export default {
	mixins: [panelMixin],

	computed: {
		...mapGetters('obs', ['currentScene']),
		pip_source() {
			let ret = this.currentScene.sources.filter(i => i.name == "_Camera[Hidden]")
			console.log(ret[0])
			return ret[0]
		},
		scale: {
			get({pip_source: {cx, source_cx}}) {
				console.log(cx/source_cx)
				return cx/source_cx
			},
			set(scale) {
				console.log(scale)
				this.setScale({
					scene: this.currentScene.name,
					source: this.pip_source.name,
					scale: Number(scale)
				})
			}
		}
	},
	methods: {
		...mapActions('obs', {
			setScale: 'sources/scale',
		})
	}
}

</script>
