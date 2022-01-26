<template>
	<panel-wrapper content-class="flex flex-col">
		<template slot="name">
			Picture in Picture scale
		</template>

		<h5 class="px-2">
			Scale {{ this.settings.itemName }}
		</h5>

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


    <template #settings>
			<h3 class="text-xl mb-2">
				Transition Scene
			</h3>
			<div class="field">
				<label
					:for="`settings-${id}-item-name`"
					class="label"
				>Item to scale:</label>
				<select
					:id="`settings-${id}-item-name`"
					v-model="itemName"
					class="select"
				>
					<option :value="undefined">
						None
					</option>
					<option
						v-for="item in currentSceneItems"
						:key="item.name"
						:value="item.name"
					>
						{{ item.name }}
					</option>
				</select>
			</div>
		</template>

	</panel-wrapper>
</template>



<script>
import {mapState, mapActions, mapGetters} from 'vuex'
import panelMixin from '@/mixins/panel'

export default {
	mixins: [panelMixin],

	computed: {
		itemName: {
			get() {
				return this.settings.itemName
			},
			set(value) {
				this.setSetting('itemName', value)
			}
		},
		currentSceneItems: {
			get() {
				let currentScene = this.sceneslist.find(i => i.name == this.currentScene)
				if(currentScene){
					return currentScene.sources
				}
				return undefined
			},
		},
	  PIPSource: {
			get(){
				let sources = this.currentSceneItems
				if(!sources){
					return undefined
				}
				let pip_source = sources.find(i => i.name == this.settings.itemName)
				if(pip_source){
					return pip_source
				}
				return undefined
			}
		},
		scale: {
			get({PIPSource}) {
				if(PIPSource){
					return PIPSource.scale
				}
				return 0
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
			sceneslist: state => state.scenes.list
		}),
	},
	methods: {
		...mapActions('obs', {
			setScale: 'scenes/setScale',
		}),

	}
}

</script>
