#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const index_1 = require("./index");
const argv = yargs_1.default
    .option('port', {
    alias: 'p',
    describe: 'port to run inspector proxy on',
    type: 'number',
    default: 8080,
}).argv;
(0, index_1.runProxyServer)(argv.port);
