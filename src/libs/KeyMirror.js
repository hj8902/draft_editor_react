import _ from 'lodash';

export default function keyMirror(prefix, obj) {
    const keys = Array.isArray(obj) ? obj : Object.keys(obj);
    return _.reduce(keys, (res, v) => {
        const key = `${prefix}.${v}`;
        res[v] = key;
        return res;
    }, {});
}

