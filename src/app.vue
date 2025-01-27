<template>
	<div
		:class="`theme-${theme}`"
		class="w-full h-full overflow-hidden m-0 font-sans flex flex-col"
	>
		<TopBar />

		<component
			:is="activeView"
			class="flex-auto overflow-hidden"
		/>

		<Settings v-if="showingSettings" />
	</div>
</template>

<script>
import {mapMutations, mapGetters, mapState} from 'vuex'

import {parseHashBang} from '@/util'

import Dashboard from '@/components/views/dashboard'
import Home from '@/components/views/home'
import Settings from '@/components/settings'
import TopBar from '@/components/layout/top-bar'

export default {
	components: {
		Dashboard,
		Home,
		Settings,
		TopBar
	},
	computed: {
		...mapGetters(['activeView']),
		...mapState(['showingSettings']),
		...mapState('settings', ['theme'])
	},
	mounted() {
		// Check if autoconnect is ready
		const vars = parseHashBang()
		if ('auto' in vars) {
			this.doAutoconnect(vars)
		}

		if ('config' in vars) {
			this.loadConfigURL(vars.config)
		}
	},
	methods: {
		async doAutoconnect(vars) {
			const response = await this.$store.dispatch('obs/connect', {
				host: vars.host,
				port: vars.port
			})
			if (response.authRequired && vars.password) {
				await this.$store.dispatch('obs/authenticate', {
					password: vars.password
				})
			}
		},
		async loadConfigURL(url) {
			console.log(url)
			this.importingLayout = true
			this.importLayoutError = false
			this.importLayoutSuccess = false

			const self = this

			// eslint no-undef is triggered by $
			$.getJSON(url, layout => { // eslint-disable-line no-undef
				const has = (object, key) => Object.hasOwnProperty.call(object, key)

				if (
					has(layout, 'nextId') &&
					has(layout, 'panels') &&
					has(layout, 'tabs')
				) {
					self.importLayout(layout)
				} else {
					console.log = 'Could not import layout from URL. Missing necessary fields.'
				}
			})
		},
		...mapMutations('layout', ['importLayout'])
	}
}
</script>

<style>
@import 'assets/styles/tailwind.css';

.svg-inline--fa {
	@apply stroke-current;
}
</style>
