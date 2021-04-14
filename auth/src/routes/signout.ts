import express, {Request, Response} from 'express';

const router = express.Router();

// this route will tell to the client to delete its cookie session
router.post('/api/users/signout',
    (req: Request, res: Response) => {
    req.session = null;

    res.send({});
});


export {router as signOutRouter};
