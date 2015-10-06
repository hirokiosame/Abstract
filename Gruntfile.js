module.exports = function(grunt) {

	'use strict';

	require('time-grunt')(grunt);
	require('jit-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		babel: {
			options: {
				sourceMap: true,
				stage: 0
			},
			dist: {
				files: [{
					expand: true,
					src: ['*.js'],
					dest: 'dist/',
					cwd: 'src/'
				}]
			}
		},

		watch: {
			grunt: {
				files: [ 'Gruntfile.js' ]
			},
			src: {
				files: [
					'src/*'
				],
				tasks: ['_develop']
			},
			options: {
				// spawn: false
			}
		}
	});

	grunt.registerTask('default', ['babel']);
	grunt.registerTask('_develop', ['babel']);
	grunt.registerTask('develop', ['babel', 'watch']);

};