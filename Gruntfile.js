'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	var config = {
		pkg: grunt.file.readJSON('package.json'),
		formlyConfig: {
			hostname: 'localhost', // change to 0.0.0.0 to listen on all connections
			demo: 'demo',
			port: 3000,
			livereloadport: 35701
		},
		connect: {
			dev: {
				options: {
					hostname: '<%= formlyConfig.hostname %>',
					port: '<%= formlyConfig.port %>',
					base: '<%= formlyConfig.demo %>',
					livereload: '<%= formlyConfig.livereloadport %>'
				}
			}
		},
		watch: {
			livereload: {
				files: ['<%= formlyConfig.demo %>/**/*.{js,css,html}'],
				options: {
					livereload: '<%= formlyConfig.livereloadport %>'
				}
			}
		},

	};

	// Pass config to grunt
	grunt.initConfig(config);

	grunt.registerTask('dev', [
		'connect:dev',
		'watch'
	]);

	grunt.registerTask('default', ['dev']);
};
