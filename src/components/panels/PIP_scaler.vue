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

		<h5 class="px-2">
			Crop {{ this.settings.itemName }}
		</h5>
		<div
			v-if="currentScene"
			class="flex-grow button-grid has-per-row-6"
		>
			<span>
  			<input
  				v-model="crop"
  				name="crop"
  				class="radio mx-4"
  				type="radio"
  				id="crop"
  				:value="1"
  			>
  			<label for="html"> None </label><br>
			</span>
			<span>
  			<input
  				v-model="crop"
  				name="crop"
  				class="radio mx-4"
  				type="radio"
  				id="crop"
  				:value="2"
  			>
  			<label for="html"> 2 people </label><br>
			</span>
			<span>
  			<input
  				v-model="crop"
  				name="crop"
  				class="radio mx-4"
  				type="radio"
  				id="crop"
  				:value="3"
  			>
  			<label for="html"> 3-4 people </label><br>
			</span>
			<span>
  			<input
  				v-model="crop"
  				name="crop"
  				class="radio mx-4"
  				type="radio"
  				id="crop"
  				:value="4"
  			>
  			<label for="html"> 5-6 people </label><br>
			</span>
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

	data() {
		return {
			crop_factors: {
				1: {'top':  0, 'bottom':  0, 'left':  0, 'right':  0, },
    		2: {'top':  0, 'bottom':  0, 'left': 59, 'right':  59, },
    		3: {'top': 90, 'bottom':  0, 'left': 12, 'right': 12, },
    		4: {'top':  4, 'bottom':  0, 'left': 60, 'right': 60, },
    		5: {'top': 50, 'bottom':  0, 'left': 11, 'right': 11, },
			}
    }
	},
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
		crop: {
			get({PIPSource}) {
				if(PIPSource){
					for(let i in this.crop_factors){
						if(this.is_same_crop(PIPSource.crop, this.crop_factors[i])){
							return i
						}
					}
			  }
				return undefined
			},
			set(crop) {
			  let pip_source = this.PIPSource
			  if(!pip_source){
			  	return 0
			  }
				let new_crop = this.crop_factors[crop]
				this.setCrop({
					scene: this.currentScene,
					source: pip_source.name,
					crop: {
					  top: new_crop.top,
					  bottom: new_crop.bottom,
						left: new_crop.left,
						right: new_crop.right
				  }
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
			setCrop: 'scenes/setCrop',
		}),
		is_same_crop(crop1, crop2){
		  if(!crop1 || !crop2){
				return false
			}
			for(let key of ["top", "bottom", "left", "right"]){
				if(crop1[key] == undefined || crop2[key] == undefined ||
				   crop1[key] != crop2[key]){
					return false
				}
			}
			return true
		}
	}
}

</script>
