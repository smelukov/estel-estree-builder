function stringifyType(type) {
    if (type.kind === 'reference') {
        return type.name;
    } if (type.kind === 'union') {
        const [first, second] = type.types;

        if (type.types.length === 2 && second.kind === 'literal' && second.value === null) {
            return '?' + stringifyType(first);
        }

        return type.types.map(stringifyType).join('|');
    } else if (type.kind === 'object') {
        const props = [];

        for (const propName in type.items) {
            props.push(`${propName}: ${stringifyType(type.items[propName])}`);
        }

        return `{${props.join(', ')}}`;
    } else if (type.kind === 'literal') {
        if (typeof type.value !== 'string') {
            return String(type.value);
        }

        return `"${type.value}"`;
    } else if (type.kind === 'array') {
        return `Array<${stringifyType(type.base)}>`;
    }

    // eslint-disable-next-line no-console
    console.error('Unknown type', type);

    return 'unknown';
}

function enumerator(nodeType, values) {
    return [
        '/**',
        ` * @typedef {${values.map(value => `"${value}"`).join('|')}} ${nodeType}`,
        ' */'
    ];
}

function typedef(nodeType, params) {
    return [
        '/**',
        ` * @typedef {Object} ${nodeType}`,
        ...params.map(prop => {
            if (prop.type.kind === 'literal') {
                return ` * @property {${typeof prop.type.value}} ${prop.name}`;
            }

            return ` * @property {${stringifyType(prop.type)}} ${prop.name}`;
        }),
        ' */'
    ];
}

function method(params, returnValue) {
    function stringify(param) {
        let name = param.safeName || param.name;
        let type = stringifyType(param.type);

        if (!param.required) {
            if (param.defaultValue !== undefined) {
                name += '=' + param.defaultValue;
            }

            name = `[${name}]`;
        }

        return { name, type };
    }

    const items = [];

    for (const param of params) {
        if (param.alias || param.type.kind === 'literal' || param.name === 'type' && param.type.kind === 'literal') {
            continue;
        }

        items.push(stringify(param));
    }

    return [
        '/**',
        ...items.map(prop => ` * @param {${prop.type}} ${prop.safeName || prop.name}`),
        ` * @return {${returnValue}}`,
        ' */'
    ];
}

module.exports = { typedef, enumerator, method, stringifyType };