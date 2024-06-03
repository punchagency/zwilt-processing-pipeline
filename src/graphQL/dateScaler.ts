import { GraphQLScalarType, Kind } from 'graphql';

const DateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        console.log('Value received for serialization:', value);
        if (value instanceof Date) {
            console.log('Serializing Date:', value.toISOString());
            return value.toISOString();
        }
        return null;
    },
    parseValue(value) {
        return new Date(value); // Parse incoming string value as Date
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value); // Parse string literal as Date
        }
        return null;
    },
});

export { DateScalar };
