import protobuf, { IService, IType, IEnum } from 'protobufjs';
import { printField } from './printField';
import { printMethod } from './printMethod';
import { printEnum } from './printEnum';

export function parseJson(json: protobuf.INamespace): string {
  const nested = json.nested;
  if (nested) {
    const output = Object.keys(nested)
      .map(name => {
        const value = nested[name];

        const res = Object.keys(value).map(category => {
          if (category === 'fields') return printField(name, value as IType);
          if (category === 'methods')
            return printMethod(name, value as IService);
          if (category === 'values') return printEnum(name, value as IEnum);
          if (category === 'nested') return parseJson(value);
        });
        return res;
      })
      .reduce((a, b) => a.concat(b), [])
      .join('');

    return output;
  }
  return '';
}

// export function loadProto() {
//   protobuf.load('rpc.proto', (err, root) => {
//     if (err) {
//       console.log(err);
//     } else {
//       const output = parseJson(root!.toJSON()!);
//       fs.writeFileSync('rpc.d.ts', output, { encoding: 'utf-8' });
//     }
//   });
// }

export function parseProto(source: string) {
  const res = protobuf.parse(source, { keepCase: true });
  if (res.package) {
    const root = res.root.lookup(res.package);
    return parseJson(root!.toJSON());
  }
  // console.log(JSON.stringify(res.root.toJSON()));
  return parseJson(res.root.toJSON());
}

export default {
  parseProto,
  parseJson
};
