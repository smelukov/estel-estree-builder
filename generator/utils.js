module.exports = {
    addIndent,
    getCliArgs
}

function addIndent(lines, indent = '    ') {
    lines.forEach((line, i) => lines[i] = indent + line);

    return lines;
}

/// CLI ///

function getCliArgs(argv, options = {}) {
    const argList = argv.slice(2);
    const args = {};
    const map = options && options.map || {};
    const types = options && options.types || {};
    const defaults = options && options.defaults || {};

    for (let i = 0; i < argList.length; i++) {
        const arg = argList[i];

        if (isArg(arg)) {
            const name = getArgName(arg);
            const values = fetchArgValues(argList, i + 1);
            const type = types.hasOwnProperty(name) && types[name];

            if (values.length) {
                i += values.length;

                if (args.hasOwnProperty(name)) {
                    if (type === Array) {
                        args[name].push(...values);
                    } else if (Array.isArray(type)) {
                        args[name].push(...values.map(type[0]));
                    } else {
                        args[name] = type(values);
                    }
                } else {
                    if (type === Array) {
                        args[name] = values;
                    } else if (Array.isArray(type)) {
                        args[name] = values.map(type[0]);
                    } else {
                        args[name] = type(values);
                    }
                }
            } else {
                if (!type) {
                    args[name] = true;
                }
            }
        }
    }

    for (const name in defaults) {
        if (!args.hasOwnProperty(name)) {
            args[name] = defaults[name];
        }
    }

    for (const name in args) {
        if (map.hasOwnProperty(name)) {
            args[map[name]] = args[name];
        }
    }

    return args;
}

function isArg(arg) {
    return arg[0] === '-';
}

function getArgName(name) {
    return name.replace(/^-+/, '');
}
function fetchArgValues(list, from) {
    const values = [];

    while (from < list.length) {
        const value = list[from++];

        if (isArg(value)) {
            break;
        }

        values.push(value);
    }

    return values;
}
