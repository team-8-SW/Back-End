module.exports = {
	parser: '@typescript-eslint/parser',
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	rules: {
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'variableLike',
				format: ['camelCase'],
			},
		],
		'@typescript-eslint/no-non-null-assertion': 'off',
	},
};
