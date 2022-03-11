global.console = {
    ...global.console,
    log: jest.fn(),
    debug: console.debug,
    trace: console.trace,
    // map other methods that you want to use like console.table
};
