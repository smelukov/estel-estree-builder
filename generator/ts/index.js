const tsDef = require('./tsDef');
const { addIndent } = require('../utils');

module.exports = { generate }

function generate(descriptors, resolveParams, getMethodName) {
    const codeLines = [];
    const definitionLines = []

    for (const nodeType in descriptors) {
        const descriptor = descriptors[nodeType];
        const resolvedParams = resolveParams(nodeType, descriptor);
        const methodName = getMethodName(nodeType);
        let methodDescription;
        let tsDefinitions;

        if (descriptor.kind === 'interface') {
            methodDescription = createMethodDescriptor(nodeType, methodName.create, resolvedParams);
            tsDefinitions = tsDef.typedef(nodeType, resolvedParams);

            const methodSource = [
                `${methodDescription.name}(${methodDescription.params.join(', ')}) {`,
                ...addIndent(methodDescription.code),
                '},'
            ];

            codeLines.push(...methodSource);
        } else if (descriptor.kind === 'enum') {
            tsDefinitions = tsDef.enumerator(nodeType, descriptor.values);
        } else {
            // eslint-disable-next-line no-console
            console.error('Unkniwn descriptor kind', descriptor);
        }

        if (tsDefinitions) {
            definitionLines.push(...tsDefinitions);
        }
    }

    return [
        ...definitionLines,
        '',
        'export default {',
        ...addIndent(codeLines),
        '};'
    ];
}

function createMethodDescriptor(nodeType, name, resolvedParams) {
    const params = resolvedParams
        .filter(param => !param.alias && param.type.kind !== 'literal')
        .map(param => {
            let name = param.safeName || param.name;

            if (param.type.kind === 'union') {
                for (let i = 0; i < param.type.types.length; i++) {
                    const currentProp = param.type.types[i];

                    if (currentProp.kind === 'literal' && currentProp.value === null) {
                        name += '?';

                        const newType = {
                            kind: param.type.kind,
                            types: param.type.types.filter((v, j) => j !== i)
                        }

                        return `${name}: ${tsDef.stringifyType(newType)}`;
                    }
                }
            }

            return `${name}: ${tsDef.stringifyType(param.type)}${param.defaultValue !== undefined ? ' = ' + String(param.defaultValue) : ''}`;
        });
    const code = generateMethodCode(resolvedParams);

    return { name, params, code };
}

function generateMethodCode(fields) {
    function stringify(param) {
        if (param.type.kind === 'literal') {
            return `"${param.type.value}"`;
        }

        return param.alias || param.safeName || param.name;
    }

    const nodeProps = [];

    for (const param of fields) {
        nodeProps.push({
            name: param.name,
            value: stringify(param)
        });
    }

    return [
        'return {',
        ...addIndent(nodeProps.map(prop => `${prop.name}: ${prop.value},`)),
        '};'
    ];
}