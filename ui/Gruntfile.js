'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist',
        test: 'test'
    };

    try {
        yeomanConfig.app = require('./package.json').appPath || yeomanConfig.app;
    } catch (e) {
    }

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            compass: {
                files: ['<%= yeoman.app %>/styles/**/*.{scss,sass}'],
                tasks: ['compass:debug']
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.app %>/styles/*.css',
                            '<%= yeoman.dist %>/*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
            debug: [
                '<%= yeoman.app %>/styles/*.css'
            ]
        },
        karma: {
            unit: {
                configFile: 'test/config/karma.conf.js'
            },
            auto: {
                configFile: 'test/config/karma.conf.js',
                singleRun: false,
                autoWatch: true
            }
        },
        coverage: {
            options: {
                thresholds: {
                    'statements': 56.2,
                    'branches': 47.1,
                    'functions': 47.3,
                    'lines': 56.4
                },
                dir: 'coverage',
                root: '.'
            }},
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '<%= yeoman.app %>/styles/',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/components',
                relativeAssets: true
            },
            dist: {},
            debug: {
                options: {
                    debugInfo: true
                }
            }
        },
        // Renames files for browser caching purposes
        filerev: {
          dist: {
            src: [
              '<%= yeoman.dist %>/**/*.js',
              '<%= yeoman.dist %>/**/*.css'
            ]
          }
        },
        useminPrepare: {
            html: [
                '<%= yeoman.app %>/patients/*.html',
                '<%= yeoman.app %>/clinical/*.html',
                '<%= yeoman.app %>/**/*.html',
                '<%= yeoman.app %>/adt/**/*.html',
                '<%= yeoman.app %>/common/**/*.html',
                '<%= yeoman.app %>/trends/**/*.html',
                '<%= yeoman.app %>/orders/**/*.html',
                '<%= yeoman.app %>/home/**/*.html',
                '<%= yeoman.app %>/admin/**/*.html',
                '<%= yeoman.app %>/dhis/**/*.html',
                '<%= yeoman.app %>/registration/**/*.html',
                '<%= yeoman.app %>/document-upload/**/*.html',
                '<%= yeoman.app %>/reports/**/*.html'
            ],
            css: '<%= yeoman.app %>/styles/**/*.css',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                  html: {
                    steps: {
                      js: ['concat'],
                      css: ['cssmin']
                    },
                    post: {}
                  }
                }
            }
        },
        usemin: {
            html: [
                '<%= yeoman.dist %>/patients/**/*.html',
                '<%= yeoman.dist %>/clinical/**/*.html',
                '<%= yeoman.dist %>/adt/**/*.html',
                '<%= yeoman.dist %>/common/**/*.html',
                '<%= yeoman.dist %>/trends/**/*.html',
                '<%= yeoman.dist %>/trends/**/*.html',
                '<%= yeoman.dist %>/orders/**/*.html',
                '<%= yeoman.dist %>/home/**/*.html',
                '<%= yeoman.dist %>/admin/**/*.html',
                '<%= yeoman.dist %>/dhis/**/*.html',
                '<%= yeoman.dist %>/reports/**/*.html',
                '<%= yeoman.dist %>/registration/**/*.html',
                '<%= yeoman.dist %>/document-upload/**/*.html'
            ],
            css: '<%= yeoman.dist %>/styles/**/*.css',
            options: {
                assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images']
            }
        },
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.dist %>/images'
                    }
                ]
            }
        },
        cssmin: {
            options: {
                banner: '/* Bahmni OPD minified CSS file */'
            },
            minify: {
                expand: true,
                cwd: '<%= yeoman.dist %>/styles/css/',
                src: ['**/*.css', '!**/*.min.*.css'],
                dest: '<%= yeoman.dist %>/styles/css/',
                ext: '.min.*.css'
            }
        },
        htmlmin: {
            dist: {
                options: {
                    keepClosingSlash:true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: [
                            'patients/**/*.html',
                            'clinical/**/*.html',
                            'adt/**/*.html',
                            'common/**/*.html',
                            'trends/**/*.html',
                            'orders/**/*.html',
                            'home/**/*.html',
                            'admin/**/*.html',
                            'dhis/**/*.html',
                            'reports/**/*.html',
                            'registration/**/*.html',
                            'document-upload/**/*.html'
                        ],
                        dest: '<%= yeoman.dist %>'
                    }
                ]
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,txt}',
                            '.htaccess',
                            'components/**/*',
                            'images/**/*.{gif,webp}',
                            'styles/**/*',
                            '**/*/*.json',
                            'lib/**/*'
                        ]
                    }
                ]
            }
        },
        rename: {
            minified: {
                files: [
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['patients.min.*.js'], dest: '<%= yeoman.dist %>/patients/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['clinical.min.*.js'], dest: '<%= yeoman.dist %>/clinical/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['adt.min.*.js'], dest: '<%= yeoman.dist %>/adt/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['orders.min.*.js'], dest: '<%= yeoman.dist %>/orders/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['trends.min.*.js'], dest: '<%= yeoman.dist %>/trends/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['home.min.*.js'], dest: '<%= yeoman.dist %>/home/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['admin.min.*.js'], dest: '<%= yeoman.dist %>/admin/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['dhis.min.*.js'], dest: '<%= yeoman.dist %>/dhis/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['reports.min.*.js'], dest: '<%= yeoman.dist %>/reports/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['registration.min.*.js'], dest: '<%= yeoman.dist %>/registration/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['document-upload.min.*.js'], dest: '<%= yeoman.dist %>/document-upload/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['patients.min.*.css'], dest: '<%= yeoman.dist %>/patients/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['clinical.min.*.css'], dest: '<%= yeoman.dist %>/clinical/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['adt.min.*.css'], dest: '<%= yeoman.dist %>/adt/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['trends.min.*.css'], dest: '<%= yeoman.dist %>/trends/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['orders.min.*.css'], dest: '<%= yeoman.dist %>/orders/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['home.min.*.css'], dest: '<%= yeoman.dist %>/home/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['admin.min.*.css'], dest: '<%= yeoman.dist %>/admin/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['dhis.min.*.css'], dest: '<%= yeoman.dist %>/dhis/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['reports.min.*.css'], dest: '<%= yeoman.dist %>/reports/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['registration.min.*.css'], dest: '<%= yeoman.dist %>/registration/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['document-upload.min.*.css'], dest: '<%= yeoman.dist %>/document-upload/'}
                ]
            }
        },
        hologram: {
            generate: {
                options: {
                    config: 'hologram_config.yml'
                }
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('test', ['karma:unit', 'coverage']);

    grunt.registerTask('dist', [
        'clean:dist',
        'compass:dist',
        'useminPrepare',
        'concat',
        'imagemin',
        'htmlmin',
        'cssmin',
        'copy:dist',
        'filerev',
        'usemin',
        'rename:minified'
    ]);

    grunt.registerTask('build', [
        'test',
        'dist'
    ]);

    grunt.registerTask('default', ['build']);
};
