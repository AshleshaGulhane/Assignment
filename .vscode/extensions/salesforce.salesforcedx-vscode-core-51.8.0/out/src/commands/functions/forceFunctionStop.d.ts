/**
 * Stop all running function containers.
 * Currently, we don't support stopping individual container,
 * because we don't support running multiple containers.
 */
export declare function forceFunctionStop(): Promise<void>;
