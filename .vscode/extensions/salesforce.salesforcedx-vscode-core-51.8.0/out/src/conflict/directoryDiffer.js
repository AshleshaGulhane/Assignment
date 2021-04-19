"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class CommonDirDirectoryDiffer {
    constructor() { }
    diff(localSourcePath, remoteSourcePath) {
        const localSet = this.listFiles(localSourcePath);
        const different = new Set();
        // process remote files to generate differences
        let scannedRemote = 0;
        this.walkFiles(remoteSourcePath, '', stats => {
            scannedRemote++;
            if (localSet.has(stats.relPath)) {
                const file1 = path.join(localSourcePath, stats.relPath);
                const file2 = path.join(remoteSourcePath, stats.relPath);
                if (this.filesDiffer(file1, file2)) {
                    different.add(stats.relPath);
                }
            }
        });
        return {
            localRoot: localSourcePath,
            remoteRoot: remoteSourcePath,
            different,
            scannedLocal: localSet.size,
            scannedRemote
        };
    }
    filesDiffer(one, two) {
        const buffer1 = fs.readFileSync(one);
        const buffer2 = fs.readFileSync(two);
        return !buffer1.equals(buffer2);
    }
    listFiles(root) {
        const results = new Set();
        this.walkFiles(root, '', stats => {
            results.add(stats.relPath);
        });
        return results;
    }
    walkFiles(root, subdir, callback) {
        const fullDir = path.join(root, subdir);
        const subdirList = fs.readdirSync(fullDir);
        subdirList.forEach(filename => {
            const fullPath = path.join(fullDir, filename);
            const stat = fs.statSync(fullPath);
            const relPath = path.join(subdir, filename);
            if (stat && stat.isDirectory()) {
                this.walkFiles(root, relPath, callback);
            }
            else {
                callback({ filename, subdir, relPath });
            }
        });
    }
}
exports.CommonDirDirectoryDiffer = CommonDirDirectoryDiffer;
//# sourceMappingURL=directoryDiffer.js.map