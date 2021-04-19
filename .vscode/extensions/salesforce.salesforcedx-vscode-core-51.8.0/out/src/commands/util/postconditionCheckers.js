"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const channels_1 = require("../../channels");
const conflict_1 = require("../../conflict");
const messages_1 = require("../../messages");
const notifications_1 = require("../../notifications");
const settings_1 = require("../../settings");
const sfdxProject_1 = require("../../sfdxProject");
const telemetry_1 = require("../../telemetry");
const util_1 = require("../../util");
const sourcePathStrategies_1 = require("./sourcePathStrategies");
class EmptyPostChecker {
    check(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            return inputs;
        });
    }
}
exports.EmptyPostChecker = EmptyPostChecker;
/* tslint:disable-next-line:prefer-for-of */
class OverwriteComponentPrompt {
    check(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (inputs.type === 'CONTINUE') {
                const { data } = inputs;
                // normalize data into a list when processing
                const componentsToCheck = data instanceof Array ? data : [data];
                const foundComponents = componentsToCheck.filter(component => this.componentExists(component));
                if (foundComponents.length > 0) {
                    const toSkip = yield this.promptOverwrite(foundComponents);
                    // cancel command if cancel clicked or if skipping every file to be retrieved
                    if (!toSkip || toSkip.size === componentsToCheck.length) {
                        return { type: 'CANCEL' };
                    }
                    if (data instanceof Array) {
                        inputs.data = componentsToCheck.filter(selection => !toSkip.has(selection));
                    }
                }
                return inputs;
            }
            return { type: 'CANCEL' };
        });
    }
    componentExists(component) {
        const { fileName, type, outputdir } = component;
        const info = util_1.MetadataDictionary.getInfo(type);
        const pathStrategy = info
            ? info.pathStrategy
            : sourcePathStrategies_1.PathStrategyFactory.createDefaultStrategy();
        return this.getFileExtensions(component).some(extension => {
            const path = path_1.join(util_1.getRootWorkspacePath(), pathStrategy.getPathToSource(outputdir, fileName, extension));
            return fs_1.existsSync(path);
        });
    }
    getFileExtensions(component) {
        const info = util_1.MetadataDictionary.getInfo(component.type);
        let metadataSuffix;
        if (component.suffix) {
            metadataSuffix = component.suffix;
        }
        else if (info && info.suffix) {
            metadataSuffix = info.suffix;
        }
        else {
            notifications_1.notificationService.showErrorMessage(messages_1.nls.localize('error_overwrite_prompt'));
            telemetry_1.telemetryService.sendException('OverwriteComponentPromptException', `Missing suffix for ${component.type}`);
        }
        const extensions = [`.${metadataSuffix}-meta.xml`];
        if (info && info.extensions) {
            extensions.push(...info.extensions);
        }
        return extensions;
    }
    promptOverwrite(foundComponents) {
        return __awaiter(this, void 0, void 0, function* () {
            const skipped = new Set();
            for (let i = 0; i < foundComponents.length; i++) {
                const options = this.buildDialogOptions(foundComponents, skipped, i);
                const choice = yield notifications_1.notificationService.showWarningModal(this.buildDialogMessage(foundComponents, i), ...options);
                const othersCount = foundComponents.length - i;
                switch (choice) {
                    case messages_1.nls.localize('warning_prompt_overwrite'):
                        break;
                    case messages_1.nls.localize('warning_prompt_skip'):
                        skipped.add(foundComponents[i]);
                        break;
                    case `${messages_1.nls.localize('warning_prompt_overwrite_all')} (${othersCount})`:
                        return skipped;
                    case `${messages_1.nls.localize('warning_prompt_skip_all')} (${othersCount})`:
                        return new Set(foundComponents.slice(i));
                    default:
                        return; // Cancel
                }
            }
            return skipped;
        });
    }
    buildDialogMessage(foundComponents, currentIndex) {
        const existingLength = foundComponents.length;
        const current = foundComponents[currentIndex];
        let body = '';
        for (let j = currentIndex + 1; j < existingLength; j++) {
            // Truncate components to show if there are more than 10 remaining
            if (j === currentIndex + 11) {
                const otherCount = existingLength - currentIndex - 11;
                body += messages_1.nls.localize('warning_prompt_other_not_shown', otherCount);
                break;
            }
            const { fileName, type } = foundComponents[j];
            body += `${type}:${fileName}\n`;
        }
        const otherFilesCount = existingLength - currentIndex - 1;
        return messages_1.nls.localize('warning_prompt_overwrite_message', current.type, current.fileName, otherFilesCount > 0
            ? messages_1.nls.localize('warning_prompt_other_existing', otherFilesCount)
            : '', body);
    }
    buildDialogOptions(foundComponents, skipped, currentIndex) {
        const choices = [messages_1.nls.localize('warning_prompt_overwrite')];
        const numOfExistingFiles = foundComponents.length;
        if (skipped.size > 0 || skipped.size !== numOfExistingFiles - 1) {
            choices.push(messages_1.nls.localize('warning_prompt_skip'));
        }
        if (currentIndex < numOfExistingFiles - 1) {
            const othersCount = numOfExistingFiles - currentIndex;
            choices.push(`${messages_1.nls.localize('warning_prompt_overwrite_all')} (${othersCount})`, `${messages_1.nls.localize('warning_prompt_skip_all')} (${othersCount})`);
        }
        return choices;
    }
}
exports.OverwriteComponentPrompt = OverwriteComponentPrompt;
class ConflictDetectionChecker {
    constructor(messages) {
        this.messages = messages;
    }
    check(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!settings_1.sfdxCoreSettings.getConflictDetectionEnabled()) {
                return inputs;
            }
            if (inputs.type === 'CONTINUE') {
                const usernameOrAlias = yield this.getDefaultUsernameOrAlias();
                if (!usernameOrAlias) {
                    return {
                        type: 'CANCEL',
                        msg: messages_1.nls.localize('conflict_detect_no_default_username')
                    };
                }
                const defaultPackageDir = yield sfdxProject_1.SfdxPackageDirectories.getDefaultPackageDir();
                if (!defaultPackageDir) {
                    return {
                        type: 'CANCEL',
                        msg: messages_1.nls.localize('conflict_detect_no_default_package_dir')
                    };
                }
                const config = {
                    usernameOrAlias,
                    packageDir: defaultPackageDir,
                    manifest: inputs.data
                };
                const results = yield conflict_1.conflictDetector.checkForConflicts(config);
                return this.handleConflicts(inputs.data, usernameOrAlias, defaultPackageDir, results);
            }
            return { type: 'CANCEL' };
        });
    }
    handleConflicts(manifest, usernameOrAlias, defaultPackageDir, results) {
        return __awaiter(this, void 0, void 0, function* () {
            const conflictTitle = messages_1.nls.localize('conflict_detect_view_root', usernameOrAlias, results.different.size);
            if (results.different.size === 0) {
                conflict_1.conflictDetector.clearCache(usernameOrAlias);
                conflict_1.conflictView.visualizeDifferences(conflictTitle, usernameOrAlias, false);
            }
            else {
                channels_1.channelService.appendLine(messages_1.nls.localize('conflict_detect_conflict_header', results.different.size, results.scannedRemote, results.scannedLocal));
                results.different.forEach(file => {
                    channels_1.channelService.appendLine(path_1.join(defaultPackageDir, file));
                });
                channels_1.channelService.showChannelOutput();
                const choice = yield notifications_1.notificationService.showWarningModal(messages_1.nls.localize(this.messages.warningMessageKey), messages_1.nls.localize('conflict_detect_override'), messages_1.nls.localize('conflict_detect_show_conflicts'));
                if (choice === messages_1.nls.localize('conflict_detect_override')) {
                    conflict_1.conflictDetector.clearCache(usernameOrAlias);
                    conflict_1.conflictView.visualizeDifferences(conflictTitle, usernameOrAlias, false);
                }
                else {
                    channels_1.channelService.appendLine(messages_1.nls.localize('conflict_detect_command_hint', this.messages.commandHint(manifest)));
                    channels_1.channelService.showChannelOutput();
                    const doReveal = choice === messages_1.nls.localize('conflict_detect_show_conflicts');
                    conflict_1.conflictView.visualizeDifferences(conflictTitle, usernameOrAlias, doReveal, results);
                    return { type: 'CANCEL' };
                }
            }
            return { type: 'CONTINUE', data: manifest };
        });
    }
    getDefaultUsernameOrAlias() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield util_1.OrgAuthInfo.getDefaultUsernameOrAlias(true);
        });
    }
}
exports.ConflictDetectionChecker = ConflictDetectionChecker;
//# sourceMappingURL=postconditionCheckers.js.map