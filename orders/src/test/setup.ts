import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'


declare global {
    namespace NodeJS {
        interface Global {
            getAuthCookie(id?: string, email?: string): string[];
        }
    }
}

// Import the fake version of nats-wrapper for all tests
jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'test';

    mongo = new MongoMemoryServer();
    const mongoURI = await mongo.getUri();
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
    // Clear all mocks to be able the test the state of calling mocks function
    jest.clearAllMocks();
})

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.getAuthCookie = (id?: string, email?: string) => {
    // build a JWT payload. {id, email}
    const payload = {
        id: id ? id : 'azer1245',
        email: email ? email : 'test@test.com'
    }
    // create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    // build session =>  { jwt: MY_JWT }
    const session = {jwt: token};
    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session)
    // Take JSON and encode it as base64 => which is into the cookie
    const base64 = Buffer.from(sessionJSON).toString('base64');
    // return a string thats the cokie with the cnoded data => [express:sess= JSON_BASE_64]
    return [`express:sess=${base64}`];
};
