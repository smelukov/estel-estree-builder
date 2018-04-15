const { addIndent } = require('../utils');

function stringifyType(type) {
    if (type.kind === 'reference') {
        return type.name;
    } if (type.kind === 'union') {
        if (type.types.length === 1) {
            return stringifyType(type.types[0]);
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
        `type ${nodeType} = ${values.map(value => `"${value}"`).join('|')};`
    ];
}

function typedef(nodeType, params, extendList) {
    return [
        `interface ${nodeType}${extendList && extendList.length ? ' extends ' + extendList.join(', ') : ''} {`,
        ...addIndent(params.map(prop => {
            if (prop.type.kind === 'literal') {
                return `${prop.name}: ${typeof prop.type.value},`;
            }

            let name = prop.name;

            if (prop.type.kind === 'union') {
                for (let i = 0; i < prop.type.types.length; i++) {
                    const currentProp = prop.type.types[i];

                    if (currentProp.kind === 'literal' && currentProp.value === null) {
                        name += '?';

                        const newType = {
                            kind: prop.type.kind,
                            types: prop.type.types.filter((v, j) => j !== i)
                        }

                        return `${name}: ${stringifyType(newType)},`;
                    }
                }
            }

            return `${prop.name}: ${stringifyType(prop.type)},`;
        })),
        '}'
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