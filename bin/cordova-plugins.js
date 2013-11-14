#!/usr/bin/env node

(function() {
    "use strict";
    var path = require("path"),
        fs = require("fs"),
        exit = require("exit"),
        nopt = require("nopt"),
        clc = require('cli-color'),
        shell = require("shelljs"),
        // prompt = require( "prompt" ),
        tmp = shell.tempdir(),
        pluginsfile = tmp + "plugins.json",
        knownOpts = {
            "dir": path
        },
        shortHands = {
            "d": ["--dir", tmp]
        },
        parsed = nopt(knownOpts, shortHands, process.argv, 2),
        args = process.argv.splice(2);

    // json format from http://registry.cordova.io
    // "se.sanitarium.cordova.exitapp":{
    //    "name":"se.sanitarium.cordova.exitapp",
    //    "description":"Implements navigator.app.exitApp on WP8",
    //    "dist-tags":{
    //       "latest":"1.0.0"
    //    },
    //    "maintainers":[
    //       {
    //          "name":"gaqzi",
    //          "email":"ba@sanitarium.se"
    //       }
    //    ],
    //    "time":{
    //       "modified":"2013-11-06T07:56:10.217Z"
    //    },
    //    "versions":{
    //       "1.0.0":"latest"
    //    },
    //    "keywords":[
    //       "cordova",
    //       "terminate"
    //    ]
    // }

    function printPluginList(obj, filter) {
        var plugin;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key !== '_updated') {
                    plugin = obj[key];
                    if (!filter || (filter && filter.trim() !== '' &&
                        ((plugin.name.indexOf(filter) !== -1) || (plugin.description && plugin.description.indexOf(filter) !== -1)))) {
                        shell.echo("Name:  " + plugin.name.trim());
                        shell.echo("Description:  " + (plugin.description ? plugin.description.trim() : "No description available."));
                        shell.echo("Version:  " + plugin["dist-tags"].latest.trim());
                        shell.echo("Last Modified:  " + new Date(plugin.time.modified));
                        shell.echo(clc.greenBright("Url:  http://registry.cordova.io/" + key + "/-/" + key + "-" + plugin["dist-tags"].latest.trim() + ".tgz \n"));
                    }
                }
            }
        }
    }

    function retrievePluginList() {
        shell.exec("curl -s -o " + pluginsfile + " http://registry.cordova.io/-/all 2>&1");
        var plugins = require(pluginsfile);
        return plugins;
    }

    if ((args.length === 0) || ((args.length === 1) && (args[0].toLowerCase() === 'list'))) {
        var list = retrievePluginList();
        printPluginList(list || {});
    }
    else {
        var directory = parsed.dir,
            command = directory ? parsed.argv.remain[1] : parsed.argv.remain[0],
            plugin = directory ? parsed.argv.remain[2] : parsed.argv.remain[1];

        switch (command.toLowerCase()) {
            case "search":
                var list = retrievePluginList();
                printPluginList(list || {}, plugin);
                break;
            case "get":
                directory = directory || tmp;
                shell.exec("curl -s -o " + directory + plugin.substring(plugin.lastIndexOf("/")) + " " + plugin + " 2>&1");
                shell.echo(directory + plugin.substring(plugin.lastIndexOf("/")));
                break;
            default:
        }
    }
})();