"use strict";
/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Conventions:
 * _message: is for unformatted text that will be shown as-is to
 * the user.
 * _text: is for text that will appear in the UI, possibly with
 * decorations, e.g., $(x) uses the https://octicons.github.com/ and should not
 * be localized
 *
 * If ommitted, we will assume _message.
 */
exports.messages = {
    config_name_text: 'Launch Apex Debugger',
    select_exception_text: 'Select an exception',
    select_break_option_text: 'Select break option',
    always_break_text: 'Always break',
    never_break_text: 'Never break',
    language_client_not_ready: 'Unable to retrieve breakpoint info from language server, language server is not ready',
    isv_debug_config_environment_error: 'Salesforce Extensions for VS Code encountered a problem while configuring your environment. Some features might not work. For details, click Help > Toggle Developer Tools or check the Salesforce CLI logs in ~/.sfdx/sfdx.log.'
};
//# sourceMappingURL=i18n.js.map