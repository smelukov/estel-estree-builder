const jsDocGenerator = require('./jsDoc');
const { addIndent } = require('../utils');

module.exports = { generate }

function generate(descriptors, resolveParams, getMethodName) {
    const codeLines = [];
    const jsDocLines = []

    for (const nodeType in descriptors) {
        const descriptor = descriptors[nodeType];
        const resolvedParams = resolveParams(nodeType, descriptor);
        const methodName = getMethodName(nodeType);
        let methodDescription;
        let jsDoc;

        if (descriptor.kind === 'interface') {
            methodDescription = createMethodDescriptor(nodeType, methodName.create, resolvedParams);
            jsDoc = jsDocGenerator.typedef(nodeType, resolvedParams);

            const methodSource = [
                ...methodDescription.jsDoc,
                `${methodDescription.name}(${methodDescription.params.join(', ')}) {`,
                ...addIndent(methodDescription.code),
                '},'
            ];

            codeLines.push(...methodSource);
        } else if (descriptor.kind === 'enum') {
            jsDoc = jsDocGenerator.enumerator(nodeType, descriptor.values);
        } else {
            // eslint-disable-next-line no-console
            console.error('Unkniwn descriptor kind', descriptor);
        }

        if (jsDoc) {
            jsDocLines.push(...jsDoc);
        }
    }

    return [
        ...jsDocLines,
        '',
        'module.exports = {',
        ...addIndent(codeLines),
        '};'
    ];
}

function createMethodDescriptor(nodeType, name, resolvedParams) {
    const params = resolvedParams
        .filter(param => !param.alias && param.type.kind !== 'literal')
        .map(param => (param.safeName || param.name) + (param.defaultValue !== undefined ? ' = ' + String(param.defaultValue) : ''));
    const code = generateMethodCode(resolvedParams);
    const jsDoc = jsDocGenerator.method(resolvedParams, nodeType);

    return { name, params, code, jsDoc };
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