const { parse: parseSpec } = require('./grammar');

exports.parse = function parse(src) {
    const specRx = /```js([\s\S]+?)```/gi;
    let specSrc = '';
    let cursor;

    // eslint-disable-next-line no-cond-assign
    while (cursor = specRx.exec(src)) {
        specSrc += cursor[1];
    }

    return parseSpec(specSrc);
};

exports.extend = function extend(base, extension) {
    for (const name in extension) {
        let item = extension[name];

        if (!item.base) {
            const baseItem = base[name];

            if (!baseItem) {
                base[name] = item;
                continue;
            }

            if (item.kind === 'interface') {
                base[name] = Object.assign(baseItem, {
                    props: Object.assign(baseItem.props, item.props)
                });
            } else {
                base[name] = Object.assign(baseItem, {
                    values: [...baseItem.values, ...item.values]
                });
            }
        } else {
            base[name] = item;
        }
    }
    return base;
}
