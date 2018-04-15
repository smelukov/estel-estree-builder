const generators = {
    js: require('./js/'),
    ts: require('./ts/')
};
const safeNameMap = {
    arguments: 'args',
    static: 'isStatic',
}
const paramAliasMap = {
    'RegExpLiteral.value': 'regex'
}

module.exports = function generateSource(descriptors, target = 'js') {
    const generator = generators[target];

    return generator.generate(descriptors, resolveParams, getMethodName).join('\n');
};

function getMethodName(nodeType) {
    return {
        create: nodeType[0].toLowerCase() + nodeType.slice(1),
        is: 'is' + nodeType
    }
}

function resolveParams(nodeType, descriptor, recursive = true) {
    if (recursive) {
        if (descriptor.cachedParamsRecursive) {
            return descriptor.cachedParamsRecursive;
        }
    } else if (descriptor.cachedParams) {
        return descriptor.cachedParams;
    }

    const baseParams = [];

    if (recursive) {
        if (descriptor.base && descriptor.base.length) {
            for (const base of descriptor.base) {
                const params = resolveParams(base.name, base.descriptor);

                for (const baseParam of params) {
                    if (!baseParams.some(param => param.name === baseParam.name)) {
                        baseParams.push(baseParam);
                    }
                }
            }
        }
    }

    const params = [];

    for (const name in descriptor.props) {
        const type = descriptor.props[name];
        const safeName = safeNameMap[name];
        let defaultValue;

        // literal value must not have default value
        if (nodeType !== 'Literal' && name !== 'value') {
            defaultValue = getDefaultValue(type);
        }

        const required = defaultValue === undefined;
        const code = (safeName || name) + (defaultValue !== undefined ? ' = ' + String(defaultValue) : '');

        for (let i = 0; i < baseParams.length; i++) {
            if (baseParams[i].name === name) {
                baseParams.splice(i, 1);
                break;
            }
        }

        params.push({ name, safeName, required, code, type, defaultValue });
    }

    params.push(...baseParams);

    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const alias = paramAliasMap[nodeType + '.' + param.name];
        const [aliasField] = params.filter(param => param.name === alias);

        if (aliasField) {
            params[i] = Object.assign({}, params[i], { alias, type: aliasField.type });
        }
    }

    params.sort((a, b) => ~a.required - ~b.required);

    if (recursive) {
        descriptor.cachedParamsRecursive = params;
    } else {
        descriptor.cachedParams = params;
    }

    return params;
}

function getDefaultValue(param) {
    if (param.kind === 'union') {
        for (const currentType of param.types) {
            if (currentType.kind === 'literal' && currentType.value === null) {
                return null;
            }
        }
    } else if (param.kind === 'reference' && param.name === 'boolean') {
        return false;
    } else if (param.kind === 'literal' && param.value === null) {
        return null;
    }
}