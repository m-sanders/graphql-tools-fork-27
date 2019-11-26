# Reproduction of graphql-tools-fork #27

In summary, when both renaming root fields and renaming object fields graphql-tools-fork fails to transform nested query result fields. e.g. `item.camelCase` is transformed correctly but `item.edges.node.camelCase` is not.

[Link](https://github.com/yaacovCR/graphql-tools-fork/issues/27)

## Running

```
nvm use
npm install
npm run dev
```

Visit: http://localhost:4000

## Failure case

### Query

We apply two transforms to the below query:

- We rename `allItems` -> `items`
- We rename `camel_case` to `camelCase`

```
{
 	item {
    id
    text
    camelCase
  }
  items {
    edges {
      node {
        id
        text
       	camelCase
      }
    }
  }
}
```

### Result

```
{
  "data": {
    "item": {
      "id": "123",
      "text": "Hello, world",
      "camelCase": "I'm a camel!"
    },
    "items": {
      "edges": [
        {
          "node": {
            "id": "123",
            "text": "Hello, world",
            // This is not returned!
            // If we make this field "required", then the response will error.
            "camelCase": null
          }
        }
      ]
    }
  }
}
```
