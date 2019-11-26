const { ApolloServer } = require("apollo-server");
const {
  makeExecutableSchema,
  transformSchema,
  TransformRootFields,
  RenameObjectFields,
  RenameRootFields
} = require("graphql-tools-fork");
const {
  fieldToFieldConfig
} = require("graphql-tools-fork/dist/stitching/schemaRecreation");

const ITEM = {
  id: "123",
  text: "Hello, world",
  camel_case: "I'm a camel!"
};

const itemSchema = makeExecutableSchema({
  typeDefs: `
    type Item {
      id: ID!
      text: String
      camel_case: String
    }    

    type ItemConnection {
      edges: [ItemEdge!]!
    }

    type ItemEdge {
      node: Item!
    }

    type Query {
      item: Item
      allItems: ItemConnection!
    }
  `,
  resolvers: {
    Query: {
      item: () => ITEM,
      allItems: () => ({
        edges: [
          {
            node: ITEM
          }
        ]
      })
    }
  }
});

const schema = transformSchema(itemSchema, [
  // The below is also broken (add an extra '/' to toggle):
  /**
  new RenameRootFields((_operation, fieldName) => {
    if (fieldName.match(/^all/)) {
      return fieldName[3].toLowerCase() + fieldName.substr(4);
    }
    return fieldName;
  }),
  /*/
  new TransformRootFields((_operation, fieldName, field) => {
    let name = fieldName;
    if (name.match(/^all/)) {
      name = name[3].toLowerCase() + name.substr(4);
    }

    // Not sure if I am supposed to use this helper, should it be exposed?
    const config = fieldToFieldConfig(field);
    return { name, field: config };
  }),
  // */
  new RenameObjectFields((_typeName, fieldName) => {
    // snake_case -> camelCase
    return fieldName.replace(/([-_][a-z])/gi, $1 => {
      return $1
        .toUpperCase()
        .replace("-", "")
        .replace("_", "");
    });
  })
]);

const runServer = async () => {
  const server = new ApolloServer({
    schema
  });
  server.listen().then(({ url }) => {
    console.log(`Running at ${url}`);
  });
};

try {
  runServer();
} catch (err) {
  console.error(err);
}
