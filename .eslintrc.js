const path = require('path') // eslint-disable-line import/no-extraneous-dependencies
const {buildConfig} = require('xo/lib/options-manager')

const xoConfig = buildConfig({
	semicolon: false,
	env: {
		jquery: true
	},
	extends: [
		'plugin:vue/recommended'
	],
	rules: {
		// 'object-curly-spacing': ['error', 'always'],
		'valid-jsdoc': 0,
		'vue/html-indent': ['error', 'tab'],
		'no-await-in-loop': 1
	},
	settings: {
		'import/resolver': {
			webpack: {
				config: path.resolve('./node_modules/@vue/cli-service/webpack.config.js')
			}
		}
	}
})

module.exports = {
	root: true,
	...xoConfig.baseConfig,
	rules: xoConfig.rules
}
