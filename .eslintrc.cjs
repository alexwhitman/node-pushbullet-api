module.exports = {
	root          : true,
	parserOptions : {
		ecmaVersion : 'latest',
		sourceType  : 'module'
	},
	env : {
		node : true,
		es6  : true
	},
	extends : 'eslint:recommended',
	rules   : {
		'array-bracket-spacing' : [
			'error',
			'always',
			{
				objectsInArrays : false,
				arraysInArrays  : false
			}
		],
		'brace-style' : [
			'error',
			'stroustrup',
			{
				allowSingleLine : true
			}
		],
		'comma-dangle' : [
			'error',
			'never'
		],
		'eol-last' : [
			'error',
			'always'
		],
		eqeqeq : [
			'error',
			'always'
		],
		indent : [
			'error',
			'tab',
			{
				SwitchCase : 1
			}
		],
		'key-spacing' : [
			'error',
			{
				beforeColon : true,
				afterColon  : true,
				align       : 'colon'
			}
		],
		'linebreak-style' : [
			'error',
			'unix'
		],
		'no-trailing-spaces' : [
			'error'
		],
		'quote-props' : [
			'error',
			'as-needed'
		],
		quotes : [
			'error',
			'single',
			{
				avoidEscape : true
			}
		],
		semi : [
			'error',
			'always'
		],
		'space-infix-ops' : [
			'error'
		]
	}
};
