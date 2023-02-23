import Cors from 'micro-cors'
import { gql, ApolloServer } from 'apollo-server-micro'
import { Client, Collection, Documents, Lambda, Map, Paginate, Get } from 'faunadb'

const client = new Client({
    secret: process.env.FAUNA_SECRET,
    domain: 'db.fauna.com',
})

export const config = {
    api: {
        bodyParser: false
    }
}

const typeDefs = gql`
    type Productos {
        Descripcion: String 
        image: String
        Precio: Float
        id: Int
    }

    type Query{
    ListaProductos:[Productos]
  }
`

const resolvers = {
    Query: {
        ListaProductos: async () => {
            const response = await client.query(
                Map(
                    Paginate(Documents(Collection('ListaProductos'))),
                    Lambda((x) => Get(x))
                )
            )
            console.log('-->', response);
            const productoss = response.data.map(item => item.data)
            return [...productoss]
        },
    },
};

const cors = Cors()

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {

    },
    introspection: true,
    playground: true,
});

const serversStart = apolloServer.start();

export default cors(async(req, res) => {
    if(req.method == 'OPTIONS') {
        res.end();
        return false;
    }

    await serversStart;
    await apolloServer.createHandler({ path: '/api/graphql' }) (req, res);
})