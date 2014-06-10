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
                configFile: 'test/config/testacular.conf.js'
            },
            e2e: {
                configFile: 'test/config/testacular-e2e.conf.js'
            },
            auto: {
                configFile: 'test/config/testacular.conf.js',
                autoWatch: true,
                singleRun: false
            }
        },
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
                '<%= yeoman.app %>/registration/**/*.html',
                '<%= yeoman.app %>/document-upload/**/*.html'
            ],
            css: '<%= yeoman.app %>/styles/.css/**/*.css',
            options: {
                dest: '<%= yeoman.dist %>'
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
                '<%= yeoman.dist %>/registration/**/*.html',
                '<%= yeoman.dist %>/document-upload/**/*.html',
            ],
            css: '<%= yeoman.dist %>/styles/**/*.css',
            options: {
                dirs: ['<%= yeoman.dist %>']
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
                src: ['**/*.css', '!**/*.min.css'],
                dest: '<%= yeoman.dist %>/styles/css/',
                ext: '.min.css'
            }
        },
        htmlmin: {
            dist: {
                options: {
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
                            'registration/**/*.html',
                            'document-upload/**/*.html'
                        ],
                        dest: '<%= yeoman.dist %>'
                    }
                ]
            }
        },
        ngmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/patients',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/patients'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/clinical',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/clinical'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/adt',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/adt'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/trends',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/trends'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/orders',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/orders'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/home',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/home'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/registration',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/registration'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/document-upload',
                        src: '**/*.js',
                        dest: '<%= yeoman.dist %>/document-upload'
                    }
                ]
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/scripts.js': [
                        '<%= yeoman.dist %>/scripts/scripts.js'
                    ]
                }
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
                            'lib/**/*'
                        ]
                    }
                ]
            }
        },
        rename: {
            minified: {
                files: [
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['patients.min.js'], dest: '<%= yeoman.dist %>/patients/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['clinical.min.js'], dest: '<%= yeoman.dist %>/clinical/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['adt.min.js'], dest: '<%= yeoman.dist %>/adt/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['orders.min.js'], dest: '<%= yeoman.dist %>/orders/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['trends.min.js'], dest: '<%= yeoman.dist %>/trends/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['home.min.js'], dest: '<%= yeoman.dist %>/home/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['registration.min.js'], dest: '<%= yeoman.dist %>/registration/'},
                    {expand: true, cwd: '<%= yeoman.dist %>/..', src: ['emergency.min.js'], dest: '<%= yeoman.dist %>/registration/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['document-upload.min.js'], dest: '<%= yeoman.dist %>/document-upload/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['patients.min.css'], dest: '<%= yeoman.dist %>/patients/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['clinical.min.css'], dest: '<%= yeoman.dist %>/clinical/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['adt.min.css'], dest: '<%= yeoman.dist %>/adt/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['trends.min.css'], dest: '<%= yeoman.dist %>/trends/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['orders.min.css'], dest: '<%= yeoman.dist %>/orders/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['home.min.css'], dest: '<%= yeoman.dist %>/home/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['registration.min.css'], dest: '<%= yeoman.dist %>/registration/'},
                    {expand: true, cwd: '<%= yeoman.dist %>/..', src: ['emergency.min.css'], dest: '<%= yeoman.dist %>/registration/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['document-upload.min.css'], dest: '<%= yeoman.dist %>/document-upload/'}
                ]
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('test', [
        'clean:debug',
        'compass:debug',
        'karma:unit'
    ]);

    grunt.registerTask('dist', [
        'clean:dist',
        'compass:dist',
        'useminPrepare',
        'concat',
        'imagemin',
        'htmlmin',
        'cssmin',
        'copy:dist',
        'ngmin',
        //  ented since it is breaking angular. Possibly because of $rootScope
        //'uglify',
        'usemin',
        'rename:minified'
    ]);

    grunt.registerTask('build', [
        'test',
        'dist'
    ]);

    grunt.registerTask('default', ['build']);
};
