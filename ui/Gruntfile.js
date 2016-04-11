'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist',
        test: 'test',
        root: '.'
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
        jshint: {
            options:{
                force: true,
                jshintrc: '.jshintrc',
                verbose: true,
                reporter: require('jshint-stylish')

            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/**/*.js',
                '!<%= yeoman.app %>/**/*.min.js',
                '!<%= yeoman.app %>/components/**/*.js',
                '!<%= yeoman.app %>/lib/**/*.js',
                '!app/lib/**/*.js'
            ]
        },
        karma: {
            unit: {
                configFile: 'test/config/karma.conf.js'
            },
            chrome: {
                configFile: 'test/config/karma.chrome.conf.js'
            },
            android: {
                configFile: 'test/config/karma.android.conf.js'
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
                    'statements': 64.6,
                    'branches': 54.0,
                    'functions': 56.2,
                    'lines': 64.6
                },
                dir: 'coverage',
                root: '.'
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
        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/**/*.js',
                    '<%= yeoman.dist %>/**/*.css',
                    '!<%= yeoman.dist %>/initWorker.js',
                    '!<%= yeoman.dist %>/components/sw-toolbox/sw-toolbox.js',
                    '!<%= yeoman.dist %>/components/offline/*.js',
                    '!<%= yeoman.dist %>/worker.js'
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
                '<%= yeoman.dist %>/orders/**/*.html',
                '<%= yeoman.dist %>/home/**/*.html',
                '<%= yeoman.dist %>/admin/**/*.html',
                '<%= yeoman.dist %>/dhis/**/*.html',
                '<%= yeoman.dist %>/offline/**/*.html',
                '<%= yeoman.dist %>/reports/**/*.html',
                '<%= yeoman.dist %>/registration/**/*.html',
                '<%= yeoman.dist %>/document-upload/**/*.html'
            ],
            css: '<%= yeoman.dist %>/styles/**/*.css',
            options: {
                assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
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
                    keepClosingSlash: true
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
                            'orders/**/*.html',
                            'home/**/*.html',
                            'offline/**/*.html',
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
                            '*.{ico,txt,html,js}',
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
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['clinical.*.js'],
                        dest: '<%= yeoman.dist %>/clinical/'
                    },
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['adt.*.js'], dest: '<%= yeoman.dist %>/adt/'},
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['orders.*.js'],
                        dest: '<%= yeoman.dist %>/orders/'
                    },
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['home.*.js'], dest: '<%= yeoman.dist %>/home/'},
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['admin.*.js'],
                        dest: '<%= yeoman.dist %>/admin/'
                    },
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['dhis.*.js'], dest: '<%= yeoman.dist %>/dhis/'},
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['offline.*.js'], dest: '<%= yeoman.dist %>/offline/'},
                    {expand: true, cwd: '<%= yeoman.root %>', src: ['common.*.js'], dest: '<%= yeoman.dist %>/'},
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['reports.*.js'],
                        dest: '<%= yeoman.dist %>/reports/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['registration.*.js'],
                        dest: '<%= yeoman.dist %>/registration/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['document-upload.*.js'],
                        dest: '<%= yeoman.dist %>/document-upload/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['patients.min.*.css'],
                        dest: '<%= yeoman.dist %>/patients/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['clinical.*.css'],
                        dest: '<%= yeoman.dist %>/clinical/'
                    },
                    {expand: true, cwd: '<%= yeoman.dist %>', src: ['adt.*.css'], dest: '<%= yeoman.dist %>/adt/'},
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['orders.*.css'],
                        dest: '<%= yeoman.dist %>/orders/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['home.*.css'],
                        dest: '<%= yeoman.dist %>/home/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['admin.*.css'],
                        dest: '<%= yeoman.dist %>/admin/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['dhis.*.css'],
                        dest: '<%= yeoman.dist %>/dhis/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['offline.*.css'],
                        dest: '<%= yeoman.dist %>/offline/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['reports.*.css'],
                        dest: '<%= yeoman.dist %>/reports/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['registration.*.css'],
                        dest: '<%= yeoman.dist %>/registration/'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['document-upload.*.css'],
                        dest: '<%= yeoman.dist %>/document-upload/'
                    }
                ]
            }
        },
        hologram: {
            generate: {
                options: {
                    config: 'hologram_config.yml'
                }
            }
        },
        ngAnnotate: {
            options: {
                remove: true,
                add: true
            },
            files: {
                expand: true,
                cwd: '<%= yeoman.dist %>',
                src: ['**/*.min.*.js'],
                dest: '<%= yeoman.dist %>'
            }
        },
        uglify:{
            options: {
                mangle: false
            },
            files:{
                expand: true,
                cwd: '<%= yeoman.dist %>',
                src: ['**/*.min.*.js'],
                dest: '<%= yeoman.dist %>'
            }
        },
        preprocess : {
            options: {
                context : {
                    DEBUG: 'production'
                }
            },
            multifile : {
                files : {
                    '<%= yeoman.dist %>/registration.min.js' : '<%= yeoman.dist %>/registration.min.js',
                    '<%= yeoman.dist %>/admin.min.js' : '<%= yeoman.dist %>/admin.min.js',
                    '<%= yeoman.dist %>/adt.min.js' : '<%= yeoman.dist %>/adt.min.js',
                    '<%= yeoman.dist %>/document-upload.min.js' : '<%= yeoman.dist %>/document-upload.min.js',
                    '<%= yeoman.dist %>/home.min.js' : '<%= yeoman.dist %>/home.min.js',
                    '<%= yeoman.dist %>/orders.min.js' : '<%= yeoman.dist %>/orders.min.js',
                    '<%= yeoman.dist %>/reports.min.js' : '<%= yeoman.dist %>/reports.min.js',
                    '<%= yeoman.dist %>/clinical.min.js' : '<%= yeoman.dist %>/clinical.min.js'
                }
            },
            web: {
                src: ['<%= yeoman.dist %>/**/index.html'],
                options: {
                    inline: true,
                    context: {
                        ONLINE: true
                    }
                }
            },
            chrome: {
                src: ['<%= yeoman.dist %>/**/index.html'],
                options: {
                    inline: true,
                    context: {
                        CHROME: true,
                        OFFLINE: true
                    }
                }
            },
            android: {
                src: '<%= yeoman.dist %>/**/index.html',
                options: {
                    inline: true,
                    context: {
                        ANDROID: true,
                        OFFLINE: true
                    }
                }
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('test', ['karma:unit', 'coverage']);

    grunt.registerTask('chrometest', ['karma:chrome']);

    grunt.registerTask('androidtest', ['karma:android']);

    grunt.registerTask('dist', [
        'clean:dist',
        'compass:dist',
        'useminPrepare',
        'ngAnnotate',
        'concat',
        'preprocess',
        'imagemin',
        'htmlmin',
        'cssmin',
        'copy:dist',
        'filerev',
        'usemin'
    ]);

    grunt.registerTask('bundle', [
        'npm-install',
        'bower-install',
        'jshint',
        'clean:dist',
        'compass:dist',
        'useminPrepare',
        'ngAnnotate',
        'concat',
        'preprocess',
        'imagemin',
        'htmlmin',
        'cssmin',
        'copy:dist',
        'usemin'
    ]);

    grunt.registerTask('build', [
        'npm-install',
        'bower-install',
        'jshint',
        'dist'
    ]);

    grunt.registerTask('tests', function(app){
        grunt.task.run((app || '') + 'test');
    });

    grunt.registerTask('uglify-and-rename', [
        'uglify',
        'rename:minified'
    ]);

    grunt.registerTask('default', ['build', 'tests', 'uglify-and-rename', 'preprocess:web']);
    grunt.registerTask('dev', ['build', 'tests', 'rename', 'preprocess:web']);
    grunt.registerTask('chrome', ['bundle', 'tests:chrome', 'uglify-and-rename', 'preprocess:chrome']);
    grunt.registerTask('android', ['bundle', 'tests:android', 'uglify-and-rename', 'preprocess:android']);

    grunt.registerTask('bower-install', 'install dependencies using bower', function () {
        var exec = require('child_process').exec;
        var cb = this.async();
        exec('bower install', function (err, stdout) {
            console.log(stdout);
            cb();
        });
    });

    grunt.registerTask('npm-install', 'install dependencies using npm', function () {
        var exec = require('child_process').exec;
        var cb = this.async();
        exec('npm install', function (err, stdout) {
            console.log(stdout);
            cb();
        });
    });
};
