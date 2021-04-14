// TESTING PURPOSE
// This file fake the using of nats-wrapper to generate the client implementation and fix test

export const natsWrapper = {
    client: {
        // mockImplementation simulate the call of this function and this simulate keeps
        // in
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback();
        }),
    },
};
