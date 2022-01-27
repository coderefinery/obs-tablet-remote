<template>
	<panel-wrapper content-class="flex flex-col">
		<template slot="name">
			Adjust element transform
		</template>

		<h5 class="px-2">
			Scale {{ settings.itemName }}
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
			Crop {{ settings.itemName }}
		</h5>
		<div
			v-if="currentScene"
			class="flex-grow button-grid has-per-row-6"
		>
			<span>
				<input
					id="crop"
					v-model="crop"
					name="crop"
					class="radio mx-4"
					type="radio"
					:value="1"
				>
				<label for="html"> None </label><br>
			</span>
			<span>
				<input
					id="crop"
					v-model="crop"
					name="crop"
					class="radio mx-4"
					type="radio"
					:value="2"
				>
				<label for="html"> 1 person </label><br>
			</span>
			<span>
				<input
					id="crop"
					v-model="crop"
					name="crop"
					class="radio mx-4"
					type="radio"
					:value="3"
				>
				<label for="html"> 2 people </label><br>
			</span>
			<span>
				<input
					id="crop"
					v-model="crop"
					name="crop"
					class="radio mx-4"
					type="radio"
					:value="4"
				>
				<label for="html"> 3-4 people </label><br>
			</span>
			<span>
				<input
					id="crop"
					v-model="crop"
					name="crop"
					class="radio mx-4"
					type="radio"
					:value="5"
				>
				<label for="html"> 5-6 people </label><br>
			</span>
		</div>

		<template #settings>
			<div class="field">
				<label
					:for="`settings-${id}-item-name`"
					class="label"
				>Choose scene item:</label>
				<select
					:id="`settings-${id}-item-name`"
					v-model="itemName"
					class="select"
				>
					<option :value="undefined">
						None
					</option>
					<option
						v-for="item in allSceneItems"
						:key="item"
						:value="item"
					>
						{{ item }}
					</option>
				</select>
			</div>
			<div class="field">
				<label class="label">Crop values:</label>
				<table class="p-2">
				<tr>
					<th></th>
					<th> top </th>
					<th> right </th>
					<th> bottom </th>
					<th> left </th>
				</tr>
				<tr>
					<td>
					1 person
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(2,'top')" @input="setCropFactor($event, 2, 'top')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(2,'right')" @input="setCropFactor($event, 2, 'right')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(2,'bottom')" @input="setCropFactor($event, 2, 'bottom')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(2,'left')" @input="setCropFactor($event, 2, 'left')">
					</td>
				</tr>
				<tr>
					<td>
					2 people
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(3,'top')" @input="setCropFactor($event, 3, 'top')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(3,'right')" @input="setCropFactor($event, 3, 'right')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(3,'bottom')" @input="setCropFactor($event, 3, 'bottom')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(3,'left')" @input="setCropFactor($event, 3, 'left')">
					</td>
				</tr>
				<tr>
					<td>
					3-4 people
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(4,'top')" @input="setCropFactor($event, 4, 'top')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(4,'right')" @input="setCropFactor($event, 4, 'right')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(4,'bottom')" @input="setCropFactor($event, 4, 'bottom')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(4,'left')" @input="setCropFactor($event, 4, 'left')">
					</td>
				</tr>
				<tr>
					<td>
					5-6 people
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(5,'top')" @input="setCropFactor($event, 5, 'top')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(5,'right')" @input="setCropFactor($event, 5, 'right')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(5,'bottom')" @input="setCropFactor($event, 5, 'bottom')">
					</td><td>
					<input type="number" class="w-12" :value="getCropFactor(5,'left')" @input="setCropFactor($event, 5, 'left')">
					</td>
				</tr>
				</table>
			</div>
		</template>
	</panel-wrapper>
</template>

<script>
import {mapState, mapActions} from 'vuex'
import panelMixin from '@/mixins/panel'

export default {
	mixins: [panelMixin],

	data() {
		return {
			defaultCropFactors: {
				1: {top: 0, bottom: 0, left: 0, right: 0},
				2: {top: 0, bottom: 0, left: 59, right: 59},
				3: {top: 90, bottom: 0, left: 12, right: 12},
				4: {top: 4, bottom: 0, left: 60, right: 60},
				5: {top: 50, bottom: 0, left: 11, right: 11}
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
		allSceneItems: {
			get() {
				const sources = []
				for (const scene of this.sceneslist) {
					for (const item of scene.sources) {
						if (!sources.includes(item.name)) {
							sources.push(item.name)
						}
					}
				}

				console.log(sources)
				return sources
			}
		},
		PIPSource: {
			get() {
				const currentScene = this.sceneslist.find(i => i.name === this.currentScene)
				if (!currentScene) {
					return undefined
				}

				const sources = currentScene.sources
				if (!sources) {
					return undefined
				}

				const pipSource = sources.find(i => i.name === this.settings.itemName)
				if (pipSource) {
					return pipSource
				}

				return undefined
			}
		},
		scale: {
			get({PIPSource}) {
				if (PIPSource) {
					return PIPSource.scale
				}

				return 0
			},
			set(scale) {
				const pipSource = this.PIPSource
				if (!pipSource) {
					return 0
				}

				this.setScale({
					scene: this.currentScene,
					source: pipSource.name,
					scale: Number(scale)
				})
			}
		},
		crop: {
			get({PIPSource}) {
				if (PIPSource) {
					for (const i in this.settings.cropFactors) {
						if (this.isSameCrop(PIPSource.crop, this.settings.cropFactors[i])) {
							return i
						}
					}
				}

				return undefined
			},
			set(crop) {
				const pipSource = this.PIPSource
				if (!pipSource) {
					return 0
				}

				const newCrop = this.settings.cropFactors[crop]
				this.setCrop({
					scene: this.currentScene,
					source: pipSource.name,
					crop: {
						top: newCrop.top,
						bottom: newCrop.bottom,
						left: newCrop.left,
						right: newCrop.right
					}
				})
			}
		},
		...mapState('obs', {
			currentScene: state => state.scenes.current,
			sceneslist: state => state.scenes.list
		})
	},
	created() {
  	if(!this.settings.cropFactors){
		  this.setSetting('cropFactors', this.defaultCropFactors)
		}
	},
	methods: {
		...mapActions('obs', {
			setScale: 'scenes/setScale',
			setCrop: 'scenes/setCrop'
		}),
		getCropFactor(index, direction){
			return this.settings.cropFactors[index][direction]
		},
		setCropFactor(e, index, direction){
		  const current_crop = crop
		  let cropFactors = this.settings.cropFactors
			cropFactors[index][direction] = e.target.value
			this.setSetting('cropFactors', cropFactors)
			console.log(cropFactors)
			crop = 0
			crop = current_crop
		},
		isSameCrop(crop1, crop2) {
			if (!crop1 || !crop2) {
				return false
			}

			for (const key of ['top', 'bottom', 'left', 'right']) {
				if (crop1[key] === undefined || crop2[key] === undefined ||
          crop1[key] !== crop2[key]) {
					return false
				}
			}

			return true
		}
	}
}

</script>

<style>
  th {
    text-align: left;
  }
  td{
    padding: 0 6px 0 6px;
	}
</style>
